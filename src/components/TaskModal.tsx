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
import { useEffect, useState, memo } from "react";
import type { Task } from "../schemas/schemas";
import { useTasks } from "../api/useTasks";

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  task: Task;
  columnId: string;
}

export const TaskModal = memo(function TaskModal({
  open,
  onClose,
  task,
  columnId,
}: TaskModalProps) {
  const { update } = useTasks(columnId);

  const [title, setTitle] = useState<string>(task.title);
  const [description, setDescription] = useState<string>(
    task.description ?? ""
  );

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description ?? "");
  }, [task.id, task.title, task.description]);

  const nextTitle = title.trim();
  const nextDesc = description.trim();

  const canSave =
    nextTitle.length > 0 &&
    (nextTitle !== task.title || nextDesc !== (task.description ?? ""));

  const handleSave = () => {
    const payload: { id: string; title?: string; description?: string } = {
      id: String(task.id),
    };

    if (nextTitle !== task.title) payload.title = nextTitle;

    if (nextDesc !== (task.description ?? "")) {
      payload.description = nextDesc;
    }

    update.mutate(payload, { onSuccess: () => onClose() });
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
});
