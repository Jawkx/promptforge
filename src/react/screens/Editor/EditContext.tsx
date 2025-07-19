import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { SelectedContext, Label } from "@/types";
import { toast as sonnerToast } from "sonner";
import { useQuery } from "@livestore/react";
import { contextLibraryEvents } from "@/livestore/context-library-store/events";
import { contexts$ } from "@/livestore/context-library-store/queries";
import { useLocalStore } from "@/store/localStore";
import { Dialog } from "@/components/ui/dialog";
import ContextFormUI from "@/features/shared/ContextForm/ContextFormUI";
import LabelSelector from "@/features/shared/ContextForm/LabelSelector";
import { useContextLibraryStore } from "@/store/ContextLibraryLiveStoreProvider";
import { estimateTokens } from "@/lib/utils";
import { v4 as uuid } from "uuid";
import { useDebouncedCallback } from "use-debounce";

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

  const contextToEdit = React.useMemo(() => {
    if (type === "library") {
      return contexts.find((c) => c.id === contextId);
    } else if (type === "selected") {
      return selectedContexts.find((c) => c.id === contextId);
    }
  }, [contextId, contexts, selectedContexts, type]);

  // Initialize form state directly and safely
  const [title, setTitle] = useState(() => contextToEdit?.title || "");
  const [content, setContent] = useState(() => contextToEdit?.content || "");
  const [labels, setLabels] = useState<readonly Label[]>(
    () => contextToEdit?.labels || [],
  );

  // Track initial values for change detection
  const [initialTitle] = useState(() => contextToEdit?.title || "");
  const [initialContent] = useState(() => contextToEdit?.content || "");
  const [initialLabels] = useState(() => contextToEdit?.labels || []);
  const [isMaximized, setIsMaximized] = useState(false);

  const [isOpen, setIsOpen] = useState(false);

  const saveData = useCallback(
    (
      titleValue: string,
      contentValue: string,
      labelsValue: readonly Label[],
      showToast = false,
    ) => {
      if (!contextId) return;

      const trimmedTitle = titleValue.trim();
      const trimmedContent = contentValue.trim();

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
        if (labelsValue !== undefined) {
          contextLibraryStore.commit(
            contextLibraryEvents.contextLabelsUpdated({
              contextId,
              labelIds: labelsValue.map((label) => label.id),
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
            labels: labelsValue || contextToUpdate.labels,
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
    const hasChanges =
      title !== initialTitle ||
      content !== initialContent ||
      JSON.stringify(labels) !== JSON.stringify(initialLabels);

    if (hasChanges) {
      saveData(title, content, labels, false);
    }

    setIsOpen(false);
    setTimeout(() => {
      navigate("/");
    }, 200);
  }, [
    title,
    content,
    labels,
    initialTitle,
    initialContent,
    initialLabels,
    saveData,
    navigate,
  ]);
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      saveData(title, content, labels, true);
      handleClose();
    },
    [title, content, labels, saveData, handleClose],
  );

  // Auto-save with debouncing
  const debouncedSave = useDebouncedCallback(
    (
      titleValue: string,
      contentValue: string,
      labelsValue: readonly Label[],
    ) => {
      saveData(titleValue, contentValue, labelsValue, false);
    },
    1000,
  );

  // Handle form field changes with auto-save
  const handleTitleChange = useCallback(
    (value: string) => {
      setTitle(value);
      debouncedSave(value, content, labels);
    },
    [content, labels, debouncedSave],
  );

  const handleContentChange = useCallback(
    (value: string) => {
      setContent(value);
      debouncedSave(title, value, labels);
    },
    [title, labels, debouncedSave],
  );

  const handleLabelsChange = useCallback(
    (value: readonly Label[]) => {
      setLabels(value);
      debouncedSave(title, content, value);
    },
    [title, content, debouncedSave],
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

  if (!contextToEdit) {
    return null; // Render nothing while we navigate away.
  }

  const screenTitle =
    type === "library" ? "Edit Library Context" : "Edit Selected Context";

  const labelSelector = (
    <LabelSelector
      selectedLabels={labels}
      onLabelsChange={handleLabelsChange}
      contextLibraryStore={contextLibraryStore}
    />
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <ContextFormUI
        title={title}
        content={content}
        labels={labels}
        onTitleChange={handleTitleChange}
        onContentChange={handleContentChange}
        onSubmit={handleSubmit}
        onCancel={handleClose}
        dialogTitle={screenTitle}
        dialogDescription="Modify the title or content of your context snippet."
        isMaximized={isMaximized}
        onMaximizeToggle={() => setIsMaximized((p) => !p)}
        autoSave={true}
        labelSelector={labelSelector}
      />
    </Dialog>
  );
};

export default EditContext;
