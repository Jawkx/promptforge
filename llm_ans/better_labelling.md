# Changes overview

-   **Global Label Management**: Introduced a new state `globalLabels` within `useContexts.ts` to store all unique labels. These labels are persisted in localStorage. Each global label has a unique `id`, `text`, and `color`.
-   **Context Label Association**: `Context` objects now store an array of `string` IDs (`labels: string[]`) that reference these global labels.
-   **Reusability & Edit Sync**:
    -   When adding or editing a context, labels are now managed through `useLabelManager.ts` and a shared `LabelManagerUI.tsx` component.
    -   Users can select from existing global labels or create new ones.
    -   Creating a "new" label (by text/color combo) will reuse an existing global label if a match is found, otherwise a new global label is created.
    -   Editing a label's text or color within a context's edit modal will update the definition of that label globally, and this change will be reflected in all other contexts using that same label.
-   **UI Updates**:
    -   `AddContextModal.tsx` and `EditContextModal.tsx` now use the `LabelManagerUI.tsx` component.
    -   The label section in these modals is no longer empty. It displays labels associated with the current context and allows picking from all available global labels.
    -   The `LabelManagerUI.tsx` provides functionality to add new labels, select existing global labels, remove labels from the current context, and edit the text/color of labels associated with the current context (which syncs globally).
-   **Type Safety**: Updated type definitions in `types/index.ts` (e.g., `GlobalLabel`, `ContextFormData`) to support the new system.
-   **Helper Functions**: `useContexts.ts` now includes helpers like `getResolvedContextLabels` (to get full label objects from IDs) and `getAllGlobalLabels`.

# File Changes: ./src/types/index.ts

## Code

## Description
{{Updated type definitions to support the new global labelling system.
-   `GlobalLabel`: Defines the structure for a globally unique label.
-   `Context`: Changed `labels` to be `string[]`, representing an array of `GlobalLabel` IDs.
-   `ContextFormData`: New type for data submitted from Add/Edit context modals. It includes full `GlobalLabel` objects, which might have existing global IDs or temporary client-side IDs for new labels. This structure facilitates easy processing in `useContexts`.
-   `AddContextModalProps` and `EditContextModalProps`: Updated to reflect the new `ContextFormData` and to pass `allGlobalLabels` and related functions for label management within the modals.}}

# File Changes: ./src/hooks/useContexts.ts

## Code
``` ts
import { useState, useCallback, useEffect } from "react";
import { Context, ContextFormData, GlobalLabel, PREDEFINED_LABEL_COLORS, LabelColorValue } from "../types";
import { useToast, ToastOptions } from "./use-toast";
import { Content } from "@tiptap/react";

const LOCAL_STORAGE_KEYS = {
  CONTEXTS: "promptForge_contexts",
  GLOBAL_LABELS: "promptForge_globalLabels", // New key for global labels
  PROMPT: "promptForge_prompt",
  SELECTED_CONTEXTS: "promptForge_selectedContexts",
};

const initialContexts: Context[] = [];
const initialGlobalLabels: GlobalLabel[] = [];

const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

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
  | "LabelAdded";

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
    case "Deleted":
      title = "Context Deleted";
      description = customDescription || `Context "${itemName}" has been deleted.`;
      break;
    case "RemovedFromPrompt":
      title = "Context Removed";
      description = customDescription || `Context "${itemName}" removed from prompt.`;
      break;
    case "Selected":
      title = "Context Selected";
      description = customDescription || `Context "${itemName}" added to prompt.`;
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
      return storedContexts ? JSON.parse(storedContexts) : initialContexts;
    } catch (error) {
      console.error("Error loading contexts from local storage:", error);
      return initialContexts;
    }
  });

  const [globalLabels, setGlobalLabels] = useState<GlobalLabel[]>(() => {
    try {
      const storedGlobalLabels = localStorage.getItem(LOCAL_STORAGE_KEYS.GLOBAL_LABELS);
      return storedGlobalLabels ? JSON.parse(storedGlobalLabels) : initialGlobalLabels;
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
      return parsed.map((c: Context) => ({ ...c, id: String(c.id) }));
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

  const getResolvedContextLabels = useCallback((context: Context | null): GlobalLabel[] => {
    if (!context) return [];
    return context.labels.map(labelId => getGlobalLabelById(labelId)).filter(Boolean) as GlobalLabel[];
  }, [getGlobalLabelById]);


  // Manages global labels, ensuring uniqueness by text (case-insensitive)
  // and updating color if a label with the same text but different color is added.
  // Returns the final GlobalLabel (either existing or newly created/updated).
  const findOrCreateGlobalLabel = useCallback((labelText: string, labelColor: LabelColorValue): GlobalLabel => {
    const normalizedText = labelText.trim().toLowerCase();
    let existingLabel = globalLabels.find(gl => gl.text.toLowerCase() === normalizedText);

    if (existingLabel) {
      if (existingLabel.color !== labelColor) {
        // Update color of existing label
        setGlobalLabels(prevGlobalLabels =>
          prevGlobalLabels.map(gl =>
            gl.id === existingLabel!.id ? { ...gl, color: labelColor } : gl
          )
        );
        showContextOperationNotification(toast, "LabelUpdated", existingLabel.text, "default", `Label "${existingLabel.text}" color updated.`);
        return { ...existingLabel, color: labelColor };
      }
      return existingLabel;
    } else {
      // Create new global label
      const newGlobalLabel: GlobalLabel = {
        id: generateId(),
        text: labelText.trim(),
        color: labelColor,
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
        // Fallback: try to find by text or create new
        return findOrCreateGlobalLabel(updatedLabel.text, updatedLabel.color);
    }

    // Check if another label with the new text already exists (excluding current label)
    const conflictingLabelByText = globalLabels.find(gl => gl.text.toLowerCase() === updatedLabel.text.trim().toLowerCase() && gl.id !== updatedLabel.id);
    if (conflictingLabelByText) {
        toast({ title: "Label Exists", description: `A label with text "${updatedLabel.text.trim()}" already exists. Choose a different name.`, variant: "destructive" });
        return existingLabelById; // Return original label to prevent change
    }
    
    // No conflict, proceed with update
    const newGlobalLabels = globalLabels.map(gl =>
        gl.id === updatedLabel.id ? { ...gl, text: updatedLabel.text.trim(), color: updatedLabel.color } : gl
    );
    setGlobalLabels(newGlobalLabels);
    showContextOperationNotification(toast, "LabelUpdated", updatedLabel.text.trim());
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
        // If labelInput has a valid global ID, it means it was an existing global label selected in the modal.
        // If its text/color was edited in the modal, updateGlobalLabelDefinition would handle it.
        // Otherwise, it's a new label from the modal (temp ID or no ID).
        const existingGlobalLabel = globalLabels.find(gl => gl.id === labelInput.id);
        if(existingGlobalLabel) { // It's an existing global label, potentially edited
            const updatedGlobal = updateGlobalLabelDefinition(labelInput);
            return updatedGlobal!.id;
        }
        // It's a new label text/color combo from the modal
        const globalLabel = findOrCreateGlobalLabel(labelInput.text, labelInput.color);
        return globalLabel.id;
      }).filter((id, index, self) => self.indexOf(id) === index); // Ensure unique IDs


      const newContext: Context = {
        id: generateId(),
        title: titleToUse,
        content: formData.content.trim(),
        labels: labelIdsForContext,
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
      };
      setContexts((prevContexts) => [...prevContexts, newContext]);
      showContextOperationNotification(toast, "Added", newContext.title, "default", `Context "${newContext.title}" (from paste) has been added.`);
    },
    [contexts, toast],
  );

  const updateContext = useCallback(
    (formData: ContextFormData) => {
      const contextId = formData.id;
      if (!contextId) {
          toast({ title: "Error", description: "Context ID missing for update.", variant: "destructive" });
          return false;
      }

      if (contexts.some(c => c.id !== contextId && c.title === formData.title.trim())) {
        toast({
          title: "Duplicate Title",
          description: `A context with the title "${formData.title.trim()}" already exists. Please choose a unique title.`,
          variant: "destructive",
        });
        return false;
      }
      
      const labelIdsForContext: string[] = formData.labels.map(labelInput => {
        const knownGlobalLabel = globalLabels.find(gl => gl.id === labelInput.id);
        if (knownGlobalLabel) {
            // User might have edited text/color of an existing global label via this context
            const updatedGlobalLabel = updateGlobalLabelDefinition(labelInput);
            return updatedGlobalLabel!.id; // Use the ID of the (potentially updated) global label
        } else {
            // This label was newly created in the modal (had a temp ID or no ID)
            // Or it's an old label whose ID is no longer in globalLabels (shouldn't happen if managed well)
            const globalLabel = findOrCreateGlobalLabel(labelInput.text, labelInput.color);
            return globalLabel.id;
        }
      }).filter((id, index, self) => self.indexOf(id) === index); // Ensure unique IDs


      const updatedContext: Context = {
        id: contextId,
        title: formData.title.trim(),
        content: formData.content.trim(),
        labels: labelIdsForContext,
      };

      setContexts((prevContexts) =>
        prevContexts.map((context) =>
          context.id === updatedContext.id ? updatedContext : context,
        ),
      );
      setSelectedContexts((prevSelectedContexts) =>
        prevSelectedContexts.map((context) =>
          context.id === updatedContext.id ? updatedContext : context, // Keep selected contexts in sync if they are edited
        ),
      );
      showContextOperationNotification(toast, "Updated", updatedContext.title);
      return true;
    },
    [contexts, globalLabels, toast, findOrCreateGlobalLabel, updateGlobalLabelDefinition],
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
        setSelectedContexts((prevSelectedContexts) =>
          prevSelectedContexts.filter((context) => !ids.includes(context.id)),
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
        showContextOperationNotification(toast, "RemovedFromPrompt", getGlobalLabelById(removedContext.labels[0])?.text || removedContext.title); // Example: show first label or title
      }
    },
    [selectedContexts, toast, getGlobalLabelById], // Added getGlobalLabelById dependency
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
      .map((context) => `# ${context.title}\n${context.content}`) // Assuming selectedContexts are full Context objects
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
    (context: Context) => {
      // Ensure context added to prompt is the full Context object, not just IDs
      const contextWithStrId = { ...context, id: String(context.id) };
      if (!selectedContexts.some((c) => c.id === contextWithStrId.id)) {
        setSelectedContexts((prevSelectedContexts) => [
          ...prevSelectedContexts,
          contextWithStrId, // Add the full context object
        ]);
        showContextOperationNotification(toast, "Selected", contextWithStrId.title);
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
    contexts, // These are Context[] with label IDs
    prompt,
    setPrompt,
    selectedContexts, // These are full Context[] used in the prompt
    addContext,
    addContextFromPaste,
    updateContext,
    deleteContext,
    removeContextFromPrompt,
    removeMultipleSelectedContextsFromPrompt,
    copyPromptWithContexts,
    addContextToPrompt,
    reorderSelectedContexts,
    deleteMultipleContexts,
    // Label specific functions
    getAllGlobalLabels,
    getGlobalLabelById,
    getResolvedContextLabels,
    // updateGlobalLabelDefinition, // Expose if direct global label editing UI is added later
  };
};

