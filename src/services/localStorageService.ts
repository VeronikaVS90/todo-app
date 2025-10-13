import { z } from "zod";
import { safeParseWithSchema } from "../lib/zod-helpers";

export class LocalStorageService {
  /**
   * Get data from localStorage
   * @param key - localStorage key
   * @param schema - Optional Zod schema for validation
   * @returns Parsed data or null if not found or validation fails
   */
  static get<T>(key: string, schema?: z.ZodTypeAny): T | null {
    try {
      const data = localStorage.getItem(key);
      if (!data) return null;

      const parsed = JSON.parse(data);

      // If schema is provided, validate the data
      if (schema) {
        const validated = safeParseWithSchema(schema, parsed);
        return validated as T | null;
      }

      return parsed as T;
    } catch (error) {
      console.error(`Error reading from localStorage (key: ${key}):`, error);
      return null;
    }
  }

  /**
   * Set data in localStorage
   * @param key - localStorage key
   * @param value - Value to store
   * @param schema - Optional Zod schema for validation before storing
   */
  static set<T>(key: string, value: T, schema?: z.ZodTypeAny): void {
    try {
      // If schema is provided, validate before storing
      if (schema) {
        const validated = safeParseWithSchema(schema, value);
        if (validated === null) {
          console.error(`Validation failed for localStorage key: ${key}`);
          return;
        }
        localStorage.setItem(key, JSON.stringify(validated));
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Error writing to localStorage (key: ${key}):`, error);
    }
  }

  static remove(key: string): void {
    localStorage.removeItem(key);
  }
}
