import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./axios";
import type { Board } from "../schemas/schemas";
import { BoardSchema, BoardArraySchema } from "../schemas/schemas";
import { parseWithSchema } from "../lib/zod-helpers";
import { LocalStorageService } from "../services/localStorageService";

export function useBoards() {
  const qc = useQueryClient();
  const key = ["boards"] as const;

  const query = useQuery<Board[], Error>({
    queryKey: key,
    queryFn: async () => {
      // If no API URL configured, use localStorage only
      if (!import.meta.env.VITE_API_BASE_URL) {
        console.log("📦 No API configured, using localStorage");
        const savedData = LocalStorageService.get<Board[]>("boards") || [];
        return savedData.sort(
          (a, b) =>
            (a.position ?? 0) - (b.position ?? 0) ||
            String(a.id).localeCompare(String(b.id))
        );
      }

      try {
        console.log("📡 Fetching boards from API...");
        const { data } = await api.get("/boards");
        console.log("📦 Raw API response:", data);

        // Validate API response with Zod (non-blocking)
        let validatedData: Board[];
        try {
          validatedData = parseWithSchema(BoardArraySchema, data);
          console.log("✅ Validation successful");
        } catch (validationError) {
          console.warn(
            "⚠️ Validation failed, using raw data:",
            validationError
          );
          // If validation fails, use raw data as fallback
          validatedData = Array.isArray(data) ? data : [];
        }

        // Get saved positions from localStorage
        const savedPositions = LocalStorageService.get<Board[]>("boards") || [];

        // Merge API data with saved positions
        const merged = validatedData.map((board) => {
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
      } catch (error: unknown) {
        console.error("❌ API Error:", error);
        // Always fallback to localStorage on any API error
        console.log("💾 Returning data from localStorage due to API error");
        const savedPositions =
          LocalStorageService.get<Board[]>("boards") || [];
        return savedPositions.sort(
          (a, b) =>
            (a.position ?? 0) - (b.position ?? 0) ||
            String(a.id).localeCompare(String(b.id))
        );
      }
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    placeholderData: (prev) =>
      prev ?? LocalStorageService.get<Board[]>("boards") ?? undefined,
  });

  const create = useMutation<Board, Error, { title: string }>({
    mutationFn: async (payload) => {
      const { data } = await api.post("/boards", payload);
      // Validate response with Zod
      return parseWithSchema(BoardSchema, data);
    },
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
    mutationFn: async ({ id, ...updates }) => {
      const { data } = await api.put(`/boards/${id}`, updates);
      // Validate response with Zod
      return parseWithSchema(BoardSchema, data);
    },
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