```

## Description
{{-   **Global Label State**: Added `globalLabels` state to store all unique `GlobalLabel` objects. This state is persisted to localStorage under `promptForge_globalLabels`.
-   **Context Label IDs**: Modified the `Context` type so `context.labels` is now an array of strings, storing the IDs of `GlobalLabel`s.
-   **Label Management Functions**:
    -   `getAllGlobalLabels()`: Returns all stored global labels.
    -   `getGlobalLabelById(id: string)`: Retrieves a global label by its ID.
    -   `getResolvedContextLabels(context: Context)`: Converts a context's label IDs into an array of full `GlobalLabel` objects.
    -   `findOrCreateGlobalLabel(labelText: string, labelColor: LabelColorValue)`: Finds an existing global label by text (case-insensitive). If found and color differs, it updates the color. If not found, it creates a new global label. Returns the `GlobalLabel` object.
    -   `updateGlobalLabelDefinition(updatedLabel: GlobalLabel)`: Updates an existing global label's text or color. Prevents creating duplicate labels by text.
-   **`addContext(formData: ContextFormData)`**:
    -   Processes `formData.labels` (which are `GlobalLabel` objects from the modal).
    -   For each label from the form, it either reuses an existing global label (matching by ID or by text/color if it's a new label from the modal) or creates a new global label via `findOrCreateGlobalLabel` or `updateGlobalLabelDefinition`.
    -   Stores an array of these final global label IDs in the new context's `labels` property.
-   **`updateContext(formData: ContextFormData)`**:
    -   Similar to `addContext`, it processes `formData.labels`.
    -   If a label from the form has an existing global ID, and its text/color has been changed in the modal, `updateGlobalLabelDefinition` is called to update the global label.
    -   If a label is new (temporary ID from modal), `findOrCreateGlobalLabel` is used.
    -   Updates the target context with the new title, content, and the processed list of global label IDs.
-   **Toast Notifications**: Added new `ContextOperation` types (`LabelAdded`, `LabelUpdated`) for better user feedback on label operations.
-   Helper `generateId` is now used for global label IDs as well.
-   Selected contexts (`selectedContexts`) are now stored as full `Context` objects to simplify display and operations in the prompt input area, though their `labels` field still contains IDs that would need resolving if displaying labels there. This part could be further refined if labels of selected contexts need to be shown with their text/color directly in the "Selected Contexts" table.}}

# File Changes: ./src/hooks/useLabelManager.ts

## Code
``` ts
import { useState, useCallback, useEffect } from "react";
import { GlobalLabel, LabelColorValue, PREDEFINED_LABEL_COLORS } from "../types";
import { useToast } from "./use-toast";

const generateClientLabelId = () => `client-temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

interface UseLabelManagerArgs {
  initialLabelsForContext: GlobalLabel[]; // Labels currently associated with the context
  allGlobalLabels: GlobalLabel[]; // All available global labels
}

export const useLabelManager = (args: UseLabelManagerArgs) => {
  const [currentContextLabels, setCurrentContextLabels] = useState<GlobalLabel[]>([]);
  const [availableGlobalLabelsToSelect, setAvailableGlobalLabelsToSelect] = useState<GlobalLabel[]>([]);
  
  const [newLabelText, setNewLabelText] = useState("");
  const [newLabelColor, setNewLabelColor] = useState<LabelColorValue>(PREDEFINED_LABEL_COLORS[0].value);
  const { toast } = useToast();

  useEffect(() => {
    setCurrentContextLabels(args.initialLabelsForContext);
  }, [args.initialLabelsForContext]);

  useEffect(() => {
    const contextLabelTexts = currentContextLabels.map(l => l.text.toLowerCase());
    setAvailableGlobalLabelsToSelect(
      args.allGlobalLabels.filter(gl => !contextLabelTexts.includes(gl.text.toLowerCase()))
    );
  }, [args.allGlobalLabels, currentContextLabels]);


  const initializeLabels = useCallback((initialCtxLabels: GlobalLabel[], allGlbLabels: GlobalLabel[]) => {
    setCurrentContextLabels(initialCtxLabels);
    const contextLabelTexts = initialCtxLabels.map(l => l.text.toLowerCase());
    setAvailableGlobalLabelsToSelect(
        allGlbLabels.filter(gl => !contextLabelTexts.includes(gl.text.toLowerCase()))
    );
    setNewLabelText("");
    setNewLabelColor(PREDEFINED_LABEL_COLORS[0].value);
  }, []);


  const handleAddNewLabelToContext = useCallback(() => {
    const text = newLabelText.trim();
    if (!text) {
      toast({ title: "Label text cannot be empty.", variant: "destructive" });
      return;
    }
    if (currentContextLabels.some(label => label.text.toLowerCase() === text.toLowerCase())) {
      toast({ title: `Label "${text}" is already added to this context.`, variant: "destructive" });
      return;
    }

    // Check if this new label text matches an existing global label (case-insensitive)
    const existingGlobalLabel = args.allGlobalLabels.find(gl => gl.text.toLowerCase() === text.toLowerCase());

    let labelToAdd: GlobalLabel;
    if (existingGlobalLabel) {
      // If it matches a global label by text, use that global label's definition but with the new color if different.
      // This implies the user wants to use the existing global label, possibly with a color override for this instance,
      // or it will be reconciled by useContexts to update the global color if it's a persistent change.
      labelToAdd = { ...existingGlobalLabel, color: newLabelColor };
       if (existingGlobalLabel.color !== newLabelColor) {
         toast({ title: "Info", description: `Label "${text}" exists globally. Color will be ${newLabelColor === existingGlobalLabel.color ? 'kept' : 'updated for this context (and potentially globally upon save)'}.`})
       }
    } else {
      // This is a completely new label (text does not exist globally)
      labelToAdd = { id: generateClientLabelId(), text, color: newLabelColor };
    }
    
    setCurrentContextLabels(prev => [...prev, labelToAdd]);
    setNewLabelText("");
    // Optionally reset newLabelColor or keep it for next label
  }, [newLabelText, newLabelColor, currentContextLabels, args.allGlobalLabels, toast]);

  const handleSelectGlobalLabelForContext = useCallback((globalLabel: GlobalLabel) => {
    if (!currentContextLabels.some(l => l.id === globalLabel.id || l.text.toLowerCase() === globalLabel.text.toLowerCase())) {
      setCurrentContextLabels(prev => [...prev, globalLabel]);
    } else {
      toast({ title: "Label already selected", description: `Label "${globalLabel.text}" is already part of this context.`, variant: "default"});
    }
  }, [currentContextLabels, toast]);


  const handleRemoveLabelFromContext = useCallback((labelIdToRemove: string) => {
    setCurrentContextLabels(prev => prev.filter(label => label.id !== labelIdToRemove));
  }, []);

  // Called when a label chip's text or color is modified in the UI
  const handleUpdateLabelDetailsInContext = useCallback((updatedLabel: GlobalLabel) => {
    // Prevent duplicate text if renaming
    const otherLabels = currentContextLabels.filter(l => l.id !== updatedLabel.id);
    if (otherLabels.some(l => l.text.toLowerCase() === updatedLabel.text.trim().toLowerCase())) {
        toast({ title: "Duplicate Label Text", description: `Another label in this context already has the text "${updatedLabel.text.trim()}".`, variant: "destructive" });
        // Revert to original text of this specific label before edit attempt
        const originalLabel = args.initialLabelsForContext.find(l => l.id === updatedLabel.id) || args.allGlobalLabels.find(l=>l.id === updatedLabel.id);
        if (originalLabel) {
             setCurrentContextLabels(prev => prev.map(label =>
                label.id === updatedLabel.id ? { ...label, text: originalLabel.text } : label
            ));
        }
        return;
    }

    setCurrentContextLabels(prev => prev.map(label =>
      label.id === updatedLabel.id ? { ...label, text: updatedLabel.text.trim(), color: updatedLabel.color } : label
    ));
  }, [currentContextLabels, toast, args.initialLabelsForContext, args.allGlobalLabels]);


  const getLabelsForSave = useCallback((): GlobalLabel[] => {
    // Filter out labels with empty text before saving
    return currentContextLabels.filter(label => label.text.trim() !== "");
  }, [currentContextLabels]);


  return {
    currentContextLabels,
    availableGlobalLabelsToSelect,
    newLabelText,
    setNewLabelText,
    newLabelColor,
    setNewLabelColor,
    initializeLabels, // Expose if needed for external re-init
    handleAddNewLabelToContext, // For "Create & Add new label" button
    handleSelectGlobalLabelForContext, // For selecting from dropdown of global labels
    handleRemoveLabelFromContext, // For removing a label chip from context
    handleUpdateLabelDetailsInContext, // For editing text/color of a label chip
    getLabelsForSave,
  };
};

```

