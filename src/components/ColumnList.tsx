import { Card, CardContent, CardHeader } from "@mui/material";
import { Button, TextField } from "@mui/material";
import { useState } from "react";
import { useColumns } from "../api/useColumns";
import { TaskList } from "./TaskList";

type Props = { boardId: string };

export function ColumnList({ boardId }: Props) {
  const { data: columns = [], create } = useColumns(boardId);
  const [title, setTitle] = useState("");

  const handleAdd = () => {
    if (!title.trim()) return;
    create.mutate({ title });
    setTitle("");
  };

  return (
    <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
      {columns.map((col) => (
        <Card key={col.id} style={{ width: 250 }}>
          <CardHeader title={col.title} />
          <CardContent>
            <TaskList columnId={col.id} />
          </CardContent>
        </Card>
      ))}

      {/* Add new column */}
      <Card style={{ width: 250, padding: "1rem" }}>
        <TextField
          label="New column"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          size="small"
        />
        <Button
          variant="contained"
          fullWidth
          style={{ marginTop: "0.5rem" }}
          onClick={handleAdd}
        >
          Add
        </Button>
      </Card>
    </div>
  );
}
