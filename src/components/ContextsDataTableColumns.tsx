import { ColumnDef } from "@tanstack/react-table";
import { Context, CONTEXT_COLOR_OPTIONS, ContextColorValue } from "../types";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit3, Trash2, Palette } from "lucide-react";


export type ContextsTableMeta = {
  onEditContext: (context: Context) => void;
  onDeleteContext: (id: string) => void;
  // Add a way to update color directly if needed, though Edit modal handles it now
  // onUpdateContextColor: (id: string, color: ContextColorValue) => void; 
};

export const getContextsTableColumns = (): ColumnDef<Context>[] => [
  {
    accessorKey: "colorLabel",
    header: () => null,
    cell: ({ row }) => {
      const colorValue = row.original.colorLabel;
      const colorOption = CONTEXT_COLOR_OPTIONS.find(opt => opt.value === colorValue);
      const bgColorClass = colorOption && colorOption.value ? colorOption.twBgClass : 'bg-transparent border border-dashed border-gray-400';

      return (
        <div className="flex items-center justify-center">
          <span
            title={colorOption?.label || "No color"}
            className={`inline-block h-3.5 w-3.5  rounded-full ${bgColorClass}`}
          />
        </div>
      );
    },
    size: 20,
    minSize: 20,
    maxSize: 20,
    enableSorting: false,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
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
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 20,
    minSize: 20,
    maxSize: 20
  },
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
    minSize: 500
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const context = row.original;
      const meta = table.options.meta as ContextsTableMeta | undefined;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="border-secondary">
            <DropdownMenuItem onClick={() => meta?.onEditContext(context)}>
              <Edit3 className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => meta?.onDeleteContext(context.id)}
              className="text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: 20,
    minSize: 20,
    maxSize: 20,
    enableSorting: false,
  },
];

