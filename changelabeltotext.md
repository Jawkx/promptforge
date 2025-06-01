Okay, I'll help you with these changes.

Here's the plan:
1.  **Remove the existing `colorLabel` system**: This involves modifying the `Context` type, related hooks, modals (`AddContextModal`, `EditContextModal`), and data table components (`ContextsDataTable`, `ContextsDataTableColumns`) to remove all functionality associated with the single color-based label per context.
2.  **Implement Text-Based Labeling**:
    *   Each context will be able to have multiple text labels.
    *   Each text label will have an associated color, chosen from a predefined palette of 5 colors.
    *   The `Context` type will store an array of these text labels, each with its text and color.
    *   The `AddContextModal` and `EditContextModal` will be updated to allow users to create, manage (remove, change color of), these text labels for a context.
    *   The `ContextsDataTable` will display these new text labels (e.g., as colored badges).
    *   The search functionality in `ContextsDataTable` will be updated to allow searching contexts by their text labels.

The Tiptap editor's own text coloring functionality (`Color` extension) will remain, as it's separate from the context labeling system.

Let's go through the files that need modification.

# File changed: ./src/types/index.ts
## Changes
1. Removed `CONTEXT_COLOR_OPTIONS` and `ContextColorValue`.
2. Added `PREDEFINED_LABEL_COLORS` with 5 color options for the new text labels.
3. Added `LabelColorValue` type derived from `PREDEFINED_LABEL_COLORS`.
4. Added `ContextLabel` interface to define the structure of new text labels (`id`, `text`, `color`).
5. Modified the `Context` interface:
    * Removed `colorLabel?: ContextColorValue;`.
    * Added `labels: ContextLabel[];`.
6. Updated `ContextCreationData` to work with the new `labels` structure, expecting an array of objects with `text` and `color` for initial labels.

## Full code
```ts
export const PREDEFINED_LABEL_COLORS = [
  { name: "Red", value: "red", twBgClass: "bg-red-500", twChipClass: "bg-red-100 text-red-700 border-red-300 dark:bg-red-700 dark:text-red-100 dark:border-red-500" },
  { name: "Blue", value: "blue", twBgClass: "bg-blue-500", twChipClass: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-700 dark:text-blue-100 dark:border-blue-500" },
  { name: "Green", value: "green", twBgClass: "bg-green-500", twChipClass: "bg-green-100 text-green-700 border-green-300 dark:bg-green-700 dark:text-green-100 dark:border-green-500" },
  { name: "Yellow", value: "yellow", twBgClass: "bg-yellow-500", twChipClass: "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-700 dark:text-yellow-100 dark:border-yellow-500" },
  { name: "Purple", value: "purple", twBgClass: "bg-purple-500", twChipClass: "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-700 dark:text-purple-100 dark:border-purple-500" },
] as const;

export type LabelColorValue = typeof PREDEFINED_LABEL_COLORS[number]['value'];

export interface ContextLabel {
  id: string; // Unique ID for the label instance on a context
  text: string;
  color: LabelColorValue;
}

export interface Context {
  id: string;
  title: string;
  content: string;
  labels: ContextLabel[];
}

export type ContextCreationData = Omit<Context, "id" | "labels"> & {
  labels: Omit<ContextLabel, "id">[];
};

export interface PromptEditorProps {
  onCopySuccess?: () => void;
}

export interface AddContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newContext: ContextCreationData) => void;
}

```
--- FILE-END ---

# File changed: ./src/hooks/useContexts.ts
## Changes
1. Updated `Context` and `ContextCreationData` imports to include `ContextLabel`, `LabelColorValue`.
2. Modified `addContext` function:
    * It now expects `labels: Omit<ContextLabel, "id">[]` in `newContextData`.
    * It maps through these initial labels and assigns a unique `id` to each, forming the `ContextLabel[]` for the new context.
    * Removed `colorLabel` handling.
3. Modified `addContextFromPaste` function:
    * Initializes `labels` to an empty array for contexts created from paste.
    * Removed `colorLabel` handling.
4. Modified `updateContext` function:
    * Ensures `labels` are properly handled, including their `id`, `text`, and `color`.
    * Removed `colorLabel` handling. The type assertion `as ContextColorValue` was removed as `colorLabel` is gone.

## Full code
```ts
import { useState, useCallback, useEffect } from "react";
import { Context, ContextCreationData, ContextLabel, LabelColorValue, PREDEFINED_LABEL_COLORS } from "../types";
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
    copyPromptWithContexts,
    addContextToPrompt,
    reorderSelectedContexts,
    deleteMultipleContexts
  };
};

```
--- FILE-END ---

