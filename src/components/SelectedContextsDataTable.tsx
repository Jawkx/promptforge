import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  Row,
  RowSelectionState,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
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
import {
  GripVertical,
  LucideTrash,
  LucideListX,
  LucideEdit3,
} from "lucide-react"; // Added LucideEdit3

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
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";

interface SelectedContextsDataTableProps {
  columns: ColumnDef<Context>[];
  data: Context[];
  tableMeta: SelectedContextsTableMeta;
  onReorderContexts: (reorderedContexts: Context[]) => void;
  onDeleteMultipleFromPrompt: (ids: string[]) => void;
}

// DraggableRow component
function DraggableRow({
  row,
  table,
}: {
  row: Row<Context>;
  table: ReturnType<typeof useReactTable<Context>>;
}) {
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
    zIndex: isDragging ? 10 : 0,
    position: "relative",
  };

  const meta = table.options.meta as
    | (SelectedContextsTableMeta & {
        onDeleteMultipleFromPrompt?: (ids: string[]) => void;
      })
    | undefined;
  const currentSelectedCount = table.getFilteredSelectedRowModel().rows.length;

  const handleRemoveFromPrompt = () => {
    meta?.onRemoveContext(row.original.id);
    table.resetRowSelection();
  };

  const handleEditSelected = () => {
    if (meta?.onEditSelectedContext) {
      meta.onEditSelectedContext(row.original);
    }
  };

  const handleDeleteMultiple = () => {
    const selectedIds = table
      .getFilteredSelectedRowModel()
      .rows.map((r) => r.original.id);
    meta?.onDeleteMultipleFromPrompt?.(selectedIds);
    table.resetRowSelection();
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <TableRow
          ref={setNodeRef}
          style={style}
          data-state={row.getIsSelected() && "selected"}
          data-dragging={isDragging}
          className="border-b-muted bg-background"
          onContextMenuCapture={() => {
            if (!row.getIsSelected() && currentSelectedCount <= 1) {
              table.resetRowSelection();
              row.toggleSelected(true);
            } else if (!row.getIsSelected() && currentSelectedCount > 1) {
              // If multiple are selected and this row is not part of them,
              // deselect others and select this one.
              // Or, if user right-clicks an unselected row when multiple are selected,
              // it's often expected to act on that single row.
              table.resetRowSelection();
              row.toggleSelected(true);
            }
            // If right-clicking an already selected row within a multiple selection, keep selection.
          }}
        >
          {row.getVisibleCells().map((cell) => (
            <TableCell
              key={cell.id}
              className={cn(
                "py-2",
                cell.column.id === "drag" || cell.column.id === "select"
                  ? "px-2"
                  : "px-3",
              )}
              style={{
                width:
                  cell.column.getSize() !== 150
                    ? cell.column.getSize()
                    : undefined,
              }}
            >
              {cell.column.id === "drag" ? (
                <Button
                  variant="ghost"
                  size="icon"
                  {...attributes}
                  {...listeners}
                  className="p-0 h-auto w-auto text-muted-foreground hover:bg-transparent cursor-grab active:cursor-grabbing"
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
      </ContextMenuTrigger>
      <ContextMenuContent className="border-secondary">
        {currentSelectedCount > 1 && row.getIsSelected() ? (
          <>
            <ContextMenuLabel>
              {currentSelectedCount} items selected
            </ContextMenuLabel>
            <ContextMenuItem
              onClick={handleDeleteMultiple}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <LucideTrash className="mr-2 h-4 w-4" />
              Remove {currentSelectedCount} from Prompt
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={handleEditSelected} disabled>
              <LucideEdit3 className="mr-2 h-4 w-4" />
              Edit (select one)
            </ContextMenuItem>
          </>
        ) : (
          <>
            <ContextMenuLabel>Context: {row.original.title}</ContextMenuLabel>
            <ContextMenuItem onClick={handleEditSelected}>
              <LucideEdit3 className="mr-2 h-4 w-4" />
              Edit Context
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={handleRemoveFromPrompt}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <LucideListX className="mr-2 h-4 w-4" />
              Remove from Prompt
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}

export function SelectedContextsDataTable({
  columns: initialColumns,
  data,
  tableMeta, // This already includes libraryContexts and onEditSelectedContext from PromptInput
  onReorderContexts,
  onDeleteMultipleFromPrompt,
}: SelectedContextsDataTableProps) {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  // Extend tableMeta passed down to rows/cells if needed for additional actions like delete multiple
  const extendedTableMeta: SelectedContextsTableMeta & {
    onDeleteMultipleFromPrompt?: (ids: string[]) => void;
  } = {
    ...tableMeta,
    onDeleteMultipleFromPrompt,
  };

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data.map(({ id }) => id),
    [data],
  );

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {}),
  );

  const table = useReactTable({
    data,
    columns: initialColumns,
    state: {
      rowSelection,
    },
    meta: extendedTableMeta, // Pass the fully typed meta
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getRowId: (row) => row.id, // Crucial for dnd-kit and selection state with unique IDs
    enableRowSelection: true,
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = data.findIndex((item) => item.id === active.id);
      const newIndex = data.findIndex((item) => item.id === over.id);
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
                    className={cn(
                      "py-2 bg-background sticky top-0 z-[1]",
                      header.id === "drag" || header.id === "select"
                        ? "px-2"
                        : "px-3",
                    )}
                    style={{
                      width:
                        header.getSize() !== 150 ? header.getSize() : undefined,
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
              <SortableContext
                items={dataIds}
                strategy={verticalListSortingStrategy}
              >
                {table.getRowModel().rows.map((row) => (
                  <DraggableRow key={row.id} row={row} table={table} />
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
      {table.getRowModel().rows?.length > 0 && (
        <div className="flex items-center justify-end space-x-2 py-2 text-xs text-muted-foreground pr-2">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getRowModel().rows.length} row(s) selected.
        </div>
      )}
    </DndContext>
  );
}
