import { ColumnDef, Row, Table } from "@tanstack/react-table";
import { Context } from "../../types";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LucideMoreVertical,
  LucideEdit3,
  LucideTrash2,
  LucideListPlus,
  LucideCopy,
  LucideTag,
} from "lucide-react";
import { contextLibraryEvents } from "@/livestore/context-library-store/events";
import { Input } from "@/components/ui/input";
import React, { useEffect, useRef, useState } from "react";
import { toast as sonnerToast } from "sonner";
import { formatTokenCount } from "@/lib/utils";
import { useLiveStores } from "@/store/LiveStoreProvider";
import { v4 as uuid } from "uuid";
import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { LabelAssignment } from "./LabelAssignment";

export type ContextsTableMeta = {
  onEditContext: (context: Context) => void;
  onDeleteContext: (id: string) => void;
  setActiveId: (id: string | null) => void;
  editingTitleId: string | null;
  setEditingTitleId: (id: string | null) => void;
  onAddSelectedToPrompt: (contexts: Context[]) => void;
};

const TitleCell: React.FC<{ row: Row<Context>; table: Table<Context> }> = ({
  row,
  table,
}) => {
  const { contextLibraryStore } = useLiveStores();
  const context = row.original;
  const meta = table.options.meta as ContextsTableMeta | undefined;
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
      contextLibraryStore.commit(
        contextLibraryEvents.contextUpdated({
          id: context.id,
          title: trimmedTitle,
          content: context.content,
          updatedAt: Date.now(),
          version: uuid(),
        }),
      );
      sonnerToast.success("Title Updated", {
        description: `Context title updated to "${trimmedTitle}".`,
      });
    } else if (!trimmedTitle) {
      setTitle(context.title); // Revert
      sonnerToast.error("Title cannot be empty", {
        description: "The context title has been reverted.",
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
      className="flex items-center h-full gap-2 justify-between"
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

export const contextsTableColumn: ColumnDef<Context>[] = [
  {
    id: "select",
    header: ({ table }) => {
      const meta = table.options.meta as ContextsTableMeta | undefined;
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
          />
        </div>
      );
    },
    cell: ({ row, table }) => {
      const meta = table.options.meta as ContextsTableMeta | undefined;
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
    cell: ({ row, table }) => <TitleCell row={row} table={table} />,
    minSize: 300,
  },
  {
    accessorKey: "tokenCount",
    header: "Tokens",
    cell: ({ row }) => {
      const tokenCount = row.original.tokenCount;
      return (
        <div className="text-center" title={String(tokenCount)}>
          {formatTokenCount(tokenCount)}
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

      const handleCopyContent = () => {
        navigator.clipboard
          .writeText(context.content)
          .then(() => {
            sonnerToast.success("Content Copied", {
              description: `Content of "${context.title}" copied to clipboard.`,
            });
          })
          .catch((err) => {
            console.error("Failed to copy content: ", err);
            sonnerToast.error("Copy Failed", {
              description: "Could not copy content to clipboard.",
            });
          });
      };

      return (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <LucideMoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => meta?.onAddSelectedToPrompt([context])}
              >
                <LucideListPlus className="mr-2 h-4 w-4" />
                Add to Prompt
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyContent}>
                <LucideCopy className="mr-2 h-4 w-4" />
                Copy Content
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => meta?.onEditContext(context)}>
                <LucideEdit3 className="mr-2 h-4 w-4" />
                Edit "{context.title}"
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <LucideTag className="mr-2 h-4 w-4" />
                  Labels
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="p-0">
                  <LabelAssignment contextIds={[context.id]} />
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => meta?.onDeleteContext(context.id)}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <LucideTrash2 className="mr-2 h-4 w-4" />
                Delete "{context.title}"
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    size: 60,
    minSize: 60,
    maxSize: 60,
    enableSorting: false,
  },
];
