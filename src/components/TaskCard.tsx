import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { useState } from "react";
import { type DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
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
  Tooltip,
} from "@mui/material";
import { TaskModal } from "./TaskModal";

interface TaskProps {
  task: Task;
  columnId: string;
  dragHandleProps?: DraggableProvidedDragHandleProps;
}

export function TaskCard({ task, columnId, dragHandleProps }: TaskProps) {
  const { update, remove } = useTasks(columnId);
  const [isEditingInline, setIsEditingInline] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchorEl);
  const [modalOpen, setModalOpen] = useState(false);

  const openMenu = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setMenuAnchorEl(e.currentTarget);
  };

  const closeMenu = () => setMenuAnchorEl(null);

  const handleUpdateInline = () => {
    const trimmed = editedTitle.trim();
    if (trimmed && trimmed !== task.title) {
      update.mutate({ id: String(task.id), title: trimmed });
    }
    setIsEditingInline(false);
  };

  const onMenuRename = () => {
    closeMenu();
    setModalOpen(true);
  };

  const onMenuDelete = () => {
    closeMenu();
    remove.mutate({ id: String(task.id) });
  };

  const getSnippet = (s?: string, max = 100) => {
    const raw = (s ?? "").trim();
    if (!raw) return "No description...";
    if (raw.length <= max) return raw;
    return raw.slice(0, max - 1).trimEnd() + "...";
  };

  const tooltipTitle = (
    <Box sx={{ maxWidth: 420 }}>
      <strong>Description:</strong> {getSnippet(task.description)}
    </Box>
  );

  return (
    <>
      <Tooltip title={tooltipTitle} arrow placement="top" enterDelay={500}>
        <Card variant="outlined">
          <CardContent
            sx={{ py: 1.5, "&:last-child": { pb: 1.5 }, cursor: "pointer" }}
            onClick={() => setModalOpen(true)}
          >
            {isEditingInline ? (
              <TextField
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleUpdateInline}
                onKeyDown={(e) => e.key === "Enter" && handleUpdateInline()}
                size="small"
                autoFocus
                fullWidth
              />
            ) : (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                gap={1}
              >
                <span style={{ flexGrow: 1 }}>{task.title}</span>

                <Tooltip title="Drag me!" arrow>
                  <IconButton
                    size="small"
                    aria-label="drag"
                    {...dragHandleProps}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DragIndicatorIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <IconButton
                  size="small"
                  aria-label="more actions"
                  aria-controls={menuOpen ? "task-menu" : undefined}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen ? "true" : undefined}
                  onClick={openMenu}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
            )}

            <Menu
              id="task-menu"
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
                Update
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
      </Tooltip>

      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        task={task}
        columnId={columnId}
      />
    </>
  );
}
