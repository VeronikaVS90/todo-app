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

  return { ...query, create };
}