# File changed: ./src/components/AddContextModal.tsx
## Changes
1. Imported `ContextLabel`, `LabelColorValue`, `PREDEFINED_LABEL_COLORS` from `../types`.
2. Removed `colorLabel` state and its related `Select` component.
3. Added state for managing current text labels: `currentLabels: Omit<ContextLabel, 'id'>[]`.
4. Added state for inputting a new label: `newLabelText: string` and `newLabelColor: LabelColorValue`.
5. Implemented UI for adding text labels:
    * An `Input` for `newLabelText`.
    * A `Select` for `newLabelColor`, populated from `PREDEFINED_LABEL_COLORS`.
    * An "Add Text Label" button (`handleAddTextLabel`).
6. Implemented UI for displaying and managing added text labels:
    * Lists currently added labels.
    * Each label in the list shows its text (with a background color corresponding to its selected `color`).
    * Each label has a "Remove" button (`handleRemoveTextLabel`).
    * Each label has a `Select` to change its color directly in the list (`handleUpdateLabelColor`).
7. Updated `handleSubmit` to pass the `currentLabels` (as `Omit<ContextLabel, 'id'>[]`) to the `onSave` callback.
8. Ensured `useEffect` resets `currentLabels`, `newLabelText`, and `newLabelColor` when the modal opens.

## Full code
```tsx
import React, { useState, useEffect } from "react";
import { ContextCreationData, PREDEFINED_LABEL_COLORS, LabelColorValue, ContextLabel } from "../types";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { X as XIcon, PlusCircle } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

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
  const [currentLabels, setCurrentLabels] = useState<Omit<ContextLabel, 'id'>[]>([]);
  const [newLabelText, setNewLabelText] = useState("");
  const [newLabelColor, setNewLabelColor] = useState<LabelColorValue>(PREDEFINED_LABEL_COLORS[0].value);

  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setContent("");
      setCurrentLabels([]);
      setNewLabelText("");
      setNewLabelColor(PREDEFINED_LABEL_COLORS[0].value);
    }
  }, [isOpen]);

  const handleAddTextLabel = () => {
    const text = newLabelText.trim();
    if (!text) {
      toast({ title: "Label text cannot be empty.", variant: "destructive" });
      return;
    }
    if (currentLabels.some(label => label.text.toLowerCase() === text.toLowerCase())) {
      toast({ title: `Label "${text}" already added.`, variant: "destructive" });
      return;
    }
    setCurrentLabels(prev => [...prev, { text, color: newLabelColor }]);
    setNewLabelText("");
    // Optionally reset newLabelColor or keep it for next label
  };

  const handleRemoveTextLabel = (textToRemove: string) => {
    setCurrentLabels(prev => prev.filter(label => label.text !== textToRemove));
  };

  const handleUpdateLabelColor = (textToUpdate: string, newColor: LabelColorValue) => {
    setCurrentLabels(prev => prev.map(label => 
      label.text === textToUpdate ? { ...label, color: newColor } : label
    ));
  };

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

    onSave({
      title: finalTitle,
      content: finalContent,
      labels: currentLabels,
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
              <Button type="button" size="icon" className="h-9 w-9" onClick={handleAddTextLabel} variant="outline">
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
                      <div key={label.text} className="flex items-center justify-between gap-2 text-xs p-1.5 rounded-md border bg-muted/30">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colorInfo?.twChipClass || 'bg-gray-100 text-gray-700 border-gray-300'}`}>
                          {label.text}
                        </span>
                        <div className="flex items-center gap-1">
                          <Select 
                            value={label.color} 
                            onValueChange={(newColor) => handleUpdateLabelColor(label.text, newColor as LabelColorValue)}
                          >
                            <SelectTrigger className="h-6 w-[80px] text-xs px-1.5 py-0">
                               <div className="flex items-center gap-1">
                                <span className={`inline-block h-2 w-2 rounded-full ${PREDEFINED_LABEL_COLORS.find(c=>c.value === label.color)?.twBgClass}`} />
                                <SelectValue/>
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
                            onClick={() => handleRemoveTextLabel(label.text)}
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
--- FILE-END ---

