// src/components/PromptEditor.tsx
import React, { useState, useCallback } from "react";
import { useContexts } from "../hooks/useContexts";
import { Context } from "../types";
import PromptInput from "./PromptInput";
import ContextsLibrary from "./ContextsLibrary";
import AddContextModal from "./AddContextModal";
import EditContextModal from "./EditContextModal";
// MarkdownPreview is no longer needed
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PromptEditorProps {
  onCopySuccess?: () => void;
}

const PROMPT_FORGE_AREA = "promptForge";
const CONTEXT_LIBRARY_AREA = "contextLibrary";

const PromptEditor: React.FC<PromptEditorProps> = ({ onCopySuccess }) => {
  const {
    contexts,
    prompt,
    setPrompt,
    selectedContexts,
    addContext,
    addContextFromPaste,
    updateContext,
    deleteContext,
    removeContextFromPrompt,
    copyPromptWithContexts,
    addContextToPrompt,
  } = useContexts();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingContext, setEditingContext] = useState<Context | null>(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [contextToDeleteId, setContextToDeleteId] = useState<string | null>(null);
  // isPreviewMode state is removed

  const { toast } = useToast();
  const [focusedArea, setFocusedArea] = useState<string>(PROMPT_FORGE_AREA);

  const handleDropOnPromptInput = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        const contextData = e.dataTransfer.getData("application/json");
        if (contextData) {
          const context = JSON.parse(contextData) as Context;
          addContextToPrompt(context);
        }
      } catch (error) {
        console.error("Error parsing dropped context:", error);
        toast({
          title: "Drop Error",
          description: "Failed to add context from drop.",
          variant: "destructive",
        });
      }
    },
    [addContextToPrompt, toast],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDragStartRow = useCallback(
    (e: React.DragEvent, context: Context) => {
      e.dataTransfer.setData("application/json", JSON.stringify(context));
      e.dataTransfer.effectAllowed = "move";
    },
    [],
  );

  const handleCopy = () => {
    const copiedText = copyPromptWithContexts();
    if (copiedText && onCopySuccess) {
      onCopySuccess();
    }
  };

  const handleAddContextButtonClick = () => {
    setAddModalOpen(true);
  };

  const handleEditContext = (context: Context) => {
    setEditingContext(context);
    setEditModalOpen(true);
  };

  const handleDeleteContextRequest = (id: string) => {
    setContextToDeleteId(id);
    setDeleteConfirmationOpen(true);
  };

  const confirmDeleteContext = () => {
    if (contextToDeleteId) {
      deleteContext(contextToDeleteId);
    }
    setDeleteConfirmationOpen(false);
    setContextToDeleteId(null);
  };

  const handleSaveNewContext = (newContextData: Omit<Context, "id">) => {
    const success = addContext(newContextData);
    if (success) {
      setAddModalOpen(false);
    }
  };

  const handleSaveEdit = (updatedContextData: Context) => {
    const success = updateContext(updatedContextData);
    if (success) {
      setEditModalOpen(false);
      setEditingContext(null);
    }
  };

  const handlePasteToLibrary = (pastedText: string) => {
    addContextFromPaste(pastedText);
  };

  const handleAddSelectedContextsToPrompt = (contextsToAdd: Context[]) => {
    let countAdded = 0;
    contextsToAdd.forEach(context => {
      // addContextToPrompt already checks for duplicates
      const alreadySelected = selectedContexts.some(sc => sc.id === context.id);
      if (!alreadySelected) {
        addContextToPrompt(context); // This will show individual toasts
        countAdded++;
      }
    });
    if (countAdded > 0 && contextsToAdd.length > 1) { // If more than one attempted, and at least one new was added
      toast({
        title: "Contexts Processed",
        description: `${countAdded} new context(s) added to prompt. Others might have been duplicates.`,
      });
    } else if (countAdded === 0 && contextsToAdd.length > 0) {
      toast({
        title: "No New Contexts Added",
        description: `All selected contexts were already in the prompt.`,
        variant: "default",
      });
    }
    // Individual toasts from addContextToPrompt will cover single additions or initial duplicates
  };

  return (
    <div className="h-full w-full max-w-screen-2xl">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel defaultSize={60} minSize={30} className="flex flex-col p-4">
          <h1 className="font-semibold text-2xl">Context Mixer</h1>
          <div className="h-3" />
          <div className="flex-grow overflow-hidden relative">
            {/* MarkdownPreview and isPreviewMode toggle removed */}
            <PromptInput
              value={prompt}
              onChange={setPrompt}
              onDrop={handleDropOnPromptInput}
              onDragOver={handleDragOver}
              selectedContexts={selectedContexts}
              onRemoveContext={removeContextFromPrompt}
              onCopy={handleCopy}
              isFocused={focusedArea === PROMPT_FORGE_AREA}
              onFocus={() => setFocusedArea(PROMPT_FORGE_AREA)}
            />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={40} minSize={25} className="flex flex-col">
          <ContextsLibrary
            contexts={contexts}
            onAddContextButtonClick={handleAddContextButtonClick}
            onEditContext={handleEditContext}
            onDeleteContext={handleDeleteContextRequest}
            onPasteToAdd={handlePasteToLibrary}
            isFocused={focusedArea === CONTEXT_LIBRARY_AREA}
            onFocus={() => setFocusedArea(CONTEXT_LIBRARY_AREA)}
            onAddSelectedToPrompt={handleAddSelectedContextsToPrompt}
            onDragStartRow={handleDragStartRow}
          />
        </ResizablePanel>
      </ResizablePanelGroup>

      <AddContextModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleSaveNewContext}
        contextsCount={contexts.length}
      />
      {editingContext && (
        <EditContextModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditingContext(null);
          }}
          onSave={handleSaveEdit}
          context={editingContext}
        />
      )}
      <AlertDialog
        open={deleteConfirmationOpen}
        onOpenChange={setDeleteConfirmationOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-primary">
              Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              context "
              {contexts.find((c) => c.id === contextToDeleteId)?.title ||
                "this context"}
              " from the library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setContextToDeleteId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteContext}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PromptEditor;
