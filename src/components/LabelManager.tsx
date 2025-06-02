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
import { X as XIcon, PlusCircle, Palette, Check, ChevronsUpDown } from "lucide-react";
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
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => handleSaveEdit(label.id)}><Check className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleCancelEdit}><XIcon className="h-3 w-3" /></Button>
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
                          <Palette className="h-3 w-3" style={{ color: label.color === "yellow" && PREDEFINED_LABEL_COLORS.find(c => c.value === "yellow") ? 'black' : label.color /* This is not ideal for general color mapping */ }} />
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
                              style={{ backgroundColor: PREDEFINED_LABEL_COLORS.find(c => c.value === colorOpt.value)?.twBgClass.replace('bg-', '') }}
                              onClick={() => handleColorChange(label, colorOpt.value)}
                              title={colorOpt.name}
                            >
                              {label.color === colorOpt.value && <Check className="h-3 w-3" style={{ color: label.color === 'yellow' ? 'black' : 'white' }} />}
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
