import React from "react";
import { Context } from "../types";
import { Content } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { Copy as CopyIcon } from "lucide-react";
import { MinimalTiptapEditor } from "./ui/minimal-tiptap";
import { SelectedContextsDataTable } from "./SelectedContextsDataTable";
import {
  getSelectedContextsTableColumns,
  SelectedContextsTableMeta,
} from "./SelectedContextsTableColumns";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import { useLocalStore } from "@/localStore";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import TurnDownService from "turndown";

const turndownService = new TurnDownService();

export interface PromptInputProps {
  onFocus: () => void;
}

const PromptInput: React.FC<PromptInputProps> = ({ onFocus }) => {
  const {
    prompt,
    setPrompt,
    selectedContexts,
    removeMultipleSelectedContextsFromPrompt,
  } = useLocalStore();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const onCopyPromptAndContextsClick = () => {
    const contextsText = selectedContexts
      .map((context) => `# ${context.title}\n${context.content}`)
      .join("\n\n");

    const fullText = prompt ? `${prompt}\n\n${contextsText}` : contextsText;

    if (!fullText.trim()) {
      toast({
        title: "Nothing to Copy",
        description: "The prompt and selected contexts are empty.",
        variant: "destructive",
      });
      return;
    }

    navigator.clipboard
      .writeText(fullText)
      .then(() => {
        toast({
          title: "Copied to Clipboard!",
          description: "The prompt and contexts have been copied.",
        });
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        toast({
          title: "Copy Failed",
          description: "Could not copy text to clipboard.",
          variant: "destructive",
        });
      });
  };

  const onRemoveContext = (id: string) => {
    const context = selectedContexts.find((c) => c.id === id);
    if (context) {
      removeMultipleSelectedContextsFromPrompt([id]);
      toast({
        title: "Context Removed",
        description: `Context "${context.title}" removed from prompt.`,
        variant: "destructive",
      });
    }
  };

  const onEditSelectedContext = (context: Context) => {
    navigate(`/edit/selected/${context.id}`);
  };

  const onDeleteMultipleFromPrompt = (ids: string[]) => {
    removeMultipleSelectedContextsFromPrompt(ids);
    toast({
      title: `${ids.length} Context(s) Removed`,
      description: `${ids.length} context(s) have been removed from the prompt.`,
      variant: "destructive",
    });
  };

  const selectedContextsTableMeta: SelectedContextsTableMeta = {
    onRemoveContext,
    onEditSelectedContext,
  };

  const selectedContextsColumns = React.useMemo(
    () => getSelectedContextsTableColumns(),
    [],
  );

  const handleSetPrompt = (inputContent: Content) => {
    setPrompt(turndownService.turndown(inputContent as string));
  };

  return (
    <ResizablePanelGroup onClick={onFocus} direction="vertical">
      <ResizablePanel className="flex-1">
        <MinimalTiptapEditor
          value={prompt}
          onChange={handleSetPrompt}
          className="w-full h-full"
          editorContentClassName="p-5 overflow-y-auto flex-1"
          output="html"
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
