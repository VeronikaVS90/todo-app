import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./axios";
import type { Task } from "../types/types";
import { LocalStorageService } from "../services/localStorageService";

const LIST_URL = "/tasks";
const ITEM_URL = (id: string) => `/tasks/${encodeURIComponent(id)}`;

export function useTasks(columnId: string) {
  const qc = useQueryClient();
  const colId = String(columnId);
  const queryKey = ["tasks", colId] as const;
  const LS_KEY = `tasks:${colId}`;

  const query = useQuery<Task[], Error>({
    queryKey,
    queryFn: async () => {
      const { data } = await api.get<Task[]>(LIST_URL);
      const filtered = data.filter((t) => String(t.columnId) === colId);
      LocalStorageService.set(LS_KEY, filtered);
      return filtered;
    },
    placeholderData: (prev) =>
      prev ?? LocalStorageService.get<Task[]>(LS_KEY) ?? undefined,
  });

  const create = useMutation<
    Task,
    Error,
    { title: string; description?: string }
  >({
    mutationFn: async (payload) => {
      const { data } = await api.post<Task>(LIST_URL, {
        ...payload,
        columnId: colId,
        done: false,
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  const update = useMutation<
    Task,
    Error,
    {
      id: string;
      title?: string;
      description?: string;
      columnId?: string;
      position?: number;
      done?: boolean;
    }
  >({
    mutationFn: async ({ id, ...updates }) => {
      const { data } = await api.put<Task>(ITEM_URL(String(id)), updates);
      return data;
    },
    onSuccess: (_res, vars) => {
      const target = String(vars.columnId ?? colId);
      qc.invalidateQueries({ queryKey: ["tasks", target] });
      if (target !== colId) qc.invalidateQueries({ queryKey });
    },
  });

  const remove = useMutation<void, Error, { id: string }, { prev?: Task[] }>({
    mutationFn: async ({ id }) => {
      await api.delete(ITEM_URL(String(id)));
    },
    onMutate: async ({ id }) => {
      await qc.cancelQueries({ queryKey });
      const prev = qc.getQueryData<Task[]>(queryKey);
      qc.setQueryData<Task[]>(queryKey, (list = []) =>
        list.filter((t) => String(t.id) !== String(id))
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData<Task[]>(queryKey, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey });
    },
  });

  return { ...query, create, update, remove };
}
