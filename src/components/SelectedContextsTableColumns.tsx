import { ColumnDef } from "@tanstack/react-table";
import { SelectedContext } from "../types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { X, LucideLink2Off } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateContextHash } from "@/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type SelectedContextsTableMeta = {
  onRemoveContext: (id: string) => void;
  onEditSelectedContext: (context: SelectedContext) => void;
  onSyncToLibrary: (context: SelectedContext) => void;
  onSyncFromLibrary: (context: SelectedContext) => void;
};

export const getSelectedContextsTableColumns =
  (): ColumnDef<SelectedContext>[] => [
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
        const selectedCopy = row.original;
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium truncate" title={selectedCopy.title}>
              {selectedCopy.title}
            </span>
          </div>
        );
      },
      minSize: 200,
    },
    {
      id: "actions",
      header: () => <div className="text-right w-full pr-2"></div>,
      cell: ({ row, table }) => {
        const context = row.original;
        const meta = table.options.meta as
          | SelectedContextsTableMeta
          | undefined;

        const currentHash = generateContextHash(context.title, context.content);

        const isModified = currentHash !== context.originalHash;

        return (
          <div className="text-right">
            {isModified && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                    <LucideLink2Off className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="border-secondary">
                  <DropdownMenuItem
                    onClick={() => meta?.onSyncToLibrary(context)}
                  >
                    Update Library
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => meta?.onSyncFromLibrary(context)}
                  >
                    Revert Changes
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

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
