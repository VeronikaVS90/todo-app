import { z } from "zod";
import { safeParseWithSchema } from "../lib/zod-helpers";

export class LocalStorageService {
  static get<T>(key: string, schema?: z.ZodTypeAny): T | null {
    try {
      const data = localStorage.getItem(key);
      if (!data) return null;

      const parsed = JSON.parse(data);

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

  static set<T>(key: string, value: T, schema?: z.ZodTypeAny): void {
    try {
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
