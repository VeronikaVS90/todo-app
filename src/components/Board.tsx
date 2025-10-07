import { useState } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { useQueryClient } from "@tanstack/react-query";
import { Box, TextField, Button } from "@mui/material";
import { useColumns } from "../api/useColumns";
import { useMoveTask } from "../api/useMoveTask";
import { ColumnWithTasks } from "./ColumnWithTasks";
import type { Task } from "../types/types";

export function Board({ boardId }: { boardId: string }) {
  const { data: columns = [], create } = useColumns(boardId);
  const qc = useQueryClient();
  const moveTask = useMoveTask();
  const [colTitle, setColTitle] = useState("");

  const handleAddColumn = () => {
    const title = colTitle.trim();
    if (!title) return;
    create.mutate({ title });
    setColTitle("");
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const sameList =
      source.droppableId === destination.droppableId &&
      source.index === destination.index;
    if (sameList) return;

    const fromKey = ["tasks", source.droppableId];
    const toKey = ["tasks", destination.droppableId];

    const fromTasks = [...(qc.getQueryData<Task[]>(fromKey) || [])];
    const toTasks =
      source.droppableId === destination.droppableId
        ? fromTasks
        : [...(qc.getQueryData<Task[]>(toKey) || [])];

    const [moved] = fromTasks.splice(source.index, 1);
    if (!moved) return;

    const updated: Task = {
      ...moved,
      columnId: destination.droppableId,
    };

    toTasks.splice(destination.index, 0, updated);

    if (source.droppableId === destination.droppableId) {
      qc.setQueryData<Task[]>(fromKey, toTasks);
    } else {
      qc.setQueryData<Task[]>(fromKey, fromTasks);
      qc.setQueryData<Task[]>(toKey, toTasks);
    }

    moveTask.mutate(
      {
        id: String(draggableId),
        fromColumnId: source.droppableId,
        toColumnId: destination.droppableId,
        position: destination.index,
      },
      {
        onError: () => {
          qc.invalidateQueries({ queryKey: ["tasks", source.droppableId] });
          qc.invalidateQueries({
            queryKey: ["tasks", destination.droppableId],
          });
        },
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
        <Button variant="contained" onClick={handleAddColumn}>
          Add column
        </Button>
      </Box>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Box display="flex" gap={2} overflow="auto" pb={1}>
          {columns.map((col) => (
            <ColumnWithTasks
              key={String(col.id)}
              column={{ ...col, id: String(col.id) }}
            />
          ))}
        </Box>
      </DragDropContext>
    </>
  );
}
