import React, { useState, useEffect, useCallback } from "react";
import { SelectedContext, Label, ContextFormData, Context } from "@/types";
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
import { useForm, useWatch } from "react-hook-form";

const EditContext: React.FC = () => {
  const contextLibraryStore = useContextLibraryStore();
  const { editContextModal, closeEditContextModal } = useLocalStore();
  const selectedContexts = useLocalStore((state) => state.selectedContexts);
  const updateSelectedContext = useLocalStore(
    (state) => state.updateSelectedContext,
  );
  const contexts = useQuery(contexts$, { store: contextLibraryStore });

  // Get type and contextId from store state
  const { type, contextId } = editContextModal;

  const contextToEdit = React.useMemo(() => {
    if (type === "library") {
      return contexts.find((c) => c.id === contextId);
    } else if (type === "selected") {
      return selectedContexts.find((c) => c.id === contextId);
    }
  }, [contextId, contexts, selectedContexts, type]);

  // Initialize form with React Hook Form
  const form = useForm<ContextFormData>({
    defaultValues: {
      id: contextId,
      title: contextToEdit?.title || "",
      content: contextToEdit?.content || "",
      labels:
        type === "library"
          ? (contextToEdit as Context)?.labels || []
          : undefined,
    },
  });

  const {
    control,
    handleSubmit: formHandleSubmit,
    setValue,
    formState: { isDirty },
  } = form;

  // Watch form values for auto-save
  const formValues = useWatch({ control });

  const [isMaximized, setIsMaximized] = useState(false);

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

  // Immediate save function specifically for labels
  const saveLabelsImmediately = useCallback(
    (labels: readonly Label[]) => {
      if (!contextId) return;

      try {
        if (type === "library") {
          contextLibraryStore.commit(
            contextLibraryEvents.contextLabelsUpdated({
              contextId,
              labelIds: labels.map((label) => label.id),
            }),
          );
        } else if (type === "selected") {
          const currentContext = useLocalStore
            .getState()
            .selectedContexts.find((c) => c.id === contextId);
          if (currentContext) {
            updateSelectedContext({
              ...currentContext,
              updatedAt: Date.now(),
              version: uuid(),
            });
          }
        }
      } catch (error) {
        console.error("Immediate label save failed:", error);
      }
    },
    [contextId, type, contextLibraryStore, updateSelectedContext],
  );

  // Auto-save with useDebouncedCallback (moved from ContextForm)
  // Updated to exclude labels to prevent duplicate saves
  const debouncedSave = useDebouncedCallback((values: ContextFormData) => {
    const { labels: _labels, ...otherValues } = values;
    saveData(otherValues, false);
  }, 500);

  // Auto-save effect using useWatch + useEffect pattern
  useEffect(() => {
    if (!isDirty) return; // Only save if user made changes

    if (formValues) {
      debouncedSave(formValues as ContextFormData);
    }
  }, [formValues, debouncedSave, isDirty]);

  const handleClose = useCallback(() => {
    // Auto-save on close if there are changes
    if (isDirty) {
      const currentValues = formValues as ContextFormData;
      saveData(currentValues, false);
    }

    closeEditContextModal();
  }, [formValues, isDirty, saveData, closeEditContextModal]);

  const handleSubmit = useCallback(
    (data: ContextFormData) => {
      saveData(data, true);
      handleClose();
    },
    [saveData, handleClose],
  );

  // Handle form field changes
  const handleTitleChange = useCallback(
    (value: string) => {
      setValue("title", value, { shouldDirty: true });
    },
    [setValue],
  );

  const handleContentChange = useCallback(
    (value: string) => {
      setValue("content", value, { shouldDirty: true });
    },
    [setValue],
  );

  const handleLabelsChange = useCallback(
    (value: readonly Label[]) => {
      setValue("labels", value, { shouldDirty: true });
      saveLabelsImmediately(value);
    },
    [setValue, saveLabelsImmediately],
  );

  // Handle the "not found" case.
  useEffect(() => {
    if (!contextToEdit && editContextModal.isOpen) {
      sonnerToast.error("Context Not Found", {
        description:
          "The context you are trying to edit does not exist or could not be found.",
      });
      closeEditContextModal();
    }
  }, [contextToEdit, editContextModal.isOpen, closeEditContextModal]);

  const screenTitle =
    type === "library" ? "Edit Library Context" : "Edit Selected Context";

  const labelSelector = (
    <LabelSelector
      selectedLabels={(formValues?.labels as Label[]) || []}
      onLabelsChange={handleLabelsChange}
      contextLibraryStore={contextLibraryStore}
    />
  );

  return (
    <Dialog
      open={editContextModal.isOpen}
      onOpenChange={(open) => !open && handleClose()}
    >
      {contextToEdit ? (
        <ContextFormUI
          title={formValues?.title || ""}
          content={formValues?.content || ""}
          labels={(formValues?.labels as Label[]) || []}
          onTitleChange={handleTitleChange}
          onContentChange={handleContentChange}
          onSubmit={formHandleSubmit(handleSubmit)}
          onCancel={handleClose}
          dialogTitle={screenTitle}
          dialogDescription="Modify the title or content of your context snippet."
          isMaximized={isMaximized}
          onMaximizeToggle={() => setIsMaximized((p) => !p)}
          autoSave={true}
          labelSelector={type === "library" ? labelSelector : undefined}
        />
      ) : null}
    </Dialog>
  );
};

export default EditContext;