## Description
{{This hook now manages labels for a specific context being added or edited.
-   **State**:
    -   `currentContextLabels`: An array of `GlobalLabel` objects that are currently associated with the context in the modal.
    -   `availableGlobalLabelsToSelect`: Global labels that are not yet part of `currentContextLabels` (based on text).
    -   `newLabelText`, `newLabelColor`: For creating a new label entry.
-   **Initialization**: `useEffect` hooks manage the `currentContextLabels` and `availableGlobalLabelsToSelect` based on props. `initializeLabels` can be called to reset/re-initialize.
-   **`handleAddNewLabelToContext`**:
    -   Handles adding a new label typed by the user.
    -   If the text matches an existing global label, it uses that global label's data (potentially with the modal's chosen color, which will be reconciled by `useContexts`).
    -   If it's a new text, a temporary client-side ID is generated.
-   **`handleSelectGlobalLabelForContext`**: Adds a selected global label to `currentContextLabels`.
-   **`handleRemoveLabelFromContext`**: Removes a label from `currentContextLabels`.
-   **`handleUpdateLabelDetailsInContext`**: Updates the text or color of a label within `currentContextLabels`. It also prevents duplicate label text within the current context during renaming. The ID (global or temporary) is preserved.
-   **`getLabelsForSave`**: Returns the `currentContextLabels` (filtered for empty text). This array of `GlobalLabel` objects is then passed to `useContexts` for final processing (creating/updating global definitions and associating IDs with the context).
-   Uses `generateClientLabelId` for temporary IDs of new labels created in the modal before they are reconciled with the global label store.
-   Provides better feedback to the user, e.g., if a label text already exists.
}}

# File Changes: ./src/components/LabelManager.tsx

