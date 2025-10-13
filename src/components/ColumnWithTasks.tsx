import { Draggable } from "@hello-pangea/dnd";
import { Column as ColumnCmp } from "./Column";
import type { Column as ColumnType } from "../schemas/schemas";
import { useTasks } from "../api/useTasks";

export function ColumnWithTasks({
  column,
  index,
}: {
  column: ColumnType;
  index: number;
}) {
  const columnId = String(column.id);
  const { data: tasks = [] } = useTasks(columnId);

  return (
    <Draggable draggableId={columnId} index={index}>
      {(drag) => (
        <div
          ref={drag.innerRef}
          {...drag.draggableProps}
          style={drag.draggableProps.style}
        >
          <ColumnCmp
            column={{ ...column, id: columnId }}
            tasks={tasks}
            dragHandleProps={drag.dragHandleProps ?? undefined}
          />
        </div>
      )}
    </Draggable>
  );
}
