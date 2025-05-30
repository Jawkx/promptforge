import React, { useState, useEffect } from "react";
import { Context } from "../types";
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
// Removed Label as it's not used in AddContextModal's structure
import { useToast } from "@/hooks/use-toast";

interface EditContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (context: Context) => void;
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
        description: "Title cannot be empty. Original title will be kept if left blank during edit.",
        variant: "destructive",
      });
      // Allow saving if content exists, keep original title
      if (!trimmedContent) {
        toast({
          title: "Content Required",
          description: "Content cannot be empty.",
          variant: "destructive",
        });
        return;
      }
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
      ...context, // Spread existing context to keep ID and category
      title: trimmedTitle || context.title, // Use original title if new one is empty
      content: trimmedContent,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Style matched with AddContextModal */}
      <DialogContent className="border-muted h-1/2 max-w-screen-lg flex flex-col">
        <DialogHeader>
          {/* Style matched with AddContextModal */}
          <DialogTitle className="text-primary">Edit Context</DialogTitle>
          <DialogDescription className="text-foreground">
            Modify the title or content of your context snippet.
          </DialogDescription>
        </DialogHeader>
        {/* Style matched with AddContextModal */}
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mb-3" // Style matched
            placeholder="Title"
          />
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            // Style matched
            className="flex-1 min-h-[200px] mb-3 resize-none"
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
