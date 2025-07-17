import React, { useState, useMemo, useCallback } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, PlusCircle } from "lucide-react";
import { useQuery } from "@livestore/react";
import { contexts$, labels$ } from "@/livestore/context-library-store/queries";
import { contextLibraryEvents } from "@/livestore/context-library-store/events";
import { useContextLibraryStore } from "@/store/ContextLibraryLiveStoreProvider";
import { Label } from "@/types";
import { LABEL_COLORS } from "@/constants/labelColors";
import { generateLabelId } from "@/lib/utils";
import { toast as sonnerToast } from "sonner";

interface LabelAssignmentProps {
  contextIds: string[];
}

export const LabelAssignment: React.FC<LabelAssignmentProps> = ({
  contextIds,
}) => {
  const contextLibraryStore = useContextLibraryStore();
  const allLabels = useQuery(labels$, { store: contextLibraryStore });
  const allContexts = useQuery(contexts$, { store: contextLibraryStore });
  const [search, setSearch] = useState("");

  const selectedContexts = useMemo(
    () => allContexts.filter((c) => contextIds.includes(c.id)),
    [allContexts, contextIds],
  );

  const assignedLabelIds = useMemo(() => {
    if (selectedContexts.length === 0) return new Set<string>();
    // Find intersection of labels for all selected contexts
    const firstContextLabels = new Set(
      selectedContexts[0].labels.map((l) => l.id),
    );
    for (let i = 1; i < selectedContexts.length; i++) {
      const currentContextLabels = new Set(
        selectedContexts[i].labels.map((l) => l.id),
      );
      for (const labelId of Array.from(firstContextLabels)) {
        if (!currentContextLabels.has(labelId)) {
          firstContextLabels.delete(labelId);
        }
      }
    }
    return firstContextLabels;
  }, [selectedContexts]);

  const handleLabelToggle = useCallback(
    (label: Label) => {
      const newLabelIds = new Set(assignedLabelIds);
      if (newLabelIds.has(label.id)) {
        newLabelIds.delete(label.id);
      } else {
        newLabelIds.add(label.id);
      }

      const labelIdArray = Array.from(newLabelIds);
      contextIds.forEach((contextId) => {
        contextLibraryStore.commit(
          contextLibraryEvents.contextLabelsUpdated({
            contextId,
            labelIds: labelIdArray,
          }),
        );
      });
    },
    [assignedLabelIds, contextIds, contextLibraryStore],
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

      contextLibraryStore.commit(contextLibraryEvents.labelCreated(newLabel));
      sonnerToast.success("Label Created", {
        description: `Label "${labelName}" has been created.`,
      });
      handleLabelToggle(newLabel);
      setSearch("");
    },
    [allLabels.length, handleLabelToggle, contextLibraryStore],
  );

  const filteredLabels = useMemo(
    () =>
      allLabels.filter((label) =>
        label.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [allLabels, search],
  );

  const showCreateOption =
    search.trim().length > 0 &&
    !allLabels.some(
      (label) => label.name.toLowerCase() === search.trim().toLowerCase(),
    );

  return (
    <Command className="min-w-[200px] ">
      <CommandInput
        placeholder="Search or create label..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No labels found.</CommandEmpty>
        <CommandGroup>
          {filteredLabels.map((label) => {
            const isAssigned = assignedLabelIds.has(label.id);
            return (
              <CommandItem
                key={label.id}
                onSelect={() => handleLabelToggle(label)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: label.color }}
                  />
                  <span>{label.name}</span>
                </div>
                {isAssigned && <Check className="h-4 w-4" />}
              </CommandItem>
            );
          })}
          {showCreateOption && (
            <CommandItem
              onSelect={() => handleCreateLabel(search.trim())}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create "{search.trim()}"</span>
            </CommandItem>
          )}
        </CommandGroup>
      </CommandList>
    </Command>
  );
};
