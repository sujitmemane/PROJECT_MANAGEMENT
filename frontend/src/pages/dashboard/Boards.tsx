import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Board {
  _id: string;
  title: string;
  tasksCount: number;
}

export default function Boards() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [creatingBoard, setCreatingBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchBoards = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/boards/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setBoards(response.data.data);
    } catch (error) {
      console.error("Failed to fetch boards:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) return;

    try {
      const response = await axios.post(
        "http://localhost:8000/api/boards/",
        { title: newBoardName.trim() },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setNewBoardName("");
      setCreatingBoard(false);
      fetchBoards();
    } catch (error) {
      console.error("Failed to create board:", error);
    }
  };

  if (loading) return <p className="p-6">Loading boards...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-black mb-6">Boards</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Existing Boards */}
        {boards.map((board) => (
          <Card
            key={board._id}
            className="bg-gray-100 border border-gray-300 hover:shadow-md transition cursor-pointer"
          >
            <CardHeader>
              <CardTitle className="text-black">{board.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 flex justify-between items-center">
              <span>Tasks: {board.tasksCount || 0}</span>
              <Button
                onClick={() => navigate(`/dashboard/${board._id}`)}
                className="bg-black text-white hover:bg-gray-900 text-sm px-3 py-1"
              >
                Open
              </Button>
            </CardContent>
          </Card>
        ))}

        {/* Create Board Card */}
        <Card className="bg-gray-100 border border-dashed border-gray-400 hover:shadow-md transition cursor-pointer flex flex-col justify-center items-center p-4">
          {!creatingBoard ? (
            <Button
              className="bg-gray-200 text-gray-800 hover:bg-gray-300 w-full"
              onClick={() => setCreatingBoard(true)}
            >
              + Create Board
            </Button>
          ) : (
            <div className="w-full flex flex-col space-y-2">
              <input
                type="text"
                autoFocus
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                placeholder="Board title"
                className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-black"
              />
              <div className="flex space-x-2">
                <Button
                  onClick={handleCreateBoard}
                  className="bg-black text-white hover:bg-gray-900 flex-1"
                >
                  Create
                </Button>
                <Button
                  onClick={() => {
                    setCreatingBoard(false);
                    setNewBoardName("");
                  }}
                  className="bg-gray-300 text-gray-800 hover:bg-gray-400 flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
