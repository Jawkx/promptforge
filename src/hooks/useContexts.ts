import { useState, useCallback, useEffect } from "react";
import { Context, ContextFormData, GlobalLabel } from "../types";
import { useToast, ToastOptions } from "./use-toast";
import { Content } from "@tiptap/react";

const LOCAL_STORAGE_KEYS = {
  CONTEXTS: "promptForge_contexts",
  GLOBAL_LABELS: "promptForge_globalLabels",
  PROMPT: "promptForge_prompt",
  SELECTED_CONTEXTS: "promptForge_selectedContexts",
};

const initialContexts: Context[] = [];
const initialGlobalLabels: GlobalLabel[] = [];

const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const generateContextHash = (title: string, content: string, labelIds: string[]): string => {
  const sortedLabelsString = [...(labelIds || [])].sort().join(',');
  const dataString = JSON.stringify({ title, content, labels: sortedLabelsString });

  let hash = 5381;
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash = ((hash << 5) + hash) + char; /* hash * 33 + char */
    hash = hash & hash; // Convert to 32bit integer
  }
  return String(hash >>> 0); // Ensure positive integer string
};

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
      description = customDescription || `Context "${itemName}" has been added.`;
      break;
    case "Updated":
      title = "Context Updated";
      description = customDescription || `Context "${itemName}" has been updated.`;
      break;
    case "SelectedContextUpdated":
      title = "Selected Context Updated";
      description = customDescription || `Selected context "${itemName}" has been updated.`;
      break;
    case "Deleted":
      title = "Context Deleted";
      description = customDescription || `Context "${itemName}" has been deleted from library.`;
      break;
    case "RemovedFromPrompt":
      title = "Context Removed";
      description = customDescription || `Context "${itemName}" removed from prompt.`;
      break;
    case "Selected":
      title = "Context Selected";
      description = customDescription || `Context "${itemName}" copied to prompt.`;
      break;
    case "Copied":
      title = "Copied to Clipboard!";
      description = customDescription || "The prompt and contexts have been copied.";
      break;
    case "MultipleDeleted":
      title = `${itemName} Contexts Deleted`;
      description = customDescription || `Successfully deleted ${itemName} context(s) from the library.`;
      break;
    case "MultipleRemovedFromPrompt":
      title = `${itemName} Context(s) Removed`;
      description = customDescription || `${itemName} context(s) have been removed from the prompt.`;
      break;
    case "LabelAdded":
      title = "Label Added";
      description = customDescription || `Label "${itemName}" has been added globally.`;
      break;
    case "LabelUpdated":
      title = "Label Updated";
      description = customDescription || `Label "${itemName}" has been updated globally.`;
      break;
    default:
      title = `Operation Successful`;
      description = customDescription || `${itemName} processed.`;
  }

  toastFn({
    title,
    description,
    variant: variant || (operation.includes("Delete") || operation.includes("Removed") ? "destructive" : "default"),
  });
};


