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
      try {
        const { data } = await api.get<Task[]>(LIST_URL);
        const filtered = data.filter((t) => String(t.columnId) === colId);

        // Get saved positions from localStorage
        const savedPositions = LocalStorageService.get<Task[]>(LS_KEY) || [];

        // Merge API data with saved positions
        const merged = filtered.map((task) => {
          const saved = savedPositions.find(
            (t) => String(t.id) === String(task.id)
          );
          return saved ? { ...task, position: saved.position } : task;
        });

        const sorted = merged.sort(
          (a, b) =>
            (a.position ?? 0) - (b.position ?? 0) ||
            String(a.id).localeCompare(String(b.id))
        );

        LocalStorageService.set(LS_KEY, sorted);
        return sorted;
      } catch (error: unknown) {
        // If API returns 404, return saved positions from localStorage
        if (
          error &&
          typeof error === "object" &&
          "response" in error &&
          error.response &&
          typeof error.response === "object" &&
          "status" in error.response &&
          error.response.status === 404
        ) {
          const savedPositions = LocalStorageService.get<Task[]>(LS_KEY) || [];
          return savedPositions.sort(
            (a, b) =>
              (a.position ?? 0) - (b.position ?? 0) ||
              String(a.id).localeCompare(String(b.id))
          );
        }
        throw error;
      }
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
        description: "",
      });
      return data;
    },
    onSuccess: (newTask) => {
      const current = qc.getQueryData<Task[]>(queryKey) || [];
      const updated = [...current, { ...newTask, position: current.length }];
      qc.setQueryData<Task[]>(queryKey, updated);
      LocalStorageService.set(LS_KEY, updated);
    },
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
    },
    {
      prevSource?: Task[];
      prevTarget?: Task[];
      targetKey?: readonly ["tasks", string];
    }
  >({
    mutationFn: async ({ id, ...updates }) => {
      const { data } = await api.put<Task>(ITEM_URL(String(id)), updates);
      return data;
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey });

      const sourceKey = queryKey;
      const targetCol = String(vars.columnId ?? colId);
      const targetKey = ["tasks", targetCol] as const;

      const prevSource = qc.getQueryData<Task[]>(sourceKey);
      const prevTarget =
        targetCol !== colId ? qc.getQueryData<Task[]>(targetKey) : undefined;

      const patchTask = (t: Task) =>
        String(t.id) === String(vars.id) ? { ...t, ...vars } : t;

      if (targetCol === colId) {
        const updated = (qc.getQueryData<Task[]>(sourceKey) || []).map(
          patchTask
        );
        qc.setQueryData<Task[]>(sourceKey, updated);
        LocalStorageService.set(LS_KEY, updated);
      } else {
        const sourceUpdated = (qc.getQueryData<Task[]>(sourceKey) || []).filter(
          (t) => String(t.id) !== String(vars.id)
        );
        qc.setQueryData<Task[]>(sourceKey, sourceUpdated);
        LocalStorageService.set(LS_KEY, sourceUpdated);

        const targetUpdated = [...(qc.getQueryData<Task[]>(targetKey) ?? [])];
        const updatedTask: Task = {
          ...(prevSource?.find(
            (t) => String(t.id) === String(vars.id)
          ) as Task),
          ...vars,
          columnId: targetCol,
        };

        const at =
          typeof vars.position === "number"
            ? vars.position
            : targetUpdated.length;
        targetUpdated.splice(
          Math.max(0, Math.min(at, targetUpdated.length)),
          0,
          updatedTask
        );
        qc.setQueryData<Task[]>(targetKey, targetUpdated);
        LocalStorageService.set(`tasks:${targetCol}`, targetUpdated);
      }

      return { prevSource, prevTarget, targetKey };
    },

    onError: (_e, _vars, ctx) => {
      if (!ctx) return;
      if (ctx.prevSource) {
        qc.setQueryData(queryKey, ctx.prevSource);
        LocalStorageService.set(LS_KEY, ctx.prevSource);
      }
      if (ctx.prevTarget && ctx.targetKey) {
        qc.setQueryData(ctx.targetKey, ctx.prevTarget);
        LocalStorageService.set(`tasks:${ctx.targetKey[1]}`, ctx.prevTarget);
      }
    },

    onSettled: () => {
      // Don't invalidate queries as we manage positions locally
      // Only invalidate if there was an error (handled in onError)
    },
  });

  const remove = useMutation<void, Error, { id: string }, { prev?: Task[] }>({
    mutationFn: async ({ id }) => {
      await api.delete(ITEM_URL(String(id)));
    },
    onMutate: async ({ id }) => {
      await qc.cancelQueries({ queryKey });
      const prev = qc.getQueryData<Task[]>(queryKey);
      const updated = (qc.getQueryData<Task[]>(queryKey) || []).filter(
        (t) => String(t.id) !== String(id)
      );
      qc.setQueryData<Task[]>(queryKey, updated);
      LocalStorageService.set(LS_KEY, updated);
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData<Task[]>(queryKey, ctx.prev);
        LocalStorageService.set(LS_KEY, ctx.prev);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey });
    },
  });

  return { ...query, create, update, remove };
}
