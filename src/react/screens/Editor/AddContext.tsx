import React, { useCallback, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast as sonnerToast } from "sonner";
import { LucideSave } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { contextLibraryEvents } from "@/livestore/context-library-store/events";
import { getRandomUntitledPlaceholder } from "@/constants/randomNames";
import { Dialog } from "@/components/ui/dialog";
import { generateId } from "@/lib/utils";
import ContextFormUI from "@/features/shared/ContextForm/ContextFormUI";
import LabelSelector from "@/features/shared/ContextForm/LabelSelector";
import { Label } from "@/types";
import { useContextLibraryStore } from "@/store/ContextLibraryLiveStoreProvider";
import { v4 as uuid } from "uuid";

const AddContext: React.FC = () => {
  const [, navigate] = useLocation();
  const { user } = useUser();
  const contextLibraryStore = useContextLibraryStore();
  const [isMaximized, setIsMaximized] = useState(false);

  const [isOpen, setIsOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [labels, setLabels] = useState<readonly Label[]>([]);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => {
      navigate("/");
    }, 200);
  }, [navigate]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const finalContent = content.trim();
      if (!finalContent) {
        sonnerToast.error("Content Required", {
          description: "The context content cannot be empty.",
        });
        return;
      }

      const finalTitle = title.trim() || getRandomUntitledPlaceholder();
      const contextId = generateId();

      // Get user ID (either authenticated user or anonymous user from session storage)
      let userId: string;
      if (user) {
        userId = user.id;
      } else {
        const anonymousId = sessionStorage.getItem("anonymousUserId");
        if (anonymousId) {
          userId = anonymousId;
        } else {
          // This shouldn't happen if LiveStoreProvider is working correctly
          userId = "anonymous";
        }
      }

      contextLibraryStore.commit(
        contextLibraryEvents.contextCreated({
          id: contextId,
          title: finalTitle,
          content: finalContent,
          createdAt: Date.now(),
          version: uuid(),
          creatorId: userId,
        }),
      );

      if (labels && labels.length > 0) {
        contextLibraryStore.commit(
          contextLibraryEvents.contextLabelsUpdated({
            contextId,
            labelIds: labels.map((label) => label.id),
          }),
        );
      }

      sonnerToast.success("Context Added", {
        description: `Context "${finalTitle}" has been added.`,
      });

      handleClose();
    },
    [content, title, labels, contextLibraryStore, handleClose, user],
  );

  const labelSelector = (
    <LabelSelector
      selectedLabels={labels}
      onLabelsChange={setLabels}
      contextLibraryStore={contextLibraryStore}
    />
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <ContextFormUI
        title={title}
        content={content}
        labels={labels}
        onTitleChange={setTitle}
        onContentChange={setContent}
        onSubmit={handleSubmit}
        onCancel={handleClose}
        dialogTitle="Add New Context"
        dialogDescription="Create a new context snippet to use in your prompts."
        submitButtonText="Add Context"
        submitButtonIcon={<LucideSave />}
        isMaximized={isMaximized}
        onMaximizeToggle={() => setIsMaximized((prev) => !prev)}
        labelSelector={labelSelector}
      />
    </Dialog>
  );
};

export default AddContext;
