import { z } from "zod";

// Board schema - accepts both string and number for id, converts to string
export const BoardSchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform(String),
    title: z.string(),
    createdAt: z
      .union([z.string(), z.number(), z.null(), z.undefined()])
      .optional(),
    position: z.number().optional(),
  })
  .passthrough(); // Allow additional fields from API

// Column schema - accepts both string and number for id and boardId
export const ColumnSchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform(String),
    title: z.string(),
    boardId: z.union([z.string(), z.number()]).transform(String),
    position: z.number().optional(),
  })
  .passthrough(); // Allow additional fields from API

// Task schema - accepts both string and number for id and columnId
export const TaskSchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform(String),
    title: z.string(),
    description: z.union([z.string(), z.null(), z.undefined()]).optional(),
    columnId: z.union([z.string(), z.number()]).transform(String),
    position: z.number().optional(),
  })
  .passthrough(); // Allow additional fields from API

// Array schemas for API responses
export const BoardArraySchema = z.array(BoardSchema);
export const ColumnArraySchema = z.array(ColumnSchema);
export const TaskArraySchema = z.array(TaskSchema);

// Export inferred types to ensure consistency with existing types
export type Board = z.infer<typeof BoardSchema>;
export type Column = z.infer<typeof ColumnSchema>;
export type Task = z.infer<typeof TaskSchema>;
