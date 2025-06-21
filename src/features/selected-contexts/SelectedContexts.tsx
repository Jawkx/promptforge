import React, { useMemo, useState, useCallback } from "react";
import { SelectedContext } from "../../types";
import { SelectedContextsDataTable } from "./SelectedContextsDataTable";
import {
  getSelectedContextsTableColumns,
  SelectedContextsTableMeta,
} from "./SelectedContextsTableColumns";
import { FocusArea, useLocalStore } from "@/store/app.store";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useQuery, useStore } from "@livestore/react";
import { contexts$ } from "@/livestore/queries";
import { events } from "@/livestore/events";
import { useSyncContexts } from "@/hooks/useSyncContexts";
import { getRandomUntitledPlaceholder } from "@/constants/titlePlaceholders";
import { v4 as uuid } from "uuid";
import { generateContextHash, generateId } from "@/utils";

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
  const isFocused = useLocalStore(
    (state) => state.focusedArea === FocusArea.SELECTED_CONTEXTS,
  );

  const { store } = useStore();
  const libraryContexts = useQuery(contexts$);

  const { toast } = useToast();
  const [, navigate] = useLocation();

  const [activeId, setActiveId] = useState<string | null>(null);

  useSyncContexts({
    libraryContexts,
    selectedContexts,
    updateSelectedContext,
    removeMultipleSelectedContextsFromPrompt,
    toast,
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
                charCount: pastedText.length,
                updatedAt: Date.now(),
              });
              toast({
                title: "Selected Context Updated",
                description: `Content updated by paste.`,
              });
              setActiveId(null);
            }
          } else {
            const title = getRandomUntitledPlaceholder();
            const now = Date.now();
            const newContext: SelectedContext = {
              id: generateId(),
              title,
              content: pastedText,
              charCount: pastedText.length,
              originalHash: generateContextHash(title, pastedText),
              createdAt: now,
              updatedAt: now,
            };
            addContextToPrompt(newContext);
            toast({
              title: "Context Pasted",
              description: `A new context "${title}" has been added to the selected list.`,
            });
          }
        }
      }
    },
    [
      isFocused,
      activeId,
      selectedContexts,
      updateSelectedContext,
      toast,
      setActiveId,
      addContextToPrompt,
    ],
  );

  const onRemoveContext = useCallback(
    (id: string) => {
      const context = selectedContexts.find((c) => c.id === id);
      if (context) {
        removeMultipleSelectedContextsFromPrompt([id]);
        toast({
          title: "Context Removed",
          description: `Context "${context.title}" removed from prompt.`,
          variant: "destructive",
        });
      }
    },
    [selectedContexts, removeMultipleSelectedContextsFromPrompt, toast],
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
      toast({
        title: `${ids.length} Context(s) Removed`,
        description: `${ids.length} context(s) have been removed from the prompt.`,
        variant: "destructive",
      });
    },
    [removeMultipleSelectedContextsFromPrompt, toast],
  );

  const onSyncToLibrary = useCallback(
    (selectedContext: SelectedContext) => {
      if (!selectedContext.originalContextId) return;

      const now = Date.now();
      store.commit(
        events.contextUpdated({
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

      toast({
        title: "Synced to Library",
        description: `Context in library has been updated.`,
      });
    },
    [store, updateSelectedContext, toast],
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
          charCount: originalContext.charCount,
          originalHash: originalContext.originalHash,
          createdAt: originalContext.createdAt,
          updatedAt: originalContext.updatedAt,
        });
        toast({
          title: "Synced from Library",
          description: `Selected context has been reverted to library version.`,
        });
      } else {
        toast({
          title: "Sync Error",
          description: `Original context not found in library.`,
          variant: "destructive",
        });
      }
    },
    [libraryContexts, updateSelectedContext, toast],
  );

  const onCreateInLibrary = useCallback(
    (selectedContext: SelectedContext) => {
      const id = uuid();
      store.commit(
        events.contextCreated({
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

      toast({
        title: "Added to Library",
        description: `Context "${selectedContext.title}" has been created in the library.`,
      });
    },
    [store, updateSelectedContext, toast],
  );

  const selectedContextsTableMeta: SelectedContextsTableMeta = useMemo(
    () => ({
      onRemoveContext,
      onEditSelectedContext,
      onSyncToLibrary,
      onSyncFromLibrary,
      onCreateInLibrary,
      setActiveId,
    }),
    [
      onRemoveContext,
      onEditSelectedContext,
      onSyncToLibrary,
      onSyncFromLibrary,
      onCreateInLibrary,
      setActiveId,
    ],
  );

  const selectedContextsColumns = useMemo(
    () => getSelectedContextsTableColumns(),
    [],
  );

  return (
    <div
      className="h-full flex flex-col"
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
      />
    </div>
  );
};