import { useState } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  TextField,
  Button,
} from "@mui/material";
import { TaskCard } from "./TaskCard";
import type { Task, Column as ColumnType } from "../types/types";
import { useTasks } from "../api/useTasks";

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
}

export function Column({ column, tasks }: ColumnProps) {
  const { create } = useTasks(column.id);
  const [newTitle, setNewTitle] = useState("");

  const handleAdd = () => {
    const title = newTitle.trim();
    if (!title) return;
    create.mutate({ title });
    setNewTitle("");
  };

  return (
    <Card sx={{ width: 280, flexShrink: 0 }}>
      <CardHeader title={column.title} />
      <CardContent>
        <Droppable droppableId={column.id}>
          {(provided) => (
            <Box
              ref={provided.innerRef}
              {...provided.droppableProps}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                minHeight: 8,
                mb: 1,
              }}
            >
              {tasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(drag) => (
                    <div
                      ref={drag.innerRef}
                      {...drag.draggableProps}
                      {...drag.dragHandleProps}
                    >
                      <TaskCard task={task} columnId={column.id} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>

        <Box display="flex" gap={1} mt={1}>
          <TextField
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="New task"
            size="small"
            fullWidth
          />
          <Button
            onClick={handleAdd}
            variant="outlined"
            size="small"
            disabled={!newTitle.trim() || create.isPending}
          >
            {create.isPending ? "..." : "Add"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
