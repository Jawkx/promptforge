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
  ColumnFiltersState, // Added for column filtering
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
import { Context, CONTEXT_COLOR_OPTIONS, ContextColorValue } from "../types";
import { ContextsTableMeta } from "./ContextsDataTableColumns";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuLabel,
} from "@/components/ui/context-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LucideEdit3, LucideListPlus, LucidePalette, LucideTrash, LucideTrash2 } from "lucide-react";

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
  // globalFilter is controlled by searchQuery prop
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [colorFilter, setColorFilter] = React.useState<ContextColorValue | "all">("all");


  const tableMeta: ContextsTableMeta = {
    onEditContext,
    onDeleteContext,
  };

  const table = useReactTable({
    data,
    columns,
    meta: tableMeta,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters, // Added
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    // globalFilter is set directly via state
    getFacetedRowModel: getFacetedRowModel(), // For advanced filtering UI, if needed
    getFacetedUniqueValues: getFacetedUniqueValues(), // For advanced filtering UI
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      globalFilter: searchQuery,
      columnFilters, // Added
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

  React.useEffect(() => {
    // When colorFilter changes, update the table's column filter for 'colorLabel'
    const colorLabelColumn = table.getColumn("colorLabel");
    if (colorLabelColumn) {
      if (colorFilter === "all" || colorFilter === "none") {
        colorLabelColumn.setFilterValue(undefined); // Clear filter
      } else {
        colorLabelColumn.setFilterValue(colorFilter);
      }
    }
  }, [colorFilter, table]);


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

  const displayedDataCount = table.getRowModel().rows.length;
  const totalDataCount = data.length;


  return (
    <div className="space-y-4 h-full max-h-[800px] flex flex-col">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-grow">
          <Input
            placeholder="Filter contexts..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="max-w-xs h-9"
          />
          <div className="relative flex items-center">
            <Select
              value={colorFilter}
              onValueChange={(value) => setColorFilter(value as ContextColorValue | "all")}
            >
              <SelectTrigger className="w-[150px] h-9">
                <div className="flex items-center gap-2">
                  <LucidePalette className="h-3.5 w-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Filter by color..." />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    All Colors
                  </div>
                </SelectItem>
                {CONTEXT_COLOR_OPTIONS.map((option) => (
                  option.value !== "none" &&
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block h-3 w-3 rounded-full ${option.twBgClass}`} />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {colorFilter !== "all" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 absolute right-8 top-1/2 -translate-y-1/2" // Adjusted for select padding/border
                onClick={() => setColorFilter("all")}
                aria-label="Clear color filter"
              >
                <XIcon className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            )}
          </div>
        </div>
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
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className="py-2 px-3 h-auto"
                      style={{ width: header.getSize() === 0 ? undefined : header.getSize() }}
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
                          if (!row.getIsSelected()) {
                            table.resetRowSelection();
                            row.toggleSelected(true);
                          }
                        }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className="py-2 px-3"
                            style={{ width: cell.column.getSize() === 0 ? undefined : cell.column.getSize() }}
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
                          <ContextMenuItem onClick={() => meta?.onEditContext(context)} disabled>
                            <LucideEdit3 className="mr-2 h-4 w-4" />
                            Edit (select one)
                          </ContextMenuItem>
                          <ContextMenuItem onClick={() => meta?.onDeleteContext(context.id)} disabled>
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
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No contexts found.
                  {(searchQuery || colorFilter !== 'all') && totalDataCount > 0 && (
                    <p className="text-xs">Try different filter criteria.</p>
                  )}
                  {totalDataCount === 0 && !searchQuery && colorFilter === 'all' && (
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
          {(searchQuery || colorFilter !== 'all') && ` (Filtered from ${totalDataCount})`}
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

