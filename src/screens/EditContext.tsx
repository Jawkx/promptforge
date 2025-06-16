import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Context, SelectedContext } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { LucideSave } from "lucide-react";
import { useQuery, useStore } from "@livestore/react";
import { events } from "@/livestore/events";
import { contexts$ } from "@/livestore/queries";
import { useLocalStore } from "@/localStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [contextToEdit, setContextToEdit] = useState<
    Context | SelectedContext | null
  >(null);

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
      setContextToEdit(foundContext);
      setTitle(foundContext.title);
      setContent(foundContext.content);
    } else {
      // If context is not found, show a toast and close the modal.
      toast({
        title: "Context Not Found",
        description:
          "The context you are trying to edit does not exist or could not be found.",
        variant: "destructive",
      });
      handleClose();
    }
  }, [contextId, type, contexts, selectedContexts, toast, handleClose]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!contextId || !contextToEdit) return;

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

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
        }),
      );
      toast({
        title: "Context Updated",
        description: `Context "${trimmedTitle}" has been updated.`,
      });
    } else if (type === "selected") {
      const updatedContext: SelectedContext = {
        ...(contextToEdit as SelectedContext),
        title: trimmedTitle,
        content: trimmedContent,
        charCount: trimmedContent.length,
      };
      updateSelectedContext(updatedContext);
      toast({
        title: "Selected Context Updated",
        description: `Selected context "${trimmedTitle}" has been updated.`,
      });
    }
    handleClose();
  };

  if (!contextToEdit) {
    // Render nothing while context is being found or if it's not found (it will be closed by useEffect)
    return null;
  }

  const screenTitle =
    type === "library" ? "Edit Library Context" : "Edit Selected Context";

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-2xl ">
        <DialogHeader>
          <DialogTitle>{screenTitle}</DialogTitle>
          <DialogDescription>
            Modify the title or content of your context snippet.
          </DialogDescription>
        </DialogHeader>
        <form
          id="edit-context-form"
          onSubmit={handleSubmit}
          className="grid gap-4 py-4"
        >
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
          />
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 min-h-[250px] resize-y"
            placeholder="Paste your context content here."
          />
        </form>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" form="edit-context-form">
            <LucideSave />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditContext;
