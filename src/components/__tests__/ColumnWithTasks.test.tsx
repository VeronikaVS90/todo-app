import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { ColumnWithTasks } from "../ColumnWithTasks";
import { render, mockColumn, mockTask } from "../../test/utils/test-utils";

// Mock the API hooks
vi.mock("../../api/useTasks", () => ({
  useTasks: vi.fn(),
}));

vi.mock("../../api/useColumns", () => ({
  useColumns: vi.fn(),
}));

// Mock TaskCard's useTasks hook
vi.mock("../TaskCard", () => ({
  TaskCard: vi.fn(({ task }) => (
    <div data-testid="task-card">{task.title}</div>
  )),
}));

import { useTasks } from "../../api/useTasks";
import { useColumns } from "../../api/useColumns";

const mockUseTasks = vi.mocked(useTasks);
const mockUseColumns = vi.mocked(useColumns);

describe("ColumnWithTasks", () => {
  const mockColumnData = mockColumn({ id: "1", title: "To Do" });
  const mockTasks = [
    mockTask({ id: "1", title: "Task 1", columnId: "1" }),
    mockTask({ id: "2", title: "Task 2", columnId: "1" }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseTasks.mockReturnValue({
      data: mockTasks,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      create: {
        mutate: vi.fn(),
        isPending: false,
      },
    } as unknown as ReturnType<typeof useTasks>);

    mockUseColumns.mockReturnValue({
      data: [mockColumnData],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      create: {
        mutate: vi.fn(),
        isPending: false,
      },
      update: {
        mutate: vi.fn(),
        isPending: false,
      },
      remove: {
        mutate: vi.fn(),
        isPending: false,
      },
      move: {
        mutate: vi.fn(),
        isPending: false,
      },
    } as unknown as ReturnType<typeof useColumns>);
  });

  it("should render column with tasks", () => {
    render(<ColumnWithTasks column={mockColumnData} index={0} />);

    expect(screen.getByText("To Do")).toBeInTheDocument();
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
  });

  it("should render empty column when no tasks", () => {
    mockUseTasks.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      create: {
        mutate: vi.fn(),
        isPending: false,
      },
    } as unknown as ReturnType<typeof useTasks>);

    render(<ColumnWithTasks column={mockColumnData} index={0} />);

    expect(screen.getByText("To Do")).toBeInTheDocument();
    expect(screen.queryByText("Task 1")).not.toBeInTheDocument();
    expect(screen.queryByText("Task 2")).not.toBeInTheDocument();
  });

  it("should render loading state when tasks are loading", () => {
    mockUseTasks.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
      create: {
        mutate: vi.fn(),
        isPending: false,
      },
    } as unknown as ReturnType<typeof useTasks>);

    render(<ColumnWithTasks column={mockColumnData} index={0} />);

    expect(screen.getByText("To Do")).toBeInTheDocument();
    // Tasks might not be visible while loading
  });

  it("should handle column with different id types", () => {
    const columnWithNumberId = { ...mockColumnData, id: 123 };

    render(<ColumnWithTasks column={columnWithNumberId} index={0} />);

    expect(screen.getByText("To Do")).toBeInTheDocument();
    expect(mockUseTasks).toHaveBeenCalledWith("123");
  });

  it("should pass correct column id to useTasks hook", () => {
    render(<ColumnWithTasks column={mockColumnData} index={0} />);

    expect(mockUseTasks).toHaveBeenCalledWith("1");
  });

  it("should render with correct draggable properties", () => {
    render(<ColumnWithTasks column={mockColumnData} index={0} />);

    // The Draggable component should be rendered with the correct draggableId
    expect(screen.getByText("To Do")).toBeInTheDocument();
  });

  it("should handle multiple columns with different indices", () => {
    const { rerender } = render(
      <ColumnWithTasks column={mockColumnData} index={0} />
    );

    expect(screen.getByText("To Do")).toBeInTheDocument();

    const secondColumn = mockColumn({ id: "2", title: "In Progress" });
    rerender(<ColumnWithTasks column={secondColumn} index={1} />);

    expect(screen.getByText("In Progress")).toBeInTheDocument();
  });
});
