import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { observer } from "mobx-react-lite";
import {
  Container,
  TextField,
  Button,
  List,
  ListItemButton,
  CircularProgress,
} from "@mui/material";
import { useBoards } from "../api/useBoards";

const BoardListPage = observer(() => {
  const { data, isLoading, error, create } = useBoards();
  const [title, setTitle] = React.useState("");

  const onCreate = () => {
    if (!title.trim()) return;
    create.mutate({ title: title.trim() });
    setTitle("");
  };

  return (
    <>
      <Container style={{ marginTop: 24 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <TextField
            label="New board"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
            {data?.map((b) => (
              <ListItemButton
                key={b.id}
                component={RouterLink}
                to={`/boards/${b.id}`}
              >
                {b.title}
              </ListItemButton>
            ))}
          </List>
        )}
      </Container>
    </>
  );
});

export default BoardListPage;
