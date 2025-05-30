import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

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

interface SelectedContextsDataTableProps {
  columns: ColumnDef<Context>[];
  data: Context[];
  onRemoveContext: (id: string) => void;
}

export function SelectedContextsDataTable({
  columns,
  data,
  onRemoveContext,
}: SelectedContextsDataTableProps) {
  const tableMeta: SelectedContextsTableMeta = {
    onRemoveContext,
  };

  const table = useReactTable({
    data,
    columns,
    meta: tableMeta,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="h-full flex flex-col">
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
                      style={{ width: header.getSize() !== 150 ? `${header.getSize()}px` : undefined }}
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
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-b-muted"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="py-2 px-3"
                      style={{ width: cell.column.getSize() !== 150 ? `${cell.column.getSize()}px` : undefined }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-full text-center py-10" // Adjusted for vertical centering if table is empty
                >
                  No contexts selected. Add from the library.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
