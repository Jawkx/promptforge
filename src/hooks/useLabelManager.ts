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

  const [newLabelText, setNewLabelText] = useState("");
  const [newLabelColor, setNewLabelColor] = useState<LabelColorValue>(PREDEFINED_LABEL_COLORS[0].value);
  const { toast } = useToast();

  useEffect(() => {
    const contextLabelTexts = currentContextLabels.map(l => l.text.toLowerCase());
    setAvailableGlobalLabelsToSelect(
      args.allGlobalLabels.filter(gl => !contextLabelTexts.includes(gl.text.toLowerCase()))
    );
  }, [args.allGlobalLabels, currentContextLabels]);


  const initializeLabels = useCallback((initialCtxLabels: GlobalLabel[], allGlbLabels: GlobalLabel[]) => {
    setCurrentContextLabels(initialCtxLabels);
    // The useEffect above will update availableGlobalLabelsToSelect based on new currentContextLabels and allGlbLabels
    setNewLabelText("");
    setNewLabelColor(PREDEFINED_LABEL_COLORS[0].value);
  }, []); // Empty deps: setNewLabelText & setNewLabelColor are stable


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

    const existingGlobalLabel = args.allGlobalLabels.find(gl => gl.text.toLowerCase() === text.toLowerCase());

    let labelToAdd: GlobalLabel;
    if (existingGlobalLabel) {
      labelToAdd = { ...existingGlobalLabel, color: newLabelColor };
      if (existingGlobalLabel.color !== newLabelColor) {
        toast({ title: "Info", description: `Label "${text}" exists globally. Color will be ${newLabelColor === existingGlobalLabel.color ? 'kept' : 'updated for this context (and potentially globally upon save)'}.` })
      }
    } else {
      labelToAdd = { id: generateClientLabelId(), text, color: newLabelColor };
    }

    setCurrentContextLabels(prev => [...prev, labelToAdd]);
    setNewLabelText("");
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

  const handleUpdateLabelDetailsInContext = useCallback((updatedLabel: GlobalLabel) => {
    const otherLabels = currentContextLabels.filter(l => l.id !== updatedLabel.id);
    if (otherLabels.some(l => l.text.toLowerCase() === updatedLabel.text.trim().toLowerCase())) {
      toast({ title: "Duplicate Label Text", description: `Another label in this context already has the text "${updatedLabel.text.trim()}".`, variant: "destructive" });
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
    return currentContextLabels.filter(label => label.text.trim() !== "");
  }, [currentContextLabels]);


  return {
    currentContextLabels,
    availableGlobalLabelsToSelect,
    newLabelText,
    setNewLabelText,
    newLabelColor,
    setNewLabelColor,
    initializeLabels,
    handleAddNewLabelToContext,
    handleSelectGlobalLabelForContext,
    handleRemoveLabelFromContext,
    handleUpdateLabelDetailsInContext,
    getLabelsForSave,
  };
};
