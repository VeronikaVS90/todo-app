import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./axios";
import type { Task } from "../schemas/schemas";
import { TaskSchema, TaskArraySchema } from "../schemas/schemas";
import { parseWithSchema } from "../lib/zod-helpers";
import { LocalStorageService } from "../services/localStorageService";

const LIST_URL = "/tasks";
const ITEM_URL = (id: string) => `/tasks/${encodeURIComponent(id)}`;

export function useTasks(columnId: string) {
  const qc = useQueryClient();
  const colId = String(columnId);
  const key = ["tasks", colId] as const;
  const LS = `tasks:${colId}`;

  const query = useQuery<Task[], Error>({
    queryKey: key,
    queryFn: async () => {
      // If no API URL configured, use localStorage only
      if (!import.meta.env.VITE_API_BASE_URL) {
        const saved = LocalStorageService.get<Task[]>(LS) || [];
        return saved.sort(
          (a, b) =>
            (a.position ?? 0) - (b.position ?? 0) ||
            String(a.id).localeCompare(String(b.id))
        );
      }

      try {
        const { data } = await api.get(LIST_URL);
        const all = parseWithSchema(TaskArraySchema, data);
        const filtered = all.filter((t) => String(t.columnId) === colId);

        const saved = LocalStorageService.get<Task[]>(LS) || [];
        const merged = filtered.map((t) => {
          const s = saved.find((x) => String(x.id) === String(t.id));
          return s ? { ...t, position: s.position } : t;
        });

        const sorted = merged.sort(
          (a, b) =>
            (a.position ?? 0) - (b.position ?? 0) ||
            String(a.id).localeCompare(String(b.id))
        );
        LocalStorageService.set(LS, sorted);
        return sorted;
      } catch (error) {
        console.error("❌ API Error in useTasks:", error);
        // Fallback to localStorage on any error
        const saved = LocalStorageService.get<Task[]>(LS) || [];
        return saved.sort(
          (a, b) =>
            (a.position ?? 0) - (b.position ?? 0) ||
            String(a.id).localeCompare(String(b.id))
        );
      }
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    placeholderData: LocalStorageService.get<Task[]>(LS) ?? ((prev) => prev),
  });

  const create = useMutation<
    Task,
    Error,
    { title: string; description?: string }
  >({
    mutationFn: async (payload) => {
      const { data } = await api.post(LIST_URL, {
        ...payload,
        columnId: colId,
        description: payload.description ?? "",
      });
      return parseWithSchema(TaskSchema, data);
    },
    onSuccess: (task) => {
      const cur = qc.getQueryData<Task[]>(key) ?? [];
      const next = [...cur, { ...task, position: cur.length }];
      qc.setQueryData(key, next);
      LocalStorageService.set(LS, next);
    },
  });

  const update = useMutation<
    Task,
    Error,
    { id: string; title?: string; description?: string }
  >({
    mutationFn: async ({ id, ...updates }) => {
      const { data } = await api.put(ITEM_URL(String(id)), updates);
      return parseWithSchema(TaskSchema, data);
    },
    onSuccess: (server) => {
      const cur = qc.getQueryData<Task[]>(key) ?? [];
      const next = cur.map((t) =>
        String(t.id) === String(server.id) ? { ...t, ...server } : t
      );
      qc.setQueryData(key, next);
      LocalStorageService.set(LS, next);
    },
  });

  const remove = useMutation<void, Error, { id: string }, { prev?: Task[] }>({
    mutationFn: async ({ id }) => {
      await api.delete(ITEM_URL(String(id)));
    },
    onMutate: async ({ id }) => {
      await qc.cancelQueries({ queryKey: key, exact: true });
      const prev = qc.getQueryData<Task[]>(key) ?? [];
      const next = (prev || []).filter((t) => String(t.id) !== String(id));
      qc.setQueryData<Task[]>(key, next);
      LocalStorageService.set(LS, next);
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData<Task[]>(key, ctx.prev);
        LocalStorageService.set(LS, ctx.prev);
      }
    },
  });

  return { ...query, create, update, remove };
}
