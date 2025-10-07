import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useState } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  TextField,
  Button,
  Menu,
  MenuItem,
  IconButton,
  ListItemIcon,
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

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchorEl);

  const openMenu = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setMenuAnchorEl(e.currentTarget);
  };

  const closeMenu = () => setMenuAnchorEl(null);

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

  const startInlineRename = () => {
    setEditedTitle(column.title);
    setIsEditing(true);
  };

  const onMenuRename = () => {
    closeMenu();
    startInlineRename();
  };

  const onMenuDelete = () => {
    closeMenu();
    remove.mutate({ id: column.id });
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
              <span onClick={startInlineRename}>{column.title}</span>

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
          )
        }
      />

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
