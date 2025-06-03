import React from "react";
import { GlobalLabel, LabelColorValue } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X as XIcon, Check } from "lucide-react"; // Removed Palette, PlusCircle, ChevronsUpDown
// Removed Popover, PopoverContent, PopoverTrigger as they are no longer needed for color picking
import { cn } from "@/lib/utils";
import { TagInput, type Tag as EmblorTag } from "emblor"; // Assuming Emblor is installed

interface LabelManagerUIProps {
  // Labels currently attached to the context being edited/created
  currentContextLabels: GlobalLabel[];
  // Callback to update a label's details (text/color) in the parent hook
  onUpdateLabelDetails: (updatedLabel: GlobalLabel) => void;
  // Callback to remove a label from the current context
  onRemoveLabelFromContext: (labelId: string) => void;

  // For new label color selection (will be used for data, not visually distinct)
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
      // Color is not changed here, only text. The original color from globalLabel is preserved.
      onUpdate({ ...globalLabel, text: editText.trim() });
    }
    setIsEditingText(false);
  };

  const handleCancelEdit = () => {
    setEditText(globalLabel.text);
    setIsEditingText(false);
  };

  // Standardized style for all labels
  const chipStyle = "flex items-center justify-between gap-1 text-xs p-1 rounded-md border border-border text-foreground bg-transparent";

  return (
    <div
      className={cn(
        chipStyle,
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
  newLabelColor, // This will be used by createTemporaryLabel for data, not for visual distinction
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
        // If text changed in Emblor, update it, keep original color
        updatedGlobalLabels.push({ ...existingInContext, text: emblorTag.text });
      } else {
        // Check if it's a known global label being added
        const existingGlobalMatchByIdAndText = allGlobalLabels.find(gl => gl.id === emblorTag.id && gl.text.toLowerCase() === emblorTag.text.toLowerCase());
        if (existingGlobalMatchByIdAndText) {
          updatedGlobalLabels.push(existingGlobalMatchByIdAndText);
        } else {
          // If it's a new tag created via Emblor input (likely has a temporary client ID from Emblor or is just text)
          // Or if it's a global tag whose text was modified to something new
          const tempLabel = createTemporaryLabel(emblorTag.text, newLabelColor); // newLabelColor is the default from useLabelManager
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
        restrictTagsToAutocompleteOptions={false}
        draggable={true}
        addOnPaste={true}
        styleClasses={{
          input: "h-8 text-sm",
          inlineTagsContainer: "gap-1 rounded-xl",
        }}
        customTagRenderer={(tag, isActive) => {
          const globalLabel = currentContextLabels.find(gl => gl.id === tag.id);
          if (!globalLabel) {
            console.warn("LabelChip: Could not find full GlobalLabel for tag id:", tag.id, "text:", tag.text);
            const tempDisplayLabel: GlobalLabel = { id: tag.id, text: tag.text, color: newLabelColor };
            return (
              <LabelChip
                key={tag.id}
                globalLabel={tempDisplayLabel}
                isActiveTag={isActive}
                onUpdate={onUpdateLabelDetails} // This will eventually update currentContextLabels
                onRemove={onRemoveLabelFromContext}
              />
            );
          }
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
