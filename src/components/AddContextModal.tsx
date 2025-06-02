import React, { useState, useEffect } from "react";
import { ContextFormData, GlobalLabel } from "../types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLabelManager } from "@/hooks/useLabelManager";
import LabelManagerUI from "./LabelManager";


interface AddContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newContextData: ContextFormData) => void;
  allGlobalLabels: GlobalLabel[];
}

const AddContextModal: React.FC<AddContextModalProps> = ({
  isOpen,
  onClose,
  onSave,
  allGlobalLabels,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const labelManager = useLabelManager({
    initialLabelsForContext: [],
    allGlobalLabels: allGlobalLabels,
  });

  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setContent("");
      // Reset label manager with current global labels, and empty initial context labels
      labelManager.initializeLabels([], allGlobalLabels);
    }
  }, [isOpen, allGlobalLabels, labelManager.initializeLabels]);


  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const finalTitle = title.trim();
    const finalContent = content.trim();

    if (!finalTitle && !finalContent) {
      toast({
        title: "Empty Context",
        description: "Both title and content are empty. Please add some content or a title.",
        variant: "destructive",
      });
      return;
    }
    if (!finalContent && finalTitle) {
      // Allow this case
    } else if (!finalContent) {
      toast({
        title: "Empty Content",
        description: "Content cannot be empty if title is also blank or nearly blank.",
        variant: "destructive",
      });
      return;
    }


    onSave({
      title: finalTitle,
      content: finalContent,
      labels: labelManager.getLabelsForSave(),
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-muted h-auto max-h-[85vh] max-w-screen-lg flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-primary">Add New Context</DialogTitle>
          <DialogDescription className="text-foreground">
            Create a new context snippet to use in your prompts. Title will be
            auto-generated if left blank. Labels can be created or selected.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 overflow-hidden">
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (optional, will be auto-generated if blank)"
          />

          <LabelManagerUI
            currentContextLabels={labelManager.currentContextLabels}
            onUpdateLabelDetails={labelManager.handleUpdateLabelDetailsInContext}
            onRemoveLabelFromContext={labelManager.handleRemoveLabelFromContext}
            newLabelColor={labelManager.newLabelColor}
            setNewLabelColor={labelManager.setNewLabelColor}
            availableGlobalLabels={labelManager.availableGlobalLabelsToSelect}
            createTemporaryLabel={labelManager.createTemporaryLabel}
            replaceAllCurrentContextLabels={labelManager.replaceAllCurrentContextLabels}
            allGlobalLabels={allGlobalLabels}
          />

          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 min-h-[150px] resize-none"
            placeholder="Paste your context content here."
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Add Context</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddContextModal;
