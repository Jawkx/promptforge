import { ColumnDef, Row } from "@tanstack/react-table";
import { Context } from "../types";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LucideMoreVertical, LucideEdit3, LucideTrash2 } from "lucide-react";
import { useStore } from "@livestore/react";
import { events } from "@/livestore/events";
import { Input } from "@/components/ui/input";
import React, { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export type ContextsTableMeta = {
  onEditContext: (context: Context) => void;
  onDeleteContext: (id: string) => void;
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

const TitleCell: React.FC<{ row: Row<Context> }> = ({ row }) => {
  const { store } = useStore();
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
      store.commit(
        events.contextUpdated({
          id: context.id,
          title: trimmedTitle,
          content: context.content,
        }),
      );
      toast({
        title: "Title Updated",
        description: `Context title updated to "${trimmedTitle}".`,
      });
    } else if (!trimmedTitle) {
      setTitle(context.title); // Revert
      toast({
        title: "Title cannot be empty",
        description: "The context title has been reverted.",
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
      />
    );
  }

  return (
    <div
      onDoubleClick={() => setIsEditing(true)}
      className="flex items-center cursor-pointer h-full"
    >
      <span className="font-medium truncate" title={context.title}>
        {context.title}
      </span>
    </div>
  );
};

export const contextsTableColumn: ColumnDef<Context>[] = [
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
    cell: ({ row }) => <TitleCell row={row} />,
    minSize: 300,
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
              <LucideMoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="border-secondary">
            <DropdownMenuItem onClick={() => meta?.onEditContext(context)}>
              <LucideEdit3 className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => meta?.onDeleteContext(context.id)}
              className="text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <LucideTrash2 className="mr-2 h-4 w-4" />
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
