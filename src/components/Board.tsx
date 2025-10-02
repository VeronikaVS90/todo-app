import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { useColumns } from "../api/useColumns";
import { ColumnWithTasks } from "./ColumnWithTasks";
import { useQueryClient } from "@tanstack/react-query";
import type { Task } from "../types/types";

export function Board({ boardId }: { boardId: string }) {
  const { data: columns = [] } = useColumns(boardId);
  const qc = useQueryClient();

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const fromKey = ["tasks", source.droppableId];
    const toKey = ["tasks", destination.droppableId];
    const fromTasks = qc.getQueryData<Task[]>(fromKey) || [];
    const toTasks =
      source.droppableId === destination.droppableId
        ? [...fromTasks]
        : qc.getQueryData<Task[]>(toKey) || [];

    const [movedTask] = fromTasks.splice(source.index, 1);

    if (!movedTask) return;

    const updatedTask: Task = {
      ...movedTask,
      columnId: destination.droppableId,
    };

    toTasks.splice(destination.index, 0, updatedTask);

    qc.setQueryData<Task[]>(
      fromKey,
      source.droppableId === destination.droppableId ? toTasks : fromTasks
    );
    if (source.droppableId !== destination.droppableId) {
      qc.setQueryData<Task[]>(toKey, toTasks);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex space-x-4">
        {columns.map((col) => (
          <ColumnWithTasks key={col.id} column={col} />
        ))}
      </div>
    </DragDropContext>
  );
}
