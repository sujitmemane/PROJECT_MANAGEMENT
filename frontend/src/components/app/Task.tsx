import { Button } from "@/components/ui/button";
import { useDraggable } from "@dnd-kit/core";
import { Edit, Trash } from "lucide-react";

interface TaskProps {
  task: { _id: string; text: string; position: number };
  editingTask: string | null;
  newTaskText: string;
  setNewTaskText: (text: string) => void;
  setEditingTask: (id: string | null) => void;
  updateTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
}

export default function Task({
  task,
  editingTask,
  newTaskText,
  setNewTaskText,
  setEditingTask,
  updateTask,
  deleteTask,
}: TaskProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task._id,
  });

  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="p-2 bg-gray-100 rounded-md text-gray-800 text-sm shadow-sm hover:bg-gray-200 transition flex justify-between items-center"
    >
      {editingTask === task._id ? (
        <>
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            className="border border-gray-300 p-1 rounded text-sm flex-1 mr-2"
          />
          <Button onClick={() => updateTask(task._id)}>Save</Button>
          <Button variant="ghost" onClick={() => setEditingTask(null)}>
            Cancel
          </Button>
        </>
      ) : (
        <>
          <span className="flex-1">{task.text}</span>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              onClick={() => {
                setEditingTask(task._id);
                setNewTaskText(task.text);
              }}
            >
              <Edit className="w-3 h-3" />
            </Button>
            <Button variant="ghost" onClick={() => deleteTask(task._id)}>
              <Trash className="w-3 h-3" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
