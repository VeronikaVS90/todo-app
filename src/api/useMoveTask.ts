import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./axios";
import type { Task } from "../types/types";

export function useMoveTask() {
  const qc = useQueryClient();

  return useMutation<
    Task,
    Error,
    { id: string; fromColumnId: string; toColumnId: string; position?: number }
  >({
    mutationFn: async ({ id, toColumnId, position }) => {
      const { data } = await api.put<Task>(`/tasks/${id}`, {
        columnId: toColumnId,
        ...(position !== undefined ? { position } : {}),
      });
      return data;
    },
    onSuccess: (_res, { fromColumnId, toColumnId }) => {
      qc.invalidateQueries({ queryKey: ["tasks", fromColumnId] });
      qc.invalidateQueries({ queryKey: ["tasks", toColumnId] });
    },
  });
}
