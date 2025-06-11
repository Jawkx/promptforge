import React, { useState } from "react";
import { useLocation } from "wouter";
import { useContexts } from "../hooks/useContexts";
import { Context } from "../types";
import PromptInput from "../components/PromptInput";
import ContextsLibrary from "../components/ContextsLibrary";
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
import { useQuery, useStore } from "@livestore/react";
import { contexts$ } from "@/livestore/queries";
import { events } from "@/livestore/events";
import { v4 as uuid } from "uuid"
import { getRandomUntitledPlaceholder } from "@/constants/titlePlaceholders";

const FOCUSED_PANE_PROMPT_INPUT = "promptInputArea";
const FOCUSED_PANE_CONTEXT_LIBRARY = "contextLibraryArea";


const Editor: React.FC = () => {
  const [, navigate] = useLocation();

  const { store } = useStore()

  const contexts = useQuery(contexts$)

  const {
    prompt,
    setPrompt,
    selectedContexts,
    removeContextFromPrompt,
    removeMultipleSelectedContextsFromPrompt,
    copyPromptWithContexts,
    addContextToPrompt,
    reorderSelectedContexts,
    getResolvedLabelsByIds,
  } = useContexts();

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
    navigate("/add");
  };

  const handleEditLibraryContext = (context: Context) => {
    navigate(`/edit/library/${context.id}`);
  };

  const handleEditSelectedContext = (context: Context) => {
    navigate(`/edit/selected/${context.id}`);
  };

  const handleDeleteContextRequest = (id: string) => {
    setContextToDeleteId(id);
    setDeleteConfirmationOpen(true);
  };

  const confirmDeleteContext = () => {
    if (contextToDeleteId) {
      store.commit(events.contextDeleted({ ids: [contextToDeleteId] }))
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
      store.commit(events.contextDeleted({ ids: contextsToDeleteIds }))
    }
    setDeleteMultipleConfirmationOpen(false);
    setContextsToDeleteIds([]);
  };

  const handlePasteToLibrary = (pastedText: string) => {
    const placeholderTitle = getRandomUntitledPlaceholder()
    const id = uuid()
    store.commit(events.contextCreated({ id, title: placeholderTitle, content: pastedText }))
  };

  const handleAddSelectedContextsToPrompt = (contextsToAdd: Context[]) => {
    // `contextsToAdd` are from the library. `addContextToPrompt` creates copies.
    contextsToAdd.forEach(context => {
      addContextToPrompt(context);
    });
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
                libraryContexts={contexts}
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

export default Editor;
