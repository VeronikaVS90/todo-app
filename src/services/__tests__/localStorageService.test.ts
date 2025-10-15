import { describe, it, expect, beforeEach, vi } from "vitest";
import { LocalStorageService } from "../localStorageService";
import { z } from "zod";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("LocalStorageService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
  });

  describe("get", () => {
    it("should return null when key does not exist", () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = LocalStorageService.get("nonexistent-key");

      expect(result).toBeNull();
      expect(localStorageMock.getItem).toHaveBeenCalledWith("nonexistent-key");
    });

    it("should return parsed JSON data", () => {
      const data = { test: "value" };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(data));

      const result = LocalStorageService.get("test-key");

      expect(result).toEqual(data);
    });

    it("should return null when JSON parsing fails", () => {
      localStorageMock.getItem.mockReturnValue("invalid json");

      const result = LocalStorageService.get("test-key");

      expect(result).toBeNull();
    });

    it("should validate data with schema and return null if invalid", () => {
      const invalidData = { invalid: "data" };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(invalidData));
      const schema = z.object({ valid: z.string() });

      const result = LocalStorageService.get("test-key", schema);

      expect(result).toBeNull();
    });

    it("should validate data with schema and return data if valid", () => {
      const validData = { valid: "data" };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(validData));
      const schema = z.object({ valid: z.string() });

      const result = LocalStorageService.get("test-key", schema);

      expect(result).toEqual(validData);
    });
  });

  describe("set", () => {
    it("should store data as JSON string", () => {
      const data = { test: "value" };

      LocalStorageService.set("test-key", data);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "test-key",
        JSON.stringify(data)
      );
    });

    it("should validate data with schema before storing", () => {
      const validData = { valid: "data" };
      const schema = z.object({ valid: z.string() });

      LocalStorageService.set("test-key", validData, schema);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "test-key",
        JSON.stringify(validData)
      );
    });

    it("should not store data if schema validation fails", () => {
      const invalidData = { invalid: "data" };
      const schema = z.object({ valid: z.string() });

      LocalStorageService.set("test-key", invalidData, schema);

      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it("should handle JSON stringify errors gracefully", () => {
      const circularData: Record<string, unknown> = { test: "value" };
      circularData.self = circularData;

      // Mock JSON.stringify to throw an error
      const originalStringify = JSON.stringify;
      JSON.stringify = vi.fn().mockImplementation(() => {
        throw new Error("Circular reference");
      });

      LocalStorageService.set("test-key", circularData);

      expect(localStorageMock.setItem).not.toHaveBeenCalled();

      // Restore original JSON.stringify
      JSON.stringify = originalStringify;
    });
  });

  describe("remove", () => {
    it("should remove item from localStorage", () => {
      LocalStorageService.remove("test-key");

      expect(localStorageMock.removeItem).toHaveBeenCalledWith("test-key");
    });
  });
});