## Code
``` tsx
import React from "react";
import { GlobalLabel, PREDEFINED_LABEL_COLORS, LabelColorValue } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X as XIcon, PlusCircle, Edit3, Palette, Check, ChevronsUpDown } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";
import { cn } from "@/lib/utils";

interface LabelManagerUIProps {
  // Labels currently attached to the context being edited/created
  currentContextLabels: GlobalLabel[];
  // Callback to update a label's details (text/color) in the parent hook
  onUpdateLabelDetails: (updatedLabel: GlobalLabel) => void;
  // Callback to remove a label from the current context
  onRemoveLabelFromContext: (labelId: string) => void;

  // For adding a brand new label (text+color input)
  newLabelText: string;
  setNewLabelText: (text: string) => void;
  newLabelColor: LabelColorValue;
  setNewLabelColor: (color: LabelColorValue) => void;
  onAddNewLabelToContext: () => void; // Adds the newLabelText/Color to currentContextLabels

  // For selecting from existing global labels
  availableGlobalLabels: GlobalLabel[];
  onSelectGlobalLabel: (globalLabel: GlobalLabel) => void;
}

const LabelManagerUI: React.FC<LabelManagerUIProps> = ({
  currentContextLabels,
  onUpdateLabelDetails,
  onRemoveLabelFromContext,
  newLabelText,
  setNewLabelText,
  newLabelColor,
  setNewLabelColor,
  onAddNewLabelToContext,
  availableGlobalLabels,
  onSelectGlobalLabel,
}) => {
  const [editingLabelId, setEditingLabelId] = React.useState<string | null>(null);
  const [editText, setEditText] = React.useState("");
  const [popoverOpen, setPopoverOpen] = React.useState(false);

  const handleStartEdit = (label: GlobalLabel) => {
    setEditingLabelId(label.id);
    setEditText(label.text);
  };

  const handleSaveEdit = (labelId: string) => {
    const labelToUpdate = currentContextLabels.find(l => l.id === labelId);
    if (labelToUpdate && editText.trim()) {
      onUpdateLabelDetails({ ...labelToUpdate, text: editText.trim() });
    }
    setEditingLabelId(null);
  };

  const handleCancelEdit = () => {
    setEditingLabelId(null);
    setEditText("");
  };
  
  const handleColorChange = (label: GlobalLabel, newColor: LabelColorValue) => {
    onUpdateLabelDetails({ ...label, color: newColor });
  };

  return (
    <div className="flex flex-col gap-3 border border-muted p-3 rounded-md">
      {/* Section for adding/selecting labels */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium text-foreground">Manage Labels for this Context</Label>
        <div className="flex items-end gap-2">
          {/* Input for new label text */}
          <div className="flex-grow">
            <Label htmlFor="newLabelText" className="sr-only">New Label Text</Label>
            <Input
              id="newLabelText"
              value={newLabelText}
              onChange={(e) => setNewLabelText(e.target.value)}
              placeholder="Create new label text"
              className="h-9"
            />
          </div>
          {/* Color picker for new label */}
          <div>
            <Label htmlFor="newLabelColor" className="sr-only">New Label Color</Label>
            <Select value={newLabelColor} onValueChange={(v) => setNewLabelColor(v as LabelColorValue)}>
              <SelectTrigger id="newLabelColor" className="h-9 w-[120px]">
                <SelectValue placeholder="Color" />
              </SelectTrigger>
              <SelectContent>
                {PREDEFINED_LABEL_COLORS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block h-3 w-3 rounded-full ${opt.twBgClass}`} />
                      {opt.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Button to add the new typed label */}
          <Button type="button" size="icon" className="h-9 w-9" onClick={onAddNewLabelToContext} variant="outline" title="Add new label to context">
            <PlusCircle className="h-4 w-4" />
            <span className="sr-only">Add New Label to Context</span>
          </Button>
        </div>
        
        {/* Popover for selecting from existing global labels */}
        {availableGlobalLabels.length > 0 && (
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={popoverOpen}
                        className="w-full justify-between h-9 font-normal"
                    >
                        Select from existing global labels...
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0 max-h-60 overflow-y-auto">
                    <Command>
                        <CommandInput placeholder="Search global labels..." />
                        <CommandList>
                            <CommandEmpty>No global labels found.</CommandEmpty>
                            <CommandGroup>
                                {availableGlobalLabels.map((globalLabel) => (
                                    <CommandItem
                                        key={globalLabel.id}
                                        value={globalLabel.text}
                                        onSelect={() => {
                                            onSelectGlobalLabel(globalLabel);
                                            setPopoverOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                currentContextLabels.find(l => l.id === globalLabel.id) ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <span className={`mr-2 inline-block h-2.5 w-2.5 rounded-full ${PREDEFINED_LABEL_COLORS.find(c => c.value === globalLabel.color)?.twBgClass}`} />
                                        {globalLabel.text}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        )}
      </div>

      {/* Display current context labels */}
      {currentContextLabels.length > 0 && (
        <ScrollArea className="max-h-[150px] pr-2">
          <div className="space-y-1.5 mt-1">
            {currentContextLabels.map((label) => {
              const colorInfo = PREDEFINED_LABEL_COLORS.find(c => c.value === label.color);
              return (
                <div key={label.id} className="flex items-center justify-between gap-2 text-xs p-1.5 rounded-md border bg-muted/30">
                  {editingLabelId === label.id ? (
                    <div className="flex-grow flex items-center gap-1">
                      <Input 
                        value={editText} 
                        onChange={(e) => setEditText(e.target.value)}
                        onBlur={() => handleSaveEdit(label.id)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(label.id); if (e.key === 'Escape') handleCancelEdit(); }}
                        className="h-6 text-xs flex-grow"
                        autoFocus
                      />
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => handleSaveEdit(label.id)}><Check className="h-3 w-3"/></Button>
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleCancelEdit}><XIcon className="h-3 w-3"/></Button>
                    </div>
                  ) : (
                    <span 
                        className={`px-2 py-0.5 rounded-full text-xs font-medium border cursor-pointer hover:opacity-80 ${colorInfo?.twChipClass || 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-500'}`}
                        onClick={() => handleStartEdit(label)}
                        title={`Edit label "${label.text}"`}
                    >
                      {label.text}
                    </span>
                  )}
                  
                  <div className="flex items-center gap-1">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-5 w-5" title={`Change color for "${label.text}"`}>
                                <Palette className="h-3 w-3" style={{color: label.color === "yellow" && PREDEFINED_LABEL_COLORS.find(c => c.value === "yellow") ? 'black' : label.color}}/>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-1">
                            <div className="flex gap-1">
                            {PREDEFINED_LABEL_COLORS.map(colorOpt => (
                                <Button
                                    key={colorOpt.value}
                                    variant="outline"
                                    size="icon"
                                    className={`h-6 w-6 rounded-full border-2 ${label.color === colorOpt.value ? 'border-primary' : 'border-transparent'}`}
                                    style={{ backgroundColor: PREDEFINED_LABEL_COLORS.find(c => c.value === colorOpt.value)?.twBgClass.replace('bg-','')}}
                                    onClick={() => handleColorChange(label, colorOpt.value)}
                                    title={colorOpt.name}
                                >
                                  {label.color === colorOpt.value && <Check className="h-3 w-3" style={{color: label.color === 'yellow' ? 'black': 'white'}}/>}
                                </Button>
                            ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-muted-foreground hover:text-destructive"
                      onClick={() => onRemoveLabelFromContext(label.id)}
                      title={`Remove label "${label.text}" from this context`}
                    >
                      <XIcon className="h-3 w-3" />
                      <span className="sr-only">Remove label {label.text}</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
      {currentContextLabels.length === 0 && <p className="text-xs text-muted-foreground text-center py-1">No labels attached to this context.</p>}
    </div>
  );
};

export default LabelManagerUI;

```

## Description
{{This new component centralizes the UI for managing labels within the Add/Edit context modals.
-   **Props**:
    -   `currentContextLabels`: Labels currently associated with the context.
    -   `onUpdateLabelDetails`: Callback to handle changes to a label's text or color.
    -   `onRemoveLabelFromContext`: Callback to remove a label from the current context.
    -   `newLabelText`, `setNewLabelText`, `newLabelColor`, `setNewLabelColor`, `onAddNewLabelToContext`: For creating and adding a new label to the context.
    -   `availableGlobalLabels`: All global labels available for selection.
    -   `onSelectGlobalLabel`: Callback when a user selects a global label to add to the context.
-   **Functionality**:
    -   **Create New Label**: Input field for text, a color `Select` dropdown, and an "Add" button to add a new label to `currentContextLabels`.
    -   **Select Existing Global Label**: A `Popover` containing a `Command` component (searchable list) displays `availableGlobalLabels`. Selecting a label calls `onSelectGlobalLabel`.
    -   **Display Current Labels**: `currentContextLabels` are displayed as chips.
        -   **Edit Text**: Clicking a label chip's text makes it editable in an `Input` field. Saving or blurring updates the text via `onUpdateLabelDetails`.
        -   **Edit Color**: Each chip has a `Popover` with color swatches to change the label's color, calling `onUpdateLabelDetails`.
        -   **Remove**: An "X" button on each chip calls `onRemoveLabelFromContext`.
-   **State**: Manages `editingLabelId` and `editText` for inline editing of label text, and `popoverOpen` for the global label selector.
-   This component provides a comprehensive UI for the label management requirements, promoting reuse and allowing edits that will be synced globally by `useContexts`.}}

# File Changes: ./src/components/AddContextModal.tsx

## Code
``` tsx
import React, { useState, useEffect } from "react";
import { ContextFormData, PREDEFINED_LABEL_COLORS, LabelColorValue, GlobalLabel } from "../types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLabelManager } from "@/hooks/useLabelManager";
import LabelManagerUI from "./LabelManager";


interface AddContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newContextData: ContextFormData) => void;
  allGlobalLabels: GlobalLabel[];
}

const AddContextModal: React.FC<AddContextModalProps> = ({
  isOpen,
  onClose,
  onSave,
  allGlobalLabels,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  
  const labelManager = useLabelManager({
    initialLabelsForContext: [],
    allGlobalLabels: allGlobalLabels,
  });

  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setContent("");
      // Reset label manager with current global labels, and empty initial context labels
      labelManager.initializeLabels([], allGlobalLabels);
    }
  }, [isOpen, allGlobalLabels, labelManager]);


  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const finalTitle = title.trim();
    const finalContent = content.trim();

    if (!finalTitle && !finalContent) {
      toast({
        title: "Empty Context",
        description: "Both title and content are empty. Please add some content or a title.",
        variant: "destructive",
      });
      return;
    }
    if (!finalContent && finalTitle) { // Content can be empty if title is not
        // Allow this case, or add specific validation if content must exist
    } else if (!finalContent) {
         toast({
        title: "Empty Content",
        description: "Content cannot be empty if title is also blank or nearly blank.",
        variant: "destructive",
      });
      return;
    }


    onSave({
      title: finalTitle,
      content: finalContent,
      labels: labelManager.getLabelsForSave(),
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-muted h-auto max-h-[85vh] max-w-screen-lg flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-primary">Add New Context</DialogTitle>
          <DialogDescription className="text-foreground">
            Create a new context snippet to use in your prompts. Title will be
            auto-generated if left blank. Labels can be created or selected from global list.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 overflow-hidden">
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (optional, will be auto-generated if blank)"
          />
          
          <LabelManagerUI
            currentContextLabels={labelManager.currentContextLabels}
            onUpdateLabelDetails={labelManager.handleUpdateLabelDetailsInContext}
            onRemoveLabelFromContext={labelManager.handleRemoveLabelFromContext}
            newLabelText={labelManager.newLabelText}
            setNewLabelText={labelManager.setNewLabelText}
            newLabelColor={labelManager.newLabelColor}
            setNewLabelColor={labelManager.setNewLabelColor}
            onAddNewLabelToContext={labelManager.handleAddNewLabelToContext}
            availableGlobalLabels={labelManager.availableGlobalLabelsToSelect}
            onSelectGlobalLabel={labelManager.handleSelectGlobalLabelForContext}
          />

          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 min-h-[150px] resize-none"
            placeholder="Paste your context content here."
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Add Context</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddContextModal;

```

## Description
{{-   **Props Update**: `AddContextModalProps` now takes `allGlobalLabels: GlobalLabel[]` to pass to `useLabelManager`. The `onSave` callback now expects `ContextFormData`.
-   **Label Management Integration**:
    -   Uses the `useLabelManager` hook, initializing it with an empty array for `initialLabelsForContext` and the passed `allGlobalLabels`.
    -   The `useEffect` hook ensures that `labelManager.initializeLabels` is called when the modal opens or `allGlobalLabels` changes, correctly setting up the label manager for a new context.
-   **UI Component**: Replaced the previous inline label input fields with the new `LabelManagerUI` component. This component is provided with all necessary state and handlers from `labelManager`.
-   **Save Logic**:
    -   When the form is submitted, `labelManager.getLabelsForSave()` is called to get the array of `GlobalLabel` objects (which include temporary IDs for new labels or existing global IDs for selected/edited ones).
    -   This array is then passed in the `ContextFormData` object to the `onSave` prop, which will be handled by `useContexts` to create/update global labels and associate them with the new context.
-   Validation for empty content when title is also nearly empty is slightly adjusted. Content can be empty if a title is provided.}}

# File Changes: ./src/components/EditContextModal.tsx

## Code
``` tsx
import React, { useState, useEffect } from "react";
import { Context, ContextFormData, PREDEFINED_LABEL_COLORS, LabelColorValue, GlobalLabel } from "../types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLabelManager } from "@/hooks/useLabelManager";
import LabelManagerUI from "./LabelManager";

interface EditContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedContextData: ContextFormData) => void;
  context: Context | null;
  allGlobalLabels: GlobalLabel[];
  getGlobalLabelById: (id: string) => GlobalLabel | undefined;
}

const EditContextModal: React.FC<EditContextModalProps> = ({
  isOpen,
  onClose,
  onSave,
  context,
  allGlobalLabels,
  getGlobalLabelById,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const initialLabelsForThisContext = React.useMemo(() => {
    if (!context) return [];
    return context.labels
      .map(id => getGlobalLabelById(id))
      .filter(Boolean) as GlobalLabel[];
  }, [context, getGlobalLabelById]);

  const labelManager = useLabelManager({
    initialLabelsForContext: initialLabelsForThisContext,
    allGlobalLabels: allGlobalLabels,
  });
  
  const { toast } = useToast();

  useEffect(() => {
    if (context && isOpen) {
      setTitle(context.title);
      setContent(context.content);
      const resolvedInitialLabels = context.labels
        .map(id => getGlobalLabelById(id))
        .filter(Boolean) as GlobalLabel[];
      labelManager.initializeLabels(resolvedInitialLabels, allGlobalLabels);
    }
  }, [context, isOpen, allGlobalLabels, getGlobalLabelById, labelManager]);

  if (!isOpen || !context) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) {
      toast({ title: "Title Required", description: "Title cannot be empty.", variant: "destructive" });
      return;
    }
    if (!trimmedContent) {
      toast({ title: "Content Required", description: "Content cannot be empty.", variant: "destructive" });
      return;
    }

    onSave({
      id: context.id, // Include context ID for update
      title: trimmedTitle,
      content: trimmedContent,
      labels: labelManager.getLabelsForSave(),
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-muted h-auto max-h-[85vh] max-w-screen-lg flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-primary">Edit Context</DialogTitle>
          <DialogDescription className="text-foreground">
            Modify the title, content, or labels of your context snippet. Changes to labels may affect other contexts.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 overflow-hidden">
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
          />

          <LabelManagerUI
            currentContextLabels={labelManager.currentContextLabels}
            onUpdateLabelDetails={labelManager.handleUpdateLabelDetailsInContext}
            onRemoveLabelFromContext={labelManager.handleRemoveLabelFromContext}
            newLabelText={labelManager.newLabelText}
            setNewLabelText={labelManager.setNewLabelText}
            newLabelColor={labelManager.newLabelColor}
            setNewLabelColor={labelManager.setNewLabelColor}
            onAddNewLabelToContext={labelManager.handleAddNewLabelToContext}
            availableGlobalLabels={labelManager.availableGlobalLabelsToSelect}
            onSelectGlobalLabel={labelManager.handleSelectGlobalLabelForContext}
          />

          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 min-h-[150px] resize-none"
            placeholder="Paste your context content here."
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditContextModal;

```

## Description
{{-   **Props Update**: `EditContextModalProps` now includes `allGlobalLabels` and `getGlobalLabelById` for label management. The `onSave` callback expects `ContextFormData`.
-   **Label Management Integration**:
    -   `initialLabelsForThisContext` is derived by resolving the `context.labels` (which are IDs) to full `GlobalLabel` objects using `getGlobalLabelById`.
    -   The `useLabelManager` hook is initialized with these resolved labels and `allGlobalLabels`.
    -   The `useEffect` hook re-initializes the `labelManager` when the modal opens or relevant props change, ensuring the label state is correct for the context being edited.
-   **UI Component**: Uses the `LabelManagerUI` component, passing it the state and handlers from `labelManager`. This provides a consistent UI for label management across Add and Edit modals.
-   **Save Logic**:
    -   On form submission, `labelManager.getLabelsForSave()` retrieves the current list of `GlobalLabel` objects associated with the context in the modal.
    -   These labels, along with the context `id`, title, and content, are passed as `ContextFormData` to the `onSave` callback. `useContexts` will then handle updating the global label definitions (if any label's text/color was changed) and updating the context's label associations.
-   The dialog description now hints that label changes might be global.}}

# File Changes: ./src/components/ContextsDataTableColumns.tsx

## Code
``` tsx
import { ColumnDef } from "@tanstack/react-table";
import { Context, GlobalLabel, PREDEFINED_LABEL_COLORS } from "../types"; // Added GlobalLabel
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit3, Trash2 } from "lucide-react";

export type ContextsTableMeta = {
  onEditContext: (context: Context) => void;
  onDeleteContext: (id: string) => void;
  // Function to resolve label IDs to GlobalLabel objects
  getResolvedLabels: (labelIds: string[]) => GlobalLabel[]; 
};

// Helper function to format character count
const formatCharCount = (count: number): string => {
  if (count < 1000) {
    return String(count);
  }
  if (count < 1_000_000) {
    const num = Math.floor(count / 1000);
    return `${num}k`;
  }
  const num = Math.floor(count / 1_000_000);
  return `${num}M`;
};

export const getContextsTableColumns = (): ColumnDef<Context>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
    minSize: 40,
    maxSize: 40,
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span className="font-medium truncate" title={row.getValue("title")}>
            {row.getValue("title")}
          </span>
        </div>
      );
    },
    minSize: 300,
  },
  {
    accessorKey: "labels",
    header: "Labels",
    // AccessorFn for filtering: joins resolved label texts.
    accessorFn: (row, index) => {
        const tableMeta = row.table.options.meta as ContextsTableMeta | undefined;
        if (tableMeta?.getResolvedLabels) {
            const resolved = tableMeta.getResolvedLabels(row.labels);
            return resolved.map(l => l.text).join(" ");
        }
        return "";
    },
    cell: ({ row, table }) => {
      // Use meta function to resolve label IDs to GlobalLabel objects
      const tableMeta = table.options.meta as ContextsTableMeta | undefined;
      const resolvedLabels = tableMeta?.getResolvedLabels ? tableMeta.getResolvedLabels(row.original.labels) : [];

      if (!resolvedLabels || resolvedLabels.length === 0) {
        return <span className="text-xs text-muted-foreground italic">No labels</span>;
      }
      return (
        <div className="flex flex-wrap gap-1 items-center max-w-[250px] overflow-hidden">
          {resolvedLabels.map((label) => {
            const colorInfo = PREDEFINED_LABEL_COLORS.find(c => c.value === label.color);
            return (
              <span
                key={label.id} // Use global label ID as key
                title={label.text}
                className={`px-1.5 py-0.5 rounded-full text-xs font-medium border truncate ${colorInfo?.twChipClass || 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-500'}`}
              >
                {label.text}
              </span>
            );
          })}
        </div>
      );
    },
    minSize: 150,
    maxSize: 300,
    enableSorting: false,
  },
  {
    accessorFn: (row) => row.content.length,
    id: "charCount",
    header: "Chars",
    cell: ({ row }) => {
      const charCount = row.original.content.length;
      return (
        <div className="text-center" title={String(charCount)}>
          {formatCharCount(charCount)}
        </div>
      );
    },
    enableSorting: true,
    size: 80,
    minSize: 60,
    maxSize: 100,
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const context = row.original;
      const meta = table.options.meta as ContextsTableMeta | undefined;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="border-secondary">
            <DropdownMenuItem onClick={() => meta?.onEditContext(context)}>
              <Edit3 className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => meta?.onDeleteContext(context.id)}
              className="text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: 60,
    minSize: 60,
    maxSize: 60,
    enableSorting: false,
  },
];

```

## Description
{{-   **`ContextsTableMeta` Update**: Added `getResolvedLabels: (labelIds: string[]) => GlobalLabel[]` to the table's meta type. This function will be provided by `ContextsLibrary.tsx` and allows the columns to resolve label IDs into full `GlobalLabel` objects for display and filtering.
-   **Labels Column (`accessorKey: "labels"`)**:
    -   **`accessorFn`**: Modified to use `table.options.meta.getResolvedLabels` to get the actual label texts. This allows the table's global filter to search by label text.
    -   **`cell`**: Now uses `table.options.meta.getResolvedLabels` to get the `GlobalLabel` objects from the `row.original.labels` (which are IDs). It then renders the label chips using the text and color from these resolved global label objects. The `key` for mapped labels now uses `label.id` (the global ID).
-   This change ensures that the "Labels" column correctly displays the text and color of globally managed labels and that filtering by label text works as expected.}}

# File Changes: ./src/components/ContextsLibrary.tsx

## Code
``` tsx
import React, { useState, useCallback } from "react";
import { Context, GlobalLabel } from "../types"; // Added GlobalLabel
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggler } from "./ThemeToggler";
import { ContextsDataTable } from "./ContextsDataTable";
import { getContextsTableColumns, ContextsTableMeta } from "./ContextsDataTableColumns"; // Added ContextsTableMeta

interface ContextsLibraryProps {
  contexts: Context[];
  onAddContextButtonClick: () => void;
  onEditContext: (context: Context) => void;
  onDeleteContext: (id: string) => void;
  onDeleteSelectedContexts: (ids: string[]) => void;
  onPasteToAdd: (pastedText: string) => void;
  isFocused: boolean;
  onFocus: () => void;
  onAddSelectedToPrompt: (selectedContexts: Context[]) => void;
  // For resolving label IDs to GlobalLabel objects for the table
  getResolvedLabels: (labelIds: string[]) => GlobalLabel[]; 
}

const ContextsLibrary: React.FC<ContextsLibraryProps> = ({
  contexts,
  onAddContextButtonClick,
  onEditContext,
  onDeleteContext,
  onDeleteSelectedContexts,
  onPasteToAdd,
  isFocused,
  onFocus,
  onAddSelectedToPrompt,
  getResolvedLabels, // Destructure new prop
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Pass getResolvedLabels to table meta
  const tableMeta: ContextsTableMeta = {
    onEditContext,
    onDeleteContext,
    getResolvedLabels,
  };

  const columns = React.useMemo(() => getContextsTableColumns(), []);


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
          onPasteToAdd(pastedText);
        } else {
          toast({
            title: "Paste Error",
            description: "Pasted content is empty.",
            variant: "destructive",
          });
        }
      }
    },
    [isFocused, onPasteToAdd, toast],
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
        columns={columns}
        data={contexts}
        // Pass the extended tableMeta here
        tableMeta={tableMeta} 
        onEditContext={onEditContext} // Kept for compatibility if table directly uses them, but meta is preferred
        onDeleteContext={onDeleteContext} // Kept for compatibility
        onDeleteSelectedContexts={onDeleteSelectedContexts}
        onAddSelectedToPrompt={onAddSelectedToPrompt}
        searchQuery={searchTerm}
        setSearchQuery={setSearchTerm}
      />

      <Button variant="default" onClick={onAddContextButtonClick}>
        <Plus className="mr-2 h-4 w-4" />
        Add Context
      </Button>
    </div>
  );
};

