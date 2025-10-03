import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./axios";
import type { Task } from "../types/types";
import { LocalStorageService } from "../services/localStorageService";

const listUrl = (columnId: string) => `/tasks?columnId=${columnId}`;
const createUrl = `/tasks`;
const itemUrl = (id: string) => `/tasks/${id}`;

export function useTasks(columnId: string) {
  const qc = useQueryClient();
  const LS_KEY = `tasks:${columnId}`;

  const query = useQuery<Task[], Error>({
    queryKey: ["tasks", columnId],
    queryFn: async () => {
      try {
        const { data } = await api.get<Task[]>(listUrl(columnId));
        LocalStorageService.set(LS_KEY, data);
        return data;
      } catch {
        return LocalStorageService.get<Task[]>(LS_KEY) || [];
      }
    },
  });

  const create = useMutation<
    Task,
    Error,
    { title: string; description?: string }
  >({
    mutationFn: async (payload) => {
      const { data } = await api.post<Task>(createUrl, {
        ...payload,
        columnId,
        done: false,
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks", columnId] }),
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
      const { data } = await api.put<Task>(itemUrl(id), updates);
      return data;
    },
    onSuccess: (_res, vars) => {
      const target = vars.columnId ?? columnId;
      qc.invalidateQueries({ queryKey: ["tasks", target] });
    },
  });

  const remove = useMutation<void, Error, { id: string }>({
    mutationFn: async ({ id }) => {
      await api.delete(itemUrl(id));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks", columnId] }),
  });

  return { ...query, create, update, remove };
}
