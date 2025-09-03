import jwt from "jsonwebtoken";
import express from "express";
import { createServer } from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

import * as usersControllers from "./src/controllers/users";
import * as boardControllers from "./src/controllers/boards";
import authMiddleware from "./src/middlwares/auth";
import { JWT_SECRET } from "./src/config";
import UserModel from "./src/models/user.model";
import type { SocketRequestInterface } from "./src/types/socket-request.interface";
import client from "./src/config/redis.config";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

app.get("/", (req, res) => {
  res.send("API is Live");
});

export const boardNamespace = io.of("/boards");

boardNamespace.use(async (socket: SocketRequestInterface, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      console.error("❌ No token provided");
      return next(new Error("Invalid Token"));
    }

    const tokenDecode = await jwt.verify(token, JWT_SECRET);

    const user = await UserModel.findById(tokenDecode?.id);

    if (!user) {
      console.error("❌ User not found in DB");
      return next(new Error("User not found"));
    }

    socket.user = user;

    next();
  } catch (error: any) {
    console.error("🔥 Authentication error:", error.message || error);
    next(new Error("Authentication error"));
  }
});

export enum SocketEventsEnum {
  boardsJoin = `board:join`,
  boardLeave = "board:leave",
  boardUsers = "board:users",
  columnCreated = "column:created",
  columnDeleted = "column:deleted",
  columnRename = "column:rename",
  columnPositionSwap = "column:position-swap",
  taskCreated = "task:created",
  taskUpdated = "task:updated",
  taskDeleted = "task:deleted",
  taskMoved = "task:moved",
}

boardNamespace.on("connection", (socket) => {
  console.log("✅ New client connected:", socket.id);

  socket.emit("test", "hello man");

  socket.on(SocketEventsEnum.boardsJoin, (data) => {
    console.log("Board Join Event HIT");
    boardControllers.joinBoard(boardNamespace, socket, data);
  });

  socket.on(SocketEventsEnum.boardLeave, (data) => {
    console.log("Board Leave Event HIT");
    boardControllers.leaveBoard(boardNamespace, socket, data);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});


app.post("/api/users", usersControllers.register);
app.get("/api/user", authMiddleware, usersControllers.currentUser);
app.post("/api/users/login", usersControllers.login);

app.get("/api/boards", authMiddleware, boardControllers.getBoards);
app.get("/api/boards/:boardId", authMiddleware, boardControllers.getBoard);
app.post("/api/boards", authMiddleware, boardControllers.createBoard);

app.get(
  "/api/boards/:boardId/info",
  authMiddleware,
  boardControllers.boardInformation
);

app.get(
  "/api/boards/:boardId/columns/:columnId/info",
  authMiddleware,
  boardControllers.ColumnInformation
);

app.post(
  "/api/boards/:boardId/columns",
  authMiddleware,
  boardControllers.createColumn
);

app.post(
  "/api/boards/:boardId/columns/:columnId/tasks",
  authMiddleware,
  boardControllers.createTask
);

app.put("/api/boards/update", authMiddleware, boardControllers.updateTask);

app.delete(
  "/api/boards/:boardId/columns/:columnId/tasks/:taskId",
  authMiddleware,
  boardControllers.deleteTask
);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Something broke!" });
});

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("Connected to mongodb");
  httpServer.listen(8000, async () => {
    const redisClient = client;
    console.log(redisClient);
    console.log(redisClient.isOpen);
    if (!redisClient.isOpen) {
      console.log("Redis connection failed");
    }
    console.log("🚀 App + Redis + Socket.IO running on port 8000");

  });
});
