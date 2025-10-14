import { useMutation } from "@tanstack/react-query";
import api from "./axios";
import type { Task } from "../schemas/schemas";
import { TaskSchema } from "../schemas/schemas";
import { parseWithSchema } from "../lib/zod-helpers";

interface MoveTaskProps {
  id: string;
  fromColumnId: string;
  toColumnId: string;
  position?: number;
}

export function useMoveTask() {
  return useMutation<Task, Error, MoveTaskProps>({
    mutationFn: async ({ id, toColumnId, position }) => {
      // Update columnId and position on server
      const { data } = await api.put(`/tasks/${encodeURIComponent(id)}`, {
        columnId: toColumnId,
        position,
      });

      // Validate response with Zod
      return parseWithSchema(TaskSchema, data);
    },
  });
}
