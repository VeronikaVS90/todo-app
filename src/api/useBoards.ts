import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./axios";
import type { Board } from "../types/types";
import { LocalStorageService } from "../services/localStorageService";

export function useBoards() {
  const qc = useQueryClient();
  const key = ["boards"] as const;

  const query = useQuery<Board[], Error>({
    queryKey: key,
    queryFn: async () => {
      const { data } = await api.get<Board[]>("/boards");

      // Get saved positions from localStorage
      const savedPositions = LocalStorageService.get<Board[]>("boards") || [];

      // Merge API data with saved positions
      const merged = data.map((board) => {
        const saved = savedPositions.find(
          (b) => String(b.id) === String(board.id)
        );
        return saved ? { ...board, position: saved.position } : board;
      });

      const sorted = merged.sort(
        (a, b) =>
          (a.position ?? 0) - (b.position ?? 0) ||
          String(a.id).localeCompare(String(b.id))
      );

      LocalStorageService.set("boards", sorted);
      return sorted;
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    placeholderData: (prev) =>
      prev ?? LocalStorageService.get<Board[]>("boards") ?? undefined,
  });

  const create = useMutation<Board, Error, { title: string }>({
    mutationFn: async (payload) =>
      (await api.post<Board>("/boards", payload)).data,
    onSuccess: (newBoard) => {
      const current = qc.getQueryData<Board[]>(key) || [];
      const updated = [{ ...newBoard, position: current.length }, ...current];
      qc.setQueryData<Board[]>(key, updated);
      LocalStorageService.set("boards", updated);
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
      const updated = (qc.getQueryData<Board[]>(key) || []).map((b) =>
        String(b.id) === String(id) ? { ...b, title } : b
      );
      qc.setQueryData<Board[]>(key, updated);
      LocalStorageService.set("boards", updated);
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData<Board[]>(key, ctx.prev);
        LocalStorageService.set("boards", ctx.prev);
      }
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
      const updated = (qc.getQueryData<Board[]>(key) || []).filter(
        (b) => String(b.id) !== String(id)
      );
      qc.setQueryData<Board[]>(key, updated);
      LocalStorageService.set("boards", updated);
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData<Board[]>(key, ctx.prev);
        LocalStorageService.set("boards", ctx.prev);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: key });
    },
  });

  return { ...query, create, update, remove };
}
