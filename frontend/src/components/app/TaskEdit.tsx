import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";

interface Column {
  _id: string;
  name: string;
}

interface Task {
  _id: string;
  text: string;
  position: number;
}

interface TaskEditProps {
  task: Task;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  boardId: string;
  columnId: string;
}

const TaskEdit = ({
  boardId,
  columnId,
  task,
  open,
  setOpen,
}: TaskEditProps) => {
  const [text, setText] = useState(task.text);
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [column1, setColumn1] = useState<string>(columnId);
  const [column2, setColumn2] = useState<string>(task._id);

  const fetchColumns = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/boards/${boardId}/info`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setColumns(response?.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch board info:", error);
    }
  };

  // Fetch tasks for a specific column
  const fetchTasks = async (colId: string) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/boards/${boardId}/columns/${colId}/info`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setTasks(response?.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch column tasks:", error);
    }
  };

  useEffect(() => {
    fetchColumns();
  }, [boardId]);

  // Load tasks whenever column1 changes
  useEffect(() => {
    if (column1) {
      fetchTasks(column1);
    }
  }, [column1]);

  // Reset values when editing a new task
  useEffect(() => {
    setText(task.text);
    setColumn1(columnId);
    setColumn2(task._id);
  }, [task, columnId]);

  const handleSave = () => {
    console.log("Final save:", { ...task, text, column1, column2 });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => setOpen(isOpen)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          {/* Task text input */}
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter task..."
            autoFocus
            className="w-full border border-gray-300 p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />

          {/* First Select (Columns) */}
          <div>
            <label className="text-sm font-medium">Move to Column</label>
            <Select onValueChange={setColumn1} value={column1}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                {columns.map((col, index) => (
                  <SelectItem key={col._id} value={col._id}>
                    {index + 1}. {col.name}
                    {col._id === columnId ? " (Current)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Second Select (Tasks reorder / Position) */}
          <div>
            <label className="text-sm font-medium">Position</label>
            <Select onValueChange={setColumn2} value={column2}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                {tasks.map((t, index) => (
                  <SelectItem key={t._id} value={t._id}>
                    Position {index + 1} → {t.text}
                    {t._id === task._id ? " (Current)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskEdit;
