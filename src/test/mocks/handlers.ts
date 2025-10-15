import { http, HttpResponse } from "msw";

// Mock API handlers for testing
export const handlers = [
  // Boards
  http.get("/api/boards", () => {
    return HttpResponse.json([
      {
        id: "1",
        title: "Test Board",
        createdAt: "2024-01-01T00:00:00Z",
        position: 0,
      },
    ]);
  }),

  http.post("/api/boards", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: "2",
      title: body.title,
      createdAt: new Date().toISOString(),
      position: 0,
    });
  }),

  // Columns
  http.get("/columns", ({ request }) => {
    const url = new URL(request.url);
    const boardId = url.searchParams.get("boardId");

    return HttpResponse.json([
      {
        id: "1",
        title: "To Do",
        boardId,
        position: 0,
      },
      {
        id: "2",
        title: "In Progress",
        boardId,
        position: 1,
      },
    ]);
  }),

  http.post("/columns", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: "3",
      title: body.title,
      boardId: body.boardId,
      position: 0,
    });
  }),

  http.put("/columns/:id", async ({ request, params }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: params.id,
      title: body.title || "Updated Column",
      boardId: body.boardId,
      position: body.position || 0,
    });
  }),

  http.delete("/columns/:id", () => {
    return HttpResponse.json(null);
  }),

  // Tasks
  http.get("/tasks", ({ request }) => {
    const url = new URL(request.url);
    const columnId = url.searchParams.get("columnId");

    return HttpResponse.json([
      {
        id: "1",
        title: "Test Task",
        description: "Test Description",
        columnId,
        position: 0,
      },
    ]);
  }),

  http.post("/tasks", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: "2",
      title: body.title,
      description: body.description || null,
      columnId: body.columnId,
      position: 0,
    });
  }),

  http.put("/tasks/:id", async ({ request, params }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: params.id,
      title: body.title || "Updated Task",
      description: body.description || null,
      columnId: body.columnId,
      position: body.position || 0,
    });
  }),

  http.delete("/tasks/:id", () => {
    return HttpResponse.json(null);
  }),
];

