import { z } from "zod";

// Board schema
export const BoardSchema = z
  .object({
    id: z.coerce.string(),
    title: z.string().trim().min(1, "Title is required"),
    // Варіант 1: зберігати як Date (раджу)
    createdAt: z.coerce.date().optional(),
    // Варіант 2 (якщо не хочеш Date):
    // createdAt: z.union([z.string(), z.number()]).optional(),
    position: z.number().int().min(0).optional(),
  })
  .passthrough();

// Column schema
export const ColumnSchema = z
  .object({
    id: z.coerce.string(),
    title: z.string().trim().min(1),
    boardId: z.coerce.string(),
    position: z.number().int().min(0).optional(),
  })
  .passthrough();

// Task schema
export const TaskSchema = z
  .object({
    id: z.coerce.string(),
    title: z.string().trim().min(1),
    description: z.string().trim().nullish(), // string | null | undefined
    columnId: z.coerce.string(),
    position: z.number().int().min(0).optional(),
  })
  .passthrough();

// Arrays
export const BoardArraySchema = z.array(BoardSchema);
export const ColumnArraySchema = z.array(ColumnSchema);
export const TaskArraySchema = z.array(TaskSchema);

// Types
export type Board = z.infer<typeof BoardSchema>;
export type Column = z.infer<typeof ColumnSchema>;
export type Task = z.infer<typeof TaskSchema>;
