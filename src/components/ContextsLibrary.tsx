import React, { useState, useCallback } from "react";
import { Context } from "../types";
import { Button } from "@/components/ui/button";
import { LucidePlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggler } from "./ThemeToggler";
import { ContextsDataTable } from "./ContextsDataTable";
import { useLocation } from "wouter";
import { getRandomUntitledPlaceholder } from "@/constants/titlePlaceholders";
import { v4 as uuid } from "uuid";
import { useStore } from "@livestore/react";
import { events } from "@/livestore/events";
import { useLocalStore } from "@/localStore";

interface ContextsLibraryProps {
  onDeleteContext: (id: string) => void;
  onDeleteSelectedContexts: (ids: string[]) => void;
  isFocused: boolean;
  onFocus: () => void;
}

const generateId = () =>
  `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const generateContextHash = (title: string, content: string): string => {
  const dataString = JSON.stringify({ title, content });
  let hash = 5381;
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash = (hash << 5) + hash + char; /* hash * 33 + char */
    hash = hash & hash; // Convert to 32bit integer
  }
  return String(hash >>> 0); // Ensure positive integer string
};

const ContextsLibrary: React.FC<ContextsLibraryProps> = ({
  onDeleteContext,
  onDeleteSelectedContexts,
  isFocused,
  onFocus,
}) => {
  const [, navigate] = useLocation();
  const { store } = useStore();
  const { toast } = useToast();
  const { addContextToPrompt } = useLocalStore();
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddContext = () => {
    navigate("/add");
  };

  const onAddSelectedToPrompt = (libraryContexts: Context[]) => {
    libraryContexts.forEach((libraryContext) => {
      const newSelectedContextCopy: Context = {
        id: generateId(),
        title: libraryContext.title,
        content: libraryContext.content,
        charCount: libraryContext.content.length,
        hash:
          libraryContext.hash ||
          generateContextHash(libraryContext.title, libraryContext.content),
      };
      addContextToPrompt(newSelectedContextCopy);
      toast({
        title: "Context Selected",
        description: `Context "${newSelectedContextCopy.title}" copied to prompt.`,
      });
    });
  };

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
          const placeholderTitle = getRandomUntitledPlaceholder();
          const id = uuid();
          store.commit(
            events.contextCreated({
              id,
              title: placeholderTitle,
              content: pastedText,
            }),
          );
          toast({
            title: "Context Added",
            description: `Context "${placeholderTitle}" has been added.`,
          });
        } else {
          toast({
            title: "Paste Error",
            description: "Pasted content is empty.",
            variant: "destructive",
          });
        }
      }
    },
    [isFocused, store, toast],
  );

  return (
    <div
      className="h-full flex flex-col py-5 px-4 gap-4 focus:outline-none"
      onClick={onFocus}
      onPaste={handlePaste}
      tabIndex={-1}
    >
      <div className="flex flex-row items-center justify-between">
        <h1 className="font-medium text-lg">Context Library</h1>
        <ThemeToggler />
      </div>

      <ContextsDataTable
        onDeleteContext={onDeleteContext}
        onDeleteSelectedContexts={onDeleteSelectedContexts}
        onAddSelectedToPrompt={onAddSelectedToPrompt}
        searchQuery={searchTerm}
        setSearchQuery={setSearchTerm}
      />

      <Button variant="default" onClick={handleAddContext}>
        <LucidePlus className="mr-2 h-4 w-4" />
        Add Context
      </Button>
    </div>
  );
};

export default ContextsLibrary;
