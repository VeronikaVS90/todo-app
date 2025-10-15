import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useColumns } from "../useColumns";
import { LocalStorageService } from "../../services/localStorageService";
import { mockColumn } from "../../test/utils/test-utils";

// Import MSW setup for integration tests
import "../../test/setup.integration";

// Mock axios
vi.mock("../axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from "../axios";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockApi = api as any;

describe("useColumns Integration Tests", () => {
  let queryClient: QueryClient;

  const createWrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    queryClient.clear();
    localStorage.clear();
  });

  describe("Query functionality", () => {
    it("should fetch and return columns from API", async () => {
      const mockColumns = [
        mockColumn({ id: "1", title: "To Do", position: 0 }),
        mockColumn({ id: "2", title: "In Progress", position: 1 }),
      ];

      mockApi.get.mockResolvedValueOnce({
        data: mockColumns,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      const { result } = renderHook(() => useColumns("board-1"), {
        wrapper: createWrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockColumns);
      expect(mockApi.get).toHaveBeenCalledWith("/columns?boardId=board-1");
    });

    it("should use localStorage as placeholder data", async () => {
      const localStorageColumns = [
        mockColumn({ id: "1", title: "Cached Column", position: 0 }),
      ];

      LocalStorageService.set("columns:board-1", localStorageColumns);

      const { result } = renderHook(() => useColumns("board-1"), {
        wrapper: createWrapper,
      });

      // Should immediately return cached data
      expect(result.current.data).toEqual(localStorageColumns);
    });

    it("should merge API data with localStorage positions", async () => {
      const apiColumns = [
        mockColumn({ id: "1", title: "API Column 1" }),
        mockColumn({ id: "2", title: "API Column 2" }),
      ];

      const localStorageColumns = [
        mockColumn({ id: "1", title: "API Column 1", position: 1 }),
        mockColumn({ id: "2", title: "API Column 2", position: 0 }),
      ];

      LocalStorageService.set("columns:board-1", localStorageColumns);

      mockApi.get.mockResolvedValueOnce({
        data: apiColumns,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      const { result } = renderHook(() => useColumns("board-1"), {
        wrapper: createWrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Should preserve localStorage positions (sorted by position, then by id)
      const expected = [
        mockColumn({ id: "1", title: "API Column 1", position: 1 }),
        mockColumn({ id: "2", title: "API Column 2", position: 0 }),
      ];

      expect(result.current.data).toEqual(expected);
    });

    it("should handle API errors gracefully", async () => {
      mockApi.get.mockRejectedValueOnce(new Error("API Error"));

      const { result } = renderHook(() => useColumns("board-1"), {
        wrapper: createWrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(new Error("API Error"));
    });
  });

  describe("Create mutation", () => {
    it("should create a new column", async () => {
      const newColumn = mockColumn({ id: "3", title: "New Column" });

      mockApi.get.mockResolvedValueOnce({
        data: [],
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      mockApi.post.mockResolvedValueOnce({
        data: newColumn,
        status: 201,
        statusText: "Created",
        headers: {},
        config: {},
      });

      const { result } = renderHook(() => useColumns("board-1"), {
        wrapper: createWrapper,
      });

      // Wait for initial query to complete
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Create new column
      await result.current.create.mutateAsync({ title: "New Column" });

      expect(mockApi.post).toHaveBeenCalledWith("/columns", {
        title: "New Column",
        boardId: "board-1",
      });

      // Check that localStorage was updated
      const cachedData = LocalStorageService.get("columns:board-1") as Array<{
        title: string;
      }>;
      expect(cachedData).toHaveLength(1);
      expect(cachedData[0].title).toBe("New Column");
    });
  });

  describe("Update mutation", () => {
    it("should update column title", async () => {
      const existingColumns = [
        mockColumn({ id: "1", title: "Old Title", position: 0 }),
      ];

      mockApi.get.mockResolvedValueOnce({
        data: existingColumns,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      const updatedColumn = mockColumn({ id: "1", title: "New Title" });
      mockApi.put.mockResolvedValueOnce({
        data: updatedColumn,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      const { result } = renderHook(() => useColumns("board-1"), {
        wrapper: createWrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Update column title
      await result.current.update.mutateAsync({
        id: "1",
        title: "New Title",
      });

      expect(mockApi.put).toHaveBeenCalledWith("/columns/1", {
        title: "New Title",
        boardId: "board-1",
      });
    });

    it("should update column position with optimistic update", async () => {
      const existingColumns = [
        mockColumn({ id: "1", title: "Column 1", position: 0 }),
        mockColumn({ id: "2", title: "Column 2", position: 1 }),
      ];

      mockApi.get.mockResolvedValueOnce({
        data: existingColumns,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      const { result } = renderHook(() => useColumns("board-1"), {
        wrapper: createWrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Update column position
      result.current.update.mutate({
        id: "1",
        position: 1,
      });

      // Should immediately update the UI (optimistic update)
      await waitFor(() => {
        const data = result.current.data;
        expect(data?.[0].position).toBe(0);
        expect(data?.[1].position).toBe(1);
      });

      expect(mockApi.put).toHaveBeenCalledWith("/columns/1", {
        position: 1,
        boardId: "board-1",
      });
    });
  });

  describe("Move mutation", () => {
    it("should move column to new position", async () => {
      const existingColumns = [
        mockColumn({ id: "1", title: "Column 1", position: 0 }),
        mockColumn({ id: "2", title: "Column 2", position: 1 }),
        mockColumn({ id: "3", title: "Column 3", position: 2 }),
      ];

      mockApi.get.mockResolvedValueOnce({
        data: existingColumns,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      const { result } = renderHook(() => useColumns("board-1"), {
        wrapper: createWrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Move column from index 0 to index 2
      result.current.move.mutate({
        id: "1",
        toIndex: 2,
      });

      await waitFor(() => {
        const data = result.current.data;
        expect(data?.[0].id).toBe("2");
        expect(data?.[1].id).toBe("3");
        expect(data?.[2].id).toBe("1");
      });

      expect(mockApi.put).toHaveBeenCalledWith("/columns/1", {
        position: 2,
        boardId: "board-1",
      });
    });
  });

  describe("Remove mutation", () => {
    it("should remove column", async () => {
      const existingColumns = [
        mockColumn({ id: "1", title: "Column 1", position: 0 }),
        mockColumn({ id: "2", title: "Column 2", position: 1 }),
      ];

      mockApi.get.mockResolvedValueOnce({
        data: existingColumns,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      const { result } = renderHook(() => useColumns("board-1"), {
        wrapper: createWrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Remove column
      result.current.remove.mutate({ id: "1" });

      await waitFor(() => {
        const data = result.current.data;
        expect(data).toHaveLength(1);
        expect(data?.[0].id).toBe("2");
        expect(data?.[0].position).toBe(0);
      });

      expect(mockApi.delete).toHaveBeenCalledWith("/columns/1");
    });
  });
});
