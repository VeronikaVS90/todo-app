import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./axios";
import type { Task } from "../schemas/schemas";
import { arrayMove, clamp, normalizePositions } from "./dnd-helpers";
import { LocalStorageService } from "../services/localStorageService";

export function useMoveTaskGlobal() {
  const qc = useQueryClient();

  return useMutation<
    void,
    Error,
    { id: string; fromColumnId: string; toColumnId: string; toIndex: number },
    { prevFrom?: Task[]; prevTo?: Task[] }
  >({
    mutationFn: async ({ id, toColumnId, toIndex }) => {
      // If no API configured, just return (move handled in onMutate)
      if (!import.meta.env.VITE_API_BASE_URL) {
        return;
      }

      // Otherwise, use API
      await api.put(`/tasks/${encodeURIComponent(id)}`, {
        columnId: toColumnId,
        position: toIndex,
      });
    },
    onMutate: async ({ id, fromColumnId, toColumnId, toIndex }) => {
      const fromKey = ["tasks", String(fromColumnId)] as const;
      const toKey = ["tasks", String(toColumnId)] as const;

      await Promise.all([
        qc.cancelQueries({ queryKey: fromKey, exact: true }),
        qc.cancelQueries({ queryKey: toKey, exact: true }),
      ]);

      const prevFrom = qc.getQueryData<Task[]>(fromKey) ?? [];
      const prevTo = qc.getQueryData<Task[]>(toKey) ?? [];

      if (fromColumnId === toColumnId) {
        const from = prevFrom.findIndex((t) => String(t.id) === String(id));
        if (from !== -1) {
          const to = clamp(toIndex, 0, prevFrom.length - 1);
          const moved = arrayMove(prevFrom, from, to);
          const norm = normalizePositions(moved);
          qc.setQueryData(fromKey, norm);
          LocalStorageService.set(`tasks:${fromColumnId}`, norm);
        }
        return { prevFrom, prevTo };
      }

      const item = prevFrom.find((t) => String(t.id) === String(id));
      if (!item) return { prevFrom, prevTo };

      const fromList = prevFrom.filter((t) => String(t.id) !== String(id));
      const to = clamp(toIndex, 0, prevTo.length);
      const toList = prevTo.slice();
      toList.splice(to, 0, { ...item, columnId: String(toColumnId) });

      const normFrom = normalizePositions(fromList);
      const normTo = normalizePositions(toList);
      qc.setQueryData(fromKey, normFrom);
      qc.setQueryData(toKey, normTo);
      LocalStorageService.set(`tasks:${fromColumnId}`, normFrom);
      LocalStorageService.set(`tasks:${toColumnId}`, normTo);

      return { prevFrom, prevTo };
    },
    onError: (_e, v, ctx) => {
      const fromKey = ["tasks", String(v.fromColumnId)] as const;
      const toKey = ["tasks", String(v.toColumnId)] as const;
      if (ctx?.prevFrom) {
        qc.setQueryData(fromKey, ctx.prevFrom);
        LocalStorageService.set(`tasks:${v.fromColumnId}`, ctx.prevFrom);
      }
      if (ctx?.prevTo) {
        qc.setQueryData(toKey, ctx.prevTo);
        LocalStorageService.set(`tasks:${v.toColumnId}`, ctx.prevTo);
      }
    },
  });
}
