import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./axios";
import type { Board } from "../types/types";

export function useBoards() {
  const qc = useQueryClient();

  const query = useQuery<Board[], Error>({
    queryKey: ["boards"],
    queryFn: async () => {
      const { data } = await api.get<Board[]>("/boards");
      return data;
    },
  });

  const create = useMutation<Board, Error, { title: string }>({
    mutationFn: async (payload) => {
      const { data } = await api.post<Board>("/boards", payload);
      return data;
    },
    onSuccess: (newBoard) => {
      qc.setQueryData<Board[]>(["boards"], (prev = []) => [newBoard, ...prev]);
    },
  });

  const update = useMutation<Board, Error, { id: Board["id"]; title: string }>({
    mutationFn: async ({ id, ...updates }) => {
      const { data } = await api.put<Board>(`/boards/${id}`, updates);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["boards"] }),
  });

  const remove = useMutation<void, Error, { id: string }>({
    mutationFn: async ({ id }) => {
      await api.delete(`/boards/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["boards"] }),
  });

  return { ...query, create, update, remove };
}
