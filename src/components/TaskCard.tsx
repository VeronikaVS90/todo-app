import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useState } from "react";
import { useTasks } from "../api/useTasks";
import type { Task } from "../types/types";
import {
  Card,
  CardContent,
  IconButton,
  TextField,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";

interface TaskProps {
  task: Task;
  columnId: string;
}

export function TaskCard({ task, columnId }: TaskProps) {
  const { update, remove } = useTasks(columnId);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchorEl);

  const openMenu = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setMenuAnchorEl(e.currentTarget);
  };

  const closeMenu = () => setMenuAnchorEl(null);

  const handleUpdate = () => {
    const trimmed = editedTitle.trim();
    if (trimmed && trimmed !== task.title) {
      update.mutate({ id: task.id, title: trimmed });
    }
    setIsEditing(false);
  };

  const startInlineRename = () => {
    setEditedTitle(task.title);
    setIsEditing(true);
  };

  const onMenuRename = () => {
    closeMenu();
    startInlineRename();
  };

  const onMenuDelete = () => {
    closeMenu();
    remove.mutate({ id: task.id });
  };

  return (
    <Card variant="outlined">
      <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
        {isEditing ? (
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
            alignItems="start"
            justifyContent="space-between"
            gap={1}
          >
            <span
              onClick={startInlineRename}
              style={{ cursor: "pointer", flexGrow: 1 }}
            >
              {task.title}
            </span>

            <IconButton
              size="small"
              aria-label="more actions"
              aria-controls={menuOpen ? "column-menu" : undefined}
              aria-haspopup="menu"
              aria-expanded={menuOpen ? "true" : undefined}
              onClick={openMenu}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

        <Menu
          id="column-menu"
          anchorEl={menuAnchorEl}
          open={menuOpen}
          onClose={closeMenu}
          onClick={(e) => e.stopPropagation()}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem onClick={onMenuRename}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            Rename
          </MenuItem>

          <MenuItem onClick={onMenuDelete} disabled={remove.isPending}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            Delete
          </MenuItem>
        </Menu>
      </CardContent>
    </Card>
  );
}
