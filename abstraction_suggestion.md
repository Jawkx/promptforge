# Changes overview

- **Abstract Label Management**: Created a new custom hook `useLabelManager` and a new component `LabelManagerUI` to handle the state and UI logic for adding, removing, and editing context labels. This significantly reduces code duplication in `AddContextModal.tsx` and `EditContextModal.tsx`.
- **Create Reusable Confirmation Dialog**: Introduced a `ConfirmationDialog` component to standardize the alert dialogs used for delete confirmations in `PromptEditor.tsx`.
- **Standardize Context Operation Toasts**: Added a helper function `showContextOperationNotification` within `useContexts.ts` to create more consistent toast messages for CRUD operations on contexts.

# File Changes: ./src/hooks/useLabelManager.ts

## Code
``` ts
import { useState, useCallback } from "react";
import { ContextLabel, LabelColorValue, PREDEFINED_LABEL_COLORS } from "../types";
import { useToast } from "./use-toast";

// Generates a unique client-side ID for new labels
const generateClientLabelId = () => `clientlabel-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

interface UseLabelManagerArgs {
  initialLabels?: ContextLabel[] | Omit<ContextLabel, 'id'>[]; // Supports both Add and Edit modal initial states
}

export const useLabelManager = (args?: UseLabelManagerArgs) => {
  const [currentLabels, setCurrentLabels] = useState<ContextLabel[]>(() => {
    if (args?.initialLabels) {
      return args.initialLabels.map(label => ({
        id: (label as ContextLabel).id || generateClientLabelId(), // Ensure ID exists
        text: label.text,
        color: label.color,
      }));
    }
    return [];
  });

  const [newLabelText, setNewLabelText] = useState("");
  const [newLabelColor, setNewLabelColor] = useState<LabelColorValue>(PREDEFINED_LABEL_COLORS[0].value);
  const { toast } = useToast();

  const initializeLabels = useCallback((labels?: ContextLabel[] | Omit<ContextLabel, 'id'>[]) => {
    if (labels) {
      setCurrentLabels(labels.map(label => ({
        id: (label as ContextLabel).id || generateClientLabelId(),
        text: label.text,
        color: label.color,
      })));
    } else {
      setCurrentLabels([]);
    }
    setNewLabelText("");
    setNewLabelColor(PREDEFINED_LABEL_COLORS[0].value);
  }, []);


  const handleAddLabel = useCallback(() => {
    const text = newLabelText.trim();
    if (!text) {
      toast({ title: "Label text cannot be empty.", variant: "destructive" });
      return;
    }
    if (currentLabels.some(label => label.text.toLowerCase() === text.toLowerCase())) {
      toast({ title: `Label "${text}" already added.`, variant: "destructive" });
      return;
    }
    setCurrentLabels(prev => [...prev, { id: generateClientLabelId(), text, color: newLabelColor }]);
    setNewLabelText("");
    // Optionally reset newLabelColor or keep it for next label
  }, [newLabelText, newLabelColor, currentLabels, toast]);

  const handleRemoveLabelById = useCallback((idToRemove: string) => {
    setCurrentLabels(prev => prev.filter(label => label.id !== idToRemove));
  }, []);

  const handleUpdateLabelColorById = useCallback((idToUpdate: string, color: LabelColorValue) => {
    setCurrentLabels(prev => prev.map(label =>
      label.id === idToUpdate ? { ...label, color } : label
    ));
  }, []);

  const getLabelsForSave = useCallback((): Omit<ContextLabel, 'id'>[] => {
    return currentLabels.map(({ text, color }) => ({ text, color }));
  }, [currentLabels]);
  
  const getLabelsWithIdsForSave = useCallback((): ContextLabel[] => {
    return currentLabels;
  }, [currentLabels]);


  return {
    currentLabels,
    newLabelText,
    setNewLabelText,
    newLabelColor,
    setNewLabelColor,
    initializeLabels,
    handleAddLabel,
    handleRemoveLabelById,
    handleUpdateLabelColorById,
    getLabelsForSave, // For AddContextModal
    getLabelsWithIdsForSave, // For EditContextModal
  };
};
```

## Description
{{This new custom hook encapsulates the logic for managing context labels. It handles the state for current labels, new label input text, and new label color. It provides functions to add, remove, and update labels, including toast notifications for validation. It also includes `initializeLabels` to reset state or load initial labels for editing, and helper functions `getLabelsForSave` and `getLabelsWithIdsForSave` to format labels correctly for `AddContextModal` and `EditContextModal` respectively.}}

# File Changes: ./src/components/LabelManagerUI.tsx

## Code
``` tsx
import React from "react";
import { ContextLabel, PREDEFINED_LABEL_COLORS, LabelColorValue } from "../types";
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
import { X as XIcon, PlusCircle } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

