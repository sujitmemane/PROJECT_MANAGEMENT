import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import Task from "./Task";
import { Button } from "../ui/button";
import { useDraggable, useDroppable } from "@dnd-kit/core";

interface ColumnProps {
  column: { _id: string; name: string; tasks: any[] };
  addingTask: string | null;
  newTaskText: string;
  setNewTaskText: (text: string) => void;
  setAddingTask: (id: string | null) => void;
  editingTask: string | null;
  setEditingTask: (id: string | null) => void;
  addTask: (columnId: string) => void;
  updateTask: (columnId: string, taskId: string) => void;
  deleteTask: (columnId: string, taskId: string) => void;
}

export default function ColumnComp({
  column,
  addingTask,
  setAddingTask,
  newTaskText,
  setNewTaskText,
  editingTask,
  setEditingTask,
  addTask,
  updateTask,
  deleteTask,
}: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column?._id,
  });
  return (
    <Card
      ref={setNodeRef}
      className="w-72 flex-shrink-0 bg-white shadow-lg rounded-lg"
    >
      <CardHeader className="px-4 py-2 border-b border-gray-200">
        <CardTitle className="text-lg font-semibold">{column.name}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 py-3 space-y-2">
        {column.tasks.map((task) => (
          <Task
            key={task._id}
            task={task}
            editingTask={editingTask}
            setEditingTask={setEditingTask}
            newTaskText={newTaskText}
            setNewTaskText={setNewTaskText}
            updateTask={(taskId) => updateTask(column._id, taskId)}
            deleteTask={(taskId) => deleteTask(column._id, taskId)}
          />
        ))}

        {addingTask === column._id ? (
          <div className="space-y-2 mt-2">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Enter task..."
              autoFocus
              className="w-full border border-gray-300 p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
            <div className="flex space-x-2">
              <Button
                size="sm"
                className="bg-black text-white hover:bg-gray-900"
                onClick={() => addTask(column._id)}
              >
                Add
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setAddingTask(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            className="w-full justify-start text-gray-600 hover:text-black"
            onClick={() => setAddingTask(column._id)}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Task
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
