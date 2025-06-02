import { useState, useCallback, useEffect } from "react";
import { GlobalLabel, LabelColorValue, PREDEFINED_LABEL_COLORS } from "../types";
import { useToast } from "./use-toast";

const generateClientLabelId = () => `client-temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

interface UseLabelManagerArgs {
  initialLabelsForContext: GlobalLabel[]; // Labels currently associated with the context
  allGlobalLabels: GlobalLabel[]; // All available global labels
}

export const useLabelManager = (args: UseLabelManagerArgs) => {
  const [currentContextLabels, setCurrentContextLabels] = useState<GlobalLabel[]>([]);
  const [availableGlobalLabelsToSelect, setAvailableGlobalLabelsToSelect] = useState<GlobalLabel[]>([]);

  const [newLabelText, setNewLabelText] = useState("");
  const [newLabelColor, setNewLabelColor] = useState<LabelColorValue>(PREDEFINED_LABEL_COLORS[0].value);
  const { toast } = useToast();

  useEffect(() => {
    setCurrentContextLabels(args.initialLabelsForContext);
  }, [args.initialLabelsForContext]);

  useEffect(() => {
    const contextLabelTexts = currentContextLabels.map(l => l.text.toLowerCase());
    setAvailableGlobalLabelsToSelect(
      args.allGlobalLabels.filter(gl => !contextLabelTexts.includes(gl.text.toLowerCase()))
    );
  }, [args.allGlobalLabels, currentContextLabels]);


  const initializeLabels = useCallback((initialCtxLabels: GlobalLabel[], allGlbLabels: GlobalLabel[]) => {
    setCurrentContextLabels(initialCtxLabels);
    const contextLabelTexts = initialCtxLabels.map(l => l.text.toLowerCase());
    setAvailableGlobalLabelsToSelect(
      allGlbLabels.filter(gl => !contextLabelTexts.includes(gl.text.toLowerCase()))
    );
    setNewLabelText("");
    setNewLabelColor(PREDEFINED_LABEL_COLORS[0].value);
  }, []);


  const handleAddNewLabelToContext = useCallback(() => {
    const text = newLabelText.trim();
    if (!text) {
      toast({ title: "Label text cannot be empty.", variant: "destructive" });
      return;
    }
    if (currentContextLabels.some(label => label.text.toLowerCase() === text.toLowerCase())) {
      toast({ title: `Label "${text}" is already added to this context.`, variant: "destructive" });
      return;
    }

    // Check if this new label text matches an existing global label (case-insensitive)
    const existingGlobalLabel = args.allGlobalLabels.find(gl => gl.text.toLowerCase() === text.toLowerCase());

    let labelToAdd: GlobalLabel;
    if (existingGlobalLabel) {
      // If it matches a global label by text, use that global label's definition but with the new color if different.
      // This implies the user wants to use the existing global label, possibly with a color override for this instance,
      // or it will be reconciled by useContexts to update the global color if it's a persistent change.
      labelToAdd = { ...existingGlobalLabel, color: newLabelColor };
      if (existingGlobalLabel.color !== newLabelColor) {
        toast({ title: "Info", description: `Label "${text}" exists globally. Color will be ${newLabelColor === existingGlobalLabel.color ? 'kept' : 'updated for this context (and potentially globally upon save)'}.` })
      }
    } else {
      // This is a completely new label (text does not exist globally)
      labelToAdd = { id: generateClientLabelId(), text, color: newLabelColor };
    }

    setCurrentContextLabels(prev => [...prev, labelToAdd]);
    setNewLabelText("");
    // Optionally reset newLabelColor or keep it for next label
  }, [newLabelText, newLabelColor, currentContextLabels, args.allGlobalLabels, toast]);

  const handleSelectGlobalLabelForContext = useCallback((globalLabel: GlobalLabel) => {
    if (!currentContextLabels.some(l => l.id === globalLabel.id || l.text.toLowerCase() === globalLabel.text.toLowerCase())) {
      setCurrentContextLabels(prev => [...prev, globalLabel]);
    } else {
      toast({ title: "Label already selected", description: `Label "${globalLabel.text}" is already part of this context.`, variant: "default" });
    }
  }, [currentContextLabels, toast]);


  const handleRemoveLabelFromContext = useCallback((labelIdToRemove: string) => {
    setCurrentContextLabels(prev => prev.filter(label => label.id !== labelIdToRemove));
  }, []);

  // Called when a label chip's text or color is modified in the UI
  const handleUpdateLabelDetailsInContext = useCallback((updatedLabel: GlobalLabel) => {
    // Prevent duplicate text if renaming
    const otherLabels = currentContextLabels.filter(l => l.id !== updatedLabel.id);
    if (otherLabels.some(l => l.text.toLowerCase() === updatedLabel.text.trim().toLowerCase())) {
      toast({ title: "Duplicate Label Text", description: `Another label in this context already has the text "${updatedLabel.text.trim()}".`, variant: "destructive" });
      // Revert to original text of this specific label before edit attempt
      const originalLabel = args.initialLabelsForContext.find(l => l.id === updatedLabel.id) || args.allGlobalLabels.find(l => l.id === updatedLabel.id);
      if (originalLabel) {
        setCurrentContextLabels(prev => prev.map(label =>
          label.id === updatedLabel.id ? { ...label, text: originalLabel.text } : label
        ));
      }
      return;
    }

    setCurrentContextLabels(prev => prev.map(label =>
      label.id === updatedLabel.id ? { ...label, text: updatedLabel.text.trim(), color: updatedLabel.color } : label
    ));
  }, [currentContextLabels, toast, args.initialLabelsForContext, args.allGlobalLabels]);


  const getLabelsForSave = useCallback((): GlobalLabel[] => {
    // Filter out labels with empty text before saving
    return currentContextLabels.filter(label => label.text.trim() !== "");
  }, [currentContextLabels]);


  return {
    currentContextLabels,
    availableGlobalLabelsToSelect,
    newLabelText,
    setNewLabelText,
    newLabelColor,
    setNewLabelColor,
    initializeLabels, // Expose if needed for external re-init
    handleAddNewLabelToContext, // For "Create & Add new label" button
    handleSelectGlobalLabelForContext, // For selecting from dropdown of global labels
    handleRemoveLabelFromContext, // For removing a label chip from context
    handleUpdateLabelDetailsInContext, // For editing text/color of a label chip
    getLabelsForSave,
  };
};

