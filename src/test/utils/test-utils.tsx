/* eslint-disable react-refresh/only-export-components */
import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  const theme = createTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <DragDropContext
          onDragEnd={() => {}}
          onDragStart={() => {}}
          onDragUpdate={() => {}}
        >
          <Droppable droppableId="test-droppable" type="COLUMN">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {children}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock data factories
export const mockColumn = (overrides = {}) => ({
  id: "1",
  title: "Test Column",
  boardId: "board-1",
  position: 0,
  ...overrides,
});

export const mockTask = (overrides = {}) => ({
  id: "1",
  title: "Test Task",
  description: "Test Description",
  columnId: "1",
  position: 0,
  ...overrides,
});

export const mockBoard = (overrides = {}) => ({
  id: "1",
  title: "Test Board",
  createdAt: "2024-01-01T00:00:00Z",
  position: 0,
  ...overrides,
});

// Mock API responses
export function mockApiResponse<T>(data: T) {
  return {
    data,
    status: 200,
    statusText: "OK",
    headers: {},
    config: {},
  };
}

// Re-export everything
export * from "@testing-library/react";
export { customRender as render };
