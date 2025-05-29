import { ColumnDef } from "@tanstack/react-table";
import { Context } from "../types";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit3, Trash2, GripVertical } from "lucide-react";

// Props for the columns, including handlers from the parent
export type ContextsTableMeta = {
  onEditContext: (context: Context) => void;
  onDeleteContext: (id: string) => void;
  onDragStartRow: (event: React.DragEvent, context: Context) => void;
};

export const getContextsTableColumns = (): ColumnDef<Context>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row, table }) => {
      // Cast meta to the correct type. Make sure 'meta' is passed to useReactTable.
      const meta = table.options.meta as ContextsTableMeta | undefined;
      return (
        <div
          draggable
          onDragStart={(e) => meta?.onDragStartRow(e, row.original)}
          className="flex items-center cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="font-medium truncate" title={row.getValue("title")}>
            {row.getValue("title")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      return <span className="truncate">{row.original.category || "Uncategorized"}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const context = row.original;
      // Cast meta to the correct type. Make sure 'meta' is passed to useReactTable.
      const meta = table.options.meta as ContextsTableMeta | undefined;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => meta?.onEditContext(context)}>
              <Edit3 className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => meta?.onDeleteContext(context.id)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
  },
];
