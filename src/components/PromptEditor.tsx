import React, { useState } from "react";
import { useContexts } from "../hooks/useContexts";
import { Context, ContextFormData } from "../types";
import PromptInput from "./PromptInput";
import ContextsLibrary from "./ContextsLibrary";
import AddContextModal from "./AddContextModal";
import EditContextModal from "./EditContextModal";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
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
    contexts, // Library contexts
    prompt,
    setPrompt,
    selectedContexts, // Selected context copies
    addContext,
    addContextFromPaste,
    updateContextInLibrary, // Renamed from updateContext
    updateSelectedContext,  // New function for selected copies
    deleteContext,
    deleteMultipleContexts,
    removeContextFromPrompt,
    removeMultipleSelectedContextsFromPrompt,
    copyPromptWithContexts,
    addContextToPrompt,
    reorderSelectedContexts,
    getAllGlobalLabels,
    getGlobalLabelById,
    getResolvedLabelsByIds,
  } = useContexts();

  const [addModalOpen, setAddModalOpen] = useState(false);

  // State for editing library contexts
  const [editLibraryModalOpen, setEditLibraryModalOpen] = useState(false);
  const [editingLibraryContext, setEditingLibraryContext] = useState<Context | null>(null);

  // State for editing selected contexts
  const [editSelectedModalOpen, setEditSelectedModalOpen] = useState(false);
  const [editingSelectedContext, setEditingSelectedContext] = useState<Context | null>(null);

  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [contextToDeleteId, setContextToDeleteId] = useState<string | null>(
    null,
  );
  const [deleteMultipleConfirmationOpen, setDeleteMultipleConfirmationOpen] = useState(false);
  const [contextsToDeleteIds, setContextsToDeleteIds] = useState<string[]>([]);

  const [focusedArea, setFocusedArea] = useState<string>(
    FOCUSED_PANE_PROMPT_INPUT,
  );

  const handleCopy = () => {
    copyPromptWithContexts();
  };

  const handleAddContextButtonClick = () => {
    setAddModalOpen(true);
  };

  // Handler for initiating edit of a library context
  const handleEditLibraryContext = (context: Context) => {
    setEditingLibraryContext(context);
    setEditLibraryModalOpen(true);
  };

  // Handler for initiating edit of a selected context copy
  const handleEditSelectedContext = (context: Context) => {
    setEditingSelectedContext(context);
    setEditSelectedModalOpen(true);
  };

  const handleDeleteContextRequest = (id: string) => {
    setContextToDeleteId(id);
    setDeleteConfirmationOpen(true);
  };

  const confirmDeleteContext = () => {
    if (contextToDeleteId) {
      deleteContext(contextToDeleteId); // Deletes from library only
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
      deleteMultipleContexts(contextsToDeleteIds); // Deletes from library only
    }
    setDeleteMultipleConfirmationOpen(false);
    setContextsToDeleteIds([]);
  };

  const handleSaveNewContext = (newContextData: ContextFormData) => {
    const success = addContext(newContextData); // Adds to library
    if (success) {
      setAddModalOpen(false);
    }
  };

  // Handler for saving edits to a library context
  const handleSaveLibraryEdit = (updatedContextData: ContextFormData) => {
    const success = updateContextInLibrary(updatedContextData);
    if (success) {
      setEditLibraryModalOpen(false);
      setEditingLibraryContext(null);
    }
  };

  // Handler for saving edits to a selected context copy
  const handleSaveSelectedEdit = (updatedContextData: ContextFormData) => {
    const success = updateSelectedContext(updatedContextData);
    if (success) {
      setEditSelectedModalOpen(false);
      setEditingSelectedContext(null);
    }
  };


  const handlePasteToLibrary = (pastedText: string) => {
    addContextFromPaste(pastedText); // Adds to library
  };

  const handleAddSelectedContextsToPrompt = (contextsToAdd: Context[]) => {
    // `contextsToAdd` are from the library. `addContextToPrompt` creates copies.
    contextsToAdd.forEach(context => {
      addContextToPrompt(context);
    });
    // Toasting for multiple items might be redundant if addContextToPrompt toasts individually.
    // For simplicity, addContextToPrompt handles its own toast for each successful addition.
  };

  const handleDeleteMultipleSelectedFromPrompt = (ids: string[]) => {
    removeMultipleSelectedContextsFromPrompt(ids);
  };

  return (
    <div className="flex justify-center h-screen w-screen">
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
                libraryContexts={contexts} // Pass library contexts for sync check
                onRemoveContext={removeContextFromPrompt}
                onEditSelectedContext={handleEditSelectedContext} // Pass handler for editing selected
                onCopyPromptAndContextsClick={handleCopy}
                onFocus={() => setFocusedArea(FOCUSED_PANE_PROMPT_INPUT)}
                onReorderContexts={reorderSelectedContexts}
                onDeleteMultipleFromPrompt={handleDeleteMultipleSelectedFromPrompt}
                getResolvedLabelsByIds={getResolvedLabelsByIds}
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
              onEditContext={handleEditLibraryContext} // This edits library contexts
              onDeleteContext={handleDeleteContextRequest}
              onDeleteSelectedContexts={handleDeleteMultipleContextsRequest}
              onPasteToAdd={handlePasteToLibrary}
              isFocused={focusedArea === FOCUSED_PANE_CONTEXT_LIBRARY}
              onFocus={() => setFocusedArea(FOCUSED_PANE_CONTEXT_LIBRARY)}
              onAddSelectedToPrompt={handleAddSelectedContextsToPrompt}
              getResolvedLabels={getResolvedLabelsByIds}
            />
          </ResizablePanel>
        </ResizablePanelGroup>

        <AddContextModal
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSave={handleSaveNewContext}
          allGlobalLabels={getAllGlobalLabels()}
        />
        {/* Edit Modal for Library Contexts */}
        {editingLibraryContext && (
          <EditContextModal
            isOpen={editLibraryModalOpen}
            onClose={() => {
              setEditLibraryModalOpen(false);
              setEditingLibraryContext(null);
            }}
            onSave={handleSaveLibraryEdit}
            context={editingLibraryContext}
            allGlobalLabels={getAllGlobalLabels()}
            getGlobalLabelById={getGlobalLabelById}
          />
        )}
        {/* Edit Modal for Selected Context Copies */}
        {editingSelectedContext && (
          <EditContextModal
            isOpen={editSelectedModalOpen}
            onClose={() => {
              setEditSelectedModalOpen(false);
              setEditingSelectedContext(null);
            }}
            onSave={handleSaveSelectedEdit}
            context={editingSelectedContext}
            allGlobalLabels={getAllGlobalLabels()}
            getGlobalLabelById={getGlobalLabelById}
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
                " from the library. Copies in the selected list will remain but become orphaned.
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
                {contextsToDeleteIds.length} context(s) from the library. Copies in the selected list will remain but become orphaned.
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
    </div>
  );
};

export default PromptEditor;
