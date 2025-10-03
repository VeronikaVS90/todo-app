import api from "./axios";
import type { Task } from "../types/types";

export const tasksApi = {
  move: async (
    id: string,
    toColumnId: string,
    position?: number
  ): Promise<Task> => {
    const { data } = await api.put<Task>(`/tasks/${id}`, {
      columnId: toColumnId,
      ...(position !== undefined ? { position } : {}),
    });
    return data;
  },
};
