import { useTasks } from "../api/useTasks";
import { Column } from "./Column";
import type { Column as ColumnType } from "../types/types";

export function ColumnWithTasks({ column }: { column: ColumnType }) {
  const columnId = String(column.id);
  const { data: tasks = [] } = useTasks(columnId);

  return <Column column={{ ...column, id: columnId }} tasks={tasks} />;
}