export default ContextsLibrary;

```

## Description
{{-   **Props Update**: `ContextsLibraryProps` now includes `getResolvedLabels: (labelIds: string[]) => GlobalLabel[]`. This function is passed down from `PromptEditor.tsx` (where it's obtained from `useContexts`).
-   **`ContextsTableMeta` Update**: The `tableMeta` object passed to `ContextsDataTable` now includes the `getResolvedLabels` function. This allows the data table columns (specifically the "Labels" column) to resolve label IDs stored in `Context` objects into full `GlobalLabel` objects for display and filtering.
-   The `ContextsDataTable` component was also updated to accept `tableMeta` as a prop to properly pass this down. (This change is implicit as the `ContextsDataTable` already had a `meta` prop in its `useReactTable` options, which `tableMeta` will populate).}}

# File Changes: ./src/components/PromptEditor.tsx

## Code
``` tsx
import React, { useState, useCallback } from "react";
import { useContexts } from "../hooks/useContexts";
import { Context, ContextFormData, GlobalLabel } from "../types"; // Added GlobalLabel
import PromptInput from "./PromptInput";
import ContextsLibrary from "./ContextsLibrary";
import AddContextModal from "./AddContextModal";
import EditContextModal from "./EditContextModal";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LucideAnvil } from "lucide-react";

