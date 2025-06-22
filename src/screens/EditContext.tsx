import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Context, SelectedContext, ContextFormData } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { LucideSave } from "lucide-react";
import { useQuery, useStore } from "@livestore/react";
import { events } from "@/livestore/events";
import { contexts$ } from "@/livestore/queries";
import { useLocalStore } from "@/store/app.store";
import { Dialog } from "@/components/ui/dialog";
import ContextForm from "@/features/shared/ContextForm";

interface EditContextProps {
  type: "library" | "selected";
  id: string;
}

const EditContext: React.FC<EditContextProps> = ({ type, id: contextId }) => {
  const [, navigate] = useLocation();
  const { store } = useStore();

  const selectedContexts = useLocalStore((state) => state.selectedContexts);
  const updateSelectedContext = useLocalStore(
    (state) => state.updateSelectedContext,
  );
  const contexts = useQuery(contexts$);
  const { toast } = useToast();

  const [initialData, setInitialData] = useState<ContextFormData | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);

  const handleClose = useCallback(() => {
    navigate("/");
  }, [navigate]);

  useEffect(() => {
    let foundContext: Context | SelectedContext | undefined;
    if (type === "library") {
      foundContext = contexts.find((c) => c.id === contextId);
    } else if (type === "selected") {
      foundContext = selectedContexts.find((c) => c.id === contextId);
    }

    if (foundContext) {
      setInitialData({
        id: foundContext.id,
        title: foundContext.title,
        content: foundContext.content,
      });
    } else {
      toast({
        title: "Context Not Found",
        description:
          "The context you are trying to edit does not exist or could not be found.",
        variant: "destructive",
      });
      handleClose();
    }
  }, [contextId, type, contexts, selectedContexts, toast, handleClose]);

  const handleSubmit = useCallback(
    (data: ContextFormData) => {
      if (!contextId || !initialData) return;

      const trimmedTitle = data.title.trim();
      const trimmedContent = data.content.trim();

      if (!trimmedTitle) {
        toast({
          title: "Title Required",
          description: "Title cannot be empty.",
          variant: "destructive",
        });
        return;
      }
      if (!trimmedContent) {
        toast({
          title: "Content Required",
          description: "Content cannot be empty.",
          variant: "destructive",
        });
        return;
      }

      if (type === "library") {
        store.commit(
          events.contextUpdated({
            id: contextId,
            title: trimmedTitle,
            content: trimmedContent,
            updatedAt: Date.now(),
          }),
        );
        toast({
          title: "Context Updated",
          description: `Context "${trimmedTitle}" has been updated.`,
        });
      } else if (type === "selected") {
        const updatedContext: SelectedContext = {
          ...(initialData as SelectedContext),
          title: trimmedTitle,
          content: trimmedContent,
          charCount: trimmedContent.length,
          updatedAt: Date.now(),
        };
        updateSelectedContext(updatedContext);
        toast({
          title: "Selected Context Updated",
          description: `Selected context "${trimmedTitle}" has been updated.`,
        });
      }
      handleClose();
    },
    [
      contextId,
      initialData,
      type,
      store,
      updateSelectedContext,
      toast,
      handleClose,
    ],
  );

  if (!initialData) {
    return null;
  }

  const screenTitle =
    type === "library" ? "Edit Library Context" : "Edit Selected Context";

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <ContextForm
        id={initialData.id}
        title={initialData.title}
        content={initialData.content}
        onSubmit={handleSubmit}
        onCancel={handleClose}
        dialogTitle={screenTitle}
        dialogDescription="Modify the title or content of your context snippet."
        submitButtonText="Save Changes"
        submitButtonIcon={<LucideSave />}
        isMaximized={isMaximized}
        onMaximizeToggle={() => setIsMaximized((p) => !p)}
      />
    </Dialog>
  );
};

export default EditContext;
