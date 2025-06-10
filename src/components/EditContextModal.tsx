import React, { useState, useEffect } from "react";
import { Context, ContextFormData } from "../types";
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

interface EditContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedContextData: ContextFormData) => void;
  context: Context | null;
}

const EditContextModal: React.FC<EditContextModalProps> = ({
  isOpen,
  onClose,
  onSave,
  context,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (context && isOpen) {
      setTitle(context.title);
      setContent(context.content);
    }
  }, [context, isOpen]);

  if (!isOpen || !context) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
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

    onSave({
      id: context.id,
      title: trimmedTitle,
      content: trimmedContent,
      labels: [],
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-muted h-auto max-h-[85vh] max-w-screen-lg flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-primary">Edit Context</DialogTitle>
          <DialogDescription className="text-foreground">
            Modify the title, content, or labels of your context snippet.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4">
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
            className="flex-1 min-h-[150px] resize-none"
            placeholder="Paste your context content here."
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditContextModal;
