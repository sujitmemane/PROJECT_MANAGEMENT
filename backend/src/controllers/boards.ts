import type { Request, Response } from "express";
import type { NextFunction } from "express";
import BoardModel from "../models/board.model";
import type { ExpressRequestInterface } from "../types/express-request.interface";
import type { Server, Socket } from "socket.io";

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
      userId: req?.user?._id,
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
    if (!boardId) {
      return res.status(400).json({
        success: false,
      });
    }

    if (!req.user) {
      return res.status(401).json({});
    }
    const board = await BoardModel.findOne({
      userId: req?.user?._id,
      _id: boardId,
    });

    return res.status(200).json({
      success: true,
      data: board,
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
  io: Server,
  socket: Socket,
  data: {
    boardId: string;
  }
) => {
  try {
    console.log("Join to room", data?.boardId);
    socket.join(data?.boardId);
  } catch (error) {}
};

export const leaveBoard = async (
  io: Server,
  socket: Socket,
  data: {
    boardId: string;
  }
) => {
  try {
    console.log("leaving room", data?.boardId);
    socket.join(data?.boardId);
  } catch (error) {}
};
