import { useState, useCallback, useRef } from "react";
import { DragDropContext, Droppable, type DropResult } from "@hello-pangea/dnd";
import { Box, TextField, Button } from "@mui/material";
import { useColumns } from "../api/useColumns";
import { useMoveTaskGlobal } from "../api/useMoveTask";
import { ColumnWithTasks } from "./ColumnWithTasks";

export function Board({ boardId }: { boardId: string }) {
  const { data: columns = [], create, move: moveColumn } = useColumns(boardId);
  const moveTask = useMoveTaskGlobal();

  const [colTitle, setColTitle] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const columnsAtDragStartRef = useRef<typeof columns>([]);

  const addColumn = () => {
    const t = colTitle.trim();
    if (!t) return;
    create.mutate({ title: t });
    setColTitle("");
  };

  const onDragStart = useCallback(() => {
    columnsAtDragStartRef.current = columns.slice();
    setIsDragging(true);
  }, [columns]);

  const onDragEnd = useCallback(
    (result: DropResult) => {
      setIsDragging(false);
      const { source, destination, draggableId, type } = result;
      if (!destination) return;

      if (type === "COLUMN") {
        if (source.index !== destination.index) {
          moveColumn.mutate({
            id: String(draggableId),
            toIndex: destination.index,
          });
        }
        return;
      }

      const fromCol = source.droppableId;
      const toCol = destination.droppableId;
      if (fromCol === toCol && source.index === destination.index) return;

      moveTask.mutate({
        id: String(draggableId),
        fromColumnId: fromCol,
        toColumnId: toCol,
        toIndex: destination.index,
      });
    },
    [moveColumn, moveTask]
  );

  if (!columns) return null;

  return (
    <>
      <Box display="flex" gap={1} mb={2}>
        <TextField
          label="New column"
          size="small"
          value={colTitle}
          onChange={(e) => setColTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addColumn()}
        />
        <Button variant="contained" onClick={addColumn}>
          Add column
        </Button>
      </Box>

      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <Droppable
          droppableId={`board-columns:${boardId}`}
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
              {(isDragging ? columnsAtDragStartRef.current : columns)
                .filter(Boolean)
                .map((col, index) => (
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
