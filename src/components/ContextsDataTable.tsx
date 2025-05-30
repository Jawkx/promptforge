import * as React from "react";
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

interface ContextsDataTableProps {
  columns: ColumnDef<Context>[];
  data: Context[];
  onEditContext: (context: Context) => void;
  onDeleteContext: (id: string) => void;
  onAddSelectedToPrompt: (selectedContexts: Context[]) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function ContextsDataTable({
  columns,
  data,
  onEditContext,
  onDeleteContext,
  onAddSelectedToPrompt,
  searchQuery,
  setSearchQuery,
}: ContextsDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const tableMeta: ContextsTableMeta = {
    onEditContext,
    onDeleteContext,
  };

  const table = useReactTable({
    data,
    columns,
    meta: tableMeta,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      globalFilter: searchQuery,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  React.useEffect(() => {
    table.setGlobalFilter(searchQuery);
  }, [searchQuery, table]);


  const handleAddSelected = () => {
    const selectedRowsData = table.getFilteredSelectedRowModel().rows.map(row => row.original);
    if (selectedRowsData.length > 0) {
      onAddSelectedToPrompt(selectedRowsData);
      table.resetRowSelection();
    }
  };

  return (
    <div className="space-y-4 h-full max-h-[800px] flex flex-col">
      <div className="flex items-center justify-between gap-2">
        <Input
          placeholder="Filter contexts..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="max-w-sm"
        />
        <Button
          onClick={handleAddSelected}
          disabled={Object.keys(rowSelection).length === 0}
          size="sm"
        >
          Add Selected
        </Button>
      </div>
      <ScrollArea className="rounded-md border border-muted flex-grow relative">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b-muted">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan} className="py-2 px-3 h-auto">
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
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-b-muted"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2 px-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No contexts found.
                  {data.length > 0 && searchQuery && (
                    <p className="text-xs">Try a different search term.</p>
                  )}
                  {data.length === 0 && !searchQuery && (
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
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-2">
          <span>
            Page{' '}
            {table.getState().pagination.pageIndex + 1} of {' '}
            {table.getPageCount()}
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
