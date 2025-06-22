import React from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { LucideSave } from "lucide-react";
import { useStore } from "@livestore/react";
import { events } from "@/livestore/events";
import { getRandomUntitledPlaceholder } from "@/constants/titlePlaceholders";
import { Dialog } from "@/components/ui/dialog";
import { generateId } from "@/utils";
import ContextForm from "@/features/shared/ContextForm";
import { ContextFormData } from "@/types";

const AddContext: React.FC = () => {
  const [, navigate] = useLocation();
  const { store } = useStore();
  const { toast } = useToast();

  const handleClose = () => {
    navigate("/");
  };

  const handleSubmit = (data: ContextFormData) => {
    const finalContent = data.content.trim();
    if (!finalContent) {
      toast({
        title: "Content Required",
        description: "The context content cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    const finalTitle = data.title.trim() || getRandomUntitledPlaceholder();

    store.commit(
      events.contextCreated({
        id: generateId(),
        title: finalTitle,
        content: finalContent,
        createdAt: Date.now(),
      }),
    );

    toast({
      title: "Context Added",
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
