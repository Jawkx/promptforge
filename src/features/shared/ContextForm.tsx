import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, PlusCircle, X, Tag } from "lucide-react";
import { useQuery } from "@livestore/react";
import { labels$ } from "@/livestore/context-library-store/queries";
import { contextLibraryEvents } from "@/livestore/context-library-store/events";
import { useLiveStores } from "@/store/LiveStoreProvider";
import { ContextFormData, Label } from "@/types";
import { LABEL_COLORS } from "@/constants/labelColors";
import { generateLabelId } from "@/lib/utils";
import { toast as sonnerToast } from "sonner";

interface ContextFormProps {
  id?: string;
  title: string;
  content: string;
  labels?: readonly Label[];
  onSubmit: (data: ContextFormData) => void;
  onCancel: () => void;
  onDataChange?: (data: ContextFormData) => void;
  dialogTitle: string;
  dialogDescription: string;
  submitButtonText?: string;
  submitButtonIcon?: React.ReactNode;
  isMaximized?: boolean;
  onMaximizeToggle?: () => void;
  autoSave?: boolean;
}

const ContextForm: React.FC<ContextFormProps> = ({
  id,
  title: initialTitle,
  content: initialContent,
  labels: initialLabels = [],
  onSubmit,
  onCancel,
  onDataChange,
  dialogTitle,
  dialogDescription,
  submitButtonText,
  submitButtonIcon,
  isMaximized = false,
  onMaximizeToggle,
  autoSave = false,
}) => {
  const { contextLibraryStore } = useLiveStores();
  const allLabels = useQuery(labels$, { store: contextLibraryStore });

  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [selectedLabels, setSelectedLabels] =
    useState<readonly Label[]>(initialLabels);
  const [labelSearch, setLabelSearch] = useState("");
  const [isLabelPopoverOpen, setIsLabelPopoverOpen] = useState(false);

  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
    setSelectedLabels(initialLabels);
  }, []);

  // Call onDataChange when data changes (for auto-save)
  useEffect(() => {
    if (onDataChange && autoSave) {
      onDataChange({ id, title, content, labels: selectedLabels });
    }
  }, [title, content, selectedLabels, onDataChange, id, autoSave]);

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      onSubmit({ id, title, content, labels: selectedLabels });
    },
    [id, title, content, selectedLabels, onSubmit],
  );

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.target.value);
    },
    [],
  );

  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);
    },
    [],
  );

  const handleLabelToggle = useCallback((label: Label) => {
    setSelectedLabels((prev) => {
      const isSelected = prev.some((l) => l.id === label.id);
      if (isSelected) {
        return prev.filter((l) => l.id !== label.id);
      } else {
        return [...prev, label];
      }
    });
  }, []);

  const handleRemoveLabel = useCallback((labelId: string) => {
    setSelectedLabels((prev) => prev.filter((l) => l.id !== labelId));
  }, []);

  const handleCreateLabel = useCallback(
    (labelName: string) => {
      const newLabelId = generateLabelId();
      const newColor =
        LABEL_COLORS[allLabels.length % LABEL_COLORS.length] || "#888888";
      const newLabel: Label = {
        id: newLabelId,
        name: labelName,
        color: newColor,
      };

      contextLibraryStore.commit(contextLibraryEvents.labelCreated(newLabel));
      sonnerToast.success("Label Created", {
        description: `Label "${labelName}" has been created.`,
      });
      handleLabelToggle(newLabel);
      setLabelSearch("");
      setIsLabelPopoverOpen(false);
    },
    [allLabels.length, handleLabelToggle, contextLibraryStore],
  );

  const filteredLabels = useMemo(
    () =>
      allLabels.filter((label) =>
        label.name.toLowerCase().includes(labelSearch.toLowerCase()),
      ),
    [allLabels, labelSearch],
  );

  const showCreateOption = useMemo(
    () =>
      labelSearch.trim().length > 0 &&
      !allLabels.some(
        (label) =>
          label.name.toLowerCase() === labelSearch.trim().toLowerCase(),
      ),
    [allLabels, labelSearch],
  );

  return (
    <DialogContent
      className="sm:max-w-3xl max-h-[90vh]"
      onMaximizeToggle={onMaximizeToggle}
      isMaximized={isMaximized}
    >
      <DialogHeader className="space-y-3 pb-6">
        <DialogTitle className="text-xl font-semibold">
          {dialogTitle}
        </DialogTitle>
        <DialogDescription className="text-muted-foreground">
          {dialogDescription}
        </DialogDescription>
      </DialogHeader>

      <form
        id="context-form"
        onSubmit={handleSubmit}
        className={cn(
          "space-y-6",
          isMaximized && "flex flex-1 flex-col space-y-6",
        )}
      >
        <div className="space-y-2">
          <label
            htmlFor="title"
            className="text-sm font-medium text-foreground"
          >
            Title
          </label>
          <Input
            id="title"
            value={title}
            onChange={handleTitleChange}
            placeholder="Enter a title (optional, will be auto-generated if blank)"
            className="h-10"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              Labels
            </label>
            <Popover
              open={isLabelPopoverOpen}
              onOpenChange={setIsLabelPopoverOpen}
            >
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-2">
                  <Tag className="h-4 w-4" />
                  Add Label
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="end">
                <Command>
                  <CommandInput
                    placeholder="Search or create label..."
                    value={labelSearch}
                    onValueChange={setLabelSearch}
                  />
                  <CommandList>
                    <CommandEmpty>No labels found.</CommandEmpty>
                    <CommandGroup>
                      {filteredLabels.map((label) => {
                        const isSelected = selectedLabels.some(
                          (l) => l.id === label.id,
                        );
                        return (
                          <CommandItem
                            key={label.id}
                            onSelect={() => {
                              handleLabelToggle(label);
                              setIsLabelPopoverOpen(false);
                            }}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: label.color }}
                              />
                              <span>{label.name}</span>
                            </div>
                            {isSelected && <Check className="h-4 w-4" />}
                          </CommandItem>
                        );
                      })}
                      {showCreateOption && (
                        <CommandItem
                          onSelect={() => handleCreateLabel(labelSearch.trim())}
                          className="flex items-center gap-2 text-muted-foreground"
                        >
                          <PlusCircle className="h-4 w-4" />
                          <span>Create "{labelSearch.trim()}"</span>
                        </CommandItem>
                      )}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {selectedLabels.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-md border">
              {selectedLabels.map((label) => (
                <Badge
                  key={label.id}
                  variant="secondary"
                  className="flex items-center gap-1.5 pr-1 py-1 text-xs"
                  style={{
                    backgroundColor: `${label.color}15`,
                    borderColor: `${label.color}40`,
                    color: label.color,
                  }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: label.color }}
                  />
                  <span>{label.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent opacity-70 hover:opacity-100"
                    onClick={() => handleRemoveLabel(label.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className={cn("space-y-2", isMaximized && "flex-1 flex flex-col")}>
          <label
            htmlFor="content"
            className="text-sm font-medium text-foreground"
          >
            Content
          </label>
          <Textarea
            id="content"
            value={content}
            onChange={handleContentChange}
            className={cn(
              "min-h-[300px] resize-none font-mono text-sm leading-relaxed",
              "border-2 focus:border-primary/50 transition-colors",
              isMaximized && "flex-1",
            )}
            placeholder="Paste your context content here..."
          />
        </div>
      </form>

      {!autoSave && (
        <DialogFooter className="pt-6 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="min-w-[100px]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="context-form"
            className="min-w-[140px] gap-2"
          >
            {submitButtonIcon}
            {submitButtonText}
          </Button>
        </DialogFooter>
      )}
    </DialogContent>
  );
};

export default ContextForm;
