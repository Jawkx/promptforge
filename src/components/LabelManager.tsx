import React from "react";
import { GlobalLabel, PREDEFINED_LABEL_COLORS, LabelColorValue } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X as XIcon, Palette, Check } from "lucide-react"; // Removed PlusCircle, ChevronsUpDown
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { TagInput, type Tag as EmblorTag } from "emblor"; // Assuming Emblor is installed

interface LabelManagerUIProps {
  // Labels currently attached to the context being edited/created
  currentContextLabels: GlobalLabel[];
  // Callback to update a label's details (text/color) in the parent hook
  onUpdateLabelDetails: (updatedLabel: GlobalLabel) => void;
  // Callback to remove a label from the current context
  onRemoveLabelFromContext: (labelId: string) => void;

  // For new label color selection
  newLabelColor: LabelColorValue;
  setNewLabelColor: (color: LabelColorValue) => void;

  // For selecting from existing global labels (used by Emblor's autocomplete)
  availableGlobalLabels: GlobalLabel[];
  // onSelectGlobalLabel: (globalLabel: GlobalLabel) => void; // Emblor's setTags will handle this

  // Functions from useLabelManager for Emblor integration
  createTemporaryLabel: (text: string, color: LabelColorValue) => GlobalLabel;
  replaceAllCurrentContextLabels: (newLabels: GlobalLabel[]) => void;
  allGlobalLabels: GlobalLabel[]; // Needed for resolving tags from Emblor
}

