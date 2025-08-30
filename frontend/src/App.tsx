import { Button } from "@/components/ui/button";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Registe";
import Dashboard from "./pages/dashboard/Dashboard";
import Boards from "./pages/dashboard/Boards";
import Members from "./pages/dashboard/Members";
import BoardPage from "./pages/dashboard/Board";
import SocketProvider from "./socket/SocketProvider";

function App() {
  return (
    <BrowserRouter>
      <SocketProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<Boards />} />
            <Route path=":boardId" element={<BoardPage />} />
            <Route path="members" element={<Members />} />
          </Route>
        </Routes>
      </SocketProvider>
    </BrowserRouter>
  );
}

export default App;
