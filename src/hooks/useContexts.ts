import { useState, useCallback, useEffect } from "react";
import { Context, ContextCreationData, ContextLabel, PREDEFINED_LABEL_COLORS } from "../types";
import { useToast } from "./use-toast";
import { Content } from "@tiptap/react"

const LOCAL_STORAGE_KEYS = {
  CONTEXTS: "promptForge_contexts",
  PROMPT: "promptForge_prompt",
  SELECTED_CONTEXTS: "promptForge_selectedContexts",
};

const initialContexts: Context[] = [];

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

  const [prompt, setPrompt] = useState<Content>("");

  const [selectedContexts, setSelectedContexts] = useState<Context[]>(() => {
    try {
      const storedSelectedContexts = localStorage.getItem(
        LOCAL_STORAGE_KEYS.SELECTED_CONTEXTS,
      );
      const parsed = storedSelectedContexts ? JSON.parse(storedSelectedContexts) : [];
      return parsed.map((c: Context) => ({ ...c, id: String(c.id) }));
    } catch (error) {
      console.error(
        "Error loading selected contexts from local storage:",
        error,
      );
      return [];
    }
  });

  const { toast } = useToast();

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

  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.SELECTED_CONTEXTS,
        JSON.stringify(selectedContexts),
      );
    } catch (error) {
      console.error("Error saving selected contexts to local storage:", error);
    }
  }, [selectedContexts]);

  const addContext = useCallback(
    (newContextData: ContextCreationData) => {
      let titleToUse = newContextData.title.trim();
      if (!titleToUse) {
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

      const newContextLabels: ContextLabel[] = newContextData.labels.map(label => ({
        ...label,
        id: `label-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Ensure unique ID
      }));

      const newContext: Context = {
        id: Date.now().toString(),
        title: titleToUse,
        content: newContextData.content.trim(),
        labels: newContextLabels,
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
        labels: [], // Pasted content starts with no labels
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

      // Ensure labels have unique IDs, text, and a valid color
      const processedLabels: ContextLabel[] = updatedContext.labels.map(label => ({
        id: label.id || `label-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        text: label.text.trim(),
        color: label.color || PREDEFINED_LABEL_COLORS[0].value, // Default to first color if somehow missing
      })).filter(label => label.text); // Remove empty labels


      const contextToUpdate: Context = {
        ...updatedContext,
        id: String(updatedContext.id),
        labels: processedLabels,
      };


      setContexts((prevContexts) =>
        prevContexts.map((context) =>
          context.id === contextToUpdate.id ? contextToUpdate : context,
        ),
      );
      setSelectedContexts((prevSelectedContexts) =>
        prevSelectedContexts.map((context) =>
          context.id === contextToUpdate.id ? contextToUpdate : context,
        ),
      );
      toast({
        title: "Context Updated",
        description: `Context "${contextToUpdate.title}" has been updated.`,
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


  const deleteMultipleContexts = useCallback(
    (ids: string[]) => {
      const contextsToDelete = contexts.filter((c) => ids.includes(c.id));
      if (contextsToDelete.length > 0) {
        setContexts((prevContexts) =>
          prevContexts.filter((context) => !ids.includes(context.id)),
        );
        setSelectedContexts((prevSelectedContexts) =>
          prevSelectedContexts.filter((context) => !ids.includes(context.id)),
        );
        toast({
          title: `${contextsToDelete.length} Contexts Deleted`,
          description: `Successfully deleted ${contextsToDelete.length} context(s) from the library.`,
          variant: "destructive",
        });
      }
    },
    [contexts, toast],
  );


  const removeContextFromPrompt = useCallback(
    (id: string) => {
      const removedContext = selectedContexts.find((c) => c.id === id);
      setSelectedContexts((prevSelectedContexts) =>
        prevSelectedContexts.filter((context) => context.id !== id),
      );
      if (removedContext) {
        toast({
          title: "Context Removed",
          description: `Context "${removedContext.title}" removed from prompt.`,
        });
      }
    },
    [selectedContexts, toast],
  );

  const removeMultipleSelectedContextsFromPrompt = useCallback(
    (ids: string[]) => {
      const currentSelectedCount = selectedContexts.length;
      setSelectedContexts((prevSelectedContexts) =>
        prevSelectedContexts.filter((context) => !ids.includes(context.id)),
      );
      const removedCount = currentSelectedCount - selectedContexts.filter((context) => !ids.includes(context.id)).length;

      if (removedCount > 0) {
        toast({
          title: `${removedCount} Context(s) Removed`,
          description: `${removedCount} context(s) have been removed from the prompt.`,
        });
      }
    },
    [selectedContexts, toast],
  );


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
      const contextWithStrId = { ...context, id: String(context.id) };
      if (!selectedContexts.some((c) => c.id === contextWithStrId.id)) {
        setSelectedContexts((prevSelectedContexts) => [
          ...prevSelectedContexts,
          contextWithStrId,
        ]);
        toast({
          title: "Context Selected",
          description: `Context "${contextWithStrId.title}" added to prompt.`,
        });
      } else {
        toast({
          title: "Context Already Selected",
          description: `Context "${contextWithStrId.title}" is already in the prompt.`,
          variant: "default",
        });
      }
    },
    [selectedContexts, toast],
  );

  const reorderSelectedContexts = useCallback((reorderedContexts: Context[]) => {
    setSelectedContexts(reorderedContexts.map(c => ({ ...c, id: String(c.id) })));
  }, []);

  return {
    contexts,
    prompt,
    setPrompt,
    selectedContexts,
    addContext,
    addContextFromPaste,
    updateContext,
    deleteContext,
    removeContextFromPrompt,
    removeMultipleSelectedContextsFromPrompt, // Export new function
    copyPromptWithContexts,
    addContextToPrompt,
    reorderSelectedContexts,
    deleteMultipleContexts
  };
};
