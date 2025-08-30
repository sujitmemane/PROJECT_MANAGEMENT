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
import { SocketEventsEnum } from "./src/types/socket-events.enum";

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

app.post("/api/users", usersControllers.register);
app.get("/api/user", authMiddleware, usersControllers.currentUser);
app.post("/api/users/login", usersControllers.login);

app.get("/api/boards", authMiddleware, boardControllers.getBoards);
app.get("/api/boards/:boardId", authMiddleware, boardControllers.getBoard);
app.post("/api/boards", authMiddleware, boardControllers.createBoard);
io.on("connection", (socket) => {
  console.log("✅ New client connected:", socket.id);

  socket.emit("test", "hello man");

  socket.on(SocketEventsEnum.boardsJoin, (data) => {
    boardControllers.joinBoard(io, socket, data);
  });

  socket.on(SocketEventsEnum.boardLeave, (data) => {
    boardControllers.leaveBoard(io, socket, data);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("Connected to mongodb");
  httpServer.listen(8000, () => {
    console.log("🚀 App + Socket.IO running on port 8000");

  });
});
