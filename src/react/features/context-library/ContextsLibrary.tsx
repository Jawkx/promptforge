import React, { useState, useCallback, useEffect } from "react";
import { Context, SelectedContext } from "../../types";
import { Button } from "@/components/ui/button";
import { LucidePlus } from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { ThemeToggler } from "@/features/shared/ThemeToggler";
import { ContextsDataTable } from "./ContextsDataTable";
import { ContextsTableToolbar } from "./ContextsTableToolbar";
import { useLocation } from "wouter";
import { useQuery } from "@livestore/react";
import { getRandomUntitledPlaceholder } from "@/constants/randomNames";
import { contextLibraryEvents } from "@/livestore/context-library-store/events";
import { FocusArea, useLocalStore } from "@/store/localStore";
import { generateId } from "@/lib/utils";
import { v4 as uuid } from "uuid";
import { contexts$, labels$ } from "@/livestore/context-library-store/queries";
import { useContextLibraryStore } from "@/store/ContextLibraryLiveStoreProvider";
import { ContextBackup } from "./ContextBackup";
import { useAuth } from "@clerk/clerk-react";

interface ContextsLibraryProps {
  onDeleteContext: (id: string) => void;
  onDeleteSelectedContexts: (ids: string[]) => void;
}

const ContextsLibrary: React.FC<ContextsLibraryProps> = ({
  onDeleteContext,
  onDeleteSelectedContexts,
}) => {
  const setFocusedArea = useLocalStore((state) => state.setFocusedArea);
  const focusedArea = useLocalStore((state) => state.focusedArea);

  const { userId } = useAuth();
  const [, navigate] = useLocation();
  const contextLibraryStore = useContextLibraryStore();
  const contexts = useQuery(contexts$, { store: contextLibraryStore });
  const labels = useQuery(labels$, { store: contextLibraryStore });
  const addContextToPrompt = useLocalStore((state) => state.addContextToPrompt);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);

  const isFocused = focusedArea === FocusArea.CONTEXT_LIBRARY;

  useEffect(() => {
    if (focusedArea !== FocusArea.CONTEXT_LIBRARY) {
      setActiveId(null);
    }
  }, [focusedArea]);

  const handleOnFocus = () => {
    setFocusedArea(FocusArea.CONTEXT_LIBRARY);
  };

  const handleAddContext = () => {
    navigate("/add");
  };

  const onAddSelectedToPrompt = useCallback(
    (libraryContexts: Context[]) => {
      libraryContexts.forEach((libraryContext) => {
        const newSelectedContextCopy: SelectedContext = {
          id: generateId(),
          title: libraryContext.title,
          content: libraryContext.content,
          tokenCount: libraryContext.tokenCount,
          version: libraryContext.version,
          originalVersion: libraryContext.version,
          originalContextId: libraryContext.id,
          createdAt: libraryContext.createdAt,
          updatedAt: libraryContext.updatedAt,
          labels: libraryContext.labels,
        };
        addContextToPrompt(newSelectedContextCopy);
        sonnerToast.success("Context Selected", {
          description: `Context "${newSelectedContextCopy.title}" copied to prompt.`,
        });
      });
    },
    [addContextToPrompt],
  );

  const handlePaste = useCallback(
    async (event: React.ClipboardEvent) => {
      const targetElement = event.target as HTMLElement;
      const isPastingIntoInput =
        targetElement.tagName === "INPUT" ||
        targetElement.tagName === "TEXTAREA";

      // Guard clause: Exit if not the right context for pasting
      if (!isFocused || isPastingIntoInput) {
        return;
      }

      event.preventDefault();
      const pastedText = event.clipboardData.getData("text").trim();

      // Guard clause: Exit if pasted content is empty
      if (!pastedText) {
        sonnerToast.error("Paste Error", {
          description: "Pasted content is empty.",
        });
        return;
      }

      // Main logic: Update existing context if one is active
      if (activeId) {
        const contextToUpdate = contexts.find((c) => c.id === activeId);
        contextLibraryStore.commit(
          contextLibraryEvents.contextUpdated({
            id: activeId,
            title: contextToUpdate?.title || getRandomUntitledPlaceholder(),
            content: pastedText,
            updatedAt: Date.now(),
            version: uuid(),
          }),
        );
        sonnerToast.success("Context Updated", {
          description: `Context content was updated via paste.`,
        });
        setActiveId(null);
        return;
      }

      // Main logic: Create a new context
      const placeholderTitle = getRandomUntitledPlaceholder();
      const newId = generateId();
      contextLibraryStore.commit(
        contextLibraryEvents.contextCreated({
          id: newId,
          title: placeholderTitle,
          content: pastedText,
          createdAt: Date.now(),
          version: uuid(),
          creatorId: userId ? userId : "user",
        }),
      );
      sonnerToast.success("Context Added", {
        description: `Context "${placeholderTitle}" has been added.`,
      });
      setEditingTitleId(newId);
    },
    [isFocused, contextLibraryStore, activeId, contexts, userId],
  );

  return (
    <div
      className="h-full flex flex-col py-5 px-4 gap-4 focus:outline-none"
      onClick={handleOnFocus}
      onPaste={handlePaste}
      tabIndex={-1}
    >
      <div className="flex flex-row items-center justify-between">
        <h1 className="font-medium text-lg">Context Library</h1>
        <ThemeToggler />
      </div>
      <ContextsTableToolbar
        searchQuery={searchTerm}
        setSearchQuery={setSearchTerm}
      />
      <ContextsDataTable
        data={contexts}
        onDeleteContext={onDeleteContext}
        onDeleteSelectedContexts={onDeleteSelectedContexts}
        onAddSelectedToPrompt={onAddSelectedToPrompt}
        searchQuery={searchTerm}
        activeId={activeId}
        setActiveId={setActiveId}
        editingTitleId={editingTitleId}
        setEditingTitleId={setEditingTitleId}
      />
      <div className="flex flex-col gap-2">
        <Button variant="default" onClick={handleAddContext}>
          <LucidePlus className="mr-2 h-4 w-4" />
          Add Context
        </Button>

        <div className="flex justify-end">
          <ContextBackup
            contexts={contexts}
            labels={labels}
            contextLibraryStore={contextLibraryStore}
          />
        </div>
      </div>{" "}
    </div>
  );
};

export default ContextsLibrary;
