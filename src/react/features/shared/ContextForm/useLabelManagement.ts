import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@livestore/react";
import { Store } from "@livestore/livestore";
import { toast as sonnerToast } from "sonner";

import { labels$ } from "@/livestore/live-store/queries";
import { events } from "@/livestore/live-store/events";
import { liveSchema } from "@/livestore/live-store/schema";
import { Label } from "@/types";
import { LABEL_COLORS } from "@/constants/labelColors";
import { generateLabelId } from "@/lib/utils";

interface UseLabelManagementProps {
  selectedLabels: readonly Label[];
  onLabelsChange: (labels: readonly Label[]) => void;
  liveStore: Store<typeof liveSchema>;
}

interface UseLabelManagementReturn {
  // State
  labelSearch: string;
  setLabelSearch: (value: string) => void;
  isLabelPopoverOpen: boolean;
  setIsLabelPopoverOpen: (open: boolean) => void;

  // Data
  allLabels: readonly Label[];
  filteredLabels: readonly Label[];
  showCreateOption: boolean;

  // Actions
  handleLabelToggle: (label: Label) => void;
  handleRemoveLabel: (labelId: string) => void;
  handleCreateLabel: (labelName: string) => void;
}

export const useLabelManagement = ({
  selectedLabels,
  onLabelsChange,
  liveStore,
}: UseLabelManagementProps): UseLabelManagementReturn => {
  const [labelSearch, setLabelSearch] = useState("");
  const [isLabelPopoverOpen, setIsLabelPopoverOpen] = useState(false);

  const allLabels = useQuery(labels$, { store: liveStore });

  const filteredLabels = useMemo(
    () =>
      allLabels.filter((label) =>
        label.name.toLowerCase().includes(labelSearch.toLowerCase()),
      ),
    [allLabels, labelSearch],
  );

  const showCreateOption = useMemo(
    () =>
      labelSearch.trim().length > 0 &&
      !allLabels.some(
        (label) =>
          label.name.toLowerCase() === labelSearch.trim().toLowerCase(),
      ),
    [allLabels, labelSearch],
  );

  const handleLabelToggle = useCallback(
    (label: Label) => {
      const isSelected = selectedLabels.some((l: Label) => l.id === label.id);
      if (isSelected) {
        onLabelsChange(selectedLabels.filter((l: Label) => l.id !== label.id));
      } else {
        onLabelsChange([...selectedLabels, label]);
      }
    },
    [selectedLabels, onLabelsChange],
  );

  const handleRemoveLabel = useCallback(
    (labelId: string) => {
      onLabelsChange(selectedLabels.filter((l: Label) => l.id !== labelId));
    },
    [selectedLabels, onLabelsChange],
  );

  const handleCreateLabel = useCallback(
    (labelName: string) => {
      const newLabelId = generateLabelId();
      const newColor =
        LABEL_COLORS[allLabels.length % LABEL_COLORS.length] || "#888888";
      const newLabel: Label = {
        id: newLabelId,
        name: labelName,
        color: newColor,
      };

      liveStore.commit(events.labelCreated(newLabel));
      sonnerToast.success("Label Created", {
        description: `Label "${labelName}" has been created.`,
      });
      handleLabelToggle(newLabel);
      setLabelSearch("");
      setIsLabelPopoverOpen(false);
    },
    [allLabels.length, handleLabelToggle, liveStore],
  );

  return {
    // State
    labelSearch,
    setLabelSearch,
    isLabelPopoverOpen,
    setIsLabelPopoverOpen,

    // Data
    allLabels,
    filteredLabels,
    showCreateOption,

    // Actions
    handleLabelToggle,
    handleRemoveLabel,
    handleCreateLabel,
  };
};
