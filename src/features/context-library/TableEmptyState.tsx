import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";

interface TableEmptyStateProps {
  searchQuery: string;
  totalDataCount: number;
  columnCount: number;
}

export const TableEmptyState: React.FC<TableEmptyStateProps> = ({
  searchQuery,
  totalDataCount,
  columnCount,
}) => {
  return (
    <TableRow>
      <TableCell colSpan={columnCount} className="h-24 text-center">
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
  );
};
