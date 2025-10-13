import { z } from "zod";

/**
 * Safely parse data with a Zod schema
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated data
 * @throws Error if validation fails
 */
export function parseWithSchema<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): z.infer<T> {
  const result = schema.safeParse(data);

  if (!result.success) {
    console.error("Validation error:", result.error);
    console.error("Failed data:", data);
    console.error("Validation issues:", result.error.issues);
    throw new Error(`Data validation failed: ${result.error.message}`);
  }

  return result.data;
}

/**
 * Safely parse data with a Zod schema and return null on error
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated data or null if validation fails
 */
export function safeParseWithSchema<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): z.infer<T> | null {
  const result = schema.safeParse(data);

  if (!result.success) {
    console.warn("Validation warning (returning null):", result.error.message);
    console.warn("Failed data:", data);
    return null;
  }

  return result.data;
}

/**
 * Validate data with a Zod schema without transforming it
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns True if valid, false otherwise
 */
export function isValid<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): data is z.infer<T> {
  return schema.safeParse(data).success;
}