const FOCUSED_PANE_PROMPT_INPUT = "promptInputArea";
const FOCUSED_PANE_CONTEXT_LIBRARY = "contextLibraryArea";


const PromptEditor: React.FC = () => {
  const {
    contexts,
    prompt,
    setPrompt,
    selectedContexts,
    addContext,
    addContextFromPaste,
    updateContext,
    deleteContext,
    deleteMultipleContexts,
    removeContextFromPrompt,
    removeMultipleSelectedContextsFromPrompt,
    copyPromptWithContexts,
    addContextToPrompt,
    reorderSelectedContexts,
    // Label-related functions from useContexts
    getAllGlobalLabels,
    getGlobalLabelById,
    getResolvedContextLabels,
  } = useContexts();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingContext, setEditingContext] = useState<Context | null>(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [contextToDeleteId, setContextToDeleteId] = useState<string | null>(
    null,
  );
  const [deleteMultipleConfirmationOpen, setDeleteMultipleConfirmationOpen] = useState(false);
  const [contextsToDeleteIds, setContextsToDeleteIds] = useState<string[]>([]);

  const { toast } = useToast();
  const [focusedArea, setFocusedArea] = useState<string>(
    FOCUSED_PANE_PROMPT_INPUT,
  );

  const handleCopy = () => {
    copyPromptWithContexts();
  };

  const handleAddContextButtonClick = () => {
    setAddModalOpen(true);
  };

  const handleEditContext = (context: Context) => {
    setEditingContext(context);
    setEditModalOpen(true);
  };

  const handleDeleteContextRequest = (id: string) => {
    setContextToDeleteId(id);
    setDeleteConfirmationOpen(true);
  };

  const confirmDeleteContext = () => {
    if (contextToDeleteId) {
      deleteContext(contextToDeleteId);
    }
    setDeleteConfirmationOpen(false);
    setContextToDeleteId(null);
  };

  const handleDeleteMultipleContextsRequest = (ids: string[]) => {
    if (ids.length === 0) return;
    setContextsToDeleteIds(ids);
    setDeleteMultipleConfirmationOpen(true);
  };

  const confirmDeleteMultipleContexts = () => {
    if (contextsToDeleteIds.length > 0) {
      deleteMultipleContexts(contextsToDeleteIds);
    }
    setDeleteMultipleConfirmationOpen(false);
    setContextsToDeleteIds([]);
  };

  const handleSaveNewContext = (newContextData: ContextFormData) => {
    const success = addContext(newContextData);
    if (success) {
      setAddModalOpen(false);
    }
  };

  const handleSaveEdit = (updatedContextData: ContextFormData) => {
    const success = updateContext(updatedContextData);
    if (success) {
      setEditModalOpen(false);
      setEditingContext(null);
    }
  };

  const handlePasteToLibrary = (pastedText: string) => {
    addContextFromPaste(pastedText);
  };

  const handleAddSelectedContextsToPrompt = (contextsToAdd: Context[]) => {
    let countAdded = 0;
    contextsToAdd.forEach(context => {
      const alreadySelected = selectedContexts.some(sc => sc.id === context.id);
      if (!alreadySelected) {
        addContextToPrompt(context);
        countAdded++;
      }
    });

    if (contextsToAdd.length > 1) {
      if (countAdded > 0) {
        toast({
          title: "Contexts Processed",
          description: `${countAdded} new context(s) added to prompt. ${contextsToAdd.length - countAdded > 0 ? `${contextsToAdd.length - countAdded} were already selected.` : ''}`,
        });
      } else {
        toast({
          title: "No New Contexts Added",
          description: `All selected contexts were already in the prompt.`,
          variant: "default",
        });
      }
    } else if (contextsToAdd.length === 1 && countAdded === 0) {
      // Single item was already selected, addContextToPrompt handles this toast
    }
  };

  const handleDeleteMultipleSelectedFromPrompt = (ids: string[]) => {
    removeMultipleSelectedContextsFromPrompt(ids);
  };

  return (
    <div className="h-full w-full max-w-screen-2xl">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel
          defaultSize={60}
          minSize={30}
          className="flex flex-col p-4"
        >
          <div className="flex flex-row mb-4">
            <LucideAnvil className="h-9 w-9 mr-3" />
            <h1 className="font-semibold text-3xl"> Prompt Forge</h1>
          </div>

          <div className="flex-grow  relative">
            <PromptInput
              value={prompt}
              onChange={setPrompt}
              selectedContexts={selectedContexts}
              onRemoveContext={removeContextFromPrompt}
              onCopyPromptAndContextsClick={handleCopy}
              onFocus={() => setFocusedArea(FOCUSED_PANE_PROMPT_INPUT)}
              onReorderContexts={reorderSelectedContexts}
              onDeleteMultipleFromPrompt={handleDeleteMultipleSelectedFromPrompt}
              // Pass label-related data/functions to PromptInput if needed for display
              getResolvedLabelsForContext={getResolvedContextLabels}
            />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          defaultSize={40}
          minSize={25}
          className="flex flex-col"
        >
          <ContextsLibrary
            contexts={contexts}
            onAddContextButtonClick={handleAddContextButtonClick}
            onEditContext={handleEditContext}
            onDeleteContext={handleDeleteContextRequest}
            onDeleteSelectedContexts={handleDeleteMultipleContextsRequest}
            onPasteToAdd={handlePasteToLibrary}
            isFocused={focusedArea === FOCUSED_PANE_CONTEXT_LIBRARY}
            onFocus={() => setFocusedArea(FOCUSED_PANE_CONTEXT_LIBRARY)}
            onAddSelectedToPrompt={handleAddSelectedContextsToPrompt}
            // Pass the function to resolve label IDs for the table
            getResolvedLabels={getResolvedContextLabels} 
          />
        </ResizablePanel>
      </ResizablePanelGroup>

      <AddContextModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleSaveNewContext}
        allGlobalLabels={getAllGlobalLabels()}
      />
      {editingContext && (
        <EditContextModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditingContext(null);
          }}
          onSave={handleSaveEdit}
          context={editingContext}
          allGlobalLabels={getAllGlobalLabels()}
          getGlobalLabelById={getGlobalLabelById}
        />
      )}
      <AlertDialog
        open={deleteConfirmationOpen}
        onOpenChange={setDeleteConfirmationOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-primary">
              Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              context "
              {contexts.find((c) => c.id === contextToDeleteId)?.title ||
                "this context"}
              " from the library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setContextToDeleteId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteContext}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={deleteMultipleConfirmationOpen}
        onOpenChange={setDeleteMultipleConfirmationOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-primary">
              Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              {contextsToDeleteIds.length} context(s) from the library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setContextsToDeleteIds([])}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteMultipleContexts}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PromptEditor;

