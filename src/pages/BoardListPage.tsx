import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { observer } from "mobx-react-lite";
import {
  Container,
  TextField,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  IconButton,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";

import { useBoards } from "../api/useBoards";
import { useMoveBoard } from "../api/useMoveBoard";

const BoardListPage = observer(() => {
  const { data, isLoading, error, create, update, remove } = useBoards();
  const move = useMoveBoard();

  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const onCreate = () => {
    const next = title.trim();
    if (!next) return;
    create.mutate({ title: next });
    setTitle("");
  };

  const startEdit = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditingTitle(currentTitle);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  const saveEdit = (id: string, originalTitle: string) => {
    const next = editingTitle.trim();
    if (!next || next === originalTitle) {
      cancelEdit();
      return;
    }
    update.mutate(
      { id, title: next },
      {
        onSettled: () => {
          cancelEdit();
        },
      }
    );
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (destination.index === source.index) return;
    move.mutate({ id: String(draggableId), position: destination.index });
  };

  return (
    <Container style={{ marginTop: 24 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <TextField
          label="New board"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          size="small"
        />
        <Button
          variant="contained"
          onClick={onCreate}
          disabled={!title.trim() || create.isPending}
        >
          {create.isPending ? "Creating..." : "Create"}
        </Button>
      </div>

      {isLoading ? (
        <CircularProgress />
      ) : error ? (
        <div>Error loading</div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="boards" type="BOARD">
            {(dropProvided) => (
              <List
                ref={dropProvided.innerRef}
                {...dropProvided.droppableProps}
              >
                {data?.map((b, index) => {
                  const isRowEditing = editingId === b.id;
                  return (
                    <Draggable
                      key={String(b.id)}
                      draggableId={String(b.id)}
                      index={index}
                      isDragDisabled={isRowEditing}
                    >
                      {(dragProvided) => (
                        <ListItem
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          secondaryAction={
                            <Box sx={{ display: "flex", gap: 0.5 }}>
                              <IconButton
                                size="small"
                                aria-label="drag board"
                                {...dragProvided.dragHandleProps}
                              >
                                <DragIndicatorIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                aria-label="edit board"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEdit(b.id, b.title);
                                }}
                                disabled={isRowEditing}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  remove.mutate({ id: b.id });
                                }}
                                aria-label="delete board"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          }
                          disablePadding
                        >
                          {isRowEditing ? (
                            <div style={{ padding: "8px 16px", width: "100%" }}>
                              <TextField
                                value={editingTitle}
                                onChange={(e) =>
                                  setEditingTitle(e.target.value)
                                }
                                onBlur={() => saveEdit(b.id, b.title)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter")
                                    saveEdit(b.id, b.title);
                                  if (e.key === "Escape") cancelEdit();
                                }}
                                autoFocus
                                fullWidth
                                size="small"
                                disabled={update.isPending}
                              />
                            </div>
                          ) : (
                            <ListItemButton
                              component={RouterLink}
                              to={`/boards/${b.id}`}
                            >
                              <ListItemText primary={b.title} />
                            </ListItemButton>
                          )}
                        </ListItem>
                      )}
                    </Draggable>
                  );
                })}
                {dropProvided.placeholder}
              </List>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </Container>
  );
});

export default BoardListPage;
