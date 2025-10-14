import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./axios";
import type { Column } from "../schemas/schemas";
import { ColumnSchema, ColumnArraySchema } from "../schemas/schemas";
import { parseWithSchema } from "../lib/zod-helpers";
import { LocalStorageService } from "../services/localStorageService";
import { arrayMove, normalizePositions, clamp } from "./dnd-helpers";

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
  const LS_KEY = `columns:${boardId}`;

  const query = useQuery<Column[], Error>({
    queryKey: key,
    queryFn: async () => {
      const { data } = await api.get(`/columns?boardId=${boardId}`);
      const validated = parseWithSchema(ColumnArraySchema, data);

      const saved = LocalStorageService.get<Column[]>(LS_KEY) || [];
      const merged = validated.map((c) => {
        const hit = saved.find((s) => String(s.id) === String(c.id));
        return hit ? { ...c, position: hit.position } : c;
      });

      const sorted = sortCols(merged);
      LocalStorageService.set(LS_KEY, sorted);
      return sorted;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    placeholderData:
      LocalStorageService.get<Column[]>(LS_KEY) ?? ((prev) => prev),
  });

  const create = useMutation<Column, Error, { title: string }>({
    mutationFn: async (payload) => {
      const { data } = await api.post(`/columns`, { ...payload, boardId });
      return parseWithSchema(ColumnSchema, data);
    },
    onSuccess: (created) => {
      const cur = qc.getQueryData<Column[]>(key) ?? [];
      const next = [...cur, { ...created, position: cur.length }];
      qc.setQueryData(key, next);
      LocalStorageService.set(LS_KEY, next);
    },
  });

  const update = useMutation<
    Column,
    Error,
    { id: string; title?: string; position?: number },
    { prev?: Column[] }
  >({
    mutationFn: async ({ id, ...updates }) => {
      const { data } = await api.put(`/columns/${encodeURIComponent(id)}`, {
        ...updates,
        boardId,
      });
      return parseWithSchema(ColumnSchema, data);
    },
    onMutate: async ({ id, title, position }) => {
      await qc.cancelQueries({ queryKey: key, exact: true });
      const prev = qc.getQueryData<Column[]>(key) ?? [];
      let next = prev.map((c) =>
        String(c.id) === String(id) ? { ...c, ...(title ? { title } : {}) } : c
      );

      if (typeof position === "number") {
        const from = next.findIndex((c) => String(c.id) === String(id));
        if (from !== -1) {
          const to = clamp(position, 0, next.length - 1);
          next = normalizePositions(arrayMove(next, from, to));
        }
      }
      qc.setQueryData(key, next);
      LocalStorageService.set(LS_KEY, next);
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(key, ctx.prev);
        LocalStorageService.set(LS_KEY, ctx.prev);
      }
    },
  });

  const move = useMutation<
    void,
    Error,
    { id: string; toIndex: number },
    { prev?: Column[] }
  >({
    mutationFn: async ({ id, toIndex }) => {
      await api.put(`/columns/${encodeURIComponent(id)}`, {
        position: toIndex,
        boardId,
      });
    },
    onMutate: async ({ id, toIndex }) => {
      await qc.cancelQueries({ queryKey: key, exact: true });
      const prev = qc.getQueryData<Column[]>(key) ?? [];
      const from = prev.findIndex((c) => String(c.id) === String(id));
      if (from === -1) return { prev };
      const to = clamp(toIndex, 0, prev.length - 1);
      const next = normalizePositions(arrayMove(prev, from, to));
      qc.setQueryData(key, next);
      LocalStorageService.set(LS_KEY, next);
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(key, ctx.prev);
        LocalStorageService.set(LS_KEY, ctx.prev);
      }
    },
  });

  const remove = useMutation<void, Error, { id: string }, { prev?: Column[] }>({
    mutationFn: async ({ id }) => {
      await api.delete(`/columns/${encodeURIComponent(id)}`);
    },
    onMutate: async ({ id }) => {
      await qc.cancelQueries({ queryKey: key, exact: true });
      const prev = qc.getQueryData<Column[]>(key) ?? [];
      const next = normalizePositions(
        prev.filter((c) => String(c.id) !== String(id))
      );
      qc.setQueryData(key, next);
      LocalStorageService.set(LS_KEY, next);
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(key, ctx.prev);
        LocalStorageService.set(LS_KEY, ctx.prev);
      }
    },
  });

  return { ...query, create, update, move, remove };
}