```

## Description
{{-   **Label Functions from `useContexts`**: Destructured `getAllGlobalLabels`, `getGlobalLabelById`, and `getResolvedContextLabels` from the `useContexts` hook.
-   **Passing Label Data to Modals**:
    -   `AddContextModal`: Now receives `allGlobalLabels={getAllGlobalLabels()}`.
    -   `EditContextModal`: Now receives `allGlobalLabels={getAllGlobalLabels()}` and `getGlobalLabelById={getGlobalLabelById}`. This allows the edit modal to resolve the current context's label IDs to full `GlobalLabel` objects and to provide the `useLabelManager` with all available global labels.
-   **Passing `getResolvedLabels` to `ContextsLibrary`**: The `getResolvedContextLabels` function (renamed to `getResolvedLabels` for the prop) is passed to `ContextsLibrary`. This enables the `ContextsDataTable` within `ContextsLibrary` to display the actual text and color of labels by resolving their IDs.
-   **`ContextFormData`**: The `handleSaveNewContext` and `handleSaveEdit` functions now correctly expect `ContextFormData` as per the updated type definitions, which includes an array of `GlobalLabel` objects.
-   `PromptInput` now receives `getResolvedLabelsForContext` (alias for `getResolvedContextLabels`) in case the selected contexts table needs to display resolved labels (this part of `SelectedContextsDataTable` might need further adjustment if labels are to be shown there).}}

# File Changes: ./src/components/PromptInput.tsx

## Code
``` tsx
import React from "react";
import { Context, GlobalLabel } from "../types"; // Added GlobalLabel
import { Button } from "@/components/ui/button";
import { Copy as CopyIcon } from "lucide-react";
import { Content } from "@tiptap/react";
import { MinimalTiptapEditor } from "./ui/minimal-tiptap";
import { SelectedContextsDataTable } from "./SelectedContextsDataTable";
import { getSelectedContextsTableColumns, SelectedContextsTableMeta } from "./SelectedContextsTableColumns"; // Added SelectedContextsTableMeta
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./ui/resizable";

export interface PromptInputProps {
  value: Content;
  onChange: (value: Content) => void;
  selectedContexts: Context[];
  onRemoveContext: (id: string) => void;
  onCopyPromptAndContextsClick: () => void;
  onFocus: () => void;
  onReorderContexts: (reorderedContexts: Context[]) => void;
  onDeleteMultipleFromPrompt: (ids: string[]) => void;
  getResolvedLabelsForContext: (context: Context) => GlobalLabel[]; // For selected contexts table
}

const PromptInput: React.FC<PromptInputProps> = ({
  value,
  onChange,
  selectedContexts,
  onRemoveContext,
  onCopyPromptAndContextsClick,
  onFocus,
  onReorderContexts,
  onDeleteMultipleFromPrompt,
  getResolvedLabelsForContext, // Destructure new prop
}) => {

  // Prepare meta for SelectedContextsDataTable
  const selectedContextsTableMeta: SelectedContextsTableMeta = {
    onRemoveContext,
    // Resolve labels for each context in the selected list for display in its table
    getResolvedLabels: (context: Context) => getResolvedLabelsForContext(context),
  };

  const selectedContextsColumns = React.useMemo(
    () => getSelectedContextsTableColumns(),
    [],
  );


  return (
    <ResizablePanelGroup onClick={onFocus} direction="vertical">
      <ResizablePanel className="flex-1">
        <MinimalTiptapEditor
          value={value}
          onChange={onChange}
          className="w-full h-full"
          editorContentClassName="p-5 overflow-y-auto flex-1"
          output="text"
          placeholder="Enter your prompt here..."
          autofocus={true}
          editable={true}
          editorClassName="focus:outline-none"
        />
      </ResizablePanel>

      <ResizableHandle withHandle className="my-4" />

      <ResizablePanel defaultSize={40} minSize={20} maxSize={80}>
        <h2 className="font-medium text-muted-foreground mb-3 text-xl">
          Selected Contexts
        </h2>
        {selectedContexts.length > 0 ? (
          <SelectedContextsDataTable
            columns={selectedContextsColumns}
            data={selectedContexts}
            tableMeta={selectedContextsTableMeta} // Pass tableMeta
            onRemoveContext={onRemoveContext} // Can be removed if only using meta
            onReorderContexts={onReorderContexts}
            onDeleteMultipleFromPrompt={onDeleteMultipleFromPrompt}
          />
        ) : (
          <div className="flex-grow flex items-center justify-center border border-muted rounded-md">
            <p className="text-sm text-muted-foreground text-center py-10">
              No contexts selected. Add from the library.
            </p>
          </div>
        )}

        <div className="h-5" />

        <Button
          onClick={onCopyPromptAndContextsClick}
          className="mt-auto w-full"
          size="lg"
        >
          <CopyIcon className="mr-2 h-4 w-4" /> Copy All
        </Button>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default PromptInput;

```

## Description
{{-   **Props Update**: Added `getResolvedLabelsForContext: (context: Context) => GlobalLabel[]` to `PromptInputProps`. This function is passed from `PromptEditor.tsx` and allows resolving label IDs to full `GlobalLabel` objects.
-   **`SelectedContextsTableMeta`**: A `selectedContextsTableMeta` object is created. It includes `onRemoveContext` and a new `getResolvedLabels` function. This `getResolvedLabels` function is specifically tailored for the `SelectedContextsDataTable`, taking a single `Context` object and returning its resolved labels using the passed `getResolvedLabelsForContext` prop.
-   **Passing Meta to `SelectedContextsDataTable`**: The `selectedContextsTableMeta` is now passed to the `SelectedContextsDataTable` via its `tableMeta` prop. This enables the columns within that table (specifically the "Labels" column, if it were to display them) to access resolved label data.
-   This change primarily sets up the `SelectedContextsDataTable` to be able_to_ display resolved labels if its column definitions are updated to do so. The `SelectedContextsTableColumns.tsx` was updated to utilize this.}}

# File Changes: ./src/components/SelectedContextsDataTable.tsx

## Code
``` tsx
import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  Row,
  RowSelectionState, // Added import
  getFilteredRowModel,
  getFacetedRowModel, // Added for potential future use
  getFacetedUniqueValues, // Added for potential future use
} from "@tanstack/react-table";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, LucideTrash, LucideListX } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Context } from "../types";
import { SelectedContextsTableMeta } from "./SelectedContextsTableColumns";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";

interface SelectedContextsDataTableProps {
  columns: ColumnDef<Context>[];
  data: Context[];
  tableMeta: SelectedContextsTableMeta; // Changed from onRemoveContext to tableMeta
  onReorderContexts: (reorderedContexts: Context[]) => void;
  onDeleteMultipleFromPrompt: (ids: string[]) => void; 
}

