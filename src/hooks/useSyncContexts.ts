import { useEffect } from "react";
import { Context, SelectedContext } from "@/types";
import { toast as sonnerToast } from "sonner";

interface UseSyncContextsParams {
  libraryContexts: readonly Context[];
  selectedContexts: SelectedContext[];
  updateSelectedContext: (context: SelectedContext) => void;
  removeMultipleSelectedContextsFromPrompt: (contextIds: string[]) => void;
}

/**
 * A hook to synchronize the selected contexts (Zustand state) with the
 * main context library (Livestore state).
 *
 * It automatically updates "pristine" (unmodified) selected contexts when their
 * original version in the library changes, and removes selected contexts if their
 * original has been deleted from the library.
 */
export const useSyncContexts = ({
  libraryContexts,
  selectedContexts,
  updateSelectedContext,
  removeMultipleSelectedContextsFromPrompt,
}: UseSyncContextsParams) => {
  useEffect(() => {
    if (selectedContexts.length === 0 || libraryContexts.length === 0) {
      return; // No need to sync if one list is empty
    }

    const libraryContextsMap = new Map(libraryContexts.map((c) => [c.id, c]));

    const updatesToApply: SelectedContext[] = [];
    const idsToRemove: string[] = [];

    selectedContexts.forEach((selectedItem) => {
      // Ignore contexts that don't have a corresponding item in the library
      // (e.g., they were pasted directly into the selected contexts list)
      if (!selectedItem.originalContextId) {
        return;
      }

      const libraryItem = libraryContextsMap.get(
        selectedItem.originalContextId,
      );

      // Case 1: The original context was deleted from the library.
      if (!libraryItem) {
        idsToRemove.push(selectedItem.id);
        return;
      }

      // Case 2: The library item has been updated.
      if (libraryItem.version !== selectedItem.originalVersion) {
        const isPristine =
          selectedItem.version === selectedItem.originalVersion;

        // If the selected context is "pristine" (unmodified), auto-update it.
        if (isPristine) {
          updatesToApply.push({
            ...selectedItem,
            title: libraryItem.title,
            content: libraryItem.content,
            tokenCount: libraryItem.tokenCount,
            version: libraryItem.version,
            originalVersion: libraryItem.version,
            createdAt: libraryItem.createdAt,
            updatedAt: libraryItem.updatedAt,
            labels: libraryItem.labels,
          });
        }
      }
    });

    // Apply all collected changes
    if (updatesToApply.length > 0) {
      updatesToApply.forEach((context) => updateSelectedContext(context));
      sonnerToast.success("Contexts Auto-Updated", {
        description: `${updatesToApply.length} selected context(s) were automatically updated from the library.`,
      });
    }

    if (idsToRemove.length > 0) {
      removeMultipleSelectedContextsFromPrompt(idsToRemove);
      sonnerToast.error("Stale Contexts Removed", {
        description: `${idsToRemove.length} selected context(s) were removed because their original was deleted from the library.`,
      });
    }
  }, [
    libraryContexts,
    selectedContexts,
    updateSelectedContext,
    removeMultipleSelectedContextsFromPrompt,
  ]);
};
