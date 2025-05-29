import { useState, useCallback, useEffect } from "react"; // Added useEffect
import { Context } from "../types";
import { useToast } from "./use-toast";

const LOCAL_STORAGE_KEYS = {
  CONTEXTS: "promptForge_contexts",
  PROMPT: "promptForge_prompt",
  SELECTED_CONTEXTS: "promptForge_selectedContexts",
};

const initialContexts: Context[] = [];

// const untitledCounter = 0; // This variable is not used and can be removed

const getNextUntitledTitle = (existingContexts: Context[]): string => {
  let title: string;
  let counter =
    existingContexts.filter((c) => c.title.startsWith("Untitled (")).length + 1;
  do {
    title = `Untitled (${counter})`;
    counter++;
  } while (existingContexts.some((c) => c.title === title));
  return title;
};

export const useContexts = () => {
  const [contexts, setContexts] = useState<Context[]>(() => {
    try {
      const storedContexts = localStorage.getItem(LOCAL_STORAGE_KEYS.CONTEXTS);
      return storedContexts ? JSON.parse(storedContexts) : initialContexts;
    } catch (error) {
      console.error("Error loading contexts from local storage:", error);
      return initialContexts;
    }
  });

  const [prompt, setPrompt] = useState<string>(() => {
    try {
      const storedPrompt = localStorage.getItem(LOCAL_STORAGE_KEYS.PROMPT);
      return storedPrompt !== null ? storedPrompt : ""; // Ensure null is handled, default to empty string
    } catch (error) {
      console.error("Error loading prompt from local storage:", error);
      return "";
    }
  });

  const [selectedContexts, setSelectedContexts] = useState<Context[]>(() => {
    try {
      const storedSelectedContexts = localStorage.getItem(
        LOCAL_STORAGE_KEYS.SELECTED_CONTEXTS,
      );
      return storedSelectedContexts ? JSON.parse(storedSelectedContexts) : [];
    } catch (error) {
      console.error(
        "Error loading selected contexts from local storage:",
        error,
      );
      return [];
    }
  });

  const { toast } = useToast();

  // Effect to save contexts to local storage
  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.CONTEXTS,
        JSON.stringify(contexts),
      );
    } catch (error) {
      console.error("Error saving contexts to local storage:", error);
      toast({
        title: "Storage Error",
        description:
          "Could not save your context library. Changes might not persist.",
        variant: "destructive",
      });
    }
  }, [contexts, toast]);

  // Effect to save prompt to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.PROMPT, prompt);
    } catch (error) {
      console.error("Error saving prompt to local storage:", error);
      // Potentially toast here if prompt saving is critical and frequent
    }
  }, [prompt]);

  // Effect to save selectedContexts to local storage
  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.SELECTED_CONTEXTS,
        JSON.stringify(selectedContexts),
      );
    } catch (error) {
      console.error("Error saving selected contexts to local storage:", error);
      // Potentially toast here
    }
  }, [selectedContexts]);

  const addContext = useCallback(
    (context: Omit<Context, "id">) => {
      let titleToUse = context.title;
      if (!titleToUse.trim()) {
        titleToUse = getNextUntitledTitle(contexts);
      }

      if (contexts.some((c) => c.title === titleToUse)) {
        toast({
          title: "Duplicate Title",
          description: `A context with the title "${titleToUse}" already exists. Please choose a unique title.`,
          variant: "destructive",
        });
        return false;
      }

      const newContext: Context = {
        ...context,
        id: Date.now().toString(),
        title: titleToUse,
      };
      setContexts((prevContexts) => [...prevContexts, newContext]);
      toast({
        title: "Context Added",
        description: `Context "${newContext.title}" has been added.`,
      });
      return true;
    },
    [contexts, toast],
  );

  const addContextFromPaste = useCallback(
    (content: string) => {
      const title = getNextUntitledTitle(contexts);
      const newContext: Context = {
        id: Date.now().toString(),
        title,
        content,
        category: "Uncategorized",
      };
      setContexts((prevContexts) => [...prevContexts, newContext]);
      toast({
        title: "Context Added",
        description: `Context "${newContext.title}" (from paste) has been added.`,
      });
    },
    [contexts, toast],
  );

  const updateContext = useCallback(
    (updatedContext: Context) => {
      if (
        contexts.some(
          (c) => c.id !== updatedContext.id && c.title === updatedContext.title,
        )
      ) {
        toast({
          title: "Duplicate Title",
          description: `A context with the title "${updatedContext.title}" already exists. Please choose a unique title.`,
          variant: "destructive",
        });
        return false;
      }

      setContexts((prevContexts) =>
        prevContexts.map((context) =>
          context.id === updatedContext.id ? updatedContext : context,
        ),
      );
      setSelectedContexts((prevSelectedContexts) =>
        prevSelectedContexts.map((context) =>
          context.id === updatedContext.id ? updatedContext : context,
        ),
      );
      toast({
        title: "Context Updated",
        description: `Context "${updatedContext.title}" has been updated.`,
      });
      return true;
    },
    [contexts, toast],
  );

  const deleteContext = useCallback(
    (id: string) => {
      const contextToDelete = contexts.find((c) => c.id === id);
      if (contextToDelete) {
        setContexts((prevContexts) =>
          prevContexts.filter((context) => context.id !== id),
        );
        setSelectedContexts((prevSelectedContexts) =>
          prevSelectedContexts.filter((context) => context.id !== id),
        );
        toast({
          title: "Context Deleted",
          description: `Context "${contextToDelete.title}" has been deleted.`,
          variant: "destructive",
        });
      }
    },
    [contexts, toast],
  );

  const removeContextFromPrompt = useCallback(
    (id: string) => {
      setSelectedContexts((prevSelectedContexts) =>
        prevSelectedContexts.filter((context) => context.id !== id),
      );
      const removedContext = selectedContexts.find((c) => c.id === id); // Find from old state for toast
      if (removedContext) {
        toast({
          title: "Context Removed",
          description: `Context "${removedContext.title}" removed from prompt.`,
        });
      }
    },
    [selectedContexts, toast],
  ); // selectedContexts needed here for the find operation

  const copyPromptWithContexts = useCallback(() => {
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
      return "";
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

    return fullText;
  }, [prompt, selectedContexts, toast]);

  const addContextToPrompt = useCallback(
    (context: Context) => {
      if (!selectedContexts.some((c) => c.id === context.id)) {
        setSelectedContexts((prevSelectedContexts) => [
          ...prevSelectedContexts,
          context,
        ]);
        toast({
          title: "Context Selected",
          description: `Context "${context.title}" added to prompt.`,
        });
      } else {
        toast({
          title: "Context Already Selected",
          description: `Context "${context.title}" is already in the prompt.`,
          variant: "default",
        });
      }
    },
    [selectedContexts, toast],
  );

  return {
    contexts,
    prompt,
    setPrompt,
    selectedContexts,
    // Removed setSelectedContexts from direct export as it's managed internally and through add/remove functions
    addContext,
    addContextFromPaste,
    updateContext,
    deleteContext,
    removeContextFromPrompt,
    copyPromptWithContexts,
    addContextToPrompt,
    getNextUntitledTitle, // This might not be needed by consumers if modals handle titles internally
  };
};