export const useContexts = () => {
  const [contexts, setContexts] = useState<Context[]>(() => {
    try {
      const storedContexts = localStorage.getItem(LOCAL_STORAGE_KEYS.CONTEXTS);
      const parsed = storedContexts ? JSON.parse(storedContexts) : initialContexts;
      return parsed.map((c: any) => ({
        ...c,
        originalId: undefined,
        labels: c.labels || [],
        contentHash: c.contentHash || generateContextHash(c.title, c.content, c.labels || [])
      }));
    } catch (error) {
      console.error("Error loading contexts from local storage:", error);
      return initialContexts;
    }
  });

  const [globalLabels, setGlobalLabels] = useState<GlobalLabel[]>(() => {
    try {
      const storedGlobalLabels = localStorage.getItem(LOCAL_STORAGE_KEYS.GLOBAL_LABELS);
      const parsedLabels = storedGlobalLabels ? JSON.parse(storedGlobalLabels) : initialGlobalLabels;
      return parsedLabels.map((label: any) => ({ id: label.id, text: label.text }));
    } catch (error) {
      console.error("Error loading global labels from local storage:", error);
      return initialGlobalLabels;
    }
  });

  const [prompt, setPrompt] = useState<Content>("");
  const [selectedContexts, setSelectedContexts] = useState<Context[]>(() => {
    try {
      const storedSelectedContexts = localStorage.getItem(
        LOCAL_STORAGE_KEYS.SELECTED_CONTEXTS,
      );
      const parsed = storedSelectedContexts ? JSON.parse(storedSelectedContexts) : [];
      return parsed.map((c: Context) => ({
        ...c,
        id: c.id || generateId(),
        labels: c.labels || [],
        contentHash: c.contentHash || generateContextHash(c.title, c.content, c.labels || [])
      }));
    } catch (error) {
      console.error("Error loading selected contexts from local storage:", error);
      return [];
    }
  });

  const { toast } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.CONTEXTS, JSON.stringify(contexts));
    } catch (error) {
      console.error("Error saving contexts to local storage:", error);
      toast({
        title: "Storage Error",
        description: "Could not save your context library. Changes might not persist.",
        variant: "destructive",
      });
    }
  }, [contexts, toast]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.GLOBAL_LABELS, JSON.stringify(globalLabels));
    } catch (error) {
      console.error("Error saving global labels to local storage:", error);
      toast({
        title: "Storage Error",
        description: "Could not save global labels. Changes might not persist.",
        variant: "destructive",
      });
    }
  }, [globalLabels, toast]);


  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.SELECTED_CONTEXTS, JSON.stringify(selectedContexts));
    } catch (error) {
      console.error("Error saving selected contexts to local storage:", error);
    }
  }, [selectedContexts]);

  const getAllGlobalLabels = useCallback(() => globalLabels, [globalLabels]);

  const getGlobalLabelById = useCallback((id: string) => globalLabels.find(gl => gl.id === id), [globalLabels]);

  const getResolvedLabelsByIds = useCallback((labelIds: string[] | undefined): GlobalLabel[] => {
    if (!labelIds || !Array.isArray(labelIds)) return [];
    return labelIds.map(labelId => getGlobalLabelById(labelId)).filter(Boolean) as GlobalLabel[];
  }, [getGlobalLabelById]);


  const findOrCreateGlobalLabel = useCallback((labelText: string): GlobalLabel => {
    const normalizedText = labelText.trim().toLowerCase();
    const existingLabel = globalLabels.find(gl => gl.text.toLowerCase() === normalizedText);

    if (existingLabel) {
      return existingLabel;
    } else {
      const newGlobalLabel: GlobalLabel = {
        id: generateId(),
        text: labelText.trim(),
      };
      setGlobalLabels(prevGlobalLabels => [...prevGlobalLabels, newGlobalLabel]);
      showContextOperationNotification(toast, "LabelAdded", newGlobalLabel.text);
      return newGlobalLabel;
    }
  }, [globalLabels, toast]);

  const updateGlobalLabelDefinition = useCallback((updatedLabel: GlobalLabel): GlobalLabel | null => {
    const existingLabelById = globalLabels.find(gl => gl.id === updatedLabel.id);
    if (!existingLabelById) {
      console.error("Attempted to update non-existent global label by ID:", updatedLabel.id);
      return findOrCreateGlobalLabel(updatedLabel.text);
    }

    const trimmedText = updatedLabel.text.trim();
    const conflictingLabelByText = globalLabels.find(gl => gl.text.toLowerCase() === trimmedText.toLowerCase() && gl.id !== updatedLabel.id);
    if (conflictingLabelByText) {
      toast({ title: "Label Exists", description: `A label with text "${trimmedText}" already exists. Choose a different name.`, variant: "destructive" });
      return existingLabelById;
    }

    if (existingLabelById.text === trimmedText) {
      return existingLabelById;
    }

    const newGlobalLabels = globalLabels.map(gl =>
      gl.id === updatedLabel.id ? { ...gl, text: trimmedText } : gl
    );
    setGlobalLabels(newGlobalLabels);
    showContextOperationNotification(toast, "LabelUpdated", trimmedText);
    // Note: Updating a global label's text does not automatically update contentHashes of contexts using it.
    // The hash is based on label IDs. The visual display will change, but sync status for this specific change won't trigger via hash.
    // This is a design choice for simplicity of the hash.
    return newGlobalLabels.find(gl => gl.id === updatedLabel.id)!;

  }, [globalLabels, toast, findOrCreateGlobalLabel]);


  const addContext = useCallback(
    (formData: ContextFormData) => {
      let titleToUse = formData.title.trim();
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

      const labelIdsForContext: string[] = formData.labels.map(labelInput => {
        const existingGlobalLabel = globalLabels.find(gl => gl.id === labelInput.id);
        if (existingGlobalLabel) {
          const updatedGlobal = updateGlobalLabelDefinition({ id: labelInput.id, text: labelInput.text });
          return updatedGlobal!.id;
        }
        const globalLabel = findOrCreateGlobalLabel(labelInput.text);
        return globalLabel.id;
      }).filter((id, index, self) => self.indexOf(id) === index);

      const content = formData.content.trim();
      const newContext: Context = {
        id: generateId(),
        title: titleToUse,
        content: content,
        labels: labelIdsForContext || [],
        contentHash: generateContextHash(titleToUse, content, labelIdsForContext || []),
      };
      setContexts((prevContexts) => [...prevContexts, newContext]);
      showContextOperationNotification(toast, "Added", newContext.title);
      return true;
    },
    [contexts, toast, findOrCreateGlobalLabel, globalLabels, updateGlobalLabelDefinition],
  );

  const addContextFromPaste = useCallback(
    (content: string) => {
      const title = getNextUntitledTitle(contexts);
      const newContext: Context = {
        id: generateId(),
        title,
        content,
        labels: [],
        contentHash: generateContextHash(title, content, []),
      };
      setContexts((prevContexts) => [...prevContexts, newContext]);
      showContextOperationNotification(toast, "Added", newContext.title, "default", `Context "${newContext.title}" (from paste) has been added.`);
    },
    [contexts, toast],
  );

  const updateContextInLibrary = useCallback(
    (formData: ContextFormData) => {
      const contextId = formData.id;
      if (!contextId) {
        toast({ title: "Error", description: "Context ID missing for library update.", variant: "destructive" });
        return false;
      }

      const libraryContextToUpdate = contexts.find(c => c.id === contextId);
      if (!libraryContextToUpdate) {
        toast({ title: "Error", description: "Context not found in library for update.", variant: "destructive" });
        return false;
      }

      const newTitle = formData.title.trim();
      if (contexts.some(c => c.id !== contextId && c.title === newTitle)) {
        toast({
          title: "Duplicate Title",
          description: `A context with the title "${newTitle}" already exists in the library. Please choose a unique title.`,
          variant: "destructive",
        });
        return false;
      }

      const labelIdsForContext: string[] = formData.labels.map(labelInput => {
        const knownGlobalLabel = globalLabels.find(gl => gl.id === labelInput.id);
        if (knownGlobalLabel) {
          const updatedGlobalLabel = updateGlobalLabelDefinition({ id: labelInput.id, text: labelInput.text });
          return updatedGlobalLabel!.id;
        } else {
          const globalLabel = findOrCreateGlobalLabel(labelInput.text);
          return globalLabel.id;
        }
      }).filter((id, index, self) => self.indexOf(id) === index);

      const newContent = formData.content.trim();
      const updatedContext: Context = {
        ...libraryContextToUpdate,
        id: contextId,
        title: newTitle,
        content: newContent,
        labels: labelIdsForContext || [],
        contentHash: generateContextHash(newTitle, newContent, labelIdsForContext || []),
      };

      setContexts((prevContexts) =>
        prevContexts.map((context) =>
          context.id === updatedContext.id ? updatedContext : context,
        ),
      );
      showContextOperationNotification(toast, "Updated", updatedContext.title);
      return true;
    },
    [contexts, globalLabels, toast, findOrCreateGlobalLabel, updateGlobalLabelDefinition],
  );

  const updateSelectedContext = useCallback(
    (formData: ContextFormData) => {
      const selectedContextId = formData.id;
      if (!selectedContextId) {
        toast({ title: "Error", description: "Selected context ID missing for update.", variant: "destructive" });
        return false;
      }

      const selectedContextToUpdate = selectedContexts.find(sc => sc.id === selectedContextId);
      if (!selectedContextToUpdate) {
        toast({ title: "Error", description: "Selected context not found for update.", variant: "destructive" });
        return false;
      }
      const newTitle = formData.title.trim();
      const labelIdsForContext: string[] = formData.labels.map(labelInput => {
        const knownGlobalLabel = globalLabels.find(gl => gl.id === labelInput.id);
        if (knownGlobalLabel) {
          const updatedGlobalLabel = updateGlobalLabelDefinition({ id: labelInput.id, text: labelInput.text });
          return updatedGlobalLabel!.id;
        } else {
          const globalLabel = findOrCreateGlobalLabel(labelInput.text);
          return globalLabel.id;
        }
      }).filter((id, index, self) => self.indexOf(id) === index);

      const newContent = formData.content.trim();
      const updatedSelectedCopy: Context = {
        ...selectedContextToUpdate,
        title: newTitle,
        content: newContent,
        labels: labelIdsForContext || [],
        contentHash: generateContextHash(newTitle, newContent, labelIdsForContext || []),
      };

      setSelectedContexts((prevSelectedContexts) =>
        prevSelectedContexts.map((sc) =>
          sc.id === updatedSelectedCopy.id ? updatedSelectedCopy : sc,
        ),
      );
      showContextOperationNotification(toast, "SelectedContextUpdated", updatedSelectedCopy.title);
      return true;
    },
    [selectedContexts, globalLabels, toast, findOrCreateGlobalLabel, updateGlobalLabelDefinition],
  );


  const deleteContext = useCallback(
    (id: string) => {
      const contextToDelete = contexts.find((c) => c.id === id);
      if (contextToDelete) {
        setContexts((prevContexts) =>
          prevContexts.filter((context) => context.id !== id),
        );
        showContextOperationNotification(toast, "Deleted", contextToDelete.title, "destructive");
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
        showContextOperationNotification(toast, "MultipleDeleted", String(contextsToDelete.length), "destructive");
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
        const firstLabelText = getResolvedLabelsByIds(removedContext.labels)[0]?.text;
        showContextOperationNotification(toast, "RemovedFromPrompt", firstLabelText || removedContext.title);
      }
    },
    [selectedContexts, toast, getResolvedLabelsByIds],
  );

  const removeMultipleSelectedContextsFromPrompt = useCallback(
    (ids: string[]) => {
      const currentSelectedCount = selectedContexts.length;
      const updatedSelectedContexts = selectedContexts.filter((context) => !ids.includes(context.id));
      setSelectedContexts(updatedSelectedContexts);

      const removedCount = currentSelectedCount - updatedSelectedContexts.length;

      if (removedCount > 0) {
        showContextOperationNotification(toast, "MultipleRemovedFromPrompt", String(removedCount));
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
        originalId: libraryContext.id,
        title: libraryContext.title,
        content: libraryContext.content,
        labels: [...libraryContext.labels],
        contentHash: libraryContext.contentHash || generateContextHash(libraryContext.title, libraryContext.content, libraryContext.labels), // Use original's hash or recompute
      };

      setSelectedContexts((prevSelectedContexts) => [
        ...prevSelectedContexts,
        newSelectedContextCopy,
      ]);
      showContextOperationNotification(toast, "Selected", newSelectedContextCopy.title);
    },
    [toast],
  );

  const reorderSelectedContexts = useCallback((reorderedContexts: Context[]) => {
    setSelectedContexts(reorderedContexts.map(c => ({
      ...c,
      id: String(c.id),
      labels: c.labels || [],
      // contentHash should already be part of 'c'
    })));
  }, []);

  return {
    contexts,
    prompt,
    setPrompt,
    selectedContexts,
    addContext,
    addContextFromPaste,
    updateContextInLibrary,
    updateSelectedContext,
    deleteContext,
    removeContextFromPrompt,
    removeMultipleSelectedContextsFromPrompt,
    copyPromptWithContexts,
    addContextToPrompt,
    reorderSelectedContexts,
    deleteMultipleContexts,
    getAllGlobalLabels,
    getGlobalLabelById,
    getResolvedLabelsByIds,
  };
};
