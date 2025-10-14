import { useQueryClient } from "@tanstack/react-query";
import api from "./axios";
import type { Column } from "../schemas/schemas";
import { LocalStorageService } from "../services/localStorageService";

function reorderById(list: Column[], id: string, toIndex: number) {
  const arr = [...list];
  const fromIndex = arr.findIndex((c) => String(c.id) === String(id));
  if (fromIndex === -1) {
    console.error("❌ Column not found:", id);
    return arr;
  }

  // 1. Remove element first
  const [moved] = arr.splice(fromIndex, 1);

  // 2. Calculate clamped index AFTER removal (array is now shorter)
  const clamped = Math.max(0, Math.min(toIndex, arr.length));

  // 3. Insert at correct position
  arr.splice(clamped, 0, moved);

  // 4. Normalize positions
  const result = arr.map((c, i) => ({ ...c, position: i }));

  return result;
}

export function useMoveColumn(boardId: string) {
  const qc = useQueryClient();
  const key = ["columns", boardId] as const;

  return {
    // Manual cache update function to be called after animation
    updateCache: (id: string, position: number) => {
      const prev = qc.getQueryData<Column[]>(key) ?? [];
      const next = reorderById(prev, String(id), position);
      qc.setQueryData<Column[]>(key, next);
      LocalStorageService.set(`columns:${boardId}`, next);

      // Sync position with server
      api
        .put(`/columns/${encodeURIComponent(id)}`, {
          position,
          boardId,
        })
        .then(() => {
          // Successfully saved to server
        })
        .catch(() => {
          // Revert to previous state on error
          qc.setQueryData<Column[]>(key, prev);
          LocalStorageService.set(`columns:${boardId}`, prev);
        });
    },
  };
}
