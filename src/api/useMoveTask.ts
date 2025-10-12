import { useMutation } from "@tanstack/react-query";
import api from "./axios";
import type { Task } from "../types/types";

interface MoveTaskProps {
  id: string;
  fromColumnId: string;
  toColumnId: string;
  position?: number;
}

export function useMoveTask() {
  return useMutation<Task, Error, MoveTaskProps>({
    mutationFn: async ({ id, toColumnId }) => {
      // Only update columnId on server, position is managed locally
      const { data } = await api.put<Task>(`/tasks/${encodeURIComponent(id)}`, {
        columnId: toColumnId,
      });
      return data;
    },
  });
}
