import { ColumnDef } from "@tanstack/react-table";
import { Context, GlobalLabel, PREDEFINED_LABEL_COLORS } from "../types";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit3, Trash2 } from "lucide-react";

export type ContextsTableMeta = {
  onEditContext: (context: Context) => void;
  onDeleteContext: (id: string) => void;
  getResolvedLabels: (labelIds: string[] | undefined) => GlobalLabel[]; // Updated to accept string[] | undefined
};

const formatCharCount = (count: number): string => {
  if (count < 1000) {
    return String(count);
  }
  if (count < 1_000_000) {
    const num = Math.floor(count / 1000);
    return `${num}k`;
  }
  const num = Math.floor(count / 1_000_000);
  return `${num}M`;
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
    size: 40,
    minSize: 40,
    maxSize: 40,
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
    minSize: 300,
  },
  {
    accessorKey: "labels",
    header: "Labels",
    accessorFn: (row) => {
      const tableMeta = row.table.options.meta as ContextsTableMeta | undefined;
      if (tableMeta?.getResolvedLabels) {
        // Pass row.labels (which is string[] | undefined)
        const resolved = tableMeta.getResolvedLabels(row.labels);
        return resolved.map(l => l.text).join(" ");
      }
      return "";
    },
    cell: ({ row, table }) => {
      const tableMeta = table.options.meta as ContextsTableMeta | undefined;
      // Pass row.original.labels (which is string[] | undefined)
      const resolvedLabels = tableMeta?.getResolvedLabels ? tableMeta.getResolvedLabels(row.original.labels) : [];

      if (!resolvedLabels || resolvedLabels.length === 0) {
        return <span className="text-xs text-muted-foreground italic">No labels</span>;
      }
      return (
        <div className="flex flex-wrap gap-1 items-center max-w-[250px] overflow-hidden">
          {resolvedLabels.map((label) => {
            const colorInfo = PREDEFINED_LABEL_COLORS.find(c => c.value === label.color);
            return (
              <span
                key={label.id}
                title={label.text}
                className={`px-1.5 py-0.5 rounded-full text-xs font-medium border truncate ${colorInfo?.twChipClass || 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-500'}`}
              >
                {label.text}
              </span>
            );
          })}
        </div>
      );
    },
    minSize: 150,
    maxSize: 300,
    enableSorting: false,
  },
  {
    accessorFn: (row) => row.content.length,
    id: "charCount",
    header: "Chars",
    cell: ({ row }) => {
      const charCount = row.original.content.length;
      return (
        <div className="text-center" title={String(charCount)}>
          {formatCharCount(charCount)}
        </div>
      );
    },
    enableSorting: true,
    size: 80,
    minSize: 60,
    maxSize: 100,
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const context = row.original;
      const meta = table.options.meta as ContextsTableMeta | undefined;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
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
    size: 60,
    minSize: 60,
    maxSize: 60,
    enableSorting: false,
  },
];
