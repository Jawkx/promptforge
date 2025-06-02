import { useState, useCallback, useEffect } from "react";
import { GlobalLabel, LabelColorValue, PREDEFINED_LABEL_COLORS } from "../types";
import { useToast } from "./use-toast";

const generateClientLabelId = () => `client-temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

interface UseLabelManagerArgs {
  initialLabelsForContext: GlobalLabel[]; // Labels currently associated with the context
  allGlobalLabels: GlobalLabel[]; // All available global labels
}

export const useLabelManager = (args: UseLabelManagerArgs) => {
  const [currentContextLabels, setCurrentContextLabels] = useState<GlobalLabel[]>(args.initialLabelsForContext);
  const [availableGlobalLabelsToSelect, setAvailableGlobalLabelsToSelect] = useState<GlobalLabel[]>([]);

  const [newLabelText, setNewLabelText] = useState(""); // Will be less used, Emblor handles input
  const [newLabelColor, setNewLabelColor] = useState<LabelColorValue>(PREDEFINED_LABEL_COLORS[0].value);
  const { toast } = useToast();

  useEffect(() => {
    const contextLabelIds = currentContextLabels.map(l => l.id);
    const contextLabelTexts = currentContextLabels.map(l => l.text.toLowerCase());

    setAvailableGlobalLabelsToSelect(
      args.allGlobalLabels.filter(gl =>
        !contextLabelIds.includes(gl.id) && !contextLabelTexts.includes(gl.text.toLowerCase())
      )
    );
  }, [args.allGlobalLabels, currentContextLabels]);


  const initializeLabels = useCallback((initialCtxLabels: GlobalLabel[], allGlbLabels: GlobalLabel[]) => {
    setCurrentContextLabels(initialCtxLabels);
    setNewLabelText(""); // Reset as Emblor will handle input
    setNewLabelColor(PREDEFINED_LABEL_COLORS[0].value);
  }, []);


  const handleAddNewLabelToContext = useCallback(() => {
    // This function is primarily for the old UI.
    // With Emblor, new tags are typically created via its input and `setTags` or `onTagAdd`.
    // We might adapt parts of this logic if needed, or rely on Emblor's callbacks.
    const text = newLabelText.trim();
    if (!text) {
      toast({ title: "Label text cannot be empty.", variant: "destructive" });
      return;
    }
    if (currentContextLabels.some(label => label.text.toLowerCase() === text.toLowerCase())) {
      toast({ title: `Label "${text}" is already added to this context.`, variant: "destructive" });
      return;
    }

    const existingGlobalLabel = args.allGlobalLabels.find(gl => gl.text.toLowerCase() === text.toLowerCase());

    let labelToAdd: GlobalLabel;
    if (existingGlobalLabel) {
      // If it exists globally, use its properties but potentially update color for this context's instance
      // The global definition's color update should happen on save if this is a new color choice
      labelToAdd = { ...existingGlobalLabel, color: newLabelColor };
      if (existingGlobalLabel.color !== newLabelColor) {
        toast({ title: "Info", description: `Label "${text}" exists globally. Color will be ${newLabelColor === existingGlobalLabel.color ? 'kept as global' : 'set to ' + newLabelColor + ' for this context (and potentially globally upon save)'}.` });
      }
    } else {
      // New label text, create with a temporary client ID
      labelToAdd = { id: generateClientLabelId(), text, color: newLabelColor };
    }

    setCurrentContextLabels(prev => [...prev, labelToAdd]);
    setNewLabelText(""); // Clear input
  }, [newLabelText, newLabelColor, currentContextLabels, args.allGlobalLabels, toast]);

  const handleSelectGlobalLabelForContext = useCallback((globalLabel: GlobalLabel) => {
    if (!currentContextLabels.some(l => l.id === globalLabel.id || l.text.toLowerCase() === globalLabel.text.toLowerCase())) {
      // Ensure the selected global label uses its defined color, not necessarily newLabelColor
      setCurrentContextLabels(prev => [...prev, { ...globalLabel }]);
    } else {
      toast({ title: "Label already selected", description: `Label "${globalLabel.text}" is already part of this context.`, variant: "default" });
    }
  }, [currentContextLabels, toast]);


  const handleRemoveLabelFromContext = useCallback((labelIdToRemove: string) => {
    setCurrentContextLabels(prev => prev.filter(label => label.id !== labelIdToRemove));
  }, []);

  const handleUpdateLabelDetailsInContext = useCallback((updatedLabel: GlobalLabel) => {
    const otherLabels = currentContextLabels.filter(l => l.id !== updatedLabel.id);
    if (otherLabels.some(l => l.text.toLowerCase() === updatedLabel.text.trim().toLowerCase())) {
      toast({ title: "Duplicate Label Text", description: `Another label in this context already has the text "${updatedLabel.text.trim()}".`, variant: "destructive" });
      // Revert to original text if possible, or prevent update
      const originalLabel = currentContextLabels.find(l => l.id === updatedLabel.id) || args.allGlobalLabels.find(l => l.id === updatedLabel.id);
      if (originalLabel && originalLabel.text !== updatedLabel.text.trim()) {
        setCurrentContextLabels(prev => prev.map(label =>
          label.id === updatedLabel.id ? { ...label, text: originalLabel.text } : label // Revert text
        ));
      }
      return;
    }

    setCurrentContextLabels(prev => prev.map(label =>
      label.id === updatedLabel.id ? { ...label, text: updatedLabel.text.trim(), color: updatedLabel.color } : label
    ));
  }, [currentContextLabels, toast, args.allGlobalLabels]);


  const getLabelsForSave = useCallback((): GlobalLabel[] => {
    return currentContextLabels.filter(label => label.text.trim() !== "");
  }, [currentContextLabels]);

  // New functions for Emblor integration
  const createTemporaryLabel = useCallback((text: string, color: LabelColorValue): GlobalLabel => {
    return {
      id: generateClientLabelId(),
      text: text.trim(),
      color: color,
    };
  }, []);

  const replaceAllCurrentContextLabels = useCallback((newLabels: GlobalLabel[]) => {
    setCurrentContextLabels(newLabels);
  }, []);


  return {
    currentContextLabels,
    availableGlobalLabelsToSelect,
    newLabelText, // Still needed if some part of UI uses it, but Emblor will be main input
    setNewLabelText,
    newLabelColor, // Crucial for new tags created via Emblor
    setNewLabelColor,
    initializeLabels,
    handleAddNewLabelToContext, // May become less used directly
    handleSelectGlobalLabelForContext, // May be triggered by Emblor's autocomplete selection
    handleRemoveLabelFromContext,
    handleUpdateLabelDetailsInContext,
    getLabelsForSave,
    // Exposed for Emblor
    createTemporaryLabel,
    replaceAllCurrentContextLabels,
  };
};
