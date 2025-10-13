import { useState } from "react";
import { DragDropContext, Droppable, type DropResult } from "@hello-pangea/dnd";
import { useQueryClient } from "@tanstack/react-query";
import { Box, TextField, Button } from "@mui/material";
import { useColumns } from "../api/useColumns";
import { useMoveTask } from "../api/useMoveTask";
import { useMoveColumn } from "../api/useMoveColumn";
import { ColumnWithTasks } from "./ColumnWithTasks";
import { LocalStorageService } from "../services/localStorageService";
import type { Task } from "../schemas/schemas";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(n, max));
}

function normalizePositions<T extends { position?: number }>(arr: T[]): T[] {
  return arr.map((item, i) => ({ ...item, position: i }));
}

export function Board({ boardId }: { boardId: string }) {
  const { data: columns = [], create } = useColumns(boardId);
  const moveColumn = useMoveColumn(boardId);
  const moveTask = useMoveTask();

  const qc = useQueryClient();
  const [colTitle, setColTitle] = useState("");

  const addColumn = () => {
    const title = colTitle.trim();
    if (!title) return;
    create.mutate({ title });
    setColTitle("");
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId, type } = result;
    if (!destination) return;

    const samePlace =
      source.droppableId === destination.droppableId &&
      source.index === destination.index;
    if (samePlace) return;

    if (type === "COLUMN") {
      const to = Math.max(0, Math.min(destination.index, columns.length));
      moveColumn.mutate({ id: String(draggableId), position: to });
      return;
    }

    const fromKey = ["tasks", source.droppableId] as const;
    const toKey = ["tasks", destination.droppableId] as const;

    const fromTasks = [...(qc.getQueryData<Task[]>(fromKey) || [])];
    const toTasks =
      source.droppableId === destination.droppableId
        ? fromTasks
        : [...(qc.getQueryData<Task[]>(toKey) || [])];

    const fromIdx = clamp(source.index, 0, Math.max(0, fromTasks.length - 1));
    const toIdx = clamp(destination.index, 0, toTasks.length);

    const [movedTask] = fromTasks.splice(fromIdx, 1);
    if (!movedTask) return;

    const updated: Task = {
      ...movedTask,
      columnId: destination.droppableId,
    };

    toTasks.splice(toIdx, 0, updated);

    if (source.droppableId === destination.droppableId) {
      const normalized = normalizePositions(toTasks);
      qc.setQueryData<Task[]>(fromKey, normalized);
      LocalStorageService.set(`tasks:${source.droppableId}`, normalized);
    } else {
      const normalizedFrom = normalizePositions(fromTasks);
      const normalizedTo = normalizePositions(toTasks);
      qc.setQueryData<Task[]>(fromKey, normalizedFrom);
      qc.setQueryData<Task[]>(toKey, normalizedTo);
      LocalStorageService.set(`tasks:${source.droppableId}`, normalizedFrom);
      LocalStorageService.set(`tasks:${destination.droppableId}`, normalizedTo);
    }

    moveTask.mutate(
      {
        id: String(draggableId),
        fromColumnId: source.droppableId,
        toColumnId: destination.droppableId,
        position: toIdx,
      },
      {
        onError: () => {
          // Revert optimistic updates on error
          qc.invalidateQueries({ queryKey: fromKey });
          qc.invalidateQueries({ queryKey: toKey });
        },
        // No onSettled - we don't want to invalidate after successful move
        // as it would reload data from server and lose local positions
      }
    );
  };

  return (
    <>
      <Box display="flex" gap={1} mb={2}>
        <TextField
          label="New column"
          size="small"
          value={colTitle}
          onChange={(e) => setColTitle(e.target.value)}
        />
        <Button variant="contained" onClick={addColumn}>
          Add column
        </Button>
      </Box>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable
          droppableId={`board:${boardId}`}
          direction="horizontal"
          type="COLUMN"
        >
          {(provided) => (
            <Box
              ref={provided.innerRef}
              {...provided.droppableProps}
              display="flex"
              gap={2}
              overflow="auto"
              pb={1}
            >
              {columns.map((col, index) => (
                <ColumnWithTasks
                  key={String(col.id)}
                  column={{ ...col, id: String(col.id) }}
                  index={index}
                />
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>
    </>
  );
}
