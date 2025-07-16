import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { Check, PlusCircle, X, Tag, Maximize2, Minimize2 } from "lucide-react";
import { useQuery } from "@livestore/react";
import { labels$ } from "@/livestore/context-library-store/queries";
import { contextLibraryEvents } from "@/livestore/context-library-store/events";
import { useContextLibraryStore } from "@/store/ContextLibraryLiveStoreProvider";
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
  autoSave = false,
}) => {
  const [isMaximized, setIsMaximized] = React.useState(false);
  const contextLibraryStore = useContextLibraryStore();
  const allLabels = useQuery(labels$, { store: contextLibraryStore });

  const handleMaximizeToggle = useCallback(() => {
    setIsMaximized((prev) => !prev);
  }, []);

  const form = useForm<ContextFormData>({
    defaultValues: {
      id,
      title: initialTitle,
      content: initialContent,
      labels: initialLabels,
    },
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    getValues,
    formState: { isDirty },
  } = form;

  // Use refs to track initial values and prevent unnecessary resets
  const initialValuesRef = useRef({
    id,
    title: initialTitle,
    content: initialContent,
    labels: initialLabels,
  });

  // Only reset when initial values actually change
  useEffect(() => {
    const newInitialValues = {
      id,
      title: initialTitle,
      content: initialContent,
      labels: initialLabels,
    };

    // Check if values have actually changed
    const hasChanged =
      initialValuesRef.current.id !== newInitialValues.id ||
      initialValuesRef.current.title !== newInitialValues.title ||
      initialValuesRef.current.content !== newInitialValues.content ||
      JSON.stringify(initialValuesRef.current.labels) !==
        JSON.stringify(newInitialValues.labels);

    if (hasChanged) {
      initialValuesRef.current = newInitialValues;
      reset(newInitialValues);
    }
  }, [id, initialTitle, initialContent, initialLabels, reset]);

  // Watch specific fields for auto-save with debouncing
  const watchedTitle = watch("title");
  const watchedContent = watch("content");
  const watchedLabels = watch("labels");

  // Debounced auto-save effect
  useEffect(() => {
    if (!onDataChange || !autoSave || !isDirty) return;

    const timeoutId = setTimeout(() => {
      const currentValues = getValues();
      onDataChange(currentValues);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [
    watchedTitle,
    watchedContent,
    watchedLabels,
    onDataChange,
    autoSave,
    getValues,
    isDirty,
  ]);

  const onFormSubmit = useCallback(
    (data: ContextFormData) => {
      onSubmit(data);
    },
    [onSubmit],
  );

  const handleLabelToggle = useCallback(
    (label: Label) => {
      const currentLabels = getValues("labels") || [];
      const isSelected = currentLabels.some((l) => l.id === label.id);
      if (isSelected) {
        setValue(
          "labels",
          currentLabels.filter((l) => l.id !== label.id),
          { shouldDirty: true },
        );
      } else {
        setValue("labels", [...currentLabels, label], { shouldDirty: true });
      }
    },
    [getValues, setValue],
  );

  const handleRemoveLabel = useCallback(
    (labelId: string) => {
      const currentLabels = getValues("labels") || [];
      setValue(
        "labels",
        currentLabels.filter((l) => l.id !== labelId),
        { shouldDirty: true },
      );
    },
    [getValues, setValue],
  );

  const [labelSearch, setLabelSearch] = React.useState("");
  const [isLabelPopoverOpen, setIsLabelPopoverOpen] = React.useState(false);

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
      className={cn(
        "sm:max-w-3xl max-h-[90vh]",
        isMaximized && "flex h-[95vh] w-[95vw] max-w-none flex-col",
      )}
    >
      <DialogHeader className="space-y-3 pb-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <DialogTitle className="text-xl font-semibold">
              {dialogTitle}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {dialogDescription}
            </DialogDescription>
          </div>
          <button
            onClick={handleMaximizeToggle}
            className="rounded-sm p-0.5 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label={isMaximized ? "Minimize" : "Maximize"}
          >
            {isMaximized ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </DialogHeader>

      <form
        id="context-form"
        onSubmit={handleSubmit(onFormSubmit)}
        onKeyDown={(e) => {
          if (
            e.key === "Enter" &&
            e.target !== e.currentTarget.querySelector("#content")
          ) {
            e.preventDefault();
          }
        }}
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
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <Input
                id="title"
                {...field}
                placeholder="Enter a title (optional, will be auto-generated if blank)"
                className="h-10"
              />
            )}
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
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-2"
                >
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
                        const isSelected = (watchedLabels || []).some(
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

          <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-md border min-h-[44px]">
            {(watchedLabels || []).length > 0 ? (
              (watchedLabels || []).map((label) => (
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
              ))
            ) : (
              <span className="text-muted-foreground text-sm">
                No labels assigned
              </span>
            )}
          </div>
        </div>

        <div className={cn("space-y-2", isMaximized && "flex-1 flex flex-col")}>
          <label
            htmlFor="content"
            className="text-sm font-medium text-foreground"
          >
            Content
          </label>
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <Textarea
                id="content"
                {...field}
                className={cn(
                  "min-h-[300px] resize-none font-mono text-sm leading-relaxed",
                  "border-2 focus:border-primary/50 transition-colors",
                  isMaximized && "flex-1",
                )}
                placeholder="Paste your context content here..."
              />
            )}
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
