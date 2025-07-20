import React, { useCallback } from "react";
import { Row } from "@tanstack/react-table";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuLabel,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from "@/components/ui/context-menu";
import {
  LucideCopy,
  LucideEdit3,
  LucideListPlus,
  LucideTag,
  LucideTrash,
  LucideTrash2,
} from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { Context } from "../../types";
import { ContextsTableMeta } from "./ContextsDataTableColumns";
import { LabelAssignment } from "./LabelAssignment";

interface ContextRowMenuProps {
  children: React.ReactNode;
  context: Context;
  isSelected: boolean;
  selectedRows: Row<Context>[];
  selectedContextIds: string[];
  currentSelectedCount: number;
  meta: ContextsTableMeta | undefined;
  onAddSelectedToPrompt: (contexts: Context[]) => void;
  onDeleteSelectedContexts: (ids: string[]) => void;
  onResetRowSelection: () => void;
  onContextMenuCapture: () => void;
}

export const ContextRowMenu: React.FC<ContextRowMenuProps> = ({
  children,
  context,
  isSelected,
  selectedRows,
  selectedContextIds,
  currentSelectedCount,
  meta,
  onAddSelectedToPrompt,
  onDeleteSelectedContexts,
  onResetRowSelection,
  onContextMenuCapture,
}) => {
  const isOpeningDialog = React.useRef(false);
  const handleAddSelectedFromContextMenu = useCallback(() => {
    const contextsToAdd = selectedRows.map((r) => r.original);
    if (contextsToAdd.length > 0) {
      onAddSelectedToPrompt(contextsToAdd);
      onResetRowSelection();
    }
  }, [selectedRows, onAddSelectedToPrompt, onResetRowSelection]);

  const handleDeleteSelectedFromContextMenu = useCallback(() => {
    if (selectedContextIds.length > 0) {
      onDeleteSelectedContexts(selectedContextIds);
      onResetRowSelection();
    }
  }, [selectedContextIds, onDeleteSelectedContexts, onResetRowSelection]);

  const handleCopyContent = useCallback(() => {
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
  }, [context.content, context.title]);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild onContextMenuCapture={onContextMenuCapture}>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent
        className="border-border"
        onCloseAutoFocus={(event) => {
          // If the menu is closing because we are opening the dialog,
          // prevent the default focus restoration.
          if (isOpeningDialog.current) {
            event.preventDefault();
            isOpeningDialog.current = false;
          }
        }}
      >
        {currentSelectedCount > 1 && isSelected ? (
          <>
            <ContextMenuLabel>
              {currentSelectedCount} items selected
            </ContextMenuLabel>
            <ContextMenuItem onClick={handleAddSelectedFromContextMenu}>
              <LucideListPlus className="mr-2 h-4 w-4" />
              Add {currentSelectedCount} to Prompt
            </ContextMenuItem>
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <LucideTag className="mr-2 h-4 w-4" />
                Labels
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="p-0">
                <LabelAssignment contextIds={selectedContextIds} />
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuItem
              onClick={handleDeleteSelectedFromContextMenu}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <LucideTrash className="mr-2 h-4 w-4" />
              Delete {currentSelectedCount} contexts
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() => meta?.onEditContext(context)}
              disabled
            >
              <LucideEdit3 className="mr-2 h-4 w-4" />
              Edit (select one)
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => meta?.onDeleteContext(context.id)}
              disabled
            >
              <LucideTrash2 className="mr-2 h-4 w-4" />
              Delete (select one)
            </ContextMenuItem>
          </>
        ) : (
          <>
            <ContextMenuItem onClick={() => onAddSelectedToPrompt([context])}>
              <LucideListPlus className="mr-2 h-4 w-4" />
              Add to Prompt
            </ContextMenuItem>
            <ContextMenuItem onClick={handleCopyContent}>
              <LucideCopy className="mr-2 h-4 w-4" />
              Copy Content
            </ContextMenuItem>
            <ContextMenuItem onClick={() => {
              isOpeningDialog.current = true;
              meta?.onEditContext(context)
            }}>
              <LucideEdit3 className="mr-2 h-4 w-4" />
              Edit "{context.title}"
            </ContextMenuItem>
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <LucideTag className="mr-2 h-4 w-4" />
                Labels
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="p-0">
                <LabelAssignment contextIds={[context.id]} />
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() => meta?.onDeleteContext(context.id)}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <LucideTrash2 className="mr-2 h-4 w-4" />
              Delete "{context.title}"
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};
