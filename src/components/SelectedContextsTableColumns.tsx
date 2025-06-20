import React, { useEffect, useRef, useState } from "react";
import { ColumnDef, Row } from "@tanstack/react-table";
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
import { Input } from "@/components/ui/input";
import { useLocalStore } from "@/localStore";
import { useToast } from "@/hooks/use-toast";

export type SelectedContextsTableMeta = {
  onRemoveContext: (id: string) => void;
  onEditSelectedContext: (context: SelectedContext) => void;
  onSyncToLibrary: (context: SelectedContext) => void;
  onSyncFromLibrary: (context: SelectedContext) => void;
  setSelectedId: (id: string | null) => void;
};

const SelectedTitleCell: React.FC<{ row: Row<SelectedContext> }> = ({
  row,
}) => {
  const updateSelectedContext = useLocalStore(
    (state) => state.updateSelectedContext,
  );
  const { toast } = useToast();
  const context = row.original;
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(context.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(context.title);
  }, [context.title]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmedTitle = title.trim();
    if (trimmedTitle && trimmedTitle !== context.title) {
      updateSelectedContext({
        ...context,
        title: trimmedTitle,
      });
      toast({
        title: "Title Updated",
        description: `Selected context title updated to "${trimmedTitle}".`,
      });
    } else if (!trimmedTitle) {
      setTitle(context.title);
      toast({
        title: "Title cannot be empty",
        description: "The selected context title has been reverted.",
        variant: "destructive",
      });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      setTitle(context.title);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="h-8"
        onClick={(e) => e.stopPropagation()}
      />
    );
  }

  return (
    <div
      onDoubleClick={() => setIsEditing(true)}
      className="flex items-center gap-2 h-full"
    >
      <span className="font-medium truncate" title={context.title}>
        {context.title}
      </span>
    </div>
  );
};

export const getSelectedContextsTableColumns =
  (): ColumnDef<SelectedContext>[] => [
    {
      id: "select",
      header: ({ table }) => {
        const meta = table.options.meta as
          | SelectedContextsTableMeta
          | undefined;
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) => {
                meta?.setSelectedId(null);
                table.toggleAllPageRowsSelected(!!value);
              }}
              aria-label="Select all"
              className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
          </div>
        );
      },
      cell: ({ row, table }) => {
        const meta = table.options.meta as
          | SelectedContextsTableMeta
          | undefined;
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => {
                meta?.setSelectedId(null);
                row.toggleSelected(!!value);
              }}
              aria-label="Select row"
              className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
      size: 40,
      minSize: 40,
      maxSize: 40,
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => <SelectedTitleCell row={row} />,
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
          <div className="text-right" onClick={(e) => e.stopPropagation()}>
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
