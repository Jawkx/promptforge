import React from "react";
import { Button } from "@/components/ui/button";
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
import { Store } from "@livestore/livestore";
import { contextLibrarySchema } from "@/livestore/context-library-store/schema";
import { Label } from "@/types";
import { useLabelManagement } from "./useLabelManagement";

interface LabelSelectorProps {
  selectedLabels: readonly Label[];
  onLabelsChange: (labels: readonly Label[]) => void;
  contextLibraryStore: Store<typeof contextLibrarySchema>;
}

const LabelSelector: React.FC<LabelSelectorProps> = ({
  selectedLabels,
  onLabelsChange,
  contextLibraryStore,
}) => {
  const {
    labelSearch,
    setLabelSearch,
    isLabelPopoverOpen,
    setIsLabelPopoverOpen,
    filteredLabels,
    showCreateOption,
    handleLabelToggle,
    handleRemoveLabel,
    handleCreateLabel,
  } = useLabelManagement({
    selectedLabels,
    onLabelsChange,
    contextLibraryStore,
  });

  return (
    <div className="space-y-4 flex-shrink-0">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">Labels</label>
        <Popover open={isLabelPopoverOpen} onOpenChange={setIsLabelPopoverOpen}>
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
                    const isSelected = (selectedLabels || []).some(
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
        {(selectedLabels || []).length > 0 ? (
          (selectedLabels || []).map((label) => (
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
                onClick={() => handleRemoveLabel(label.id!)}
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
  );
};

export default LabelSelector;
