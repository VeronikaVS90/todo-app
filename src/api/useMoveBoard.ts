import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./axios";
import type { Board } from "../types/types";

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

  return useMutation<
    Board,
    Error,
    { id: string; position: number },
    { prev?: Board[]; from?: number; to?: number }
  >({
    mutationFn: async ({ id, position }) => {
      const { data } = await api.put<Board>(
        `/boards/${encodeURIComponent(id)}`,
        { position }
      );
      return data;
    },

    onMutate: async ({ id, position }) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<Board[]>(key) ?? [];

      const from = prev.findIndex((b) => String(b.id) === String(id));
      if (from === -1) return { prev };

      const to = Math.max(0, Math.min(position, prev.length - 1));
      const optimistic = normalizePositions(reorder(prev, from, to));
      qc.setQueryData<Board[]>(key, optimistic);

      return { prev, from, to };
    },

    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData<Board[]>(key, ctx.prev);
    },

    onSuccess: (serverBoard) => {
      qc.setQueryData<Board[]>(key, (curr = []) =>
        normalizePositions(
          curr.map((b) =>
            String(b.id) === String(serverBoard.id)
              ? { ...b, ...serverBoard }
              : b
          )
        )
      );
    },
  });
}
