import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
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
import { useColumns } from "../api/useColumns";

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
}

export function Column({ column, tasks }: ColumnProps) {
  const { create } = useTasks(column.id);
  const { update, remove } = useColumns(column.boardId);
  const [newTitle, setNewTitle] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(column.title);

  const handleAdd = () => {
    const title = newTitle.trim();
    if (!title) return;
    create.mutate({ title });
    setNewTitle("");
  };

  const handleUpdate = () => {
    const trimmed = editedTitle.trim();
    if (trimmed && trimmed !== column.title) {
      update.mutate({ id: column.id, title: trimmed });
    }
    setIsEditing(false);
  };

  return (
    <Card sx={{ width: 280, flexShrink: 0 }}>
      <CardHeader
        title={
          isEditing ? (
            <TextField
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleUpdate}
              onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
              size="small"
              autoFocus
              fullWidth
            />
          ) : (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <span onClick={() => setIsEditing(true)}>{column.title}</span>
              <IconButton onClick={() => setIsEditing(true)} size="small">
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  remove.mutate({ id: column.id });
                }}
                aria-label="delete column"
                size="small"
                disabled={remove.isPending}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          )
        }
      />
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
