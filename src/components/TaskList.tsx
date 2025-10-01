import { List, ListItem, ListItemText, Button, TextField } from "@mui/material";
import { useState } from "react";
import { useTasks } from "../api/useTasks";

type Props = { columnId: string };

export function TaskList({ columnId }: Props) {
  const { data: tasks = [], create } = useTasks(columnId);
  const [title, setTitle] = useState("");

  const handleAdd = () => {
    if (!title.trim()) return;
    create.mutate({ title });
    setTitle("");
  };

  return (
    <div>
      <List dense>
        {tasks.map((task) => (
          <ListItem key={task.id}>
            <ListItemText primary={task.title} />
          </ListItem>
        ))}
      </List>

      <TextField
        label="New task"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        size="small"
        fullWidth
      />

      <Button
        variant="outlined"
        fullWidth
        style={{ marginTop: "0.5rem" }}
        onClick={handleAdd}
      >
        Add Task
      </Button>
    </div>
  );
}
