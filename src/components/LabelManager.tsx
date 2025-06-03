import React from "react";
import { GlobalLabel } from "../types";
import { InputTags } from "@/components/ui/input-tags";

interface LabelManagerUIProps {
  currentContextLabels: GlobalLabel[];
  createTemporaryLabel: (text: string) => GlobalLabel;
  replaceAllCurrentContextLabels: (newLabels: GlobalLabel[]) => void;
  allGlobalLabels: GlobalLabel[];
}

const LabelManagerUI: React.FC<LabelManagerUIProps> = ({
  currentContextLabels,
  // newLabelColor removed
  createTemporaryLabel,
  replaceAllCurrentContextLabels,
  allGlobalLabels,
}) => {

  const tagTextsForInput: string[] = React.useMemo(() =>
    currentContextLabels.map(gl => gl.text),
    [currentContextLabels]
  );

  const handleInputTagsChange = (updater: React.SetStateAction<string[]>) => {
    const newTagTexts = typeof updater === 'function'
      ? updater(tagTextsForInput)
      : updater;

    const updatedGlobalLabels: GlobalLabel[] = [];
    const addedTexts = new Set<string>();

    newTagTexts.forEach(text => {
      if (addedTexts.has(text.trim().toLowerCase())) return;
      const normalizedText = text.trim();
      if (!normalizedText) return;

      let labelToAdd: GlobalLabel | undefined = currentContextLabels.find(gl => gl.text.toLowerCase() === normalizedText.toLowerCase());

      if (!labelToAdd) {
        labelToAdd = allGlobalLabels.find(gl => gl.text.toLowerCase() === normalizedText.toLowerCase());
      }

      if (labelToAdd) {
        updatedGlobalLabels.push({ id: labelToAdd.id, text: labelToAdd.text });
      } else {
        // createTemporaryLabel no longer takes color
        const tempLabel = createTemporaryLabel(normalizedText);
        updatedGlobalLabels.push(tempLabel);
      }
      addedTexts.add(normalizedText.toLowerCase());
    });
    replaceAllCurrentContextLabels(updatedGlobalLabels);
  };

  return (
    <InputTags
      value={tagTextsForInput}
      onChange={handleInputTagsChange}
      placeholder="Add or create labels (e.g. bug, feature)"
    />
  );
};

export default LabelManagerUI;

