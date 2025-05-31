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
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuLabel,
} from "@/components/ui/context-menu";
import { Edit3, Trash2, ListPlus, Trash } from "lucide-react";

interface ContextsDataTableProps {
  columns: ColumnDef<Context>[];
  data: Context[];
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
  onEditContext,
  onDeleteContext,
  onDeleteSelectedContexts,
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


  const handleAddSelectedButtonClick = () => {
    const selectedRowsData = table.getFilteredSelectedRowModel().rows.map(row => row.original);
    if (selectedRowsData.length > 0) {
      onAddSelectedToPrompt(selectedRowsData);
      table.resetRowSelection();
    }
  };

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
          onClick={handleAddSelectedButtonClick}
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
              table.getRowModel().rows.map((row) => {
                const context = row.original;
                const meta = table.options.meta as ContextsTableMeta | undefined;
                const currentSelectedCount = table.getFilteredSelectedRowModel().rows.length;

                return (
                  <ContextMenu key={row.id + "-cm-root"}>
                    <ContextMenuTrigger asChild>
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className="border-b-muted"
                        onContextMenuCapture={() => {
                          // If right-clicking on a row that isn't selected,
                          // and it's not part of an existing multi-selection context (e.g. ctrl/meta key not held)
                          // then select this row exclusively.
                          if (!row.getIsSelected()) {
                            // Check if ctrl or meta key is pressed to allow adding to selection
                            // For simplicity here, we'll just make it the sole selection if not selected.
                            // A more advanced version would check for modifier keys.
                            table.resetRowSelection();
                            row.toggleSelected(true);
                          }
                        }}
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
                    </ContextMenuTrigger>
                    <ContextMenuContent className="border-secondary">
                      {currentSelectedCount > 1 && row.getIsSelected() ? (
                        <>
                          <ContextMenuLabel>{currentSelectedCount} items selected</ContextMenuLabel>
                          <ContextMenuItem onClick={handleAddSelectedFromContextMenu}>
                            <ListPlus className="mr-2 h-4 w-4" />
                            Add {currentSelectedCount} to Prompt
                          </ContextMenuItem>
                          <ContextMenuItem
                            onClick={handleDeleteSelectedFromContextMenu}
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete {currentSelectedCount} contexts
                          </ContextMenuItem>
                          <ContextMenuSeparator />
                          <ContextMenuItem onClick={() => meta?.onEditContext(context)} disabled>
                            <Edit3 className="mr-2 h-4 w-4" />
                            Edit (select one)
                          </ContextMenuItem>
                          <ContextMenuItem onClick={() => meta?.onDeleteContext(context.id)} disabled>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete (select one)
                          </ContextMenuItem>
                        </>
                      ) : (
                        <>
                          <ContextMenuItem onClick={() => onAddSelectedToPrompt([context])}>
                            <ListPlus className="mr-2 h-4 w-4" />
                            Add to Prompt
                          </ContextMenuItem>
                          <ContextMenuItem onClick={() => meta?.onEditContext(context)}>
                            <Edit3 className="mr-2 h-4 w-4" />
                            Edit "{context.title}"
                          </ContextMenuItem>
                          <ContextMenuSeparator />
                          <ContextMenuItem
                            onClick={() => meta?.onDeleteContext(context.id)}
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
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
