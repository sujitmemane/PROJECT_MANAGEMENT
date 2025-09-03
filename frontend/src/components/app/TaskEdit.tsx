import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import axios from "axios";

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
}

const TaskEdit = ({ boardId, task, open, setOpen }: TaskEditProps) => {
  const [text, setText] = useState(task.text);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setText(task.text);
  }, [task]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.put(
        "http://localhost:8000/api/boards/update",
        {
          boardId,
          taskId: task._id,
          text,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setOpen(false);
    } catch (error) {
      console.error("Failed to update task:", error);
      alert("Error updating task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter task..."
            autoFocus
            className="w-full border border-gray-300 p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskEdit;
