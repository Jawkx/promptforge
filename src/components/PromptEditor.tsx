import React, { useState, useCallback } from "react";
import { useContexts } from "../hooks/useContexts";
import { Context, ContextCreationData } from "../types";
import PromptInput from "./PromptInput";
import ContextsLibrary from "./ContextsLibrary";
import AddContextModal from "./AddContextModal";
import EditContextModal from "./EditContextModal";
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

const FOCUSED_PANE_PROMPT_INPUT = "promptInputArea";
const FOCUSED_PANE_CONTEXT_LIBRARY = "contextLibraryArea";


const PromptEditor: React.FC = () => {
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
    reorderSelectedContexts, // Get reorder function
  } = useContexts();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingContext, setEditingContext] = useState<Context | null>(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [contextToDeleteId, setContextToDeleteId] = useState<string | null>(
    null,
  );

  const { toast } = useToast();
  const [focusedArea, setFocusedArea] = useState<string>(
    FOCUSED_PANE_PROMPT_INPUT,
  );

  const handleCopy = () => {
    copyPromptWithContexts();
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

  const handleSaveNewContext = (newContextData: ContextCreationData) => {
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
      const alreadySelected = selectedContexts.some(sc => sc.id === context.id);
      if (!alreadySelected) {
        addContextToPrompt(context);
        countAdded++;
      }
    });

    if (contextsToAdd.length > 1) {
      if (countAdded > 0) {
        toast({
          title: "Contexts Processed",
          description: `${countAdded} new context(s) added to prompt. ${contextsToAdd.length - countAdded > 0 ? `${contextsToAdd.length - countAdded} were already selected.` : ''}`,
        });
      } else {
        toast({
          title: "No New Contexts Added",
          description: `All selected contexts were already in the prompt.`,
          variant: "default",
        });
      }
    } else if (contextsToAdd.length === 1 && countAdded === 0) {
      // Single item was already selected, addContextToPrompt handles this toast
    }
  };

  return (
    <div className="h-full w-full max-w-screen-2xl">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel
          defaultSize={60}
          minSize={30}
          className="flex flex-col p-4"
        >
          <h1 className="font-semibold text-2xl">Context Mixer</h1>
          <div className="h-3" />
          <div className="flex-grow overflow-hidden relative">
            <PromptInput
              value={prompt}
              onChange={setPrompt}
              selectedContexts={selectedContexts}
              onRemoveContext={removeContextFromPrompt}
              onCopyPromptAndContextsClick={handleCopy}
              onFocus={() => setFocusedArea(FOCUSED_PANE_PROMPT_INPUT)}
              onReorderContexts={reorderSelectedContexts} // Pass reorder function
            />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          defaultSize={40}
          minSize={25}
          className="flex flex-col"
        >
          <ContextsLibrary
            contexts={contexts}
            onAddContextButtonClick={handleAddContextButtonClick}
            onEditContext={handleEditContext}
            onDeleteContext={handleDeleteContextRequest}
            onPasteToAdd={handlePasteToLibrary}
            isFocused={focusedArea === FOCUSED_PANE_CONTEXT_LIBRARY}
            onFocus={() => setFocusedArea(FOCUSED_PANE_CONTEXT_LIBRARY)}
            onAddSelectedToPrompt={handleAddSelectedContextsToPrompt}
          />
        </ResizablePanel>
      </ResizablePanelGroup>

      <AddContextModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleSaveNewContext}
      // contextsCount prop removed
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
