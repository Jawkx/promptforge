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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
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
  dialogTitle: string;
  dialogDescription: string;
  submitButtonText: string;
  submitButtonIcon?: React.ReactNode;
  isMaximized?: boolean;
  onMaximizeToggle?: () => void;
}

const ContextForm: React.FC<ContextFormProps> = ({
  id,
  title: initialTitle,
  content: initialContent,
  labels: initialLabels = [],
  onSubmit,
  onCancel,
  dialogTitle,
  dialogDescription,
  submitButtonText,
  submitButtonIcon,
  isMaximized = false,
  onMaximizeToggle,
}) => {
  const { contextLibraryStore } = useLiveStores();
  const allLabels = useQuery(labels$, { store: contextLibraryStore });
  
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [selectedLabels, setSelectedLabels] = useState<readonly Label[]>(initialLabels);
  const [labelSearch, setLabelSearch] = useState("");
  const [isLabelPopoverOpen, setIsLabelPopoverOpen] = useState(false);

  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
    setSelectedLabels(initialLabels);
  }, [initialTitle, initialContent, initialLabels]);

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

  const handleLabelToggle = useCallback(
    (label: Label) => {
      setSelectedLabels(prev => {
        const isSelected = prev.some(l => l.id === label.id);
        if (isSelected) {
          return prev.filter(l => l.id !== label.id);
        } else {
          return [...prev, label];
        }
      });
    },
    [],
  );

  const handleRemoveLabel = useCallback(
    (labelId: string) => {
      setSelectedLabels(prev => prev.filter(l => l.id !== labelId));
    },
    [],
  );

  const handleCreateLabel = useCallback(
    (labelName: string) => {
      const newLabelId = generateLabelId();
      const newColor = LABEL_COLORS[allLabels.length % LABEL_COLORS.length] || "#888888";
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
        (label) => label.name.toLowerCase() === labelSearch.trim().toLowerCase(),
      ),
    [allLabels, labelSearch],
  );

  return (
    <DialogContent
      className="sm:max-w-2xl"
      onMaximizeToggle={onMaximizeToggle}
      isMaximized={isMaximized}
    >
      <DialogHeader>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogDescription>{dialogDescription}</DialogDescription>
      </DialogHeader>
      <form
        id="context-form"
        onSubmit={handleSubmit}
        className={cn("grid gap-4 py-4", isMaximized && "flex flex-1 flex-col")}
      >
        <Input
          id="title"
          value={title}
          onChange={handleTitleChange}
          placeholder="Title (optional, will be auto-generated if blank)"
        />
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Labels</label>
            <Popover open={isLabelPopoverOpen} onOpenChange={setIsLabelPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <Tag className="h-4 w-4 mr-1" />
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
                        const isSelected = selectedLabels.some(l => l.id === label.id);
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
            <div className="flex flex-wrap gap-1">
              {selectedLabels.map((label) => (
                <Badge
                  key={label.id}
                  variant="secondary"
                  className="flex items-center gap-1 pr-1"
                  style={{ 
                    backgroundColor: `${label.color}20`, 
                    borderColor: label.color,
                    color: label.color
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
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleRemoveLabel(label.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        <Textarea
          id="content"
          value={content}
          onChange={handleContentChange}
          className={cn("min-h-[250px] resize-none", isMaximized && "flex-1")}
          placeholder="Paste your context content here."
        />
      </form>
      <DialogFooter>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" form="context-form">
          {submitButtonIcon}
          {submitButtonText}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default ContextForm;
