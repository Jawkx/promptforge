import React, { useMemo, useCallback } from "react";
import {
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  RowSelectionState,
  getFacetedRowModel,
  getFacetedUniqueValues,
  ColumnFiltersState,
  Row,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Context } from "../../types";
import {
  contextsTableColumn,
  ContextsTableMeta,
} from "./ContextsDataTableColumns";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuLabel,
} from "@/components/ui/context-menu";
import {
  LucideEdit3,
  LucideListPlus,
  LucideSearch,
  LucideTrash,
  LucideTrash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { FocusArea, useLocalStore } from "@/store/app.store";

const DataTableRow = React.memo(
  ({
    row,
    table,
    activeId,
    isSelected,
    onAddSelectedToPrompt,
    onDeleteSelectedContexts,
  }: {
    row: Row<Context>;
    table: ReturnType<typeof useReactTable<Context>>;
    activeId: string | null;
    isSelected: boolean;
    onAddSelectedToPrompt: (contexts: Context[]) => void;
    onDeleteSelectedContexts: (ids: string[]) => void;
  }) => {
    const context = row.original;
    const meta = table.options.meta as ContextsTableMeta | undefined;
    const { setActiveId } = meta || {};
    const currentSelectedCount =
      table.getFilteredSelectedRowModel().rows.length;

    const handleAddSelectedFromContextMenu = useCallback(() => {
      const selectedRows = table.getFilteredSelectedRowModel().rows;
      const selectedContexts = selectedRows.map((r) => r.original);
      if (selectedContexts.length > 0) {
        onAddSelectedToPrompt(selectedContexts);
        table.resetRowSelection();
      }
    }, [table, onAddSelectedToPrompt]);

    const handleDeleteSelectedFromContextMenu = useCallback(() => {
      const selectedRows = table.getFilteredSelectedRowModel().rows;
      const selectedIds = selectedRows.map((r) => r.original.id);
      if (selectedIds.length > 0) {
        onDeleteSelectedContexts(selectedIds);
        table.resetRowSelection();
      }
    }, [table, onDeleteSelectedContexts]);

    const handleRowClick = useCallback(() => {
      if (!setActiveId) return;
      if (activeId === context.id) {
        setActiveId(null);
      } else {
        setActiveId(context.id);
        table.resetRowSelection();
      }
    }, [setActiveId, activeId, context.id, table]);

    const handleContextMenuCapture = useCallback(() => {
      if (!row.getIsSelected() && setActiveId) {
        setActiveId(context.id);
        table.resetRowSelection();
      }
    }, [row, context.id, setActiveId, table]);

    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <TableRow
            data-state={(isSelected || context.id === activeId) && "selected"}
            className="border-b-muted cursor-pointer"
            onClick={handleRowClick}
            onContextMenuCapture={handleContextMenuCapture}
          >
            {row.getVisibleCells().map((cell, idx) => (
              <TableCell
                key={cell.id}
                className={cn("py-2", idx === 0 ? "pl-3" : "px-2")}
                style={{
                  width:
                    cell.column.getSize() === 0 || cell.column.getSize() === 150
                      ? undefined
                      : cell.column.getSize(),
                }}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        </ContextMenuTrigger>
        <ContextMenuContent className="border-secondary">
          {currentSelectedCount > 1 && isSelected ? (
            <>
              <ContextMenuLabel>
                {currentSelectedCount} items selected
              </ContextMenuLabel>
              <ContextMenuItem onClick={handleAddSelectedFromContextMenu}>
                <LucideListPlus className="mr-2 h-4 w-4" />
                Add {currentSelectedCount} to Prompt
              </ContextMenuItem>
              <ContextMenuItem
                onClick={handleDeleteSelectedFromContextMenu}
                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <LucideTrash className="mr-2 h-4 w-4" />
                Delete {currentSelectedCount} contexts
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                onClick={() => meta?.onEditContext(context)}
                disabled
              >
                <LucideEdit3 className="mr-2 h-4 w-4" />
                Edit (select one)
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => meta?.onDeleteContext(context.id)}
                disabled
              >
                <LucideTrash2 className="mr-2 h-4 w-4" />
                Delete (select one)
              </ContextMenuItem>
            </>
          ) : (
            <>
              <ContextMenuItem onClick={() => onAddSelectedToPrompt([context])}>
                <LucideListPlus className="mr-2 h-4 w-4" />
                Add to Prompt
              </ContextMenuItem>
              <ContextMenuItem onClick={() => meta?.onEditContext(context)}>
                <LucideEdit3 className="mr-2 h-4 w-4" />
                Edit "{context.title}"
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                onClick={() => meta?.onDeleteContext(context.id)}
                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <LucideTrash2 className="mr-2 h-4 w-4" />
                Delete "{context.title}"
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>
    );
  },
);
DataTableRow.displayName = "DataTableRow";

interface ContextsDataTableProps {
  data: readonly Context[];
  onDeleteContext: (id: string) => void;
  onDeleteSelectedContexts: (ids: string[]) => void;
  onAddSelectedToPrompt: (selectedContexts: Context[]) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  editingTitleId: string | null;
  setEditingTitleId: (id: string | null) => void;
}

export const ContextsDataTable: React.FC<ContextsDataTableProps> = ({
  data,
  onDeleteContext,
  onDeleteSelectedContexts,
  onAddSelectedToPrompt,
  searchQuery,
  setSearchQuery,
  activeId,
  setActiveId,
  editingTitleId,
  setEditingTitleId,
}) => {
  const [, navigate] = useLocation();

  const isFocused = useLocalStore(
    (state) => state.focusedArea === FocusArea.CONTEXT_LIBRARY,
  );

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const handleEditContext = useCallback(
    (context: Context) => {
      navigate(`/edit/library/${context.id}`);
    },
    [navigate],
  );

  const tableMeta: ContextsTableMeta = useMemo(
    () => ({
      onEditContext: handleEditContext,
      onDeleteContext: onDeleteContext,
      setActiveId,
      editingTitleId,
      setEditingTitleId,
    }),
    [
      handleEditContext,
      onDeleteContext,
      setActiveId,
      editingTitleId,
      setEditingTitleId,
    ],
  );

  // useReactTable for some reason expect mutatable data type
  const mutatableContext = useMemo(() => [...data], [data]);

  const table = useReactTable({
    data: mutatableContext,
    columns: contextsTableColumn,
    meta: tableMeta,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getRowId: (row) => row.id,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      globalFilter: searchQuery,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    onGlobalFilterChange: setSearchQuery,
  });

  React.useEffect(() => {
    table.setGlobalFilter(searchQuery);
  }, [searchQuery, table]);

  const displayedDataCount = table.getRowModel().rows.length;
  const totalDataCount = data.length;

  return (
    <div className="h-full max-h-[800px] flex flex-col ">
      <div className="flex items-center mb-3">
        <LucideSearch className="text-primary mr-4" />
        <Input
          placeholder="Filter contexts by title or content..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="h-9 "
        />
      </div>
      <ScrollArea
        className={cn(
          "rounded-md border flex-grow relative",
          isFocused ? "border-primary" : "border-muted",
        )}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b-muted">
                {headerGroup.headers.map((header, idx) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        "py-2 sticky top-0 bg-background z-10",
                        idx === 0 ? "pl-3" : "px-2",
                      )}
                      style={{
                        width:
                          header.getSize() === 0 || header.getSize() === 150
                            ? undefined
                            : header.getSize(),
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                return (
                  <DataTableRow
                    key={row.id}
                    row={row}
                    table={table}
                    activeId={activeId}
                    isSelected={row.getIsSelected()}
                    onAddSelectedToPrompt={onAddSelectedToPrompt}
                    onDeleteSelectedContexts={onDeleteSelectedContexts}
                  />
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={contextsTableColumn.length}
                  className="h-24 text-center"
                >
                  No contexts found.
                  {searchQuery && totalDataCount > 0 && (
                    <p className="text-xs">Try a different search term.</p>
                  )}
                  {totalDataCount === 0 && !searchQuery && (
                    <p className="text-xs">
                      Click the 'Add Context' button to create one.
                    </p>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <div className="flex items-center justify-between space-x-2 py-2 text-sm text-muted-foreground">
        <div>
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {displayedDataCount} row(s) selected.
          {searchQuery && ` (Filtered from ${totalDataCount})`}
        </div>
        <div className="flex items-center space-x-2">
          <span>
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount() || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
