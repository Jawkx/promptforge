import React, { useState, useCallback } from "react";
import { Context, GlobalLabel } from "../types";
import { Button } from "@/components/ui/button";
import { LucidePlus } from "lucide-react"; // Updated Lucide import
import { useToast } from "@/hooks/use-toast";
import { ThemeToggler } from "./ThemeToggler";
import { ContextsDataTable } from "./ContextsDataTable";
import { getContextsTableColumns, ContextsTableMeta } from "./ContextsDataTableColumns";

interface ContextsLibraryProps {
  contexts: Context[];
  onAddContextButtonClick: () => void;
  onEditContext: (context: Context) => void;
  onDeleteContext: (id: string) => void;
  onDeleteSelectedContexts: (ids: string[]) => void;
  onPasteToAdd: (pastedText: string) => void;
  isFocused: boolean;
  onFocus: () => void;
  onAddSelectedToPrompt: (selectedContexts: Context[]) => void;
  getResolvedLabels: (labelIds: string[] | undefined) => GlobalLabel[]; // Changed parameter to string[] | undefined
}

const ContextsLibrary: React.FC<ContextsLibraryProps> = ({
  contexts,
  onAddContextButtonClick,
  onEditContext,
  onDeleteContext,
  onDeleteSelectedContexts,
  onPasteToAdd,
  isFocused,
  onFocus,
  onAddSelectedToPrompt,
  getResolvedLabels,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const tableMeta: ContextsTableMeta = {
    onEditContext,
    onDeleteContext,
    getResolvedLabels,
  };

  // Pass getResolvedLabels to getContextsTableColumns
  const columns = React.useMemo(() => getContextsTableColumns(getResolvedLabels), [getResolvedLabels]);


  const handlePaste = useCallback(
    async (event: React.ClipboardEvent) => {
      const targetElement = event.target as HTMLElement;
      const isPastingIntoInput =
        targetElement.tagName === "INPUT" ||
        targetElement.tagName === "TEXTAREA";

      if (isFocused && !isPastingIntoInput) {
        event.preventDefault();
        const pastedText = event.clipboardData.getData("text");
        if (pastedText.trim()) {
          onPasteToAdd(pastedText);
        } else {
          toast({
            title: "Paste Error",
            description: "Pasted content is empty.",
            variant: "destructive",
          });
        }
      }
    },
    [isFocused, onPasteToAdd, toast],
  );

  return (
    <div
      className="h-full flex flex-col py-5 px-4 gap-4 focus:outline-none"
      onClick={onFocus}
      onPaste={handlePaste}
      tabIndex={-1}
    >
      <div className="flex flex-row items-center justify-between">
        <h1 className="font-medium text-lg">Context Library</h1>
        <ThemeToggler />
      </div>

      <ContextsDataTable
        columns={columns}
        data={contexts}
        tableMeta={tableMeta}
        onEditContext={onEditContext}
        onDeleteContext={onDeleteContext}
        onDeleteSelectedContexts={onDeleteSelectedContexts}
        onAddSelectedToPrompt={onAddSelectedToPrompt}
        searchQuery={searchTerm}
        setSearchQuery={setSearchTerm}
      />

      <Button variant="default" onClick={onAddContextButtonClick}>
        <LucidePlus className="mr-2 h-4 w-4" />
        Add Context
      </Button>
    </div>
  );
};

export default ContextsLibrary;
