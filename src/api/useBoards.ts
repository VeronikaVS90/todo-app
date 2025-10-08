import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./axios";
import type { Board } from "../types/types";

export function useBoards() {
  const qc = useQueryClient();
  const key = ["boards"] as const;

  const query = useQuery<Board[], Error>({
    queryKey: key,
    queryFn: async () => (await api.get<Board[]>("/boards")).data,
  });

  const create = useMutation<Board, Error, { title: string }>({
    mutationFn: async (payload) =>
      (await api.post<Board>("/boards", payload)).data,
    onSuccess: (newBoard) => {
      qc.setQueryData<Board[]>(key, (prev = []) => [newBoard, ...prev]);
    },
  });

  const update = useMutation<
    Board,
    Error,
    { id: string; title: string },
    { prev?: Board[] }
  >({
    mutationFn: async ({ id, ...updates }) =>
      (await api.put<Board>(`/boards/${id}`, updates)).data,
    onMutate: async ({ id, title }) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<Board[]>(key);
      qc.setQueryData<Board[]>(key, (list = []) =>
        list.map((b) => (String(b.id) === String(id) ? { ...b, title } : b))
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData<Board[]>(key, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: key });
    },
  });

  const remove = useMutation<void, Error, { id: string }, { prev?: Board[] }>({
    mutationFn: async ({ id }) => {
      await api.delete(`/boards/${id}`);
    },
    onMutate: async ({ id }) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<Board[]>(key);
      qc.setQueryData<Board[]>(key, (list = []) =>
        list.filter((b) => String(b.id) !== String(id))
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData<Board[]>(key, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: key });
    },
  });

  return { ...query, create, update, remove };
}
