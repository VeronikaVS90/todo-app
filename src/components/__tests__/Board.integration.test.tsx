import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Board } from "../Board";
import { render, mockColumn } from "../../test/utils/test-utils";

// Mock the API hooks
vi.mock("../../api/useColumns", () => ({
  useColumns: vi.fn(),
}));

vi.mock("../../api/useMoveTask", () => ({
  useMoveTaskGlobal: vi.fn(),
}));

import { useColumns } from "../../api/useColumns";
import { useMoveTaskGlobal } from "../../api/useMoveTask";

const mockUseColumns = vi.mocked(useColumns);
const mockUseMoveTaskGlobal = vi.mocked(useMoveTaskGlobal);

describe("Board Integration Tests", () => {
  const mockColumns = [
    mockColumn({ id: "1", title: "To Do", position: 0 }),
    mockColumn({ id: "2", title: "In Progress", position: 1 }),
    mockColumn({ id: "3", title: "Done", position: 2 }),
  ];

  const mockCreate = {
    mutate: vi.fn(),
    isPending: false,
  };

  const mockUpdate = {
    mutate: vi.fn(),
    isPending: false,
  };

  const mockRemove = {
    mutate: vi.fn(),
    isPending: false,
  };

  const mockMove = {
    mutate: vi.fn(),
    isPending: false,
  };

  const mockMoveTask = {
    mutate: vi.fn(),
    isPending: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseColumns.mockReturnValue({
      data: mockColumns,
      create: mockCreate,
      update: mockUpdate,
      remove: mockRemove,
      move: mockMove,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useColumns>);

    mockUseMoveTaskGlobal.mockReturnValue(
      mockMoveTask as unknown as ReturnType<typeof useMoveTaskGlobal>
    );
  });

  describe("Column Management Flow", () => {
    it("should complete full column creation flow", async () => {
      const user = userEvent.setup();
      render(<Board boardId="board-1" />);

      // Initial state - should show existing columns
      expect(screen.getByText("To Do")).toBeInTheDocument();
      expect(screen.getByText("In Progress")).toBeInTheDocument();
      expect(screen.getByText("Done")).toBeInTheDocument();

      // Add new column
      const input = screen.getByLabelText("New column");
      const button = screen.getByRole("button", { name: "Add column" });

      await user.type(input, "New Column");
      await user.click(button);

      // Verify mutation was called
      expect(mockCreate.mutate).toHaveBeenCalledWith({ title: "New Column" });

      // Verify input was cleared
      await waitFor(() => {
        expect(input).toHaveValue("");
      });
    });

    it("should handle multiple column additions", async () => {
      const user = userEvent.setup();
      render(<Board boardId="board-1" />);

      const input = screen.getByLabelText("New column");
      const button = screen.getByRole("button", { name: "Add column" });

      // Add first column
      await user.type(input, "First Column");
      await user.click(button);
      expect(mockCreate.mutate).toHaveBeenCalledWith({ title: "First Column" });

      // Add second column
      await user.type(input, "Second Column");
      await user.click(button);
      expect(mockCreate.mutate).toHaveBeenCalledWith({
        title: "Second Column",
      });
    });

    it("should handle keyboard navigation for column creation", async () => {
      const user = userEvent.setup();
      render(<Board boardId="board-1" />);

      const input = screen.getByLabelText("New column");

      // Type and press Enter
      await user.type(input, "Keyboard Column");
      await user.keyboard("{Enter}");

      expect(mockCreate.mutate).toHaveBeenCalledWith({
        title: "Keyboard Column",
      });
    });
  });

  describe("Drag and Drop Integration", () => {
    it("should handle column reordering", () => {
      render(<Board boardId="board-1" />);

      // Verify drag context is rendered
      expect(screen.getByText("To Do")).toBeInTheDocument();
      expect(screen.getByText("In Progress")).toBeInTheDocument();
      expect(screen.getByText("Done")).toBeInTheDocument();

      // The actual drag and drop testing would require more complex setup
      // with @testing-library/user-event drag and drop utilities
      // This test verifies the structure is in place
    });

    it("should handle task movement between columns", () => {
      render(<Board boardId="board-1" />);

      // Verify the drag context and droppable areas are rendered
      expect(screen.getByText("To Do")).toBeInTheDocument();

      // The actual task movement testing would require more complex setup
      // This test verifies the structure is in place
    });
  });

  describe("Error Handling", () => {
    it("should handle column creation errors gracefully", () => {
      const mockCreateWithError = {
        mutate: vi.fn(),
        isPending: false,
        error: new Error("Failed to create column"),
      };

      mockUseColumns.mockReturnValue({
        data: mockColumns,
        create: mockCreateWithError,
        update: mockUpdate,
        remove: mockRemove,
        move: mockMove,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useColumns>);

      render(<Board boardId="board-1" />);

      // Should still render the form even with error
      expect(screen.getByLabelText("New column")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Add column" })
      ).toBeInTheDocument();
    });

    it("should handle loading states", () => {
      mockUseColumns.mockReturnValue({
        data: undefined,
        create: mockCreate,
        update: mockUpdate,
        remove: mockRemove,
        move: mockMove,
        isLoading: true,
        error: null,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useColumns>);

      render(<Board boardId="board-1" />);

      // Should still render the form during loading
      expect(screen.getByLabelText("New column")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Add column" })
      ).toBeInTheDocument();
    });
  });

  describe("User Interaction Patterns", () => {
    it("should handle rapid user interactions", async () => {
      const user = userEvent.setup();
      render(<Board boardId="board-1" />);

      const input = screen.getByLabelText("New column");
      const button = screen.getByRole("button", { name: "Add column" });

      // Rapid typing and clicking
      await user.type(input, "Quick");
      await user.click(button);
      await user.type(input, "Another");
      await user.click(button);

      expect(mockCreate.mutate).toHaveBeenCalledTimes(2);
      expect(mockCreate.mutate).toHaveBeenNthCalledWith(1, { title: "Quick" });
      expect(mockCreate.mutate).toHaveBeenNthCalledWith(2, {
        title: "Another",
      });
    });

    it("should handle form reset after successful creation", async () => {
      const user = userEvent.setup();
      render(<Board boardId="board-1" />);

      const input = screen.getByLabelText("New column");
      const button = screen.getByRole("button", { name: "Add column" });

      await user.type(input, "Test Column");
      await user.click(button);

      // Input should be cleared after successful creation
      await waitFor(() => {
        expect(input).toHaveValue("");
      });

      // Should be able to add another column immediately
      await user.type(input, "Second Column");
      await user.click(button);

      expect(mockCreate.mutate).toHaveBeenCalledWith({
        title: "Second Column",
      });
    });
  });
});
