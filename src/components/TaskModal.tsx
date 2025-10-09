import CloseIcon from "@mui/icons-material/Close";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import { useEffect, useState } from "react";
import type { Task } from "../types/types";
import { useTasks } from "../api/useTasks";

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  task: Task;
  columnId: string;
}

export function TaskModal({ open, onClose, task, columnId }: TaskModalProps) {
  const { update } = useTasks(columnId);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description ?? "");
  }, [task.id]);

  const canSave =
    title.trim().length > 0 &&
    (title.trim() !== task.title ||
      (description ?? "") !== (task.description ?? ""));

  const handleSave = () => {
    const payload: Partial<Task> & { id: string } = {
      id: String(task.id),
      title: title.trim(),
      description: description.trim() || undefined,
    };

    update.mutate(payload, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pr: 6 }}>
        Update
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <TextField
            label="Name"
            value={title}
            autoFocus
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canSave) handleSave();
            }}
            fullWidth
            size="small"
            placeholder="Введіть назву задачі"
          />

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            minRows={3}
            fullWidth
            placeholder="Add description..."
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="text">
          Close
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!canSave || update.isPending}
        >
          {update.isPending ? "Saving…" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
