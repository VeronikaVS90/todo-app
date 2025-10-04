import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./axios";
import type { Column } from "../types/types";
import { LocalStorageService } from "../services/localStorageService";

export function useColumns(boardId: string) {
  const qc = useQueryClient();

  const LS_KEY = `columns: ${boardId}`;

  const query = useQuery<Column[], Error>({
    queryKey: ["columns", boardId],
    queryFn: async () => {
      try {
        const { data } = await api.get<Column[]>(`/columns?boardId=${boardId}`);
        LocalStorageService.set(LS_KEY, data);
        return data;
      } catch {
        return LocalStorageService.get<Column[]>(LS_KEY) || [];
      }
    },
  });

  const create = useMutation<Column, Error, { title: string }>({
    mutationFn: async (payload) => {
      const { data } = await api.post<Column>(`/columns`, {
        ...payload,
        boardId,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["columns", boardId] });
    },
  });

  const update = useMutation<
    Column,
    Error,
    {
      id: string;
      title: string;
    }
  >({
    mutationFn: async ({ id, ...updates }) => {
      const { data } = await api.put<Column>(`/columns/${id}`, updates);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["columns", boardId] });
    },
  });

  const remove = useMutation<void, Error, { id: string }>({
    mutationFn: async ({ id }) => {
      await api.delete(`/columns/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["columns", boardId] }),
  });

  return { ...query, create, update, remove };
}
