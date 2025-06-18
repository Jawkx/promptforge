import { useEffect } from "react";
import { Context, SelectedContext } from "@/types";
import { generateContextHash } from "@/utils";
import { useToast } from "@/hooks/use-toast";

type ToastFn = ReturnType<typeof useToast>["toast"];

interface UseSyncContextsParams {
  libraryContexts: readonly Context[];
  selectedContexts: SelectedContext[];
  updateSelectedContext: (context: SelectedContext) => void;
  removeMultipleSelectedContextsFromPrompt: (contextIds: string[]) => void;
  toast: ToastFn;
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
  toast,
}: UseSyncContextsParams) => {
  useEffect(() => {
    if (selectedContexts.length === 0 || libraryContexts.length === 0) {
      return; // No need to sync if one list is empty
    }

    const libraryContextsMap = new Map(libraryContexts.map((c) => [c.id, c]));

    const updatesToApply: SelectedContext[] = [];
    const idsToRemove: string[] = [];

    selectedContexts.forEach((selectedItem) => {
      const libraryItem = libraryContextsMap.get(
        selectedItem.originalContextId,
      );

      // Case 1: The original context was deleted from the library.
      if (!libraryItem) {
        idsToRemove.push(selectedItem.id);
        return;
      }

      const newLibraryHash = generateContextHash(
        libraryItem.title,
        libraryItem.content,
      );

      // Case 2: The library item has been updated.
      if (newLibraryHash !== selectedItem.originalHash) {
        const selectedItemCurrentHash = generateContextHash(
          selectedItem.title,
          selectedItem.content,
        );

        // If the selected context is "pristine" (unmodified), auto-update it.
        if (selectedItemCurrentHash === selectedItem.originalHash) {
          updatesToApply.push({
            ...selectedItem,
            title: libraryItem.title,
            content: libraryItem.content,
            charCount: libraryItem.charCount,
            originalHash: newLibraryHash,
          });
        }
      }
    });

    // Apply all collected changes
    if (updatesToApply.length > 0) {
      updatesToApply.forEach((context) => updateSelectedContext(context));
      toast({
        title: "Contexts Auto-Updated",
        description: `${updatesToApply.length} selected context(s) were automatically updated from the library.`,
      });
    }

    if (idsToRemove.length > 0) {
      removeMultipleSelectedContextsFromPrompt(idsToRemove);
      toast({
        title: "Stale Contexts Removed",
        description: `${idsToRemove.length} selected context(s) were removed because their original was deleted from the library.`,
        variant: "destructive",
      });
    }
  }, [
    libraryContexts,
    selectedContexts,
    updateSelectedContext,
    removeMultipleSelectedContextsFromPrompt,
    toast,
  ]);
};
