import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import TaskEdit from "./TaskEdit";
import { useState } from "react";

interface TaskProps {
  task: { _id: string; text: string; position: number };
  deleteTask: (taskId: string) => void;
  boardId: string;
  columnId: string;
}

export default function Task({
  task,
  deleteTask,
  boardId,
  columnId,
}: TaskProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-2 bg-gray-100 rounded-md text-gray-800 text-sm shadow-sm hover:bg-gray-200 transition flex justify-between items-center">
      <span className="flex-1">{task.text}</span>
      <div className="flex space-x-1">
        <Button variant="ghost" onClick={() => setIsOpen(true)}>
          <Edit className="w-3 h-3" />
        </Button>
        <Button variant="ghost" onClick={() => deleteTask(task._id)}>
          <Trash className="w-3 h-3" />
        </Button>
      </div>
      {/* Edit Dialog */}
      <TaskEdit
        boardId={boardId}
        columnId={columnId}
        task={task}
        open={isOpen}
        setOpen={setIsOpen}
      />
    </div>
  );
}
