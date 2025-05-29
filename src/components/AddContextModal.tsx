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
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface AddContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (context: Omit<Context, "id">) => void;
  contextsCount: number; // To generate unique default titles
}

const AddContextModal: React.FC<AddContextModalProps> = ({
  isOpen,
  onClose,
  onSave,
  contextsCount,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setContent("");
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalTitle = title.trim();
    if (!finalTitle && !content.trim()) {
      toast({
        title: "Empty Context",
        description:
          "Both title and content are empty. Please add some content.",
        variant: "destructive",
      });
      return;
    }
    if (!finalTitle) {
      finalTitle = `Untitled (${contextsCount + 1})`;
    }
    if (!content.trim()) {
      toast({
        title: "Empty Content",
        description: "Content cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    onSave({
      title: finalTitle,
      content: content.trim(),
      category: "Uncategorized", // Default category or implement category input
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="text-primary">Add New Context</DialogTitle>
          <DialogDescription className="text-foreground">
            Create a new context snippet to use in your prompts.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right text-foreground">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
                placeholder="Default title will be 'Untitled (N)' if left blank"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="content" className="text-right text-foreground">
                Content
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="col-span-3 min-h-[200px]"
                placeholder="Paste your context content here."
              />
            </div>
          </div>
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
