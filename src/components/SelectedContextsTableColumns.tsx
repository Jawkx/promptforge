import { ColumnDef } from "@tanstack/react-table";
import { Context, GlobalLabel } from "../types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { X, CircleSlash } from "lucide-react"; // Added CircleSlash
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type SelectedContextsTableMeta = {
  onRemoveContext: (id: string) => void;
  getResolvedLabels: (labelIds: string[] | undefined) => GlobalLabel[];
  libraryContexts: Context[]; // To access original contexts for sync check
  onEditSelectedContext: (context: Context) => void; // To trigger edit modal
};

// Helper to compare labels arrays (order-insensitive)
const areLabelsSame = (labelsA: string[], labelsB: string[]): boolean => {
  if (labelsA.length !== labelsB.length) return false;
  const sortedA = [...labelsA].sort();
  const sortedB = [...labelsB].sort();
  return sortedA.every((val, index) => val === sortedB[index]);
};

export const getSelectedContextsTableColumns = (): ColumnDef<Context>[] => [
  {
    id: "drag",
    header: () => null,
    cell: () => null,
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
    cell: ({ row, table }) => {
      const selectedCopy = row.original;
      const meta = table.options.meta as SelectedContextsTableMeta | undefined;
      let isOutOfSync = false;

      if (selectedCopy.originalId && meta?.libraryContexts) {
        const originalLibraryContext = meta.libraryContexts.find(
          (libCtx) => libCtx.id === selectedCopy.originalId
        );

        if (originalLibraryContext) {
          const titleChanged = selectedCopy.title !== originalLibraryContext.title;
          const contentChanged = selectedCopy.content !== originalLibraryContext.content;
          const labelsChanged = !areLabelsSame(selectedCopy.labels, originalLibraryContext.labels);

          if (titleChanged || contentChanged || labelsChanged) {
            isOutOfSync = true;
          }
        }
        // If originalLibraryContext is not found (orphaned), it's not "out of sync" in the sense of being edited.
        // It just has no original to compare against. No icon shown for this case.
      }

      return (
        <div className="flex items-center gap-2">
          {isOutOfSync && (
            <CircleSlash
              className="h-4 w-4 text-orange-500 flex-shrink-0"
              title="Modified: This context differs from its original in the library."
            />
          )}
          <span className="font-medium truncate" title={selectedCopy.title}>
            {selectedCopy.title}
          </span>
        </div>
      );
    },
    minSize: 200,
  },
  {
    accessorKey: "labels",
    header: "Labels",
    cell: ({ row, table }) => {
      const meta = table.options.meta as SelectedContextsTableMeta | undefined;
      const resolvedLabels = meta?.getResolvedLabels ? meta.getResolvedLabels(row.original.labels) : [];

      if (!resolvedLabels || resolvedLabels.length === 0) {
        return <span className="text-xs text-muted-foreground italic">No labels</span>;
      }
      return (
        <div className="flex flex-wrap gap-1 items-center max-w-[200px] overflow-hidden">
          {resolvedLabels.slice(0, 3).map((label) => {
            return (
              <Badge
                key={label.id}
                title={label.text}
                variant="outline"
                className="truncate"
              >
                {label.text}
              </Badge>
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
