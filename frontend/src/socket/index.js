import { io } from "socket.io-client";

export const createSocket = (token) => {
  return io("http://localhost:8000", {
    transports: ["websocket"],
    auth: {
      token,
    },
  });
};
