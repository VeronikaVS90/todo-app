import { useState } from "react";
import { useTasks } from "../api/useTasks";
import type { Task } from "../types/types";
import { Card, CardContent, IconButton, TextField, Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export function TaskCard({ task, columnId }: { task: Task; columnId: string }) {
  const { update, remove } = useTasks(columnId);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);

  const handleSave = () => {
    const next = title.trim();
    if (!next || next === task.title) {
      setIsEditing(false);
      return;
    }
    update.mutate({ id: task.id, title: next });
    setIsEditing(false);
  };

  return (
    <Card variant="outlined">
      <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
        {isEditing ? (
          <TextField
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            size="small"
            autoFocus
            fullWidth
          />
        ) : (
          <Box
            display="flex"
            alignItems="start"
            justifyContent="space-between"
            gap={1}
          >
            <span onClick={() => setIsEditing(true)}>{task.title}</span>
            <IconButton
              size="small"
              onClick={() => remove.mutate({ id: task.id })}
              aria-label="delete task"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