interface LabelManagerUIProps {
  currentLabels: ContextLabel[];
  newLabelText: string;
  setNewLabelText: (text: string) => void;
  newLabelColor: LabelColorValue;
  setNewLabelColor: (color: LabelColorValue) => void;
  onAddLabel: () => void;
  onRemoveLabel: (id: string) => void;
  onUpdateLabelColor: (id: string, newColor: LabelColorValue) => void;
}

const LabelManagerUI: React.FC<LabelManagerUIProps> = ({
  currentLabels,
  newLabelText,
  setNewLabelText,
  newLabelColor,
  setNewLabelColor,
  onAddLabel,
  onRemoveLabel,
  onUpdateLabelColor,
}) => {
  return (
    <div className="flex flex-col gap-2 border border-muted p-3 rounded-md">
      <Label className="text-sm font-medium text-foreground">Text Labels</Label>
      <div className="flex items-end gap-2">
        <div className="flex-grow">
          <Label htmlFor="newLabelText" className="sr-only">New Label Text</Label>
          <Input
            id="newLabelText"
            value={newLabelText}
            onChange={(e) => setNewLabelText(e.target.value)}
            placeholder="Enter label text"
            className="h-9"
          />
        </div>
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
        <Button type="button" size="icon" className="h-9 w-9" onClick={onAddLabel} variant="outline">
          <PlusCircle className="h-4 w-4" />
          <span className="sr-only">Add Text Label</span>
        </Button>
      </div>
      {currentLabels.length > 0 && (
        <ScrollArea className="max-h-[100px] pr-2">
          <div className="space-y-1.5 mt-1">
            {currentLabels.map((label) => {
              const colorInfo = PREDEFINED_LABEL_COLORS.find(c => c.value === label.color);
              return (
                <div key={label.id} className="flex items-center justify-between gap-2 text-xs p-1.5 rounded-md border bg-muted/30">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colorInfo?.twChipClass || 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-500'}`}>
                    {label.text}
                  </span>
                  <div className="flex items-center gap-1">
                    <Select
                      value={label.color}
                      onValueChange={(newColor) => onUpdateLabelColor(label.id, newColor as LabelColorValue)}
                    >
                      <SelectTrigger className="h-6 w-[80px] text-xs px-1.5 py-0">
                        <div className="flex items-center gap-1">
                          <span className={`inline-block h-2 w-2 rounded-full ${PREDEFINED_LABEL_COLORS.find(c => c.value === label.color)?.twBgClass}`} />
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {PREDEFINED_LABEL_COLORS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value} className="text-xs">
                            <div className="flex items-center gap-2">
                              <span className={`inline-block h-2.5 w-2.5 rounded-full ${opt.twBgClass}`} />
                              {opt.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-muted-foreground hover:text-destructive"
                      onClick={() => onRemoveLabel(label.id)}
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
      {currentLabels.length === 0 && <p className="text-xs text-muted-foreground text-center py-1">No labels added yet.</p>}
    </div>
  );
};

export default LabelManagerUI;
```

## Description
{{This new component centralizes the UI for managing labels (input fields for adding new labels and a display list for existing labels). It receives its state and handlers from the `useLabelManager` hook, making the modal components (`AddContextModal`, `EditContextModal`) cleaner by abstracting this repetitive UI structure.}}

# File Changes: ./src/components/shared/ConfirmationDialog.tsx

## Code
``` tsx
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // Using existing UI component

interface ConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description: React.ReactNode;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "default" | "destructive";
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onOpenChange,
  title = "Are you sure?",
  description,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "default",
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-primary">{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className={confirmVariant === "destructive" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}>
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
```

## Description
{{This new shared component provides a reusable structure for confirmation dialogs. It takes props for controlling its state, content (title, description), and actions (confirm/cancel text and handlers). This helps to reduce boilerplate code in `PromptEditor.tsx` for delete confirmations.}}

# File Changes: ./src/hooks/useContexts.ts

## Code
``` ts
import { useState, useCallback, useEffect } from "react";
import { Context, ContextCreationData, ContextLabel, PREDEFINED_LABEL_COLORS } from "../types";
import { useToast, ToastOptions } from "./use-toast"; // Import ToastOptions
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

// Helper for standardized toast notifications
type ContextOperation = 
  | "Added" 
  | "Updated" 
  | "Deleted" 
  | "RemovedFromPrompt"
  | "Selected"
  | "Copied"
  | "Processed"
  | "MultipleDeleted"
  | "MultipleRemovedFromPrompt";

const showContextOperationNotification = (
  toastFn: (props: ToastOptions) => void,
  operation: ContextOperation,
  itemName: string, // Can be context title or count for multiple items
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
      showContextOperationNotification(toast, "Added", newContext.title);
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
      showContextOperationNotification(toast, "Added", newContext.title, "default", `Context "${newContext.title}" (from paste) has been added.`);
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
      showContextOperationNotification(toast, "Updated", contextToUpdate.title);
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
        showContextOperationNotification(toast, "RemovedFromPrompt", removedContext.title);
      }
    },
    [selectedContexts, toast],
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
    (context: Context) => {
      const contextWithStrId = { ...context, id: String(context.id) };
      if (!selectedContexts.some((c) => c.id === contextWithStrId.id)) {
        setSelectedContexts((prevSelectedContexts) => [
          ...prevSelectedContexts,
          contextWithStrId,
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
```

## Description
{{A helper function `showContextOperationNotification` has been added to standardize toast messages for common operations like adding, updating, deleting, and selecting contexts. This function is now used throughout the `useContexts` hook, promoting consistency in user feedback and reducing repetitive toast configurations. The type `ToastOptions` was also imported from `./use-toast` for better type safety with the toast function.}}

# File Changes: ./src/components/AddContextModal.tsx

## Code
``` tsx
import React, { useState, useEffect } from "react";
import { ContextCreationData, PREDEFINED_LABEL_COLORS } from "../types";
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
import LabelManagerUI from "./LabelManagerUI";
import { useLabelManager } from "@/hooks/useLabelManager";


interface AddContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newContext: ContextCreationData) => void;
}

const AddContextModal: React.FC<AddContextModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { toast } = useToast();

  const {
    currentLabels,
    newLabelText,
    setNewLabelText,
    newLabelColor,
    setNewLabelColor,
    initializeLabels,
    handleAddLabel,
    handleRemoveLabelById,
    handleUpdateLabelColorById,
    getLabelsForSave,
  } = useLabelManager();

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setContent("");
      initializeLabels(); // Resets label manager state
    }
  }, [isOpen, initializeLabels]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const finalTitle = title.trim();
    const finalContent = content.trim();

    if (!finalTitle && !finalContent) {
      toast({
        title: "Empty Context",
        description:
          "Both title and content are empty. Please add some content or a title.",
        variant: "destructive",
      });
      return;
    }
    if (!finalContent) {
      toast({
        title: "Empty Content",
        description: "Content cannot be empty if title is also nearly empty.",
        variant: "destructive",
      });
      return;
    }
    
    const labelsToSave = getLabelsForSave();

    onSave({
      title: finalTitle,
      content: finalContent,
      labels: labelsToSave,
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
            auto-generated if left blank.
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
            currentLabels={currentLabels}
            newLabelText={newLabelText}
            setNewLabelText={setNewLabelText}
            newLabelColor={newLabelColor}
            setNewLabelColor={setNewLabelColor}
            onAddLabel={handleAddLabel}
            onRemoveLabel={handleRemoveLabelById}
            onUpdateLabelColor={handleUpdateLabelColorById}
          />
          
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 min-h-[150px] resize-none" // Adjusted min-h
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
{{The `AddContextModal` component has been refactored to use the new `useLabelManager` hook and the `LabelManagerUI` component. This removes the local state and handler functions for label management, delegating that responsibility to the hook and UI component. The `useEffect` hook now calls `initializeLabels` from the `useLabelManager` hook to reset label state when the modal opens. The `handleSubmit` function now uses `getLabelsForSave` from the hook to retrieve labels in the format expected by `onSave`.}}

# File Changes: ./src/components/EditContextModal.tsx

## Code
``` tsx
import React, { useState, useEffect } from "react";
import { Context, PREDEFINED_LABEL_COLORS } from "../types";
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
import LabelManagerUI from "./LabelManagerUI";
import { useLabelManager } from "@/hooks/useLabelManager";


interface EditContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (context: Context) => void;
  context: Context | null;
}

const EditContextModal: React.FC<EditContextModalProps> = ({
  isOpen,
  onClose,
  onSave,
  context,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { toast } = useToast();

  const {
    currentLabels,
    newLabelText,
    setNewLabelText,
    newLabelColor,
    setNewLabelColor,
    initializeLabels,
    handleAddLabel,
    handleRemoveLabelById,
    handleUpdateLabelColorById,
    getLabelsWithIdsForSave,
  } = useLabelManager();

  useEffect(() => {
    if (context && isOpen) {
      setTitle(context.title);
      setContent(context.content);
      initializeLabels(context.labels); // Initialize label manager with context's labels
    }
  }, [context, isOpen, initializeLabels]);

  if (!isOpen || !context) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) {
      toast({
        title: "Title Required",
        description: "Title cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    if (!trimmedContent) {
      toast({
        title: "Content Required",
        description: "Content cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    
    const finalLabels = getLabelsWithIdsForSave();

    onSave({
      ...context,
      title: trimmedTitle,
      content: trimmedContent,
      labels: finalLabels,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-muted h-auto max-h-[85vh] max-w-screen-lg flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-primary">Edit Context</DialogTitle>
          <DialogDescription className="text-foreground">
            Modify the title, content, or labels of your context snippet.
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
            currentLabels={currentLabels}
            newLabelText={newLabelText}
            setNewLabelText={setNewLabelText}
            newLabelColor={newLabelColor}
            setNewLabelColor={setNewLabelColor}
            onAddLabel={handleAddLabel}
            onRemoveLabel={handleRemoveLabelById}
            onUpdateLabelColor={handleUpdateLabelColorById}
          />
          
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 min-h-[150px] resize-none" // Adjusted min-h
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
{{The `EditContextModal` component has been refactored to leverage the `useLabelManager` hook and the `LabelManagerUI` component. Similar to `AddContextModal`, this change centralizes label management logic. The `useEffect` hook now populates the label manager with the existing context's labels by calling `initializeLabels(context.labels)`. The `handleSubmit` function uses `getLabelsWithIdsForSave` to get the labels (including their original or temporary client-side IDs) for saving.}}

# File Changes: ./src/components/PromptEditor.tsx

## Code
``` tsx
import React, { useState, useCallback } from "react";
import { useContexts } from "../hooks/useContexts";
import { Context, ContextCreationData } from "../types";
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
import { ConfirmationDialog } from "./shared/ConfirmationDialog"; // Import new component
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
    removeMultipleSelectedContextsFromPrompt, // Import new hook function
    copyPromptWithContexts,
    addContextToPrompt,
    reorderSelectedContexts,
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

  const handleSaveNewContext = (newContextData: ContextCreationData) => {
    const success = addContext(newContextData);
    if (success) {
      setAddModalOpen(false);
    }
  };

  const handleSaveEdit = (updatedContextData: Context) => {
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
              onDeleteMultipleFromPrompt={handleDeleteMultipleSelectedFromPrompt} // Pass handler
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
          />
        </ResizablePanel>
      </ResizablePanelGroup>

      <AddContextModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleSaveNewContext}
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
        />
      )}
      <ConfirmationDialog
        isOpen={deleteConfirmationOpen}
        onOpenChange={setDeleteConfirmationOpen}
        description={
          <>
            This action cannot be undone. This will permanently delete the
            context "
            <strong>
              {contexts.find((c) => c.id === contextToDeleteId)?.title ||
                "this context"}
            </strong>
            " from the library.
          </>
        }
        onConfirm={confirmDeleteContext}
        onCancel={() => setContextToDeleteId(null)}
        confirmText="Delete"
        confirmVariant="destructive"
      />
      <ConfirmationDialog
        isOpen={deleteMultipleConfirmationOpen}
        onOpenChange={setDeleteMultipleConfirmationOpen}
        description={
          <>
            This action cannot be undone. This will permanently delete{" "}
            <strong>{contextsToDeleteIds.length} context(s)</strong> from the library.
          </>
        }
        onConfirm={confirmDeleteMultipleContexts}
        onCancel={() => setContextsToDeleteIds([])}
        confirmText="Delete"
        confirmVariant="destructive"
      />
    </div>
  );
};

export default PromptEditor;
```

## Description
{{The `PromptEditor` component now uses the `ConfirmationDialog` component for both single and multiple context deletion confirmations. This replaces the previous direct usage of `AlertDialog` components, leading to cleaner and more maintainable code for handling these confirmations. The `description` prop for `ConfirmationDialog` is now passed as JSX for better formatting of dynamic content (like context titles or counts). The `confirmVariant` prop is used to style the confirmation button appropriately as destructive.}}
