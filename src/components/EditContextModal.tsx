import React, { useState, useEffect } from "react";
import { Context, CONTEXT_COLOR_OPTIONS, ContextColorValue } from "../types";
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
  const [colorLabel, setColorLabel] = useState<ContextColorValue>("none");
  const { toast } = useToast();

  useEffect(() => {
    if (context && isOpen) {
      setTitle(context.title);
      setContent(context.content);
      setColorLabel(context.colorLabel || "none"); // Initialize color label
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
      ...context,
      title: trimmedTitle || context.title,
      content: trimmedContent,
      colorLabel: colorLabel, // Save selected color label
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-muted h-auto max-h-[70vh] max-w-screen-lg flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-primary">Edit Context</DialogTitle>
          <DialogDescription className="text-foreground">
            Modify the title or content of your context snippet.
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
            <Label htmlFor="editColorLabel" className="mb-1 block text-sm font-medium text-foreground">
              Color Label
            </Label>
            <Select
              value={colorLabel}
              onValueChange={(value) => setColorLabel(value as ContextColorValue)}
            >
              <SelectTrigger id="editColorLabel">
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
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditContextModal;
