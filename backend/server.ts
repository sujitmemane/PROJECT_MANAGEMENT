import express from "express";
import { createServer } from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import bodyParser from "body-parser";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

import * as usersControllers from "./src/controllers/users";
import authMiddleware from "./src/middlwares/auth";

io.on("connection", (socket) => {
  console.log(socket.id);
});

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(express.json());
app.get("/", (req, res) => {
  res.send("API is Live");
});

app.post("/api/users", usersControllers.register);
app.get("/api/user", authMiddleware, usersControllers.currentUser);
app.post("/api/users/login", usersControllers.login);

mongoose.connect("").then(() => {
  console.log("Connected to mongodb");
  app.listen(8000, () => {
    console.log("App is runnig on port 8000");
  });
});
