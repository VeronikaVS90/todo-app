import { Droppable, Draggable } from "@hello-pangea/dnd";
import { TaskCard } from "./TaskCard";
import type { Task, Column } from "../types/types";

interface ColumnProps {
  column: Column;
  tasks: Task[];
}

export function Column({ column, tasks }: ColumnProps) {
  return (
    <div className="column bg-gray-100 p-3 rounded w-64">
      <h3 className="font-bold mb-2">{column.title}</h3>
      <Droppable droppableId={column.id}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="space-y-2"
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <TaskCard task={task} columnId={column.id} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
