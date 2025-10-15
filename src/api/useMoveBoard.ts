import { useQueryClient } from "@tanstack/react-query";
import api from "./axios";
import type { Board } from "../schemas/schemas";
import { BoardSchema } from "../schemas/schemas";
import { parseWithSchema } from "../lib/zod-helpers";
import { LocalStorageService } from "../services/localStorageService";

function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = list.slice();
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

function normalizePositions<T extends { position?: number }>(arr: T[]): T[] {
  return arr.map((item, i) => ({ ...item, position: i }));
}

export function useMoveBoard() {
  const qc = useQueryClient();
  const key = ["boards"] as const;

  return {
    // Manual cache update function to be called after animation
    updateCache: (id: string, position: number) => {
      const prev = qc.getQueryData<Board[]>(key) ?? [];
      const from = prev.findIndex((b) => String(b.id) === String(id));

      if (from === -1) return;

      // position is already correct from drag & drop
      const optimistic = normalizePositions(reorder(prev, from, position));
      qc.setQueryData<Board[]>(key, optimistic);
      LocalStorageService.set("boards", optimistic);

      // Make API call to sync with server
      api
        .put(`/boards/${encodeURIComponent(id)}`, { position })
        .then(({ data }) => {
          const serverBoard = parseWithSchema(BoardSchema, data);
          const updated = qc.getQueryData<Board[]>(key) || [];
          const normalized = normalizePositions(
            updated.map((b) =>
              String(b.id) === String(serverBoard.id)
                ? { ...b, ...serverBoard }
                : b
            )
          );
          qc.setQueryData<Board[]>(key, normalized);
          LocalStorageService.set("boards", normalized);
        })
        .catch(() => {
          // Revert to previous state
          qc.setQueryData<Board[]>(key, prev);
          LocalStorageService.set("boards", prev);
        });
    },
  };
}
