import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  Row,
} from "@tanstack/react-table";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Context } from "../types";
import { SelectedContextsTableMeta } from "./SelectedContextsTableColumns";
import { Button } from "@/components/ui/button";

interface SelectedContextsDataTableProps {
  columns: ColumnDef<Context>[];
  data: Context[];
  onRemoveContext: (id: string) => void;
  onReorderContexts: (reorderedContexts: Context[]) => void; // New prop
}

// DraggableRow component
function DraggableRow({ row }: { row: Row<Context> }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: row.original.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 10 : 0, // Ensure dragging item is on top
    position: 'relative', // Needed for z-index to take effect on table rows
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      className="border-b-muted bg-background" // Ensure bg for stacking context
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell
          key={cell.id}
          className="py-2 px-3"
          style={{ width: cell.column.getSize() !== 150 ? `${cell.column.getSize()}px` : undefined }}
        >
          {cell.column.id === "drag" ? (
            <Button
              variant="ghost"
              size="icon"
              {...attributes}
              {...listeners}
              className="p-0 h-auto w-auto text-muted-foreground hover:bg-transparent cursor-grab active:cursor-grabbing"
            // Prevent click propagation if it interferes with row selection or other actions
            // onClick={(e) => e.stopPropagation()} 
            >
              <GripVertical className="h-4 w-4" />
              <span className="sr-only">Drag to reorder</span>
            </Button>
          ) : (
            flexRender(cell.column.columnDef.cell, cell.getContext())
          )}
        </TableCell>
      ))}
    </TableRow>
  );
}

export function SelectedContextsDataTable({
  columns: initialColumns,
  data,
  onRemoveContext,
  onReorderContexts,
}: SelectedContextsDataTableProps) {
  const tableMeta: SelectedContextsTableMeta = {
    onRemoveContext,
  };

  const dataIds = React.useMemo<UniqueIdentifier[]>(() => data.map(({ id }) => id), [data]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Require the mouse to move by a few pixels before activating
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      // Press delay of 250ms, with a tolerance of 5px of movement
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {})
  );

  const table = useReactTable({
    data,
    columns: initialColumns,
    meta: tableMeta,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id, // Crucial for dnd-kit
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = data.findIndex(item => item.id === active.id);
      const newIndex = data.findIndex(item => item.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorderContexts(arrayMove(data, oldIndex, newIndex));
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <ScrollArea className="flex rounded-md border border-muted flex-grow relative ">
        <Table className="h-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b-muted">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className="py-2 px-3 h-auto bg-background" // Ensure header bg for stacking
                    style={{
                      width: header.getSize() !== 150 ? `${header.getSize()}px` : undefined,
                      position: 'sticky',
                      top: 0,
                      zIndex: 1
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
                {table.getRowModel().rows.map((row) => (
                  <DraggableRow key={row.id} row={row} />
                ))}
              </SortableContext>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={initialColumns.length}
                  className="h-full text-center py-10"
                >
                  No contexts selected. Add from the library.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </DndContext>
  );
}
