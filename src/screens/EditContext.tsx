import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Context, SelectedContext, ContextFormData } from "@/types";
import { toast as sonnerToast } from "sonner";
import { LucideSave } from "lucide-react";
import { useQuery } from "@livestore/react";
import { contextLibraryEvents } from "@/livestore/context-library-store/events";
import { contexts$ } from "@/livestore/context-library-store/queries";
import { useLocalStore } from "@/store/app.store";
import { Dialog } from "@/components/ui/dialog";
import ContextForm from "@/features/shared/ContextForm";
import { useAppStores } from "@/store/LiveStoreProvider";

interface EditContextProps {
  type: "library" | "selected";
  id: string;
}

const EditContext: React.FC<EditContextProps> = ({ type, id: contextId }) => {
  const [, navigate] = useLocation();
  const { contextLibraryStore } = useAppStores();

  const selectedContexts = useLocalStore((state) => state.selectedContexts);
  const updateSelectedContext = useLocalStore(
    (state) => state.updateSelectedContext,
  );
  const contexts = useQuery(contexts$, { store: contextLibraryStore });

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
      sonnerToast.error("Context Not Found", {
        description:
          "The context you are trying to edit does not exist or could not be found.",
      });
      handleClose();
    }
  }, [contextId, type, contexts, selectedContexts, handleClose]);

  const handleSubmit = useCallback(
    (data: ContextFormData) => {
      if (!contextId || !initialData) return;

      const trimmedTitle = data.title.trim();
      const trimmedContent = data.content.trim();

      if (!trimmedTitle) {
        sonnerToast.error("Title Required", {
          description: "Title cannot be empty.",
        });
        return;
      }
      if (!trimmedContent) {
        sonnerToast.error("Content Required", {
          description: "Content cannot be empty.",
        });
        return;
      }

      if (type === "library") {
        contextLibraryStore.commit(
          contextLibraryEvents.contextUpdated({
            id: contextId,
            title: trimmedTitle,
            content: trimmedContent,
            updatedAt: Date.now(),
          }),
        );
        sonnerToast.success("Context Updated", {
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
        sonnerToast.success("Selected Context Updated", {
          description: `Selected context "${trimmedTitle}" has been updated.`,
        });
      }
      handleClose();
    },
    [
      contextId,
      initialData,
      type,
      contextLibraryStore,
      updateSelectedContext,
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
