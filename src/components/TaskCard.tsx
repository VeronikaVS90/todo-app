import { useState } from "react";
import { useTasks } from "../api/useTasks";
import type { Task } from "../types/types";

export function TaskCard({ task, columnId }: { task: Task; columnId: string }) {
  const { update, remove } = useTasks(columnId);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);

  const handleSave = () => {
    update.mutate({ id: task.id, title });
    setIsEditing(false);
  };

  return (
    <div className="task-card border p-2 rounded bg-white shadow mb-2">
      {isEditing ? (
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSave}
          autoFocus
          className="border px-1"
        />
      ) : (
        <span onDoubleClick={() => setIsEditing(true)}>{task.title}</span>
      )}

      <button
        className="ml-2 text-red-500"
        onClick={() => remove.mutate({ id: task.id })}
      >
        X
      </button>
    </div>
  );
}
