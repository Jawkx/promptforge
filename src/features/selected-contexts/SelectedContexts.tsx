import React, { useMemo, useState, useCallback } from "react";
import { SelectedContext } from "../../types";
import { Button } from "@/components/ui/button";
import { Copy as CopyIcon } from "lucide-react";
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
import { generateContextHash } from "@/utils";

const generateId = () =>
  `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

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

  const prompt = useLocalStore((state) => state.prompt);
  const { store } = useStore();
  const libraryContexts = useQuery(contexts$);

  const { toast } = useToast();
  const [, navigate] = useLocation();

  const [selectedId, setSelectedId] = useState<string | null>(null);

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
          if (selectedId) {
            const contextToUpdate = selectedContexts.find(
              (c) => c.id === selectedId,
            );
            if (contextToUpdate) {
              updateSelectedContext({
                ...contextToUpdate,
                content: pastedText,
                charCount: pastedText.length,
              });
              toast({
                title: "Selected Context Updated",
                description: `Content updated by paste.`,
              });
              setSelectedId(null);
            }
          } else {
            const title = getRandomUntitledPlaceholder();
            const newContext: SelectedContext = {
              id: generateId(),
              title,
              content: pastedText,
              charCount: pastedText.length,
              originalHash: generateContextHash(title, pastedText),
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
      selectedId,
      selectedContexts,
      updateSelectedContext,
      toast,
      setSelectedId,
      addContextToPrompt,
    ],
  );

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

  const onEditSelectedContext = (context: SelectedContext) => {
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

  const onSyncToLibrary = (selectedContext: SelectedContext) => {
    if (!selectedContext.originalContextId) return;

    store.commit(
      events.contextUpdated({
        id: selectedContext.originalContextId,
        title: selectedContext.title,
        content: selectedContext.content,
      }),
    );

    const newHash = generateContextHash(
      selectedContext.title,
      selectedContext.content,
    );
    updateSelectedContext({
      ...selectedContext,
      originalHash: newHash,
    });

    toast({
      title: "Synced to Library",
      description: `Context in library has been updated.`,
    });
  };

  const onSyncFromLibrary = (selectedContext: SelectedContext) => {
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
  };

  const onCreateInLibrary = (selectedContext: SelectedContext) => {
    const id = uuid();
    store.commit(
      events.contextCreated({
        id,
        title: selectedContext.title,
        content: selectedContext.content,
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
  };

  const selectedContextsTableMeta: SelectedContextsTableMeta = {
    onRemoveContext,
    onEditSelectedContext,
    onSyncToLibrary,
    onSyncFromLibrary,
    onCreateInLibrary,
    setSelectedId,
  };

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
        selectedId={selectedId}
        setSelectedId={setSelectedId}
      />

      <div className="h-5" />

      <Button
        onClick={onCopyPromptAndContextsClick}
        className="mt-auto w-full"
        size="lg"
      >
        <CopyIcon className="mr-2 h-4 w-4" /> Copy All
      </Button>
    </div>
  );
};
