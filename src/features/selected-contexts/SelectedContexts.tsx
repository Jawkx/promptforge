import React, { useState, useCallback, useEffect, useMemo } from "react";
import { SelectedContext } from "../../types";
import { SelectedContextsDataTable } from "./SelectedContextsDataTable";
import {
  getSelectedContextsTableColumns,
  SelectedContextsTableMeta,
} from "./SelectedContextsTableColumns";
import { FocusArea, useLocalStore } from "@/store/app.store";
import { toast as sonnerToast } from "sonner";
import { useLocation } from "wouter";
import { useQuery } from "@livestore/react";
import { contexts$ } from "@/livestore/context-library-store/queries";
import { contextLibraryEvents } from "@/livestore/context-library-store/events";
import { useSyncContexts } from "@/hooks/useSyncContexts";
import { getRandomUntitledPlaceholder } from "@/constants/titlePlaceholders";
import { generateContextHash, generateId, estimateTokens } from "@/lib/utils";
import { useAppStores } from "@/store/LiveStoreProvider";
import { useDroppable } from "@dnd-kit/core";

export const SelectedContexts: React.FC = () => {
  const selectedContexts = useLocalStore((state) => state.selectedContexts);
  const removeMultipleSelectedContextsFromPrompt = useLocalStore(
    (state) => state.removeMultipleSelectedContextsFromPrompt,
  );
  const updateSelectedContext = useLocalStore(
    (state) => state.updateSelectedContext,
  );
  const addContextToPrompt = useLocalStore((state) => state.addContextToPrompt);
  const setFocusedArea = useLocalStore((state) => state.setFocusedArea);
  const focusedArea = useLocalStore((state) => state.focusedArea);
  const isFocused = focusedArea === FocusArea.SELECTED_CONTEXTS;

  const { contextLibraryStore } = useAppStores();
  const libraryContexts = useQuery(contexts$, { store: contextLibraryStore });

  const [, navigate] = useLocation();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);

  const { setNodeRef, isOver } = useDroppable({
    id: "selected-contexts-droppable-area",
  });

  useEffect(() => {
    if (focusedArea !== FocusArea.SELECTED_CONTEXTS) {
      setActiveId(null);
    }
  }, [focusedArea]);

  useSyncContexts({
    libraryContexts,
    selectedContexts,
    updateSelectedContext,
    removeMultipleSelectedContextsFromPrompt,
  });

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
          if (activeId) {
            const contextToUpdate = selectedContexts.find(
              (c) => c.id === activeId,
            );
            if (contextToUpdate) {
              updateSelectedContext({
                ...contextToUpdate,
                content: pastedText,
                tokenCount: estimateTokens(pastedText),
                updatedAt: Date.now(),
              });
              sonnerToast.success("Selected Context Updated", {
                description: `Content updated by paste.`,
              });
              setActiveId(null);
            }
          } else {
            const title = getRandomUntitledPlaceholder();
            const now = Date.now();
            const newId = generateId();
            const newContext: SelectedContext = {
              id: newId,
              title,
              content: pastedText,
              tokenCount: estimateTokens(pastedText),
              originalHash: generateContextHash(title, pastedText),
              createdAt: now,
              updatedAt: now,
            };
            addContextToPrompt(newContext);
            sonnerToast("Context Pasted", {
              description: `A new context "${title}" has been added to the selected list.`,
            });
            setEditingTitleId(newId);
          }
        }
      }
    },
    [
      isFocused,
      activeId,
      selectedContexts,
      updateSelectedContext,
      setActiveId,
      addContextToPrompt,
    ],
  );

  const onRemoveContext = useCallback(
    (id: string) => {
      const context = selectedContexts.find((c) => c.id === id);
      if (context) {
        removeMultipleSelectedContextsFromPrompt([id]);
        sonnerToast.error("Context Removed", {
          description: `Context "${context.title}" removed from prompt.`,
        });
      }
    },
    [selectedContexts, removeMultipleSelectedContextsFromPrompt],
  );

  const onEditSelectedContext = useCallback(
    (context: SelectedContext) => {
      navigate(`/edit/selected/${context.id}`);
    },
    [navigate],
  );

  const onDeleteMultipleFromPrompt = useCallback(
    (ids: string[]) => {
      removeMultipleSelectedContextsFromPrompt(ids);
      sonnerToast.error(`${ids.length} Context(s) Removed`, {
        description: `${ids.length} context(s) have been removed from the prompt.`,
      });
    },
    [removeMultipleSelectedContextsFromPrompt],
  );

  const onSyncToLibrary = useCallback(
    (selectedContext: SelectedContext) => {
      if (!selectedContext.originalContextId) return;

      const now = Date.now();
      contextLibraryStore.commit(
        contextLibraryEvents.contextUpdated({
          id: selectedContext.originalContextId,
          title: selectedContext.title,
          content: selectedContext.content,
          updatedAt: now,
        }),
      );

      const newHash = generateContextHash(
        selectedContext.title,
        selectedContext.content,
      );
      updateSelectedContext({
        ...selectedContext,
        originalHash: newHash,
        updatedAt: now,
      });

      sonnerToast.success("Synced to Library", {
        description: `Context in library has been updated.`,
      });
    },
    [contextLibraryStore, updateSelectedContext],
  );

  const onSyncFromLibrary = useCallback(
    (selectedContext: SelectedContext) => {
      const originalContext = libraryContexts.find(
        (c) => c.id === selectedContext.originalContextId,
      );

      if (originalContext) {
        updateSelectedContext({
          ...selectedContext,
          title: originalContext.title,
          content: originalContext.content,
          tokenCount: originalContext.tokenCount,
          originalHash: originalContext.originalHash,
          createdAt: originalContext.createdAt,
          updatedAt: originalContext.updatedAt,
        });
        sonnerToast.success("Synced from Library", {
          description: `Selected context has been reverted to library version.`,
        });
      } else {
        sonnerToast.error("Sync Error", {
          description: `Original context not found in library.`,
        });
      }
    },
    [libraryContexts, updateSelectedContext],
  );

  const onCreateInLibrary = useCallback(
    (selectedContext: SelectedContext) => {
      const id = generateId();
      contextLibraryStore.commit(
        contextLibraryEvents.contextCreated({
          id,
          title: selectedContext.title,
          content: selectedContext.content,
          createdAt: selectedContext.createdAt,
        }),
      );

      const newHash = generateContextHash(
        selectedContext.title,
        selectedContext.content,
      );
      updateSelectedContext({
        ...selectedContext,
        originalContextId: id,
        originalHash: newHash,
      });

      sonnerToast.success("Added to Library", {
        description: `Context "${selectedContext.title}" has been created in the library.`,
      });
    },
    [contextLibraryStore, updateSelectedContext],
  );

  const selectedContextsTableMeta: SelectedContextsTableMeta = useMemo(
    () => ({
      onRemoveContext,
      onEditSelectedContext,
      onSyncToLibrary,
      onSyncFromLibrary,
      onCreateInLibrary,
      setActiveId,
      editingTitleId,
      setEditingTitleId,
    }),
    [
      onRemoveContext,
      onEditSelectedContext,
      onSyncToLibrary,
      onSyncFromLibrary,
      onCreateInLibrary,
      setActiveId,
      editingTitleId,
      setEditingTitleId,
    ],
  );

  const selectedContextsColumns = useMemo(
    () => getSelectedContextsTableColumns(),
    [],
  );

  return (
    <div
      className="h-full flex flex-col p-0.5"
      tabIndex={-1}
      onPaste={handlePaste}
      onClick={() => setFocusedArea(FocusArea.SELECTED_CONTEXTS)}
    >
      <h2 className="font-medium text-muted-foreground mb-3 text-xl">
        Selected Contexts
      </h2>
      <SelectedContextsDataTable
        columns={selectedContextsColumns}
        data={selectedContexts}
        tableMeta={selectedContextsTableMeta}
        onDeleteMultipleFromPrompt={onDeleteMultipleFromPrompt}
        activeId={activeId}
        setActiveId={setActiveId}
        droppableRef={setNodeRef}
        isDroppableOver={isOver}
      />
    </div>
  );
};
