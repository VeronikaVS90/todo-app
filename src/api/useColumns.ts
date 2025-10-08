import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./axios";
import type { Column, Task } from "../types/types";
import { LocalStorageService } from "../services/localStorageService";

export function useColumns(boardId: string) {
  const qc = useQueryClient();
  const key = ["columns", boardId] as const;

  const query = useQuery<Column[], Error>({
    queryKey: key,
    queryFn: async () => {
      try {
        const { data } = await api.get<Column[]>(`/columns?boardId=${boardId}`);
        LocalStorageService.set(`columns:${boardId}`, data);
        return data;
      } catch {
        return LocalStorageService.get<Column[]>(`columns:${boardId}`) || [];
      }
    },
  });

  const create = useMutation<Column, Error, { title: string }>({
    mutationFn: async (payload) => {
      const { data } = await api.post<Column>(`/columns`, {
        ...payload,
        boardId,
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
    { id: string; title: string },
    { prev?: Column[] }
  >({
    mutationFn: async ({ id, ...updates }) => {
      const { data } = await api.put<Column>(`/columns/${id}`, updates);
      return data;
    },
    onMutate: async ({ id, title }) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<Column[]>(key);
      // оптимістично оновлюємо заголовок
      qc.setQueryData<Column[]>(key, (list = []) =>
        list.map((c) => (String(c.id) === String(id) ? { ...c, title } : c))
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
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
    { prevCols?: Column[]; prevTasks?: Task[] }
  >({
    mutationFn: async ({ id }) => {
      await api.delete(`/columns/${id}`);
    },
    onMutate: async ({ id }) => {
      await qc.cancelQueries({ queryKey: key });
      const prevCols = qc.getQueryData<Column[]>(key);
      qc.setQueryData<Column[]>(key, (list = []) =>
        list.filter((c) => String(c.id) !== String(id))
      );

      // каскад — прибираємо задачі цієї колонки з глобального кеша ["tasks"]
      const prevTasks = qc.getQueryData<Task[]>(["tasks"]);
      if (prevTasks) {
        qc.setQueryData<Task[]>(
          ["tasks"],
          prevTasks.filter((t) => String(t.columnId) !== String(id))
        );
      }
      return { prevCols, prevTasks };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prevCols) qc.setQueryData<Column[]>(key, ctx.prevCols);
      if (ctx?.prevTasks) qc.setQueryData<Task[]>(["tasks"], ctx.prevTasks);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: key });
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  return { ...query, create, update, remove };
}
