import { io } from "socket.io-client";

const URL = "http://localhost:8000/boards";

export const socket = io(URL, {
  autoConnect: false,
  transports: ["websocket"],
  auth: {
    token: localStorage.getItem("token"),
  },
});
