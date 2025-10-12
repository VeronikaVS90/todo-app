import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./axios";
import type { Column, Task } from "../types/types";
import { LocalStorageService } from "../services/localStorageService";

function reorderById(list: Column[], id: string, toIndex: number) {
  const arr = [...list];
  const fromIndex = arr.findIndex((c) => String(c.id) === String(id));
  if (fromIndex === -1) return arr;
  const [moved] = arr.splice(fromIndex, 1);
  const clamped = Math.max(0, Math.min(toIndex, arr.length));
  arr.splice(clamped, 0, moved);
  return arr.map((c, i) => ({ ...c, position: i }));
}

function sortCols(cols: Column[]) {
  return [...cols].sort(
    (a, b) =>
      (a.position ?? 0) - (b.position ?? 0) ||
      String(a.id).localeCompare(String(b.id))
  );
}

export function useColumns(boardId: string) {
  const qc = useQueryClient();
  const key = ["columns", boardId] as const;

  const query = useQuery<Column[], Error>({
    queryKey: key,
    queryFn: async () => {
      const { data } = await api.get<Column[]>(`/columns?boardId=${boardId}`);

      // Get saved positions from localStorage
      const savedPositions =
        LocalStorageService.get<Column[]>(`columns:${boardId}`) || [];

      // Merge API data with saved positions
      const merged = data.map((column) => {
        const saved = savedPositions.find(
          (c) => String(c.id) === String(column.id)
        );
        return saved ? { ...column, position: saved.position } : column;
      });

      const sorted = sortCols(merged);
      LocalStorageService.set(`columns:${boardId}`, sorted);
      return sorted;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    placeholderData: (prev) =>
      prev ??
      LocalStorageService.get<Column[]>(`columns:${boardId}`) ??
      undefined,
    select: (data) => sortCols(data),
  });

  const create = useMutation<Column, Error, { title: string }>({
    mutationFn: async (payload) => {
      const current = qc.getQueryData<Column[]>(key) ?? [];
      const { data } = await api.post<Column>(`/columns`, {
        ...payload,
        boardId,
        position: current.length,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key });
    },
  });

  const update = useMutation<
    Column,
    Error,
    { id: string; title: string; position?: number },
    { prev?: Column[] }
  >({
    mutationFn: async ({ id, ...updates }) => {
      const { data } = await api.put<Column>(`/columns/${id}`, updates);
      return data;
    },

    onMutate: async ({ id, title, position }) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<Column[]>(key) ?? [];

      let next = prev;
      if (typeof position === "number") {
        next = reorderById(prev, String(id), position);
      }
      if (typeof title === "string") {
        next = next.map((c) =>
          String(c.id) === String(id) ? { ...c, title } : c
        );
      }

      qc.setQueryData<Column[]>(key, next);
      return { prev };
    },

    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData<Column[]>(key, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: key });
    },
  });

  const remove = useMutation<
    void,
    Error,
    { id: string },
    { prevCols?: Column[]; prevTasksByCol?: Record<string, Task[]> }
  >({
    mutationFn: async ({ id }) => {
      await api.delete(`/columns/${encodeURIComponent(id)}`);
    },
    onMutate: async ({ id }) => {
      await qc.cancelQueries({ queryKey: key });

      const prevCols = qc.getQueryData<Column[]>(key) ?? [];

      const afterDelete = prevCols
        .filter((c) => String(c.id) !== String(id))
        .map((c, i) => ({ ...c, position: i }));
      qc.setQueryData<Column[]>(key, afterDelete);

      const prevTasksByCol: Record<string, Task[]> = {};
      const deletedId = String(id);
      const tasksKey = ["tasks", deletedId] as const;
      const prevTasks = qc.getQueryData<Task[]>(tasksKey);
      if (prevTasks) {
        prevTasksByCol[deletedId] = prevTasks;
        qc.removeQueries({ queryKey: tasksKey });
      }
      return { prevCols, prevTasksByCol };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prevCols) qc.setQueryData<Column[]>(key, ctx.prevCols);
      if (ctx?.prevTasksByCol) {
        for (const [colId, tasks] of Object.entries(ctx.prevTasksByCol)) {
          qc.setQueryData<Task[]>(["tasks", colId], tasks);
        }
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: key });
    },
  });

  return { ...query, create, update, remove };
}
