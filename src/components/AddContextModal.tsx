import React, { useState, useEffect } from "react";
import { ContextCreationData, CONTEXT_COLOR_OPTIONS, ContextColorValue } from "../types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

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
  const [content, setContent] = useState("");
  const [colorLabel, setColorLabel] = useState<ContextColorValue>("");
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setContent("");
      setColorLabel(""); // Reset color label on open
    }
  }, [isOpen]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const finalTitle = title.trim();
    const finalContent = content.trim();

    if (!finalTitle && !finalContent) {
      toast({
        title: "Empty Context",
        description:
          "Both title and content are empty. Please add some content or a title.",
        variant: "destructive",
      });
      return;
    }
    if (!finalContent) {
      toast({
        title: "Empty Content",
        description: "Content cannot be empty if title is also nearly empty.",
        variant: "destructive",
      });
      return;
    }

    onSave({
      title: finalTitle,
      content: finalContent,
      colorLabel: colorLabel, // Pass selected color label
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-muted h-auto max-h-[70vh] max-w-screen-lg flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-primary">Add New Context</DialogTitle>
          <DialogDescription className="text-foreground">
            Create a new context snippet to use in your prompts. Title will be
            auto-generated if left blank.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4">
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
          />
          <div>
            <Label htmlFor="colorLabel" className="mb-1 block text-sm font-medium text-foreground">
              Color Label
            </Label>
            <Select
              value={colorLabel}
              onValueChange={(value) => setColorLabel(value as ContextColorValue)}
            >
              <SelectTrigger id="colorLabel">
                <SelectValue placeholder="Select a color..." />
              </SelectTrigger>
              <SelectContent>
                {CONTEXT_COLOR_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block h-3 w-3 rounded-full ${option.twBgClass}`} />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 min-h-[200px] resize-none"
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
