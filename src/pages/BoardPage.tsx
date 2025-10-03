import { useParams } from "react-router-dom";
import { useBoards } from "../api/useBoards";
import { Board } from "../components/Board";
import { useState, useEffect } from "react";
import { TextField } from "@mui/material";

export function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const { data: boards, isLoading, error, update } = useBoards();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");

  const board = boards?.find((b) => b.id === boardId);

  useEffect(() => {
    if (board) {
      setTitle(board.title);
    }
  }, [board]);

  if (!boardId) return <p>No board selected</p>;
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading boards</p>;
  if (!board) return <p>Board not found</p>;

  const handleSave = () => {
    const next = title.trim();
    if (!next || next === board.title) {
      setIsEditing(false);
      return;
    }
    update.mutate({ id: board.id, title: next });
    setIsEditing(false);
  };

  return (
    <div style={{ padding: "1rem" }}>
      {isEditing ? (
        <TextField
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          size="small"
          autoFocus
        />
      ) : (
        <h2 onClick={() => setIsEditing(true)}>{board.title}</h2>
      )}

      <Board boardId={boardId} />
    </div>
  );
}
