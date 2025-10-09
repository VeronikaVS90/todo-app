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
      const filtered = data
        .filter((t) => String(t.columnId) === colId)
        .sort(
          (a, b) =>
            (a.position ?? 0) - (b.position ?? 0) ||
            String(a.id).localeCompare(String(b.id))
        );
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
        description: "",
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
        qc.setQueryData<Task[]>(sourceKey, (list = []) => list.map(patchTask));
      } else {
        qc.setQueryData<Task[]>(sourceKey, (list = []) =>
          list.filter((t) => String(t.id) !== String(vars.id))
        );
        qc.setQueryData<Task[]>(targetKey, (list = []) => {
          const updated = [...(list ?? [])];
          const updatedTask: Task = {
            ...(prevSource?.find(
              (t) => String(t.id) === String(vars.id)
            ) as Task),
            ...vars,
            columnId: targetCol,
          };

          const at =
            typeof vars.position === "number" ? vars.position : updated.length;
          updated.splice(
            Math.max(0, Math.min(at, updated.length)),
            0,
            updatedTask
          );
          return updated;
        });
      }

      return { prevSource, prevTarget, targetKey };
    },

    onError: (_e, _vars, ctx) => {
      if (!ctx) return;
      if (ctx.prevSource) qc.setQueryData(queryKey, ctx.prevSource);
      if (ctx.prevTarget && ctx.targetKey)
        qc.setQueryData(ctx.targetKey, ctx.prevTarget);
    },

    onSettled: (_res, _err, vars) => {
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
