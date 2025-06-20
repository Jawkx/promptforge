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
import { LucideTrash, LucideListX, LucideEdit3 } from "lucide-react";

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
import { FocusArea, useLocalStore } from "@/store/app.store";

interface SelectedContextsDataTableProps {
  columns: ColumnDef<SelectedContext>[];
  data: SelectedContext[];
  tableMeta: SelectedContextsTableMeta;
  onDeleteMultipleFromPrompt: (ids: string[]) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
}

const DataTableRow = ({
  row,
  table,
}: {
  row: Row<SelectedContext>;
  table: ReturnType<typeof useReactTable<SelectedContext>>;
}) => {
  const meta = table.options.meta as
    | (SelectedContextsTableMeta & {
        onDeleteMultipleFromPrompt?: (ids: string[]) => void;
        selectedId: string | null;
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
          data-state={
            (row.getIsSelected() || row.original.id === meta?.selectedId) &&
            "selected"
          }
          className="border-b-muted bg-background cursor-pointer"
          onClick={() => {
            if (meta?.setSelectedId) {
              if (meta.selectedId === row.original.id) {
                meta.setSelectedId(null);
              } else {
                meta.setSelectedId(row.original.id);
                table.resetRowSelection();
              }
            }
          }}
          onContextMenuCapture={() => {
            if (
              !row.getIsSelected() &&
              row.original.id !== meta?.selectedId &&
              meta?.setSelectedId
            ) {
              meta.setSelectedId(row.original.id);
              table.resetRowSelection();
            }
          }}
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
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
};

export const SelectedContextsDataTable: React.FC<
  SelectedContextsDataTableProps
> = ({
  columns: initialColumns,
  data,
  tableMeta,
  onDeleteMultipleFromPrompt,
  selectedId,
  setSelectedId,
}) => {
  const isFocused = useLocalStore(
    (state) => state.focusedArea === FocusArea.SELECTED_CONTEXTS,
  );

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const extendedTableMeta: SelectedContextsTableMeta & {
    onDeleteMultipleFromPrompt?: (ids: string[]) => void;
    selectedId: string | null;
  } = {
    ...tableMeta,
    onDeleteMultipleFromPrompt,
    selectedId,
    setSelectedId,
  };

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
          "flex-grow flex items-center justify-center border rounded-md",
          isFocused ? "border-primary" : "border-muted",
        )}
      >
        <p className="text-sm text-muted-foreground text-center py-10">
          No contexts selected. Add from the library.
        </p>
      </div>
    );
  }

  return (
    <>
      <ScrollArea
        className={cn(
          "flex rounded-md border flex-grow relative",
          isFocused ? "border-primary" : "border-muted",
        )}
      >
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
                      header.id === "select" ? "px-2" : "px-3",
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
              table
                .getRowModel()
                .rows.map((row) => (
                  <DataTableRow key={row.id} row={row} table={table} />
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
    </>
  );
};
