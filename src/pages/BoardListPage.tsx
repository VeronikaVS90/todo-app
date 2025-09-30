import React from "react";
import { observer } from "mobx-react-lite";
import {
  Container,
  TextField,
  Button,
  List,
  ListItem,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
} from "@mui/material";
import { useBoards } from "../api/useBoards";
import { useStore } from "../store/useStore";
import Brightness4Icon from "@mui/icons-material/Brightness4";

const BoardListPage = observer(() => {
  const { data, isLoading, error, create } = useBoards();
  const [title, setTitle] = React.useState("");
  const store = useStore();

  const onCreate = () => {
    if (!title.trim()) return;
    create.mutate({ title: title.trim() });
    setTitle("");
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <div style={{ flex: 1 }}>My To Do List</div>
          <IconButton color="inherit" onClick={() => store.ui.toggleTheme()}>
            <Brightness4Icon />
          </IconButton>
        </Toolbar>
      </AppBar>

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
              <ListItem key={b.id}>{b.title}</ListItem>
            ))}
          </List>
        )}
      </Container>
    </>
  );
});

export default BoardListPage;
