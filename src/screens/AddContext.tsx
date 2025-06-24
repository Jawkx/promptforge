import React from "react";
import { useLocation } from "wouter";
import { toast as sonnerToast } from "sonner";
import { LucideSave } from "lucide-react";
import { contextLibraryEvents } from "@/livestore/context-library-store/events";
import { getRandomUntitledPlaceholder } from "@/constants/titlePlaceholders";
import { Dialog } from "@/components/ui/dialog";
import { generateId } from "@/utils";
import ContextForm from "@/features/shared/ContextForm";
import { ContextFormData } from "@/types";
import { useAppStores } from "@/store/LiveStoreProvider";

const AddContext: React.FC = () => {
  const [, navigate] = useLocation();
  const { contextLibraryStore } = useAppStores();

  const handleClose = () => {
    navigate("/");
  };

  const handleSubmit = (data: ContextFormData) => {
    const finalContent = data.content.trim();
    if (!finalContent) {
      sonnerToast.error("Content Required", {
        description: "The context content cannot be empty.",
      });
      return;
    }

    const finalTitle = data.title.trim() || getRandomUntitledPlaceholder();

    contextLibraryStore.commit(
      contextLibraryEvents.contextCreated({
        id: generateId(),
        title: finalTitle,
        content: finalContent,
        createdAt: Date.now(),
      }),
    );

    sonnerToast.success("Context Added", {
      description: `Context "${finalTitle}" has been added.`,
    });

    handleClose();
  };

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
