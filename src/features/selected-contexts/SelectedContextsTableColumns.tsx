import React, { useEffect, useRef, useState } from "react";
import { ColumnDef, Row, Table } from "@tanstack/react-table";
import { SelectedContext } from "../../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { X, LucideLink2Off, LucideSave, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useLocalStore } from "@/store/localStore";
import { toast as sonnerToast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatTokenCount } from "@/lib/utils";
import { v4 as uuid } from "uuid";

export type SelectedContextsTableMeta = {
  onRemoveContext: (id: string) => void;
  onEditSelectedContext: (context: SelectedContext) => void;
  onSyncToLibrary: (context: SelectedContext) => void;
  onSyncFromLibrary: (context: SelectedContext) => void;
  onCreateInLibrary: (context: SelectedContext) => void;
  setActiveId: (id: string | null) => void;
  editingTitleId?: string | null;
  setEditingTitleId?: (id: string | null) => void;
};

const SelectedTitleCell: React.FC<{
  row: Row<SelectedContext>;
  table: Table<SelectedContext>;
}> = ({ row, table }) => {
  const updateSelectedContext = useLocalStore(
    (state) => state.updateSelectedContext,
  );
  const context = row.original;
  const meta = table.options.meta as SelectedContextsTableMeta | undefined;
  const { editingTitleId, setEditingTitleId } = meta || {};

  const [isEditing, setIsEditing] = useState(context.id === editingTitleId);
  const [title, setTitle] = useState(context.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(context.title);
  }, [context.title]);

  useEffect(() => {
    if (context.id === editingTitleId) {
      setIsEditing(true);
    }
  }, [editingTitleId, context.id]);

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
        updatedAt: Date.now(),
        version: uuid(),
      });
      sonnerToast.success("Title Updated", {
        description: `Selected context title updated to "${trimmedTitle}".`,
      });
    } else if (!trimmedTitle) {
      setTitle(context.title);
      sonnerToast.error("Title cannot be empty", {
        description: "The selected context title has been reverted.",
      });
    }
    setIsEditing(false);
    if (setEditingTitleId && context.id === editingTitleId) {
      setEditingTitleId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      setTitle(context.title);
      setIsEditing(false);
      if (setEditingTitleId && context.id === editingTitleId) {
        setEditingTitleId(null);
      }
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
      className="flex items-center gap-2 h-full justify-between"
    >
      <span className="font-medium truncate" title={context.title}>
        {context.title}
      </span>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {context.labels?.map((label) => (
          <Badge
            key={label.id}
            variant="outline"
            className="text-xs px-2 py-0.5 h-5 border"
            style={{
              backgroundColor: label.color + "20",
              borderColor: label.color,
              color: label.color,
            }}
            title={label.name}
          >
            {label.name}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export const getSelectedContextsTableColumns =
  (): ColumnDef<SelectedContext>[] => [
    {
      id: "drag-handle",
      header: "",
      cell: () => (
        <div className="flex h-full items-center justify-center cursor-grab active:cursor-grabbing">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 30,
      minSize: 30,
      maxSize: 30,
    },
    {
      id: "select",
      header: ({ table }) => {
        const meta = table.options.meta as
          | SelectedContextsTableMeta
          | undefined;
        return (
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex h-full items-center justify-center"
          >
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                table.getIsSomePageRowsSelected()
              }
              onCheckedChange={(value) => {
                meta?.setActiveId(null);
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
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex h-full items-center justify-center"
          >
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => {
                meta?.setActiveId(null);
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
      cell: ({ row, table }) => <SelectedTitleCell row={row} table={table} />,
      minSize: 200,
    },
    {
      accessorKey: "tokenCount",
      header: () => <div className="text-center">Tokens</div>,
      cell: ({ row }) => {
        const tokenCount = row.original.tokenCount;
        return (
          <div className="text-center" title={String(tokenCount)}>
            {formatTokenCount(tokenCount)}
          </div>
        );
      },
      enableSorting: false,
      size: 60,
      minSize: 60,
      maxSize: 60,
    },
    {
      id: "actions",
      header: () => <div className="text-right w-full pr-2"></div>,
      cell: ({ row, table }) => {
        const context = row.original;
        const meta = table.options.meta as
          | SelectedContextsTableMeta
          | undefined;

        const isLinked = !!context.originalContextId;
        const isModified = context.version !== context.originalVersion;

        return (
          <div className="text-right" onClick={(e) => e.stopPropagation()}>
            {!isLinked ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 p-0"
                    onClick={() => meta?.onCreateInLibrary(context)}
                  >
                    <LucideSave className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create in Library</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              isModified && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                      <LucideLink2Off className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
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
              )
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
