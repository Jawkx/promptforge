import React from "react";
import { GlobalLabel, LabelColorValue } from "../types";
import { InputTags } from "@/components/ui/input-tags";

interface LabelManagerUIProps {
  currentContextLabels: GlobalLabel[];
  newLabelColor: LabelColorValue;
  createTemporaryLabel: (text: string, color: LabelColorValue) => GlobalLabel;
  replaceAllCurrentContextLabels: (newLabels: GlobalLabel[]) => void;
  allGlobalLabels: GlobalLabel[];
}

const LabelManagerUI: React.FC<LabelManagerUIProps> = ({
  currentContextLabels,
  newLabelColor,
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
      ? updater(tagTextsForInput) // Pass current derived string[] as prevState
      : updater;

    const updatedGlobalLabels: GlobalLabel[] = [];
    const addedTexts = new Set<string>();

    newTagTexts.forEach(text => {
      if (addedTexts.has(text)) return;

      let labelToAdd: GlobalLabel | undefined = currentContextLabels.find(gl => gl.text === text);

      if (!labelToAdd) {
        labelToAdd = allGlobalLabels.find(gl => gl.text.toLowerCase() === text.toLowerCase());
      }

      if (labelToAdd) {
        updatedGlobalLabels.push(labelToAdd);
      } else {
        const tempLabel = createTemporaryLabel(text, newLabelColor);
        updatedGlobalLabels.push(tempLabel);
      }
      addedTexts.add(text);
    });
    replaceAllCurrentContextLabels(updatedGlobalLabels);
  };

  return (
    <InputTags
      value={tagTextsForInput}
      onChange={handleInputTagsChange}
      placeholder="Add or create labels..."
    />
  );
};

export default LabelManagerUI;
