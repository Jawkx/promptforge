import { useState, useCallback, useEffect } from "react";
import { Context, GlobalLabel } from "../types";
import { useToast, ToastOptions } from "./use-toast";
import { Content } from "@tiptap/react";

const LOCAL_STORAGE_KEYS = {
  CONTEXTS: "promptForge_contexts",
  GLOBAL_LABELS: "promptForge_globalLabels",
  PROMPT: "promptForge_prompt",
  SELECTED_CONTEXTS: "promptForge_selectedContexts",
};

const initialGlobalLabels: GlobalLabel[] = [];

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

type ContextOperation =
  | "Added"
  | "Updated"
  | "Deleted"
  | "RemovedFromPrompt"
  | "Selected"
  | "Copied"
  | "Processed"
  | "MultipleDeleted"
  | "MultipleRemovedFromPrompt"
  | "LabelUpdated"
  | "LabelAdded"
  | "SelectedContextUpdated";

const showContextOperationNotification = (
  toastFn: (props: ToastOptions) => void,
  operation: ContextOperation,
  itemName: string,
  variant?: "destructive" | "default",
  customDescription?: string,
) => {
  let title = "";
  let description = "";

  switch (operation) {
    case "Added":
      title = "Context Added";
      description =
        customDescription || `Context "${itemName}" has been added.`;
      break;
    case "Updated":
      title = "Context Updated";
      description =
        customDescription || `Context "${itemName}" has been updated.`;
      break;
    case "SelectedContextUpdated":
      title = "Selected Context Updated";
      description =
        customDescription || `Selected context "${itemName}" has been updated.`;
      break;
    case "Deleted":
      title = "Context Deleted";
      description =
        customDescription ||
        `Context "${itemName}" has been deleted from library.`;
      break;
    case "RemovedFromPrompt":
      title = "Context Removed";
      description =
        customDescription || `Context "${itemName}" removed from prompt.`;
      break;
    case "Selected":
      title = "Context Selected";
      description =
        customDescription || `Context "${itemName}" copied to prompt.`;
      break;
    case "Copied":
      title = "Copied to Clipboard!";
      description =
        customDescription || "The prompt and contexts have been copied.";
      break;
    case "MultipleDeleted":
      title = `${itemName} Contexts Deleted`;
      description =
        customDescription ||
        `Successfully deleted ${itemName} context(s) from the library.`;
      break;
    case "MultipleRemovedFromPrompt":
      title = `${itemName} Context(s) Removed`;
      description =
        customDescription ||
        `${itemName} context(s) have been removed from the prompt.`;
      break;
    case "LabelAdded":
      title = "Label Added";
      description =
        customDescription || `Label "${itemName}" has been added globally.`;
      break;
    case "LabelUpdated":
      title = "Label Updated";
      description =
        customDescription || `Label "${itemName}" has been updated globally.`;
      break;
    default:
      title = `Operation Successful`;
      description = customDescription || `${itemName} processed.`;
  }

  toastFn({
    title,
    description,
    variant:
      variant ||
      (operation.includes("Delete") || operation.includes("Removed")
        ? "destructive"
        : "default"),
  });
};

export const useContexts = () => {
  const [prompt, setPrompt] = useState<Content>("");
  const [selectedContexts, setSelectedContexts] = useState<Context[]>(() => {
    try {
      const storedSelectedContexts = localStorage.getItem(
        LOCAL_STORAGE_KEYS.SELECTED_CONTEXTS,
      );
      const parsed = storedSelectedContexts
        ? JSON.parse(storedSelectedContexts)
        : [];
      return parsed.map((c: Context) => ({
        ...c,
        id: c.id || generateId(),
        hash: c.hash || generateContextHash(c.title, c.content),
      }));
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
        LOCAL_STORAGE_KEYS.SELECTED_CONTEXTS,
        JSON.stringify(selectedContexts),
      );
    } catch (error) {
      console.error("Error saving selected contexts to local storage:", error);
    }
  }, [selectedContexts]);

  const removeContextFromPrompt = useCallback((id: string) => {
    return;
    const removedContext = selectedContexts.find((c) => c.id === id);
    setSelectedContexts((prevSelectedContexts) =>
      prevSelectedContexts.filter((context) => context.id !== id),
    );
    if (removedContext) {
      const firstLabelText = getResolvedLabelsByIds(removedContext.labels)[0]
        ?.text;
      showContextOperationNotification(
        toast,
        "RemovedFromPrompt",
        firstLabelText || removedContext.title,
      );
    }
  }, []);

  const removeMultipleSelectedContextsFromPrompt = useCallback(
    (ids: string[]) => {
      const currentSelectedCount = selectedContexts.length;
      const updatedSelectedContexts = selectedContexts.filter(
        (context) => !ids.includes(context.id),
      );
      setSelectedContexts(updatedSelectedContexts);

      const removedCount =
        currentSelectedCount - updatedSelectedContexts.length;

      if (removedCount > 0) {
        showContextOperationNotification(
          toast,
          "MultipleRemovedFromPrompt",
          String(removedCount),
        );
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
        showContextOperationNotification(toast, "Copied", "Prompt");
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
    (libraryContext: Context) => {
      const newSelectedContextCopy: Context = {
        id: generateId(),
        title: libraryContext.title,
        content: libraryContext.content,
        charCount: libraryContext.content.length,
        hash:
          libraryContext.hash ||
          generateContextHash(libraryContext.title, libraryContext.content),
      };

      setSelectedContexts((prevSelectedContexts) => [
        ...prevSelectedContexts,
        newSelectedContextCopy,
      ]);
      showContextOperationNotification(
        toast,
        "Selected",
        newSelectedContextCopy.title,
      );
    },
    [toast],
  );

  const reorderSelectedContexts = useCallback(
    (reorderedContexts: Context[]) => {
      setSelectedContexts(
        reorderedContexts.map((c) => ({
          ...c,
          id: String(c.id),
          // contentHash should already be part of 'c'
        })),
      );
    },
    [],
  );

  return {
    prompt,
    setPrompt,
    selectedContexts,
    removeContextFromPrompt,
    removeMultipleSelectedContextsFromPrompt,
    copyPromptWithContexts,
    addContextToPrompt,
    reorderSelectedContexts,
  };
};
