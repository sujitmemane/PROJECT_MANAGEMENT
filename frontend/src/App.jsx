import { useEffect, useState } from "react";

import "./App.css";

import { useSocket } from "./socket/SocketProvider";

function App() {
  const socket = useSocket();
  console.log("soc", socket);
  useEffect(() => {
    if (!socket) return;

    socket.on("count", (data) => {
      console.log("Count from server:", data);
    });

    socket.emit("board:join", {
      boardId: "wdfwf",
    });
    socket.emit("board:leave", {
      boardId: "wdfwfdwd",
    });

    return () => {};
  }, [socket]);

  return (
    <>
      <h1>Socket IO Project</h1>
    </>
  );
}

export default App;
