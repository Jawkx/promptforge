import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { SelectedContext, ContextFormData } from "@/types";
import { toast as sonnerToast } from "sonner";
import { useQuery } from "@livestore/react";
import { contextLibraryEvents } from "@/livestore/context-library-store/events";
import { contexts$ } from "@/livestore/context-library-store/queries";
import { useLocalStore } from "@/store/localStore";
import { Dialog } from "@/components/ui/dialog";
import ContextForm from "@/features/shared/ContextForm";
import { useContextLibraryStore } from "@/store/ContextLibraryLiveStoreProvider";
import { estimateTokens } from "@/lib/utils";
import { v4 as uuid } from "uuid";

interface EditContextProps {
  type: "library" | "selected";
  id: string;
}

const EditContext: React.FC<EditContextProps> = ({ type, id: contextId }) => {
  const [, navigate] = useLocation();
  const contextLibraryStore = useContextLibraryStore();

  const selectedContexts = useLocalStore((state) => state.selectedContexts);
  const updateSelectedContext = useLocalStore(
    (state) => state.updateSelectedContext,
  );
  const contexts = useQuery(contexts$, { store: contextLibraryStore });

  // 1. Find the data right away.
  const contextToEdit =
    type === "library"
      ? contexts.find((c) => c.id === contextId)
      : selectedContexts.find((c) => c.id === contextId);

  // 3. Initialize state directly and safely. No useEffect needed for this!
  const [initialData] = useState<ContextFormData | null>(() => {
    if (!contextToEdit) return null;
    return {
      id: contextToEdit.id,
      title: contextToEdit.title,
      content: contextToEdit.content,
      labels: contextToEdit.labels,
    };
  });

  const [currentData, setCurrentData] = useState<ContextFormData | null>(
    initialData,
  );
  const [isMaximized, setIsMaximized] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveData = useCallback(
    (data: ContextFormData, showToast = false) => {
      if (!contextId) return;

      const trimmedTitle = data.title.trim();
      const trimmedContent = data.content.trim();

      if (!trimmedContent) {
        return;
      }

      if (type === "library") {
        contextLibraryStore.commit(
          contextLibraryEvents.contextUpdated({
            id: contextId,
            title: trimmedTitle,
            content: trimmedContent,
            updatedAt: Date.now(),
            version: uuid(),
          }),
        );

        // Update labels if they were changed
        if (data.labels !== undefined) {
          contextLibraryStore.commit(
            contextLibraryEvents.contextLabelsUpdated({
              contextId,
              labelIds: data.labels.map((label) => label.id),
            }),
          );
        }

        if (showToast) {
          sonnerToast.success("Context Updated", {
            description: `Context "${trimmedTitle}" has been updated.`,
          });
        }
      } else if (type === "selected") {
        // Get latest state directly from the store to stabilize this callback.
        const currentSelectedContexts =
          useLocalStore.getState().selectedContexts;
        const contextToUpdate = currentSelectedContexts.find(
          (c) => c.id === contextId,
        );
        if (contextToUpdate) {
          const updatedContext: SelectedContext = {
            ...contextToUpdate,
            title: trimmedTitle,
            content: trimmedContent,
            labels: data.labels || contextToUpdate.labels,
            tokenCount: estimateTokens(trimmedContent),
            updatedAt: Date.now(),
            version: uuid(),
          };
          updateSelectedContext(updatedContext);
          if (showToast) {
            sonnerToast.success("Selected Context Updated", {
              description: `Selected context "${trimmedTitle}" has been updated.`,
            });
          }
        }
      }
    },
    [contextId, type, contextLibraryStore, updateSelectedContext],
  );

  const handleClose = useCallback(() => {
    // Auto-save on close if there are changes
    if (currentData && initialData) {
      const hasChanges =
        currentData.title !== initialData.title ||
        currentData.content !== initialData.content ||
        JSON.stringify(currentData.labels) !==
          JSON.stringify(initialData.labels);

      if (hasChanges) {
        saveData(currentData, false);
      }
    }
    setIsOpen(false);
    setTimeout(() => {
      navigate("/");
    }, 200);
  }, [currentData, initialData, saveData, navigate]);

  const handleSubmit = useCallback(
    (data: ContextFormData) => {
      saveData(data, true);
      handleClose();
    },
    [saveData, handleClose],
  );

  const handleDataChange = useCallback(
    (data: ContextFormData) => {
      setCurrentData(data);

      // Clear existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Set new timeout for auto-save
      debounceTimeoutRef.current = setTimeout(() => {
        saveData(data, false);
      }, 1000); // 1 second debounce
    },
    [saveData],
  );

  useEffect(() => {
    setIsOpen(true);
  }, []);

  // 2. Handle the "not found" case.
  useEffect(() => {
    if (!contextToEdit) {
      sonnerToast.error("Context Not Found", {
        description:
          "The context you are trying to edit does not exist or could not be found.",
      });
      navigate("/");
    }
  }, [contextToEdit, navigate]);

  if (!contextToEdit || !initialData) {
    return null; // Render nothing while we navigate away.
  }

  const screenTitle =
    type === "library" ? "Edit Library Context" : "Edit Selected Context";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <ContextForm
        id={initialData.id}
        title={initialData.title}
        content={initialData.content}
        labels={initialData.labels}
        onSubmit={handleSubmit}
        onCancel={handleClose}
        onDataChange={handleDataChange}
        dialogTitle={screenTitle}
        dialogDescription="Modify the title or content of your context snippet."
        isMaximized={isMaximized}
        onMaximizeToggle={() => setIsMaximized((p) => !p)}
        autoSave={true}
      />
    </Dialog>
  );
};

export default EditContext;
