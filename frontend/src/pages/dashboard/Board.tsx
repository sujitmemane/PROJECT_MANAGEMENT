import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Plus, Users, Calendar, Settings } from "lucide-react";
import { useSocket } from "@/socket/SocketProvider";

import ColumnComp from "../../components/app/Column";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface Task {
  _id: string;
  text: string;
}

interface Column {
  _id: string;
  name: string;
  position?: number;
  tasks: Task[];
}

interface User {
  _id: string;
  username: string;
  avatar?: string;
}

export default function BoardPage() {
  const [columns, setColumns] = useState<Column[]>([]);
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [addingTask, setAddingTask] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [newTaskText, setNewTaskText] = useState("");
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [board, setBoard] = useState<{ title?: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const { boardId = " " } = useParams();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    socket.emit("board:join", { boardId });

    socket.on("board:users", (users: User[]) => setActiveUsers(users));

    const handleTaskCreated = (data: Task & { columnId: string }) => {
      setColumns((prevCols) =>
        prevCols.map((col) =>
          col._id === data.columnId
            ? { ...col, tasks: [...col.tasks, data] }
            : col
        )
      );
    };

    const handleTaskUpdated = (data: Task & { columnId: string }) => {
      setColumns((prevCols) =>
        prevCols.map((col) =>
          col._id === data.columnId
            ? {
                ...col,
                tasks: col.tasks.map((task) =>
                  task._id === data._id ? { ...task, text: data.text } : task
                ),
              }
            : col
        )
      );
    };

    const handleTaskDeleted = (data: { taskId: string; columnId: string }) => {
      setColumns((prevCols) =>
        prevCols.map((col) =>
          col._id === data.columnId
            ? {
                ...col,
                tasks: col.tasks.filter((task) => task._id !== data.taskId),
              }
            : col
        )
      );
    };

    socket.on("column:created", (data) => {
      setColumns((prevCols) => {
        const updatedCols = [...prevCols, data];
        updatedCols.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
        return updatedCols;
      });
    });

    socket.on("task:created", handleTaskCreated);
    socket.on("task:updated", handleTaskUpdated);
    socket.on("task:deleted", handleTaskDeleted);

    return () => {
      socket.off("board:users");
      socket.emit("board:leave", { boardId });
      socket.off("column:created");
      socket.off("task:created", handleTaskCreated);
      socket.off("task:updated", handleTaskUpdated);
      socket.off("task:deleted", handleTaskDeleted);
    };
  }, [socket, boardId]);

  useEffect(() => {
    const fetchBoard = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:8000/api/boards/${boardId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setBoard(response.data.data.board);
        setColumns(response.data.data.columns || []);
      } catch (err) {
        console.error("Failed to fetch board:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBoard();
  }, [boardId]);

  const addColumn = async () => {
    if (!newColumnName.trim()) return;
    const newColPosition = columns.length + 1;

    try {
      const response = await axios.post(
        `http://localhost:8000/api/boards/${boardId}/columns`,
        { name: newColumnName.trim(), position: newColPosition },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.success) {
        setNewColumnName("");
        setAddingColumn(false);
      }
    } catch (error) {
      console.error("Error adding column:", error);
    }
  };

  const addTask = async (columnId: string) => {
    if (!newTaskText.trim()) return;
    const position = columns.find((c) => c._id === columnId)?.tasks.length + 1;

    try {
      const response = await axios.post(
        `http://localhost:8000/api/boards/${boardId}/columns/${columnId}/tasks`,
        { text: newTaskText.trim(), position },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.success) {
        setNewTaskText("");
        setAddingTask(null);
      }
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const updateTask = async (columnId: string, taskId: string) => {
    if (!newTaskText.trim()) return;

    try {
      const response = await axios.put(
        `http://localhost:8000/api/boards/${boardId}/columns/${columnId}/tasks/${taskId}`,
        { text: newTaskText },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.success) {
        setNewTaskText("");
        setEditingTask(null);
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const deleteTask = async (columnId: string, taskId: string) => {
    try {
      const response = await axios.delete(
        `http://localhost:8000/api/boards/${boardId}/columns/${columnId}/tasks/${taskId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (!response.data.success) {
        console.error("Failed to delete task");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const totalTasks = columns.reduce((sum, col) => sum + col.tasks.length, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-600"></div>
          <p className="text-slate-600 font-medium">Loading board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-full px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Board Title & Stats */}
            <div className="flex items-center space-x-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {board?.title || "Board"}
                </h1>
                <div className="flex items-center space-x-4 mt-1">
                  <Badge variant="secondary" className="text-xs font-medium">
                    <Calendar className="w-3 h-3 mr-1" />
                    {columns.length} columns
                  </Badge>
                  <Badge variant="secondary" className="text-xs font-medium">
                    {totalTasks} tasks
                  </Badge>
                </div>
              </div>
            </div>

            {/* Active Users & Actions */}
            <div className="flex items-center space-x-4">
              {/* Active Users */}
              {activeUsers.length > 0 && (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 text-sm text-slate-600">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">
                      {activeUsers.length} online
                    </span>
                  </div>
                  <Separator orientation="vertical" className="h-6" />
                  <div className="flex -space-x-2">
                    {activeUsers.slice(0, 5).map((user) => (
                      <Avatar
                        key={user._id}
                        className="w-9 h-9 border-2 border-white shadow-sm"
                      >
                        <AvatarImage
                          src={
                            user.avatar ||
                            `https://i.pravatar.cc/40?u=${user._id}`
                          }
                          alt={user.username}
                        />
                        <AvatarFallback className="text-xs font-semibold bg-slate-100">
                          {user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {activeUsers.length > 5 && (
                      <div className="w-9 h-9 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center">
                        <span className="text-xs font-semibold text-slate-600">
                          +{activeUsers.length - 5}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Settings Button */}
              <Button variant="outline" size="sm" className="shadow-sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Board Content */}
      <div className="p-6">
        <div className="flex gap-6 overflow-x-auto pb-4 min-h-[calc(100vh-180px)]">
          <div className="flex gap-6">
            {columns.map((col, index) => (
              <ColumnComp
                key={col._id}
                boardId={boardId}
                column={col}
                addingTask={addingTask}
                setAddingTask={setAddingTask}
                newTaskText={newTaskText}
                setNewTaskText={setNewTaskText}
                editingTask={editingTask}
                setEditingTask={setEditingTask}
                addTask={addTask}
                updateTask={updateTask}
                deleteTask={deleteTask}
              />
            ))}
          </div>

          {/* Add Column */}
          <div className="w-80 flex-shrink-0">
            {!addingColumn ? (
              <Button
                variant="outline"
                className="w-full h-12 justify-center text-slate-600 hover:text-slate-900 hover:bg-white hover:border-slate-300 border-dashed border-2 border-slate-200 bg-slate-50/50 transition-all duration-200"
                onClick={() => setAddingColumn(true)}
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Column
              </Button>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Column Name
                    </label>
                    <input
                      type="text"
                      value={newColumnName}
                      onChange={(e) => setNewColumnName(e.target.value)}
                      placeholder="Enter column name..."
                      autoFocus
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addColumn();
                        if (e.key === "Escape") setAddingColumn(false);
                      }}
                    />
                  </div>
                  <div className="flex space-x-2 pt-2">
                    <Button
                      size="sm"
                      className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm flex-1"
                      onClick={addColumn}
                      disabled={!newColumnName.trim()}
                    >
                      Add Column
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setAddingColumn(false);
                        setNewColumnName("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
