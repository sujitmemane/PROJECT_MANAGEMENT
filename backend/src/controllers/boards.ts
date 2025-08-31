import type { Request, Response } from "express";
import type { NextFunction } from "express";
import BoardModel from "../models/board.model";
import type { ExpressRequestInterface } from "../types/express-request.interface";
import type { Namespace, Server, Socket } from "socket.io";
import type { SocketRequestInterface } from "../types/socket-request.interface";
import UserModel from "../models/user.model";
import client from "../config/redis.config";
import ColumnModel from "../models/column.model";
import TaskModel from "../models/task.model";
import { boardNamespace, SocketEventsEnum } from "../../server";

export const getBoards = async (
  req: ExpressRequestInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({});
    }
    const boards = await BoardModel.find({
      // userId: req?.user?._id,
    });

    return res.status(200).json({
      success: true,
      data: boards,
    });
  } catch (error) {
    next(error);
  }
};
export const getBoard = async (
  req: ExpressRequestInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const { boardId } = req.params;
    const userId = req.user?._id;

    if (!boardId) {
      return res
        .status(400)
        .json({ success: false, message: "BoardId missing" });
    }

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const board = await BoardModel.findOne({ _id: boardId });
    if (!board) {
      return res
        .status(404)
        .json({ success: false, message: "Board not found" });
    }

    const columns = await ColumnModel.find({ boardId }).sort("position").lean();

    const tasks = await TaskModel.find({ boardId }).sort("position").lean();

    const columnsWithTasks = columns.map((col) => ({
      ...col,
      tasks: tasks.filter((t) => t.columnId.toString() === col._id.toString()),
    }));

    return res.status(200).json({
      success: true,
      data: {
        board,
        columns: columnsWithTasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createBoard = async (
  req: ExpressRequestInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const board = await BoardModel.create({
      title: req.body.title,
      userId: req?.user?._id,
    });

    return res.status(200).json({
      success: true,
      data: board,
    });
  } catch (error) {
    next(error);
  }
};

export const joinBoard = async (
  namespace: Namespace,
  socket: SocketRequestInterface,
  data: {
    boardId: string;
  }
) => {
  try {
    const RedisClient = client;
    const key = `bites:boards:${data?.boardId}:users`;
    const user = socket.user;
    const roomName = `board:${data?.boardId}`;
    socket.join(roomName);
    await RedisClient.sAdd(key, user?._id.toString());

    const users = await boardUsers(namespace, {
      boardId: data?.boardId,
    });

    socket.emit("board:users", users);

    namespace.to(roomName).emit(`board:joined`, {
      socketId: socket?.id,
      boardId: data?.boardId,
      user: {
        username: user?.username,
        email: user?.email,
        avatar: user?.avatar,
      },
    });
  } catch (error) {
    console.error("❌ Error in joinBoard:", error);
  }
};

export const leaveBoard = async (
  namespace: Namespace,
  socket: SocketRequestInterface,
  data: {
    boardId: string;
  }
) => {
  try {
    const RedisClient = client;
    const key = `bites:boards:${data?.boardId}:users`;
    const user = socket.user;
    const roomName = `board:${data?.boardId}`;

    socket.leave(roomName);
    await RedisClient.sRem(key, user?._id.toString());

    console.log(
      `🚪 User ${user?.username} (${socket.id}) left room ${roomName}`
    );
    const users = await boardUsers(namespace, {
      boardId: data?.boardId,
    });

    namespace.to(roomName).emit(`board:users`, users);
    console.log(
      `📢 Emitted "board:left" to room ${roomName} with user ${user?.username}`
    );
  } catch (error) {
    console.error("❌ Error in leaveBoard:", error);
  }
};

const boardUsers = async (
  namespace: Namespace,

  data: {
    boardId: string;
  }
) => {
  try {
    const RedisClient = client;
    const roomName = `board:${data?.boardId}`;
    const key = `bites:boards:${data?.boardId}:users`;

    const socketCount = namespace.adapter.rooms.get(roomName);
    console.log("Socket Count", socketCount);
    const members = await RedisClient.sMembers(key);

    const users = await UserModel.find({
      _id: { $in: members },
    });

    return users;
  } catch (error) {
    console.error("❌ Error in boardUsers:", error);
  }
};

export const createColumn = async (
  req: ExpressRequestInterface,
  res: Response
) => {
  try {
    const { boardId } = req.params;
    const { name, position } = req.body;

    const column = await ColumnModel.create({
      boardId,
      name,
      position,
    });

    boardNamespace.to(`board:${boardId}`).emit(SocketEventsEnum.columnCreated, {
      ...column.toObject(),
      tasks: [],
    });

    return res.status(201).json({ success: true, data: column });
  } catch (error) {
    console.error("❌ Error creating column:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

export const createTask = async (
  req: ExpressRequestInterface,
  res: Response
) => {
  try {
    const { boardId, columnId } = req.params;
    const { text, position } = req.body;

    const task = await TaskModel.create({
      text,
      position,
      boardId,
      columnId,
    });

    boardNamespace
      .to(`board:${boardId}`)
      .emit(SocketEventsEnum.taskCreated, task);

    return res.status(201).json({ success: true, data: task });
  } catch (error) {
    console.error("❌ Error creating column:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

export const updateTask = async (
  req: ExpressRequestInterface,
  res: Response
) => {
  try {
    const { boardId, columnId, taskId } = req.params;
    const { text, position } = req.body;

    const task = await TaskModel.findByIdAndUpdate(
      taskId,
      { text, position },
      { new: true }
    );

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    boardNamespace
      .to(`board:${boardId}`)
      .emit(SocketEventsEnum.taskUpdated, { ...task.toObject(), columnId });

    return res.status(200).json({ success: true, data: task });
  } catch (error) {
    console.error("Error updating task:", error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const deleteTask = async (
  req: ExpressRequestInterface,
  res: Response
) => {
  const { boardId, columnId, taskId } = req.params;

  const task = await TaskModel.findByIdAndDelete(taskId);

  boardNamespace
    .to(`board:${boardId}`)
    .emit(SocketEventsEnum.taskDeleted, { taskId, columnId });

  return res.status(201).json({ success: true, data: task });
};
