import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Column } from "../types/types";
import { LocalStorageService } from "../services/localStorageService";

interface MoveColumnProps {
  id: string;
  position: number;
}

function reorderById(list: Column[], id: string, toIndex: number) {
  const arr = [...list];
  const fromIndex = arr.findIndex((c) => String(c.id) === String(id));
  if (fromIndex === -1) return arr;

  const clamped = Math.max(0, Math.min(toIndex, arr.length));

  const [moved] = arr.splice(fromIndex, 1);
  arr.splice(clamped, 0, moved);

  return arr.map((c, i) => ({ ...c, position: i }));
}

export function useMoveColumn(boardId: string) {
  const qc = useQueryClient();
  const key = ["columns", boardId] as const;

  return useMutation<Column, Error, MoveColumnProps, { prev: Column[] }>({
    mutationFn: async ({ id, position }) => {
      // Don't send position to API, just return the column data
      // The position will be managed locally
      const current = qc.getQueryData<Column[]>(key) ?? [];
      const column = current.find((c) => String(c.id) === String(id));
      return column || ({ id, position } as Column);
    },

    onMutate: async ({ id, position }) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<Column[]>(key) ?? [];
      const next = reorderById(prev, String(id), position);
      qc.setQueryData<Column[]>(key, next);
      LocalStorageService.set(`columns:${boardId}`, next);
      return { prev };
    },

    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData<Column[]>(key, ctx.prev);
        LocalStorageService.set(`columns:${boardId}`, ctx.prev);
      }
    },

    onSuccess: () => {
      // Position is already updated in onMutate, just ensure localStorage is saved
      const cur = qc.getQueryData<Column[]>(key) ?? [];
      LocalStorageService.set(`columns:${boardId}`, cur);
    },
  });
}
