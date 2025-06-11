import React from "react";
import {
  ColumnDef,
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
import { Context } from "../types";
import { ContextsTableMeta } from "./ContextsDataTableColumns";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuLabel,
} from "@/components/ui/context-menu";
import { LucideEdit3, LucideListPlus, LucideSearch, LucideTrash, LucideTrash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContextsDataTableProps {
  columns: ColumnDef<Context>[];
  data: Context[];
  tableMeta: ContextsTableMeta; // Added to pass getResolvedLabels
  onEditContext: (context: Context) => void;
  onDeleteContext: (id: string) => void;
  onDeleteSelectedContexts: (ids: string[]) => void;
  onAddSelectedToPrompt: (selectedContexts: Context[]) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function ContextsDataTable({
  columns,
  data,
  tableMeta: providedTableMeta, // Renamed to avoid conflict
  onEditContext,
  onDeleteContext,
  onDeleteSelectedContexts,
  onAddSelectedToPrompt,
  searchQuery,
  setSearchQuery,
}: ContextsDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);


  // Combine providedTableMeta with other meta properties if needed
  // For now, it seems providedTableMeta is complete for what columns need.
  const tableMeta: ContextsTableMeta = {
    ...providedTableMeta, // Includes getResolvedLabels
    onEditContext,       // Still needed by column actions
    onDeleteContext,     // Still needed by column actions
  };

  const table = useReactTable({
    data,
    columns,
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

  const handleAddSelectedFromContextMenu = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedContexts = selectedRows.map(r => r.original);
    if (selectedContexts.length > 0) {
      onAddSelectedToPrompt(selectedContexts);
      table.resetRowSelection();
    }
  };

  const handleDeleteSelectedFromContextMenu = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedIds = selectedRows.map(r => r.original.id);
    if (selectedIds.length > 0) {
      onDeleteSelectedContexts(selectedIds);
      table.resetRowSelection();
    }
  };

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
      <ScrollArea className="rounded-md border border-muted flex-grow relative">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b-muted">
                {headerGroup.headers.map((header, idx) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn("py-2 sticky top-0 bg-background z-10", idx === 0 ? "pl-3" : "px-2")}
                      style={{ width: header.getSize() === 0 || header.getSize() === 150 ? undefined : header.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
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
                const context = row.original;
                const metaFromTable = table.options.meta as ContextsTableMeta | undefined;
                const currentSelectedCount = table.getFilteredSelectedRowModel().rows.length;

                return (
                  <ContextMenu key={row.id + "-cm-root"}>
                    <ContextMenuTrigger asChild>
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className="border-b-muted"
                        onContextMenuCapture={() => {
                          if (!row.getIsSelected()) {
                            table.resetRowSelection();
                            row.toggleSelected(true);
                          }
                        }}
                      >
                        {row.getVisibleCells().map((cell, idx) => (
                          <TableCell
                            key={cell.id}
                            className={cn("py-2", idx === 0 ? "pl-3" : "px-2")}
                            style={{ width: cell.column.getSize() === 0 || cell.column.getSize() === 150 ? undefined : cell.column.getSize() }}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="border-secondary">
                      {currentSelectedCount > 1 && row.getIsSelected() ? (
                        <>
                          <ContextMenuLabel>{currentSelectedCount} items selected</ContextMenuLabel>
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
                          <ContextMenuItem onClick={() => metaFromTable?.onEditContext(context)} disabled>
                            <LucideEdit3 className="mr-2 h-4 w-4" />
                            Edit (select one)
                          </ContextMenuItem>
                          <ContextMenuItem onClick={() => metaFromTable?.onDeleteContext(context.id)} disabled>
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
                          <ContextMenuItem onClick={() => metaFromTable?.onEditContext(context)}>
                            <LucideEdit3 className="mr-2 h-4 w-4" />
                            Edit "{context.title}"
                          </ContextMenuItem>
                          <ContextMenuSeparator />
                          <ContextMenuItem
                            onClick={() => metaFromTable?.onDeleteContext(context.id)}
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
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No contexts found.
                  {searchQuery && totalDataCount > 0 && (
                    <p className="text-xs">Try a different search term.</p>
                  )}
                  {totalDataCount === 0 && !searchQuery && (
                    <p className="text-xs">Click the 'Add Context' button to create one.</p>
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
            Page{' '}
            {table.getState().pagination.pageIndex + 1} of {' '}
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
}
