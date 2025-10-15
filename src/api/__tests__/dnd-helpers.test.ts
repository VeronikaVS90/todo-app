import { describe, it, expect } from "vitest";
import { clamp, arrayMove, normalizePositions } from "../dnd-helpers";

describe("dnd-helpers", () => {
  describe("clamp", () => {
    it("should return the number when it is within bounds", () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });

    it("should return min when number is below minimum", () => {
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(5, 10, 20)).toBe(10);
    });

    it("should return max when number is above maximum", () => {
      expect(clamp(15, 0, 10)).toBe(10);
      expect(clamp(25, 0, 20)).toBe(20);
    });

    it("should handle edge cases", () => {
      expect(clamp(5, 5, 5)).toBe(5);
      expect(clamp(0, 0, 0)).toBe(0);
    });
  });

  describe("arrayMove", () => {
    it("should move item from one position to another", () => {
      const arr = ["a", "b", "c", "d"];
      const result = arrayMove(arr, 1, 3);
      expect(result).toEqual(["a", "c", "d", "b"]);
    });

    it("should handle moving to the beginning", () => {
      const arr = ["a", "b", "c", "d"];
      const result = arrayMove(arr, 2, 0);
      expect(result).toEqual(["c", "a", "b", "d"]);
    });

    it("should handle moving to the end", () => {
      const arr = ["a", "b", "c", "d"];
      const result = arrayMove(arr, 0, 3);
      expect(result).toEqual(["b", "c", "d", "a"]);
    });

    it("should handle no-op moves", () => {
      const arr = ["a", "b", "c", "d"];
      const result = arrayMove(arr, 1, 1);
      expect(result).toEqual(["a", "b", "c", "d"]);
    });

    it("should not mutate original array", () => {
      const arr = ["a", "b", "c", "d"];
      const originalArr = [...arr];
      arrayMove(arr, 1, 3);
      expect(arr).toEqual(originalArr);
    });

    it("should handle single element array", () => {
      const arr = ["a"];
      const result = arrayMove(arr, 0, 0);
      expect(result).toEqual(["a"]);
    });
  });

  describe("normalizePositions", () => {
    it("should normalize positions to sequential order", () => {
      const items = [
        { id: "1", position: 5 },
        { id: "2", position: 2 },
        { id: "3", position: 8 },
      ];
      const result = normalizePositions(items);
      expect(result).toEqual([
        { id: "1", position: 0 },
        { id: "2", position: 1 },
        { id: "3", position: 2 },
      ]);
    });

    it("should handle items without position", () => {
      const items = [{ id: "1" }, { id: "2", position: 2 }, { id: "3" }];
      const result = normalizePositions(items);
      expect(result).toEqual([
        { id: "1", position: 0 },
        { id: "2", position: 1 },
        { id: "3", position: 2 },
      ]);
    });

    it("should handle empty array", () => {
      const result = normalizePositions([]);
      expect(result).toEqual([]);
    });

    it("should handle single item", () => {
      const items = [{ id: "1", position: 10 }];
      const result = normalizePositions(items);
      expect(result).toEqual([{ id: "1", position: 0 }]);
    });

    it("should preserve other properties", () => {
      const items = [
        { id: "1", title: "First", position: 5 },
        { id: "2", title: "Second", position: 2 },
      ];
      const result = normalizePositions(items);
      expect(result).toEqual([
        { id: "1", title: "First", position: 0 },
        { id: "2", title: "Second", position: 1 },
      ]);
    });
  });
});