// DraggableRow component
function DraggableRow({ row, table }: { row: Row<Context>; table: ReturnType<typeof useReactTable<Context>> }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: row.original.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 10 : 0,
    position: 'relative',
  };

  const meta = table.options.meta as SelectedContextsTableMeta & { onDeleteMultipleFromPrompt?: (ids: string[]) => void } | undefined;
  const currentSelectedCount = table.getFilteredSelectedRowModel().rows.length;
  
  const handleRemoveFromPrompt = () => {
    meta?.onRemoveContext(row.original.id);
    table.resetRowSelection();
  };

  const handleDeleteMultiple = () => {
    const selectedIds = table.getFilteredSelectedRowModel().rows.map(r => r.original.id);
    meta?.onDeleteMultipleFromPrompt?.(selectedIds);
    table.resetRowSelection();
  }


  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <TableRow
          ref={setNodeRef}
          style={style}
          data-state={row.getIsSelected() && "selected"}
          data-dragging={isDragging}
          className="border-b-muted bg-background"
          onContextMenuCapture={() => {
            if (!row.getIsSelected() && currentSelectedCount <= 1) {
              table.resetRowSelection(); 
              row.toggleSelected(true); 
            } else if (!row.getIsSelected() && currentSelectedCount > 1) {
              table.resetRowSelection();
              row.toggleSelected(true);
            }
          }}
        >
          {row.getVisibleCells().map((cell, idx) => (
            <TableCell
              key={cell.id}
              className={cn("py-2",
                cell.column.id === 'drag' || cell.column.id === 'select' ? "px-2" : "px-3"
              )}
              style={{ width: cell.column.getSize() !== 150 ? cell.column.getSize() : undefined }}
            >
              {cell.column.id === "drag" ? (
                <Button
                  variant="ghost"
                  size="icon"
                  {...attributes}
                  {...listeners}
                  className="p-0 h-auto w-auto text-muted-foreground hover:bg-transparent cursor-grab active:cursor-grabbing"
                >
                  <GripVertical className="h-4 w-4" />
                  <span className="sr-only">Drag to reorder</span>
                </Button>
              ) : (
                flexRender(cell.column.columnDef.cell, cell.getContext())
              )}
            </TableCell>
          ))}
        </TableRow>
      </ContextMenuTrigger>
      <ContextMenuContent className="border-secondary">
        {currentSelectedCount > 1 && row.getIsSelected() ? (
          <>
            <ContextMenuLabel>{currentSelectedCount} items selected</ContextMenuLabel>
            <ContextMenuItem
              onClick={handleDeleteMultiple}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <LucideTrash className="mr-2 h-4 w-4" />
              Remove {currentSelectedCount} from Prompt
            </ContextMenuItem>
          </>
        ) : (
          <>
            <ContextMenuLabel>Context: {row.original.title}</ContextMenuLabel>
            <ContextMenuItem
              onClick={handleRemoveFromPrompt}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <LucideListX className="mr-2 h-4 w-4" />
              Remove from Prompt
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}


export function SelectedContextsDataTable({
  columns: initialColumns,
  data,
  tableMeta, // Changed from onRemoveContext to tableMeta
  onReorderContexts,
  onDeleteMultipleFromPrompt, 
}: SelectedContextsDataTableProps) {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  // Extend tableMeta with onDeleteMultipleFromPrompt for DraggableRow context menu
  const extendedTableMeta: SelectedContextsTableMeta & { onDeleteMultipleFromPrompt?: (ids: string[]) => void } = {
    ...tableMeta,
    onDeleteMultipleFromPrompt, 
  };


  const dataIds = React.useMemo<UniqueIdentifier[]>(() => data.map(({ id }) => id), [data]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {})
  );

  const table = useReactTable({
    data,
    columns: initialColumns,
    state: {
      rowSelection,
    },
    meta: extendedTableMeta, // Pass the extended meta
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(), 
    getFacetedRowModel: getFacetedRowModel(), 
    getFacetedUniqueValues: getFacetedUniqueValues(), 
    getRowId: (row) => row.id,
    enableRowSelection: true,
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = data.findIndex(item => item.id === active.id);
      const newIndex = data.findIndex(item => item.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorderContexts(arrayMove(data, oldIndex, newIndex));
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <ScrollArea className="flex rounded-md border border-muted flex-grow relative ">
        <Table className="h-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b-muted">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn("py-2 bg-background sticky top-0 z-[1]",
                      header.id === 'drag' || header.id === 'select' ? "px-2" : "px-3"
                    )}
                    style={{
                      width: header.getSize() !== 150 ? header.getSize() : undefined,
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
                {table.getRowModel().rows.map((row) => (
                  <DraggableRow key={row.id} row={row} table={table} />
                ))}
              </SortableContext>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={initialColumns.length}
                  className="h-full text-center py-10"
                >
                  No contexts selected. Add from the library.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      {table.getRowModel().rows?.length > 0 && (
        <div className="flex items-center justify-end space-x-2 py-2 text-xs text-muted-foreground pr-2">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getRowModel().rows.length} row(s) selected.
        </div>
      )}
    </DndContext>
  );
}

```

## Description
{{-   **Props Update**: Changed `onRemoveContext: (id: string) => void` prop to `tableMeta: SelectedContextsTableMeta`. This `tableMeta` object now carries the `onRemoveContext` function and potentially other meta-data like `getResolvedLabels` (as defined in `SelectedContextsTableColumns.tsx`).
-   **Meta Usage**: The `table` instance is now initialized with this `tableMeta` prop.
-   **DraggableRow**:
    -   The `DraggableRow` component now accesses `onRemoveContext` and `onDeleteMultipleFromPrompt` (if needed for context menu actions) via `table.options.meta`.
    -   The context menu logic within `DraggableRow` is updated to use `meta.onRemoveContext(...)` and `meta.onDeleteMultipleFromPrompt(...)`.
-   The `onDeleteMultipleFromPrompt` prop is still passed directly to the `SelectedContextsDataTable` and also included in an `extendedTableMeta` object for use within `DraggableRow`'s context menu for multi-select actions. This ensures the multi-delete functionality is available from the context menu when multiple rows are selected.
-   This change centralizes table-related callbacks and data resolvers into the `tableMeta` object, making the component more aligned with `@tanstack/react-table` conventions for passing custom data and functions to columns and cells.}}

# File Changes: ./src/components/SelectedContextsTableColumns.tsx

## Code
``` tsx
import { ColumnDef } from "@tanstack/react-table";
import { Context, GlobalLabel, PREDEFINED_LABEL_COLORS } from "../types"; // Added GlobalLabel
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectedContextsTableMeta = {
  onRemoveContext: (id: string) => void;
  // Function to resolve label IDs for a specific context
  getResolvedLabels: (context: Context) => GlobalLabel[]; 
};

export const getSelectedContextsTableColumns = (): ColumnDef<Context>[] => [
  {
    id: "drag",
    header: () => null,
    cell: () => null, // Drag handle is rendered by DraggableRow component
    size: 30,
    minSize: 30,
    maxSize: 30,
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
    minSize: 40,
    maxSize: 40,
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span className="font-medium truncate" title={row.getValue("title")}>
            {row.getValue("title")}
          </span>
        </div>
      );
    },
    minSize: 200,
  },
  {
    accessorKey: "labels",
    header: "Labels",
    // No accessorFn needed here if display is handled by cell; filtering would need it
    cell: ({ row, table }) => {
      const meta = table.options.meta as SelectedContextsTableMeta | undefined;
      const resolvedLabels = meta?.getResolvedLabels ? meta.getResolvedLabels(row.original) : [];
      
      if (!resolvedLabels || resolvedLabels.length === 0) {
        return <span className="text-xs text-muted-foreground italic">No labels</span>;
      }
      return (
        <div className="flex flex-wrap gap-1 items-center max-w-[200px] overflow-hidden">
          {resolvedLabels.slice(0, 3).map((label) => { 
            const colorInfo = PREDEFINED_LABEL_COLORS.find(c => c.value === label.color);
            return (
              <span
                key={label.id}
                title={label.text}
                className={`px-1.5 py-0.5 rounded-full text-xs font-medium border truncate ${colorInfo?.twChipClass || 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-500'}`}
              >
                {label.text}
              </span>
            );
          })}
          {resolvedLabels.length > 3 && <span className="text-xs text-muted-foreground">...</span>}
        </div>
      );
    },
    minSize: 120,
    maxSize: 250,
    enableSorting: false,
  },
  {
    id: "actions",
    header: () => <div className="text-right w-full pr-2"></div>,
    cell: ({ row, table }) => {
      const context = row.original;
      const meta = table.options.meta as SelectedContextsTableMeta | undefined;

      return (
        <div className="text-right">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => meta?.onRemoveContext(context.id)}
            className={cn(
              "h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10",
            )}
            aria-label={`Remove ${context.title}`}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    },
    enableSorting: false,
    size: 60,
    minSize: 60,
    maxSize: 60,
  },
];

```

## Description
{{-   **`SelectedContextsTableMeta` Update**:
    -   The `getResolvedLabels` function signature in `SelectedContextsTableMeta` is changed from `(labelIds: string[]) => GlobalLabel[]` to `(context: Context) => GlobalLabel[]`. This makes it more convenient for the "Labels" column cell to get resolved labels for the specific context of the current row.
-   **Labels Column (`accessorKey: "labels"`)**:
    -   The `cell` renderer for the "Labels" column now uses `meta.getResolvedLabels(row.original)` to get the fully resolved `GlobalLabel` objects for the current context (`row.original`).
    -   It then maps over these `resolvedLabels` to display the label chips, showing their text and color. A maximum of 3 labels are shown, with an ellipsis (...) if there are more, to keep the UI clean.
-   This ensures that if labels are associated with contexts selected for the prompt, they can be displayed correctly in the "Selected Contexts" table.}}
