import React, { useCallback } from "react";
import { useLocation } from "wouter";
import { toast as sonnerToast } from "sonner";
import { LucideSave } from "lucide-react";
import { contextLibraryEvents } from "@/livestore/context-library-store/events";
import { getRandomUntitledPlaceholder } from "@/constants/titlePlaceholders";
import { Dialog } from "@/components/ui/dialog";
import { generateId } from "@/lib/utils";
import ContextForm from "@/features/shared/ContextForm";
import { ContextFormData } from "@/types";
import { useLiveStores } from "@/store/LiveStoreProvider";
import { v4 as uuid } from "uuid";

const AddContext: React.FC = () => {
  const [, navigate] = useLocation();
  const { contextLibraryStore } = useLiveStores();

  const handleClose = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const handleSubmit = useCallback(
    (data: ContextFormData) => {
      const finalContent = data.content.trim();
      if (!finalContent) {
        sonnerToast.error("Content Required", {
          description: "The context content cannot be empty.",
        });
        return;
      }

      const finalTitle = data.title.trim() || getRandomUntitledPlaceholder();
      const contextId = generateId();

      contextLibraryStore.commit(
        contextLibraryEvents.contextCreated({
          id: contextId,
          title: finalTitle,
          content: finalContent,
          createdAt: Date.now(),
          version: uuid(),
        }),
      );

      if (data.labels && data.labels.length > 0) {
        contextLibraryStore.commit(
          contextLibraryEvents.contextLabelsUpdated({
            contextId,
            labelIds: data.labels.map((label) => label.id),
          }),
        );
      }

      sonnerToast.success("Context Added", {
        description: `Context "${finalTitle}" has been added.`,
      });

      handleClose();
    },
    [contextLibraryStore, handleClose],
  );

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <ContextForm
        title=""
        content=""
        onSubmit={handleSubmit}
        onCancel={handleClose}
        dialogTitle="Add New Context"
        dialogDescription="Create a new context snippet to use in your prompts."
        submitButtonText="Add Context"
        submitButtonIcon={<LucideSave />}
      />
    </Dialog>
  );
};

export default AddContext;
