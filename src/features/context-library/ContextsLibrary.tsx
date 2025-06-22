import React, { useState, useCallback, useEffect } from "react";
import { Context, SelectedContext } from "../../types";
import { Button } from "@/components/ui/button";
import { LucidePlus } from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { ThemeToggler } from "@/features/shared/ThemeToggler";
import { ContextsDataTable } from "./ContextsDataTable";
import { useLocation } from "wouter";
import { getRandomUntitledPlaceholder } from "@/constants/titlePlaceholders";
import { useQuery, useStore } from "@livestore/react";
import { events } from "@/livestore/events";
import { FocusArea, useLocalStore } from "@/store/app.store";
import { generateContextHash, generateId } from "@/utils";
import { contexts$ } from "@/livestore/queries";

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

  const [, navigate] = useLocation();
  const { store } = useStore();
  const contexts = useQuery(contexts$);
  const addContextToPrompt = useLocalStore((state) => state.addContextToPrompt);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

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
          charCount: libraryContext.content.length,
          originalHash:
            libraryContext.originalHash ||
            generateContextHash(libraryContext.title, libraryContext.content),
          originalContextId: libraryContext.id,
          createdAt: libraryContext.createdAt,
          updatedAt: libraryContext.updatedAt,
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

      if (isFocused && !isPastingIntoInput) {
        event.preventDefault();
        const pastedText = event.clipboardData.getData("text");
        if (pastedText.trim()) {
          if (activeId) {
            const contextToUpdate = contexts.find((c) => c.id === activeId);
            store.commit(
              events.contextUpdated({
                id: activeId,
                title: contextToUpdate?.title || getRandomUntitledPlaceholder(),
                content: pastedText,
                updatedAt: Date.now(),
              }),
            );
            sonnerToast.success("Context Updated", {
              description: `Context content was updated via paste.`,
            });
            setActiveId(null);
          } else {
            const placeholderTitle = getRandomUntitledPlaceholder();
            store.commit(
              events.contextCreated({
                id: generateId(),
                title: placeholderTitle,
                content: pastedText,
                createdAt: Date.now(),
              }),
            );
            sonnerToast.success("Context Added", {
              description: `Context "${placeholderTitle}" has been added.`,
            });
          }
        } else {
          sonnerToast.error("Paste Error", {
            description: "Pasted content is empty.",
          });
        }
      }
    },
    [isFocused, store, activeId, contexts],
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

      <ContextsDataTable
        data={contexts}
        onDeleteContext={onDeleteContext}
        onDeleteSelectedContexts={onDeleteSelectedContexts}
        onAddSelectedToPrompt={onAddSelectedToPrompt}
        searchQuery={searchTerm}
        setSearchQuery={setSearchTerm}
        activeId={activeId}
        setActiveId={setActiveId}
      />

      <Button variant="default" onClick={handleAddContext}>
        <LucidePlus className="mr-2 h-4 w-4" />
        Add Context
      </Button>
    </div>
  );
};

export default ContextsLibrary;
