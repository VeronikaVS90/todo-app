import { useParams } from "react-router-dom";
import { useBoards } from "../api/useBoards";
import { Board } from "../components/Board";

export function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const { data: boards, isLoading, error } = useBoards();

  if (!boardId) return <p>No board selected</p>;
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading boards</p>;

  const board = boards?.find((b) => String(b.id) === String(boardId));
  if (!board) return <p>Board not found</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h2>{board.title}</h2>

      <Board boardId={boardId} />
    </div>
  );
}
