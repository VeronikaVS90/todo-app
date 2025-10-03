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
import { useBoards } from "../api/useBoards";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const BoardListPage = observer(() => {
  const { data, isLoading, error, create, update, remove } = useBoards();
  const [title, setTitle] = useState("");
  const [editingId, setEditingID] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const onCreate = () => {
    const next = title.trim();
    if (!next) return;
    create.mutate({ title: next });
    setTitle("");
  };

  const startEdit = (id: string, currentTitle: string) => {
    setEditingID(id);
    setEditingTitle(currentTitle);
  };

  const cancelEdit = () => {
    setEditingID(null);
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
        <List>
          {data?.map((b) => {
            const isRowEditing = editingId === b.id;
            return (
              <ListItem
                key={b.id}
                secondaryAction={
                  <Box sx={{ display: "flex", gap: 0.5 }}>
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
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={() => saveEdit(b.id, b.title)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(b.id, b.title);
                        if (e.key === "Escape") cancelEdit();
                      }}
                      autoFocus
                      fullWidth
                      size="small"
                      disabled={update.isPending}
                    />
                  </div>
                ) : (
                  <ListItemButton component={RouterLink} to={`/boards/${b.id}`}>
                    <ListItemText primary={b.title} />
                  </ListItemButton>
                )}
              </ListItem>
            );
          })}
        </List>
      )}
    </Container>
  );
});

export default BoardListPage;
