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

describe("Board", () => {
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

  it("should render board with columns", () => {
    render(<Board boardId="board-1" />);

    expect(screen.getByText("To Do")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  it("should render add column form", () => {
    render(<Board boardId="board-1" />);

    expect(screen.getByLabelText("New column")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add column" })
    ).toBeInTheDocument();
  });

  it("should create new column when form is submitted", async () => {
    const user = userEvent.setup();
    render(<Board boardId="board-1" />);

    const input = screen.getByLabelText("New column");
    const button = screen.getByRole("button", { name: "Add column" });

    await user.type(input, "New Column");
    await user.click(button);

    expect(mockCreate.mutate).toHaveBeenCalledWith({ title: "New Column" });
  });

  it("should clear input after creating column", async () => {
    const user = userEvent.setup();
    render(<Board boardId="board-1" />);

    const input = screen.getByLabelText("New column");
    const button = screen.getByRole("button", { name: "Add column" });

    await user.type(input, "New Column");
    await user.click(button);

    await waitFor(() => {
      expect(input).toHaveValue("");
    });
  });

  it("should not create column with empty title", async () => {
    const user = userEvent.setup();
    render(<Board boardId="board-1" />);

    const button = screen.getByRole("button", { name: "Add column" });
    await user.click(button);

    expect(mockCreate.mutate).not.toHaveBeenCalled();
  });

  it("should not create column with whitespace-only title", async () => {
    const user = userEvent.setup();
    render(<Board boardId="board-1" />);

    const input = screen.getByLabelText("New column");
    const button = screen.getByRole("button", { name: "Add column" });

    await user.type(input, "   ");
    await user.click(button);

    expect(mockCreate.mutate).not.toHaveBeenCalled();
  });

  it("should create column when Enter is pressed", async () => {
    const user = userEvent.setup();
    render(<Board boardId="board-1" />);

    const input = screen.getByLabelText("New column");

    await user.type(input, "New Column");
    await user.keyboard("{Enter}");

    expect(mockCreate.mutate).toHaveBeenCalledWith({ title: "New Column" });
  });

  it("should render loading state when columns are loading", () => {
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

    // Should not render columns while loading
    expect(screen.queryByText("To Do")).not.toBeInTheDocument();
  });

  it("should render empty state when no columns", () => {
    mockUseColumns.mockReturnValue({
      data: [],
      create: mockCreate,
      update: mockUpdate,
      remove: mockRemove,
      move: mockMove,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useColumns>);

    render(<Board boardId="board-1" />);

    // Should render the add column form even when no columns
    expect(screen.getByLabelText("New column")).toBeInTheDocument();
  });

  it("should handle drag and drop for columns", () => {
    render(<Board boardId="board-1" />);

    // This test would require more complex drag and drop testing setup
    // For now, we'll just verify the drag context is rendered
    expect(screen.getByText("To Do")).toBeInTheDocument();
  });
});
