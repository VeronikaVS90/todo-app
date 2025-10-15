import { describe, it, expect } from "vitest";
import { BoardSchema, ColumnSchema, TaskSchema } from "../schemas";

describe("Schemas", () => {
  describe("BoardSchema", () => {
    it("should parse valid board data with string id", () => {
      const data = {
        id: "1",
        title: "Test Board",
        createdAt: "2024-01-01T00:00:00Z",
        position: 0,
      };

      const result = BoardSchema.parse(data);

      expect(result).toEqual({
        id: "1",
        title: "Test Board",
        createdAt: "2024-01-01T00:00:00Z",
        position: 0,
      });
    });

    it("should parse valid board data with number id", () => {
      const data = {
        id: 1,
        title: "Test Board",
        createdAt: "2024-01-01T00:00:00Z",
        position: 0,
      };

      const result = BoardSchema.parse(data);

      expect(result.id).toBe("1");
      expect(result.title).toBe("Test Board");
    });

    it("should handle missing optional fields", () => {
      const data = {
        id: "1",
        title: "Test Board",
      };

      const result = BoardSchema.parse(data);

      expect(result).toEqual({
        id: "1",
        title: "Test Board",
      });
    });

    it("should allow additional fields", () => {
      const data = {
        id: "1",
        title: "Test Board",
        extraField: "extra",
      };

      const result = BoardSchema.parse(data);

      expect(result.extraField).toBe("extra");
    });

    it("should throw error for invalid data", () => {
      const data = {
        id: "1",
        // missing title
      };

      expect(() => BoardSchema.parse(data)).toThrow();
    });
  });

  describe("ColumnSchema", () => {
    it("should parse valid column data", () => {
      const data = {
        id: "1",
        title: "Test Column",
        boardId: "board-1",
        position: 0,
      };

      const result = ColumnSchema.parse(data);

      expect(result).toEqual({
        id: "1",
        title: "Test Column",
        boardId: "board-1",
        position: 0,
      });
    });

    it("should convert number ids to strings", () => {
      const data = {
        id: 1,
        title: "Test Column",
        boardId: 2,
      };

      const result = ColumnSchema.parse(data);

      expect(result.id).toBe("1");
      expect(result.boardId).toBe("2");
    });

    it("should handle missing position", () => {
      const data = {
        id: "1",
        title: "Test Column",
        boardId: "board-1",
      };

      const result = ColumnSchema.parse(data);

      expect(result.position).toBeUndefined();
    });
  });

  describe("TaskSchema", () => {
    it("should parse valid task data", () => {
      const data = {
        id: "1",
        title: "Test Task",
        description: "Test Description",
        columnId: "column-1",
        position: 0,
      };

      const result = TaskSchema.parse(data);

      expect(result).toEqual({
        id: "1",
        title: "Test Task",
        description: "Test Description",
        columnId: "column-1",
        position: 0,
      });
    });

    it("should handle null description", () => {
      const data = {
        id: "1",
        title: "Test Task",
        description: null,
        columnId: "column-1",
      };

      const result = TaskSchema.parse(data);

      expect(result.description).toBeNull();
    });

    it("should handle undefined description", () => {
      const data = {
        id: "1",
        title: "Test Task",
        columnId: "column-1",
      };

      const result = TaskSchema.parse(data);

      expect(result.description).toBeUndefined();
    });

    it("should convert number ids to strings", () => {
      const data = {
        id: 1,
        title: "Test Task",
        columnId: 2,
      };

      const result = TaskSchema.parse(data);

      expect(result.id).toBe("1");
      expect(result.columnId).toBe("2");
    });
  });
});

