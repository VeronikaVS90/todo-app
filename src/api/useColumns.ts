import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./axios";
import type { Column } from "../types";
import { LocalStorageService } from "../services/localStorageService";

export function useColumns(boardId: string) {
  const qc = useQueryClient();

  const LS_KEY = `columns: ${boardId}`;

  const query = useQuery<Column[], Error>({
    queryKey: ["columns", boardId],
    queryFn: async () => {
      try {
        const { data } = await api.get<Column[]>(`/boards/${boardId}/columns`);
        LocalStorageService.set(LS_KEY, data);
        return data;
      } catch {
        return LocalStorageService.get<Column[]>(LS_KEY) || [];
      }
    },
  });

  const create = useMutation<Column, Error, { title: string }>({
    mutationFn: async (payload) => {
      const { data } = await api.post<Column>(
        `/boards/${boardId}/columns`,
        payload
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["columns", boardId] });
    },
  });

  return { ...query, create };
}
