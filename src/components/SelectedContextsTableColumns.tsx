import { ColumnDef } from "@tanstack/react-table";
import { Context } from "../types";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectedContextsTableMeta = {
  onRemoveContext: (id: string) => void;
};

export const getSelectedContextsTableColumns = (): ColumnDef<Context>[] => [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span className="font-medium truncate" title={row.getValue("title")}>
            {row.getValue("title")}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right w-full pr-2">Action</div>,
    cell: ({ row, table }) => {
      const context = row.original;
      const meta = table.options.meta as SelectedContextsTableMeta | undefined;

      return (
        <div className="text-right">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => meta?.onRemoveContext(context.id)}
            className={cn(
              "h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10",
            )}
            aria-label={`Remove ${context.title}`}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    },
    enableSorting: false,
    size: 80, // Adjusted size for the column header and button
  },
];
