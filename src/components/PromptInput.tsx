import React from "react";
import { Context } from "../types";
import { Button } from "@/components/ui/button";
import { Copy as CopyIcon } from "lucide-react";
import { Content } from "@tiptap/react";
import { MinimalTiptapEditor } from "./ui/minimal-tiptap";
import { SelectedContextsDataTable } from "./SelectedContextsDataTable";
import { getSelectedContextsTableColumns } from "./SelectedContextsTableColumns";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./ui/resizable";

export interface PromptInputProps {
  value: Content;
  onChange: (value: Content) => void;
  selectedContexts: Context[];
  onRemoveContext: (id: string) => void;
  onCopyPromptAndContextsClick: () => void;
  onFocus: () => void;
  onReorderContexts: (reorderedContexts: Context[]) => void;
  onDeleteMultipleFromPrompt: (ids: string[]) => void; // Added prop
}

const PromptInput: React.FC<PromptInputProps> = ({
  value,
  onChange,
  selectedContexts,
  onRemoveContext,
  onCopyPromptAndContextsClick,
  onFocus,
  onReorderContexts,
  onDeleteMultipleFromPrompt, // Destructure prop
}) => {
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
            onRemoveContext={onRemoveContext}
            onReorderContexts={onReorderContexts}
            onDeleteMultipleFromPrompt={onDeleteMultipleFromPrompt} // Pass prop
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
