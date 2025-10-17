import { useQueryClient } from "@tanstack/react-query";
import api from "./axios";
import type { Column } from "../schemas/schemas";
import { LocalStorageService } from "../services/localStorageService";

function reorderById(list: Column[], id: string, toIndex: number) {
  const arr = [...list];
  const fromIndex = arr.findIndex((c) => String(c.id) === String(id));
  if (fromIndex === -1) {
    console.error("Column not found:", id);
    return arr;
  }

  const [moved] = arr.splice(fromIndex, 1);

  const clamped = Math.max(0, Math.min(toIndex, arr.length));

  arr.splice(clamped, 0, moved);

  const result = arr.map((c, i) => ({ ...c, position: i }));

  return result;
}

export function useMoveColumn(boardId: string) {
  const qc = useQueryClient();
  const key = ["columns", boardId] as const;

  return {
    updateCache: (id: string, position: number) => {
      const prev = qc.getQueryData<Column[]>(key) ?? [];
      const next = reorderById(prev, String(id), position);
      qc.setQueryData<Column[]>(key, next);
      LocalStorageService.set(`columns:${boardId}`, next);

      // If no API configured, just use optimistic update
      if (!import.meta.env.VITE_API_BASE_URL) {
        return;
      }

      // Otherwise, sync with API
      api
        .put(`/columns/${encodeURIComponent(id)}`, {
          position,
          boardId,
        })
        .catch(() => {
          qc.setQueryData<Column[]>(key, prev);
          LocalStorageService.set(`columns:${boardId}`, prev);
        });
    },
  };
}
