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
import { LucideAnvil } from "lucide-react";

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
    deleteMultipleContexts,
    removeContextFromPrompt,
    removeMultipleSelectedContextsFromPrompt, // Import new hook function
    copyPromptWithContexts,
    addContextToPrompt,
    reorderSelectedContexts,
  } = useContexts();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingContext, setEditingContext] = useState<Context | null>(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [contextToDeleteId, setContextToDeleteId] = useState<string | null>(
    null,
  );
  const [deleteMultipleConfirmationOpen, setDeleteMultipleConfirmationOpen] = useState(false);
  const [contextsToDeleteIds, setContextsToDeleteIds] = useState<string[]>([]);

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

  const handleDeleteMultipleContextsRequest = (ids: string[]) => {
    if (ids.length === 0) return;
    setContextsToDeleteIds(ids);
    setDeleteMultipleConfirmationOpen(true);
  };

  const confirmDeleteMultipleContexts = () => {
    if (contextsToDeleteIds.length > 0) {
      deleteMultipleContexts(contextsToDeleteIds);
    }
    setDeleteMultipleConfirmationOpen(false);
    setContextsToDeleteIds([]);
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

  const handleDeleteMultipleSelectedFromPrompt = (ids: string[]) => {
    removeMultipleSelectedContextsFromPrompt(ids);
  };

  return (
    <div className="h-full w-full max-w-screen-2xl">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel
          defaultSize={60}
          minSize={30}
          className="flex flex-col p-4"
        >
          <div className="flex flex-row mb-4">
            <LucideAnvil className="h-9 w-9 mr-3" />
            <h1 className="font-semibold text-3xl"> Prompt Forge</h1>
          </div>

          <div className="flex-grow  relative">
            <PromptInput
              value={prompt}
              onChange={setPrompt}
              selectedContexts={selectedContexts}
              onRemoveContext={removeContextFromPrompt}
              onCopyPromptAndContextsClick={handleCopy}
              onFocus={() => setFocusedArea(FOCUSED_PANE_PROMPT_INPUT)}
              onReorderContexts={reorderSelectedContexts}
              onDeleteMultipleFromPrompt={handleDeleteMultipleSelectedFromPrompt} // Pass handler
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
            onDeleteSelectedContexts={handleDeleteMultipleContextsRequest}
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
      <AlertDialog
        open={deleteMultipleConfirmationOpen}
        onOpenChange={setDeleteMultipleConfirmationOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-primary">
              Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              {contextsToDeleteIds.length} context(s) from the library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setContextsToDeleteIds([])}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteMultipleContexts}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PromptEditor;
