import React from "react";
import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Context } from "../../types";

interface TablePaginationProps {
  table: Table<Context>;
  displayedDataCount: number;
  totalDataCount: number;
  searchQuery: string;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  table,
  displayedDataCount,
  totalDataCount,
  searchQuery,
}) => {
  return (
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
  );
};