const LabelChip: React.FC<{
  globalLabel: GlobalLabel;
  isActiveTag?: boolean; // From Emblor's customTagRenderer
  onUpdate: (updatedLabel: GlobalLabel) => void;
  onRemove: (labelId: string) => void;
}> = ({ globalLabel, isActiveTag, onUpdate, onRemove }) => {
  const [isEditingText, setIsEditingText] = React.useState(false);
  const [editText, setEditText] = React.useState(globalLabel.text);

  React.useEffect(() => {
    setEditText(globalLabel.text);
  }, [globalLabel.text]);

  const handleSaveEdit = () => {
    if (editText.trim() && editText.trim() !== globalLabel.text) {
      onUpdate({ ...globalLabel, text: editText.trim() });
    }
    setIsEditingText(false);
  };

  const handleCancelEdit = () => {
    setEditText(globalLabel.text);
    setIsEditingText(false);
  };

  const handleColorChange = (newColor: LabelColorValue) => {
    onUpdate({ ...globalLabel, color: newColor });
  };

  const colorInfo = PREDEFINED_LABEL_COLORS.find(c => c.value === globalLabel.color);

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-1 text-xs p-1 rounded-md border",
        colorInfo?.twChipClass || 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-500',
        isActiveTag ? 'ring-2 ring-ring ring-offset-1 ring-offset-background' : ''
      )}
    >
      {isEditingText ? (
        <div className="flex-grow flex items-center gap-1">
          <Input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); handleSaveEdit(); }
              if (e.key === 'Escape') { e.preventDefault(); handleCancelEdit(); }
            }}
            className="h-6 text-xs flex-grow bg-background/80 dark:bg-popover" // Ensure input is visible
            autoFocus
          />
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleSaveEdit}><Check className="h-3 w-3" /></Button>
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleCancelEdit}><XIcon className="h-3 w-3" /></Button>
        </div>
      ) : (
        <span
          className="px-1 py-0.5 font-medium cursor-pointer hover:opacity-80 truncate"
          onClick={() => setIsEditingText(true)}
          title={`Edit label "${globalLabel.text}"`}
        >
          {globalLabel.text}
        </span>
      )}

      <div className="flex items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-transparent" title={`Change color for "${globalLabel.text}"`}>
              <Palette className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-1">
            <div className="flex gap-1">
              {PREDEFINED_LABEL_COLORS.map(colorOpt => (
                <Button
                  key={colorOpt.value}
                  variant="outline"
                  size="icon"
                  className={`h-6 w-6 rounded-full border-2 ${globalLabel.color === colorOpt.value ? 'border-primary' : 'border-transparent'}`}
                  style={{ backgroundColor: PREDEFINED_LABEL_COLORS.find(c => c.value === colorOpt.value)?.twBgClass.replace('bg-', '') }}
                  onClick={() => handleColorChange(colorOpt.value)}
                  title={colorOpt.name}
                >
                  {globalLabel.color === colorOpt.value && <Check className="h-3 w-3" style={{ color: globalLabel.color === 'yellow' ? 'black' : 'white' }} />}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-5 w-5 text-muted-foreground hover:text-destructive hover:bg-transparent"
          onClick={() => onRemove(globalLabel.id)}
          title={`Remove label "${globalLabel.text}" from this context`}
        >
          <XIcon className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};


const LabelManagerUI: React.FC<LabelManagerUIProps> = ({
  currentContextLabels,
  onUpdateLabelDetails,
  onRemoveLabelFromContext,
  newLabelColor,
  availableGlobalLabels,
  createTemporaryLabel,
  replaceAllCurrentContextLabels,
  allGlobalLabels, // Full list of global labels for resolving by ID
}) => {
  const [activeTagIndex, setActiveTagIndex] = React.useState<number | null>(null);

  const emblorTags: EmblorTag[] = React.useMemo(() =>
    currentContextLabels.map(gl => ({ id: gl.id, text: gl.text })),
    [currentContextLabels]
  );

  const handleSetEmblorTags = (updater: EmblorTag[] | ((prevEmblorTags: EmblorTag[]) => EmblorTag[])) => {
    const currentEmblorFormat = currentContextLabels.map(gl => ({ id: gl.id, text: gl.text }));
    const newEmblorTagsResolved = typeof updater === 'function' ? updater(currentEmblorFormat) : updater;

    const updatedGlobalLabels: GlobalLabel[] = [];

    newEmblorTagsResolved.forEach(emblorTag => {
      const existingInContext = currentContextLabels.find(gl => gl.id === emblorTag.id);

      if (existingInContext) {
        updatedGlobalLabels.push({ ...existingInContext, text: emblorTag.text }); // Keep color
      } else {
        const existingGlobalMatch = allGlobalLabels.find(gl => gl.id === emblorTag.id && gl.text === emblorTag.text);
        if (existingGlobalMatch) {
          updatedGlobalLabels.push(existingGlobalMatch);
        } else {
          const tempLabel = createTemporaryLabel(emblorTag.text, newLabelColor);
          updatedGlobalLabels.push(tempLabel);
        }
      }
    });
    replaceAllCurrentContextLabels(updatedGlobalLabels);
  };


  return (
    <>
      <TagInput
        tags={emblorTags}
        setTags={handleSetEmblorTags}
        activeTagIndex={activeTagIndex}
        setActiveTagIndex={setActiveTagIndex}
        placeholder="Add or create labels..."
        enableAutocomplete
        autocompleteOptions={availableGlobalLabels.map(gl => ({ id: gl.id, text: gl.text }))}
        restrictTagsToAutocompleteOptions={false} // Allow creating new tags
        draggable={true} // Enable drag and drop reordering
        addOnPaste={true}
        styleClasses={{
          input: "h-8 text-sm",
          inlineTagsContainer: "gap-1 rounded-xl",
        }}
        customTagRenderer={(tag, isActive) => {
          const globalLabel = currentContextLabels.find(gl => gl.id === tag.id);
          if (!globalLabel) return null;
          return (
            <LabelChip
              key={globalLabel.id}
              globalLabel={globalLabel}
              isActiveTag={isActive}
              onUpdate={onUpdateLabelDetails}
              onRemove={onRemoveLabelFromContext}
            />
          );
        }}
      />

      {currentContextLabels.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-1">
          No labels. Type in the box above and press Enter to add.
        </p>
      )}
    </>
  );
};

export default LabelManagerUI;
