import { useTasks } from "../api/useTasks";
import { Column } from "./Column";
import type { Column as ColumnType } from "../types/types";

export function ColumnWithTasks({ column }: { column: ColumnType }) {
  const { data: tasks = [] } = useTasks(column.id);

  return <Column column={column} tasks={tasks} />;
}
