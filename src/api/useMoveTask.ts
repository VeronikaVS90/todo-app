import { useMutation } from "@tanstack/react-query";
import api from "./axios";
import type { Task } from "../types/types";

export function useMoveTask() {
  return useMutation<
    Task,
    Error,
    { id: string; fromColumnId: string; toColumnId: string; position?: number }
  >({
    mutationFn: async ({ id, toColumnId, position }) => {
      const { data } = await api.put<Task>(`/tasks/${encodeURIComponent(id)}`, {
        columnId: toColumnId,
        ...(position !== undefined ? { position } : {}),
      });
      return data;
    },
  });
}
