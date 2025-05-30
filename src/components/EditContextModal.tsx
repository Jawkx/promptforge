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
      category: context.category || "Uncategorized",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Context</DialogTitle>
          <DialogDescription>
            Modify the title or content of your context snippet.
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
              />
            </div>
          </div>
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
