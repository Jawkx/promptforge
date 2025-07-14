import React, { useCallback, useMemo } from "react";
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
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  LucideCopy,
  LucideTrash,
  LucideListX,
  LucideEdit3,
} from "lucide-react";
import { toast as sonnerToast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { SelectedContext } from "../../types";
import { SelectedContextsTableMeta } from "./SelectedContextsTableColumns";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import { FocusArea, useLocalStore } from "@/store/localStore";

interface SelectedContextsDataTableProps {
  columns: ColumnDef<SelectedContext>[];
  data: SelectedContext[];
  tableMeta: SelectedContextsTableMeta;
  onDeleteMultipleFromPrompt: (ids: string[]) => void;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  onReorderContexts: (activeId: string, overId: string) => void;
}

interface MemoizedDataTableRowProps {
  row: Row<SelectedContext>;
  table: ReturnType<typeof useReactTable<SelectedContext>>;
  isSelected: boolean;
  activeId: string | null;
}

interface SortableRowProps extends MemoizedDataTableRowProps {
  id: string;
}

const SortableRow = React.memo(
  ({ id, row, table, isSelected, activeId }: SortableRowProps) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <MemoizedDataTableRow
        row={row}
        table={table}
        isSelected={isSelected}
        activeId={activeId}
        dragHandleProps={{ ...attributes, ...listeners }}
        sortableProps={{ ref: setNodeRef, style }}
      />
    );
  },
);
SortableRow.displayName = "SortableRow";

const MemoizedDataTableRow = React.memo(
  ({
    row,
    table,
    isSelected,
    activeId,
    dragHandleProps,
    sortableProps,
  }: MemoizedDataTableRowProps & {
    dragHandleProps?: Record<string, unknown>;
    sortableProps?: { ref: any; style: any };
  }) => {
    const meta = table.options.meta as
      | (SelectedContextsTableMeta & {
          onDeleteMultipleFromPrompt?: (ids: string[]) => void;
          setActiveId: (id: string | null) => void;
        })
      | undefined;
    const currentSelectedCount =
      table.getFilteredSelectedRowModel().rows.length;

    const handleRemoveFromPrompt = useCallback(() => {
      meta?.onRemoveContext(row.original.id);
      table.resetRowSelection();
    }, [meta, row.original.id, table]);

    const handleEditSelected = useCallback(() => {
      if (meta?.onEditSelectedContext) {
        meta.onEditSelectedContext(row.original);
      }
    }, [meta, row.original]);

    const handleCopyContent = useCallback(() => {
      navigator.clipboard
        .writeText(row.original.content)
        .then(() => {
          sonnerToast.success("Content Copied", {
            description: `Content of "${row.original.title}" copied to clipboard.`,
          });
        })
        .catch((err) => {
          console.error("Failed to copy content: ", err);
          sonnerToast.error("Copy Failed", {
            description: "Could not copy content to clipboard.",
          });
        });
    }, [row.original.content, row.original.title]);

    const handleDeleteMultiple = useCallback(() => {
      const selectedIds = table
        .getFilteredSelectedRowModel()
        .rows.map((r) => r.original.id);
      meta?.onDeleteMultipleFromPrompt?.(selectedIds);
      table.resetRowSelection();
    }, [meta, table]);

    const handleRowClick = useCallback(() => {
      if (meta?.setActiveId) {
        if (activeId === row.original.id) {
          meta.setActiveId(null);
        } else {
          meta.setActiveId(row.original.id);
          table.resetRowSelection();
        }
      }
    }, [meta, activeId, row.original.id, table]);

    const handleContextMenuCapture = useCallback(() => {
      if (
        !row.getIsSelected() &&
        row.original.id !== activeId &&
        meta?.setActiveId
      ) {
        meta.setActiveId(row.original.id);
        table.resetRowSelection();
      }
    }, [row, activeId, meta, table]);

    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <TableRow
            ref={sortableProps?.ref}
            style={sortableProps?.style}
            data-state={
              (isSelected || row.original.id === activeId) && "selected"
            }
            className="border-b-muted cursor-pointer"
            onClick={handleRowClick}
            onContextMenuCapture={handleContextMenuCapture}
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell
                key={cell.id}
                className={cn(
                  "py-2",
                  cell.column.id === "select" ? "px-2" : "px-3",
                )}
                style={{
                  width:
                    cell.column.getSize() !== 150
                      ? cell.column.getSize()
                      : undefined,
                }}
                {...(cell.column.id === "drag-handle" ? dragHandleProps : {})}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {currentSelectedCount > 1 && isSelected ? (
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
              <ContextMenuItem onClick={handleCopyContent}>
                <LucideCopy className="mr-2 h-4 w-4" />
                Copy Content
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
  },
);
MemoizedDataTableRow.displayName = "MemoizedDataTableRow";

export const SelectedContextsDataTable: React.FC<
  SelectedContextsDataTableProps
> = ({
  columns: initialColumns,
  data,
  tableMeta,
  onDeleteMultipleFromPrompt,
  activeId,
  setActiveId,
  onReorderContexts,
}) => {
  const isFocused = useLocalStore(
    (state) => state.focusedArea === FocusArea.SELECTED_CONTEXTS,
  );

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [isDragging, setIsDragging] = React.useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        onReorderContexts(String(active.id), String(over.id));
      }
      setIsDragging(false);
    },
    [onReorderContexts],
  );

  const handleDragCancel = useCallback(() => {
    setIsDragging(false);
  }, []);

  const extendedTableMeta = useMemo(
    () => ({
      ...tableMeta,
      onDeleteMultipleFromPrompt,
      activeId,
      setActiveId,
    }),
    [tableMeta, onDeleteMultipleFromPrompt, activeId, setActiveId],
  );

  const table = useReactTable({
    data,
    columns: initialColumns,
    state: {
      rowSelection,
    },
    meta: extendedTableMeta,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getRowId: (row) => row.id,
    enableRowSelection: true,
  });

  if (data.length === 0) {
    return (
      <div
        className={cn(
          "flex-grow flex items-center justify-center border rounded-md transition-all",
          isFocused && "border-primary",
        )}
      >
        <p className="text-sm text-muted-foreground text-center py-10">
          No contexts selected. Add from the library.
        </p>
      </div>
    );
  }

  const contextIds = data.map((context) => context.id);

  return (
    <div className="flex flex-col h-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <ScrollArea
          className={cn(
            "flex-1 rounded-md border transition-all",
            isFocused && "border-primary",
          )}
        >
          <Table className="overflow-clip">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b-muted">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        "py-2 bg-background sticky top-0 z-[1]",
                        header.id === "select" || header.id === "drag-handle"
                          ? "px-2"
                          : "px-3",
                      )}
                      style={{
                        width:
                          header.getSize() !== 150
                            ? header.getSize()
                            : undefined,
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
              <SortableContext
                items={contextIds}
                strategy={verticalListSortingStrategy}
              >
                {table.getRowModel().rows?.length ? (
                  table
                    .getRowModel()
                    .rows.map((row) => (
                      <SortableRow
                        key={row.id}
                        id={row.id}
                        row={row}
                        table={table}
                        isSelected={row.getIsSelected()}
                        activeId={activeId}
                      />
                    ))
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
              </SortableContext>
            </TableBody>
          </Table>
          {!isDragging && <ScrollBar orientation="horizontal" />}
        </ScrollArea>
      </DndContext>
      {table.getRowModel().rows?.length > 0 && (
        <div className="flex items-center justify-end space-x-2 py-2 text-xs text-muted-foreground pr-2">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getRowModel().rows.length} row(s) selected.
        </div>
      )}
    </div>
  );
};
