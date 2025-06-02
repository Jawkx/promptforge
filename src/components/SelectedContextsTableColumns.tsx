import { ColumnDef } from "@tanstack/react-table";
import { Context, GlobalLabel, PREDEFINED_LABEL_COLORS } from "../types"; // Added GlobalLabel
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectedContextsTableMeta = {
  onRemoveContext: (id: string) => void;
  // Function to resolve label IDs for a specific context
  getResolvedLabels: (context: Context) => GlobalLabel[];
};

export const getSelectedContextsTableColumns = (): ColumnDef<Context>[] => [
  {
    id: "drag",
    header: () => null,
    cell: () => null, // Drag handle is rendered by DraggableRow component
    size: 30,
    minSize: 30,
    maxSize: 30,
    enableSorting: false,
    enableHiding: false,
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
        className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
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
    minSize: 200,
  },
  {
    accessorKey: "labels",
    header: "Labels",
    // No accessorFn needed here if display is handled by cell; filtering would need it
    cell: ({ row, table }) => {
      const meta = table.options.meta as SelectedContextsTableMeta | undefined;
      const resolvedLabels = meta?.getResolvedLabels ? meta.getResolvedLabels(row.original) : [];

      if (!resolvedLabels || resolvedLabels.length === 0) {
        return <span className="text-xs text-muted-foreground italic">No labels</span>;
      }
      return (
        <div className="flex flex-wrap gap-1 items-center max-w-[200px] overflow-hidden">
          {resolvedLabels.slice(0, 3).map((label) => {
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
          {resolvedLabels.length > 3 && <span className="text-xs text-muted-foreground">...</span>}
        </div>
      );
    },
    minSize: 120,
    maxSize: 250,
    enableSorting: false,
  },
  {
    id: "actions",
    header: () => <div className="text-right w-full pr-2"></div>,
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
    size: 60,
    minSize: 60,
    maxSize: 60,
  },
];

