import React, { useState, useEffect } from "react";
import { ContextCreationData } from "../types"; // Using ContextCreationData
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
import { Content } from "@tiptap/core"
import { useToast } from "@/hooks/use-toast";
import { MinimalTiptapEditor } from "./ui/minimal-tiptap";

interface AddContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newContext: ContextCreationData) => void;
}

const AddContextModal: React.FC<AddContextModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<Content>("");
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setContent("");
    }
  }, [isOpen]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const finalTitle = title.trim();

    if (!finalTitle && !content) {
      toast({
        title: "Empty Context",
        description:
          "Both title and content are empty. Please add some content or a title.",
        variant: "destructive",
      });
      return;
    }
    if (!content) {
      toast({
        title: "Empty Content",
        description: "Content cannot be empty if title is also nearly empty.",
        variant: "destructive",
      });
      return;
    }

    onSave({
      title: finalTitle,
      content: content as string,
      category: "Uncategorized",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-muted max-w-screen-lg flex flex-col">

        <DialogHeader>
          <DialogTitle className="text-primary">Add New Context</DialogTitle>
          <DialogDescription className="text-foreground">
            Create a new context snippet to use in your prompts. Title will be
            auto-generated if left blank.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1">

          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mb-4"
            placeholder="Title"
          />

          <MinimalTiptapEditor
            value={content}
            onChange={setContent}
            output="text"
            className="flex-1 mb-5 max-h-96"
            editorContentClassName="p-3 overflow-y-auto flex-1"
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
