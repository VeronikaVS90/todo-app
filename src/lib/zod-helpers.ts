import { z, ZodError } from "zod";

export class SchemaValidationError<T = unknown> extends Error {
  readonly issues: ZodError["issues"];
  readonly data?: T;

  constructor(message: string, zerr: ZodError, data?: T) {
    super(message, { cause: zerr });
    this.name = "SchemaValidationError";
    this.issues = zerr.issues;
    this.data = data;
  }
}

type Logger = (message: string, meta?: unknown) => void;

function defaultSafeStringify(value: unknown, max = 2_000) {
  try {
    const s = JSON.stringify(value);
    return s.length > max ? s.slice(0, max) + "…(truncated)" : s;
  } catch {
    return "[Unserializable value]";
  }
}

export function parseWithSchema<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
  opts?: { logger?: Logger; attachDataOnError?: boolean }
): z.infer<T> {
  const res = schema.safeParse(data);
  if (!res.success) {
    opts?.logger?.("Validation error", {
      issues: res.error.issues,
      dataPreview: defaultSafeStringify(data),
    });
    throw new SchemaValidationError(
      "Data validation failed",
      res.error,
      opts?.attachDataOnError ? (data as unknown) : undefined
    );
  }
  return res.data;
}

export function tryParseWithSchema<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
  opts?: { logger?: Logger }
): { ok: true; data: z.infer<T> } | { ok: false; error: ZodError } {
  const res = schema.safeParse(data);
  if (!res.success) {
    opts?.logger?.("Validation warning", {
      issues: res.error.issues,
      dataPreview: defaultSafeStringify(data),
    });
    return { ok: false, error: res.error };
  }
  return { ok: true, data: res.data };
}

export function safeParseWithSchema<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
  opts?: { logger?: Logger }
): z.infer<T> | null {
  const res = tryParseWithSchema(schema, data, opts);
  return res.ok ? res.data : null;
}

export function isValid<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): data is z.infer<T> {
  return schema.safeParse(data).success;
}

export async function parseWithSchemaAsync<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
  opts?: { logger?: Logger; attachDataOnError?: boolean }
): Promise<z.infer<T>> {
  const res = await schema.safeParseAsync(data);
  if (!res.success) {
    opts?.logger?.("Validation error (async)", {
      issues: res.error.issues,
      dataPreview: defaultSafeStringify(data),
    });
    throw new SchemaValidationError(
      "Data validation failed",
      res.error,
      opts?.attachDataOnError ? (data as unknown) : undefined
    );
  }
  return res.data;
}

export async function tryParseWithSchemaAsync<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
  opts?: { logger?: Logger }
): Promise<{ ok: true; data: z.infer<T> } | { ok: false; error: ZodError }> {
  const res = await schema.safeParseAsync(data);
  if (!res.success) {
    opts?.logger?.("Validation warning (async)", {
      issues: res.error.issues,
      dataPreview: defaultSafeStringify(data),
    });
    return { ok: false, error: res.error };
  }
  return { ok: true, data: res.data };
}

export type { ZodError };
export type Result<T> = { ok: true; data: T } | { ok: false; error: ZodError };
