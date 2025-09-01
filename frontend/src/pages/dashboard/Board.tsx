import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Plus } from "lucide-react";
import { useSocket } from "@/socket/SocketProvider";

import ColumnComp from "../../components/app/Column";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";

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
  const { boardId } = useParams();
  const { socket } = useSocket();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id;
    const columnId = over.id;

    let movedTask: any;

    setColumns((prevColumns) =>
      prevColumns.map((col) => {
        if (!movedTask) {
          const taskIndex = col.tasks.findIndex((t) => t._id === taskId);
          if (taskIndex !== -1) {
            movedTask = col.tasks[taskIndex];
            const newTasks = [...col.tasks];
            newTasks.splice(taskIndex, 1);
            return { ...col, tasks: newTasks };
          }
        }

        if (col._id === columnId && movedTask) {
          return { ...col, tasks: [...col.tasks, movedTask] };
        }

        return col;
      })
    );
  };

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

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {board?.title || "Board"}
        </h1>
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {activeUsers.map((user) => (
            <div
              key={user._id}
              className="flex items-center space-x-2 bg-white shadow-md rounded-full px-3 py-1 border border-gray-200 min-w-[180px]"
              title={user.username}
            >
              <img
                src={user.avatar || `https://i.pravatar.cc/40?u=${user._id}`}
                alt={user.username}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex flex-col text-sm">
                <span className="font-medium text-gray-900 truncate">
                  {user.username}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4">
        <div className="flex gap-4">
          <DndContext onDragEnd={handleDragEnd}>
            {columns.map((col) => (
              <ColumnComp
                key={col._id}
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
          </DndContext>
        </div>

        <div className="w-72 flex-shrink-0">
          {!addingColumn ? (
            <Button
              size="sm"
              variant="ghost"
              className="w-full justify-start text-gray-600 hover:text-black"
              onClick={() => setAddingColumn(true)}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Column
            </Button>
          ) : (
            <div className="space-y-2 mt-2">
              <input
                type="text"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="Enter column name..."
                autoFocus
                className="w-full border border-gray-300 p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  className="bg-black text-white hover:bg-gray-900"
                  onClick={addColumn}
                >
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setAddingColumn(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
