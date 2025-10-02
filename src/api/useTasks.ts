import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./axios";
import type { Task } from "../types/types";
import { LocalStorageService } from "../services/localStorageService";

export function useTasks(columnId: string) {
  const qc = useQueryClient();

  const LS_KEY = `tasks: ${columnId}`;

  const query = useQuery<Task[], Error>({
    queryKey: ["tasks", columnId],
    queryFn: async () => {
      try {
        const { data } = await api.get<Task[]>(`/tasks?columnId=${columnId}`);
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
      const { data } = await api.post<Task>(`/tasks`, { ...payload, columnId });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", columnId] });
    },
  });

  return { ...query, create };
}
