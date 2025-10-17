import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { useState, memo, useCallback } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { type DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
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
  Tooltip,
} from "@mui/material";
import { TaskCard } from "./TaskCard";
import type { Task, Column as ColumnType } from "../schemas/schemas";
import { useTasks } from "../api/useTasks";
import { useColumns } from "../api/useColumns";

interface ColumnProps {
  column: ColumnType & { id: string };
  tasks: Task[];
  dragHandleProps?: DraggableProvidedDragHandleProps;
}

export const Column = memo(function Column({
  column,
  tasks,
  dragHandleProps,
}: ColumnProps) {
  const columnId = String(column.id);
  const { create } = useTasks(columnId);
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

  const closeMenu = useCallback(() => setMenuAnchorEl(null), []);

  const handleAdd = useCallback(() => {
    const title = newTitle.trim();
    if (!title) return;
    create.mutate({ title });
    setNewTitle("");
  }, [newTitle, create]);

  const handleUpdate = useCallback(() => {
    const trimmed = editedTitle.trim();
    if (trimmed && trimmed !== column.title) {
      update.mutate({ id: columnId, title: trimmed });
    }
    setIsEditing(false);
  }, [editedTitle, column.title, update, columnId]);

  const startInlineRename = useCallback(() => {
    setEditedTitle(column.title);
    setIsEditing(true);
  }, [column.title]);

  const onMenuRename = useCallback(() => {
    closeMenu();
    setTimeout(() => {
      startInlineRename();
    }, 0);
  }, [closeMenu, startInlineRename]);

  const onMenuDelete = useCallback(() => {
    closeMenu();
    setTimeout(() => {
      remove.mutate({ id: columnId });
    }, 0);
  }, [closeMenu, remove, columnId]);

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
              gap={1}
            >
              <span onClick={startInlineRename} style={{ flexGrow: 1 }}>
                {column.title}
              </span>
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
        <Droppable droppableId={columnId}>
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
              {tasks
                .filter((t): t is Task => !!t)
                .map((task, index) => (
                  <Draggable
                    key={String(task.id)}
                    draggableId={String(task.id)}
                    index={index}
                  >
                    {(drag) => (
                      <div
                        ref={drag.innerRef}
                        {...drag.draggableProps}
                        style={drag.draggableProps.style}
                      >
                        <TaskCard
                          task={task}
                          columnId={columnId}
                          dragHandleProps={drag.dragHandleProps ?? undefined}
                        />
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
});
