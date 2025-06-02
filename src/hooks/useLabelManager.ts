import { useState, useCallback } from "react";
import { ContextLabel, LabelColorValue, PREDEFINED_LABEL_COLORS } from "../types";
import { useToast } from "./use-toast";

// Generates a unique client-side ID for new labels
const generateClientLabelId = () => `clientlabel-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

interface UseLabelManagerArgs {
  initialLabels?: ContextLabel[] | Omit<ContextLabel, 'id'>[]; // Supports both Add and Edit modal initial states
}

export const useLabelManager = (args?: UseLabelManagerArgs) => {
  const [currentLabels, setCurrentLabels] = useState<ContextLabel[]>(() => {
    if (args?.initialLabels) {
      return args.initialLabels.map(label => ({
        id: (label as ContextLabel).id || generateClientLabelId(), // Ensure ID exists
        text: label.text,
        color: label.color,
      }));
    }
    return [];
  });

  const [newLabelText, setNewLabelText] = useState("");
  const [newLabelColor, setNewLabelColor] = useState<LabelColorValue>(PREDEFINED_LABEL_COLORS[0].value);
  const { toast } = useToast();

  const initializeLabels = useCallback((labels?: ContextLabel[] | Omit<ContextLabel, 'id'>[]) => {
    if (labels) {
      setCurrentLabels(labels.map(label => ({
        id: (label as ContextLabel).id || generateClientLabelId(),
        text: label.text,
        color: label.color,
      })));
    } else {
      setCurrentLabels([]);
    }
    setNewLabelText("");
    setNewLabelColor(PREDEFINED_LABEL_COLORS[0].value);
  }, []);


  const handleAddLabel = useCallback(() => {
    const text = newLabelText.trim();
    if (!text) {
      toast({ title: "Label text cannot be empty.", variant: "destructive" });
      return;
    }
    if (currentLabels.some(label => label.text.toLowerCase() === text.toLowerCase())) {
      toast({ title: `Label "${text}" already added.`, variant: "destructive" });
      return;
    }
    setCurrentLabels(prev => [...prev, { id: generateClientLabelId(), text, color: newLabelColor }]);
    setNewLabelText("");
    // Optionally reset newLabelColor or keep it for next label
  }, [newLabelText, newLabelColor, currentLabels, toast]);

  const handleRemoveLabelById = useCallback((idToRemove: string) => {
    setCurrentLabels(prev => prev.filter(label => label.id !== idToRemove));
  }, []);

  const handleUpdateLabelColorById = useCallback((idToUpdate: string, color: LabelColorValue) => {
    setCurrentLabels(prev => prev.map(label =>
      label.id === idToUpdate ? { ...label, color } : label
    ));
  }, []);

  const getLabelsForSave = useCallback((): Omit<ContextLabel, 'id'>[] => {
    return currentLabels.map(({ text, color }) => ({ text, color }));
  }, [currentLabels]);

  const getLabelsWithIdsForSave = useCallback((): ContextLabel[] => {
    return currentLabels;
  }, [currentLabels]);


  return {
    currentLabels,
    newLabelText,
    setNewLabelText,
    newLabelColor,
    setNewLabelColor,
    initializeLabels,
    handleAddLabel,
    handleRemoveLabelById,
    handleUpdateLabelColorById,
    getLabelsForSave, // For AddContextModal
    getLabelsWithIdsForSave, // For EditContextModal
  };
};
