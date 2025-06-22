import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { LucideSave } from "lucide-react";
import { useStore } from "@livestore/react";
import { events } from "@/livestore/events";
import { getRandomUntitledPlaceholder } from "@/constants/titlePlaceholders";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { generateId } from "@/utils";

const AddContext: React.FC = () => {
  const [, navigate] = useLocation();
  const { store } = useStore();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isMaximized, setIsMaximized] = useState(false);

  const handleClose = () => {
    navigate("/");
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const finalContent = content.trim();
    if (!finalContent) {
      toast({
        title: "Content Required",
        description: "The context content cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    const finalTitle = title.trim() || getRandomUntitledPlaceholder();

    store.commit(
      events.contextCreated({
        id: generateId(),
        title: finalTitle,
        content: finalContent,
        createdAt: Date.now(),
      }),
    );

    toast({
      title: "Context Added",
      description: `Context "${finalTitle}" has been added.`,
    });

    handleClose();
  };

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent
        className="sm:max-w-2xl"
        onMaximizeToggle={() => setIsMaximized((p) => !p)}
        isMaximized={isMaximized}
      >
        <DialogHeader>
          <DialogTitle>Add New Context</DialogTitle>
          <DialogDescription>
            Create a new context snippet to use in your prompts.
          </DialogDescription>
        </DialogHeader>
        <form
          id="add-context-form"
          onSubmit={handleSubmit}
          className={cn(
            "grid gap-4 py-4",
            isMaximized && "flex flex-1 flex-col",
          )}
        >
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (optional, will be auto-generated if blank)"
          />
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={cn("min-h-[250px] resize-none", isMaximized && "flex-1")}
            placeholder="Paste your context content here."
          />
        </form>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" form="add-context-form">
            <LucideSave />
            Add Context
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddContext;
