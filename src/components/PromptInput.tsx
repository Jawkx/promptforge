import React from "react";
import { Context, GlobalLabel } from "../types";
import { Button } from "@/components/ui/button";
import { Copy as CopyIcon } from "lucide-react";
import { Content } from "@tiptap/react";
import { MinimalTiptapEditor } from "./ui/minimal-tiptap";
import { SelectedContextsDataTable } from "./SelectedContextsDataTable";
import { getSelectedContextsTableColumns, SelectedContextsTableMeta } from "./SelectedContextsTableColumns";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./ui/resizable";

export interface PromptInputProps {
  value: Content;
  onChange: (value: Content) => void;
  selectedContexts: Context[]; // These are copies with unique IDs and originalId
  libraryContexts: Context[]; // Full library for sync checks
  onRemoveContext: (id: string) => void; // id is unique ID of selected copy
  onEditSelectedContext: (context: Context) => void; // To edit a selected copy
  onCopyPromptAndContextsClick: () => void;
  onFocus: () => void;
  onReorderContexts: (reorderedContexts: Context[]) => void;
  onDeleteMultipleFromPrompt: (ids: string[]) => void; // ids are unique IDs of selected copies
  getResolvedLabelsByIds: (labelIds: string[] | undefined) => GlobalLabel[];
}

const PromptInput: React.FC<PromptInputProps> = ({
  value,
  onChange,
  selectedContexts,
  libraryContexts, // Received prop
  onRemoveContext,
  onEditSelectedContext, // Received prop
  onCopyPromptAndContextsClick,
  onFocus,
  onReorderContexts,
  onDeleteMultipleFromPrompt,
  getResolvedLabelsByIds,
}) => {

  const selectedContextsTableMeta: SelectedContextsTableMeta = {
    onRemoveContext,
    getResolvedLabels: getResolvedLabelsByIds,
    libraryContexts, // Pass library contexts for sync checks
    onEditSelectedContext, // Pass handler for editing selected contexts
  };

  const selectedContextsColumns = React.useMemo(
    () => getSelectedContextsTableColumns(),
    [],
  );


  return (
    <ResizablePanelGroup onClick={onFocus} direction="vertical">
      <ResizablePanel className="flex-1">
        <MinimalTiptapEditor
          value={value}
          onChange={onChange}
          className="w-full h-full"
          editorContentClassName="p-5 overflow-y-auto flex-1"
          output="text"
          placeholder="Enter your prompt here..."
          autofocus={true}
          editable={true}
          editorClassName="focus:outline-none"
        />
      </ResizablePanel>

      <ResizableHandle withHandle className="my-4" />

      <ResizablePanel defaultSize={40} minSize={20} maxSize={80}>
        <h2 className="font-medium text-muted-foreground mb-3 text-xl">
          Selected Contexts
        </h2>
        {selectedContexts.length > 0 ? (
          <SelectedContextsDataTable
            columns={selectedContextsColumns}
            data={selectedContexts}
            tableMeta={selectedContextsTableMeta}
            onReorderContexts={onReorderContexts}
            onDeleteMultipleFromPrompt={onDeleteMultipleFromPrompt}
          />
        ) : (
          <div className="flex-grow flex items-center justify-center border border-muted rounded-md">
            <p className="text-sm text-muted-foreground text-center py-10">
              No contexts selected. Add from the library.
            </p>
          </div>
        )}

        <div className="h-5" />

        <Button
          onClick={onCopyPromptAndContextsClick}
          className="mt-auto w-full"
          size="lg"
        >
          <CopyIcon className="mr-2 h-4 w-4" /> Copy All
        </Button>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default PromptInput;