# File changed: ./src/components/EditContextModal.tsx
## Changes
1. Imported `ContextLabel`, `LabelColorValue`, `PREDEFINED_LABEL_COLORS` from `../types`.
2. Removed old `colorLabel` state and `Select` component.
3. Added state for managing current text labels: `currentLabels: ContextLabel[]`. (Note: `ContextLabel` includes `id` here, as we're editing existing labels).
4. Added state for inputting a new label: `newLabelText: string` and `newLabelColor: LabelColorValue`.
5. Copied UI logic for adding, removing, and updating colors of text labels from `AddContextModal`, adapting it for `EditContextModal`.
    * `handleAddTextLabel`: Generates a new temporary `id` (e.g., `temp-${uuid}`) for newly added labels in edit mode.
    * `handleRemoveTextLabel`: Removes by `id`.
    * `handleUpdateLabelColor`: Updates by `id`.
6. Updated `useEffect` to initialize `currentLabels` from `context.labels` when the modal opens with a context. It ensures each label has an `id`.
7. Updated `handleSubmit` to pass the `currentLabels` to the `onSave` callback. It filters out labels with empty text before saving.

## Full code
```tsx
import React, { useState, useEffect } from "react";
import { Context, PREDEFINED_LABEL_COLORS, LabelColorValue, ContextLabel } from "../types";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { X as XIcon, PlusCircle } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

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
  const [currentLabels, setCurrentLabels] = useState<ContextLabel[]>([]);
  const [newLabelText, setNewLabelText] = useState("");
  const [newLabelColor, setNewLabelColor] = useState<LabelColorValue>(PREDEFINED_LABEL_COLORS[0].value);
  const { toast } = useToast();

  useEffect(() => {
    if (context && isOpen) {
      setTitle(context.title);
      setContent(context.content);
      // Ensure all labels have an id, important for managing them in the UI
      setCurrentLabels(context.labels.map(l => ({...l, id: l.id || `temp-id-${Math.random()}`})));
      setNewLabelText("");
      setNewLabelColor(PREDEFINED_LABEL_COLORS[0].value);
    }
  }, [context, isOpen]);

  if (!isOpen || !context) return null;

  const handleAddTextLabel = () => {
    const text = newLabelText.trim();
    if (!text) {
      toast({ title: "Label text cannot be empty.", variant: "destructive" });
      return;
    }
    if (currentLabels.some(label => label.text.toLowerCase() === text.toLowerCase())) {
      toast({ title: `Label "${text}" already added.`, variant: "destructive" });
      return;
    }
    // For new labels in edit mode, generate a temporary unique ID
    const newId = `label-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setCurrentLabels(prev => [...prev, { id: newId, text, color: newLabelColor }]);
    setNewLabelText("");
  };

  const handleRemoveTextLabel = (idToRemove: string) => {
    setCurrentLabels(prev => prev.filter(label => label.id !== idToRemove));
  };

  const handleUpdateLabelColor = (idToUpdate: string, newColor: LabelColorValue) => {
    setCurrentLabels(prev => prev.map(label => 
      label.id === idToUpdate ? { ...label, color: newColor } : label
    ));
  };


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

    // Filter out any labels that might have become empty during editing (if applicable)
    const finalLabels = currentLabels.filter(label => label.text.trim() !== "");

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

          <div className="flex flex-col gap-2 border border-muted p-3 rounded-md">
            <Label className="text-sm font-medium text-foreground">Text Labels</Label>
            <div className="flex items-end gap-2">
              <div className="flex-grow">
                <Label htmlFor="editNewLabelText" className="sr-only">New Label Text</Label>
                <Input
                  id="editNewLabelText"
                  value={newLabelText}
                  onChange={(e) => setNewLabelText(e.target.value)}
                  placeholder="Enter label text"
                  className="h-9"
                />
              </div>
              <div>
                <Label htmlFor="editNewLabelColor" className="sr-only">New Label Color</Label>
                <Select value={newLabelColor} onValueChange={(v) => setNewLabelColor(v as LabelColorValue)}>
                  <SelectTrigger id="editNewLabelColor" className="h-9 w-[120px]">
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
              <Button type="button" size="icon" className="h-9 w-9" onClick={handleAddTextLabel} variant="outline">
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
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colorInfo?.twChipClass || 'bg-gray-100 text-gray-700 border-gray-300'}`}>
                          {label.text}
                        </span>
                        <div className="flex items-center gap-1">
                          <Select 
                            value={label.color} 
                            onValueChange={(newColor) => handleUpdateLabelColor(label.id, newColor as LabelColorValue)}
                          >
                            <SelectTrigger className="h-6 w-[80px] text-xs px-1.5 py-0">
                               <div className="flex items-center gap-1">
                                <span className={`inline-block h-2 w-2 rounded-full ${PREDEFINED_LABEL_COLORS.find(c=>c.value === label.color)?.twBgClass}`} />
                                <SelectValue/>
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
                            onClick={() => handleRemoveTextLabel(label.id)}
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
--- FILE-END ---

# File changed: ./src/components/ContextsDataTableColumns.tsx
## Changes
1. Imported `ContextLabel`, `PREDEFINED_LABEL_COLORS` from `../types`.
2. Removed the old `colorLabel` column definition.
3. Added a new column for "Labels" (`accessorKey: "labels"`):
    * The `header` is "Labels".
    * The `cell` function now renders the `labels` array of a context. Each label is displayed as a small, colored chip/badge using its `text` and `color` properties. The color is mapped to a `twChipClass` from `PREDEFINED_LABEL_COLORS`.
    * Added an `accessorFn` to return a concatenated string of label texts (`row.labels.map(l => l.text).join(" ")`). This allows the table's global filter to search by label text.
    * Adjusted column sizing (`minSize`, `maxSize`).
4. Updated `ContextsTableMeta` to remove `onUpdateContextColor` as color editing is now part of the main edit modal.
5. Kept other columns (`select`, `title`, `actions`) largely the same, adjusting spacing or removing references to the old color system if any.

## Full code
```tsx
import { ColumnDef } from "@tanstack/react-table";
import { Context, PREDEFINED_LABEL_COLORS, ContextLabel } from "../types";
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
    accessorFn: (row) => row.labels.map(l => l.text).join(" "), // For filtering
    cell: ({ row }) => {
      const labels = row.original.labels;
      if (!labels || labels.length === 0) {
        return <span className="text-xs text-muted-foreground italic">No labels</span>;
      }
      return (
        <div className="flex flex-wrap gap-1 items-center max-w-[250px] overflow-hidden">
          {labels.map((label) => {
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
        </div>
      );
    },
    minSize: 150,
    maxSize: 300,
    enableSorting: false, 
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
--- FILE-END ---

# File changed: ./src/components/ContextsDataTable.tsx
## Changes
1. Removed `colorFilter` state and its associated `Select` component and logic.
2. The main search input (`searchQuery`) will now also filter by label texts due to the `accessorFn` added in `ContextsDataTableColumns.tsx` for the "labels" column. The table's `globalFilter` will use this.
3. Removed `LucidePalette` and related UI for color filtering.
4. Simplified `React.useEffect` for column filters as color-specific filtering is removed. The `columnFilters` state is kept for potential future column-specific filters but is not actively used by a color filter anymore.
5. Adjusted "No contexts found" message to reflect that `colorFilter` is no longer a criterion.

## Full code
```tsx
import React from "react";
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  RowSelectionState,
  getFacetedRowModel,
  getFacetedUniqueValues,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Context } from "../types";
import { ContextsTableMeta } from "./ContextsDataTableColumns";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuLabel,
} from "@/components/ui/context-menu";
import { LucideEdit3, LucideListPlus, LucideTrash, LucideTrash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContextsDataTableProps {
  columns: ColumnDef<Context>[];
  data: Context[];
  onEditContext: (context: Context) => void;
  onDeleteContext: (id: string) => void;
  onDeleteSelectedContexts: (ids: string[]) => void;
  onAddSelectedToPrompt: (selectedContexts: Context[]) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function ContextsDataTable({
  columns,
  data,
  onEditContext,
  onDeleteContext,
  onDeleteSelectedContexts,
  onAddSelectedToPrompt,
  searchQuery,
  setSearchQuery,
}: ContextsDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);


  const tableMeta: ContextsTableMeta = {
    onEditContext,
    onDeleteContext,
  };

  const table = useReactTable({
    data,
    columns,
    meta: tableMeta,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters, 
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getFacetedRowModel: getFacetedRowModel(), 
    getFacetedUniqueValues: getFacetedUniqueValues(), 
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      globalFilter: searchQuery,
      columnFilters, 
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    onGlobalFilterChange: setSearchQuery, // Connects table's global filter state back to searchQuery
  });

  // This effect syncs the external searchQuery to the table's global filter state.
  React.useEffect(() => {
    table.setGlobalFilter(searchQuery);
  }, [searchQuery, table]);


  const handleAddSelectedButtonClick = () => {
    const selectedRowsData = table.getFilteredSelectedRowModel().rows.map(row => row.original);
    if (selectedRowsData.length > 0) {
      onAddSelectedToPrompt(selectedRowsData);
      table.resetRowSelection();
    }
  };

  const handleAddSelectedFromContextMenu = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedContexts = selectedRows.map(r => r.original);
    if (selectedContexts.length > 0) {
      onAddSelectedToPrompt(selectedContexts);
      table.resetRowSelection();
    }
  };

  const handleDeleteSelectedFromContextMenu = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedIds = selectedRows.map(r => r.original.id);
    if (selectedIds.length > 0) {
      onDeleteSelectedContexts(selectedIds);
      table.resetRowSelection();
    }
  };

  const displayedDataCount = table.getRowModel().rows.length;
  const totalDataCount = data.length;


  return (
    <div className="space-y-4 h-full max-h-[800px] flex flex-col">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-grow">
          <Input
            placeholder="Filter contexts by title, content, or labels..."
            value={searchQuery} // Controlled by external state
            onChange={(event) => setSearchQuery(event.target.value)} // Updates external state
            className="max-w-xs h-9"
          />
        </div>
        <Button
          onClick={handleAddSelectedButtonClick}
          disabled={Object.keys(rowSelection).length === 0}
          size="sm"
        >
          Add Selected
        </Button>
      </div>
      <ScrollArea className="rounded-md border border-muted flex-grow relative">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b-muted">
                {headerGroup.headers.map((header, idx) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn("py-2 sticky top-0 bg-background z-10", idx === 0 ? "pl-3" : "px-2")}
                      style={{ width: header.getSize() === 0 || header.getSize() === 150 ? undefined : header.getSize() }} // 150 is default from tanstack
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const context = row.original;
                const meta = table.options.meta as ContextsTableMeta | undefined;
                const currentSelectedCount = table.getFilteredSelectedRowModel().rows.length;

                return (
                  <ContextMenu key={row.id + "-cm-root"}>
                    <ContextMenuTrigger asChild>
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className="border-b-muted"
                        onContextMenuCapture={() => {
                          if (!row.getIsSelected()) {
                            table.resetRowSelection();
                            row.toggleSelected(true);
                          }
                        }}
                      >
                        {row.getVisibleCells().map((cell, idx) => (
                          <TableCell
                            key={cell.id}
                            className={cn("py-2", idx === 0 ? "pl-3" : "px-2")}
                            style={{ width: cell.column.getSize() === 0 || cell.column.getSize() === 150 ? undefined : cell.column.getSize() }}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="border-secondary">
                      {currentSelectedCount > 1 && row.getIsSelected() ? (
                        <>
                          <ContextMenuLabel>{currentSelectedCount} items selected</ContextMenuLabel>
                          <ContextMenuItem onClick={handleAddSelectedFromContextMenu}>
                            <LucideListPlus className="mr-2 h-4 w-4" />
                            Add {currentSelectedCount} to Prompt
                          </ContextMenuItem>
                          <ContextMenuItem
                            onClick={handleDeleteSelectedFromContextMenu}
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                          >
                            <LucideTrash className="mr-2 h-4 w-4" />
                            Delete {currentSelectedCount} contexts
                          </ContextMenuItem>
                          <ContextMenuSeparator />
                          <ContextMenuItem onClick={() => meta?.onEditContext(context)} disabled>
                            <LucideEdit3 className="mr-2 h-4 w-4" />
                            Edit (select one)
                          </ContextMenuItem>
                          <ContextMenuItem onClick={() => meta?.onDeleteContext(context.id)} disabled>
                            <LucideTrash2 className="mr-2 h-4 w-4" />
                            Delete (select one)
                          </ContextMenuItem>
                        </>
                      ) : (
                        <>
                          <ContextMenuItem onClick={() => onAddSelectedToPrompt([context])}>
                            <LucideListPlus className="mr-2 h-4 w-4" />
                            Add to Prompt
                          </ContextMenuItem>
                          <ContextMenuItem onClick={() => meta?.onEditContext(context)}>
                            <LucideEdit3 className="mr-2 h-4 w-4" />
                            Edit "{context.title}"
                          </ContextMenuItem>
                          <ContextMenuSeparator />
                          <ContextMenuItem
                            onClick={() => meta?.onDeleteContext(context.id)}
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                          >
                            <LucideTrash2 className="mr-2 h-4 w-4" />
                            Delete "{context.title}"
                          </ContextMenuItem>
                        </>
                      )}
                    </ContextMenuContent>
                  </ContextMenu>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No contexts found.
                  {searchQuery && totalDataCount > 0 && (
                    <p className="text-xs">Try a different search term.</p>
                  )}
                  {totalDataCount === 0 && !searchQuery && (
                    <p className="text-xs">Click the 'Add Context' button to create one.</p>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <div className="flex items-center justify-between space-x-2 py-2 text-sm text-muted-foreground">
        <div>
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {displayedDataCount} row(s) selected.
          {searchQuery && ` (Filtered from ${totalDataCount})`}
        </div>
        <div className="flex items-center space-x-2">
          <span>
            Page{' '}
            {table.getState().pagination.pageIndex + 1} of {' '}
            {table.getPageCount() || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

```
--- FILE-END ---
