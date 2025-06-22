import React, { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ContextFormData } from "@/types";

interface ContextFormProps {
  id?: string;
  title: string;
  content: string;
  onSubmit: (data: ContextFormData) => void;
  onCancel: () => void;
  dialogTitle: string;
  dialogDescription: string;
  submitButtonText: string;
  submitButtonIcon?: React.ReactNode;
  isMaximized?: boolean;
  onMaximizeToggle?: () => void;
}

const ContextForm: React.FC<ContextFormProps> = ({
  id,
  title: initialTitle,
  content: initialContent,
  onSubmit,
  onCancel,
  dialogTitle,
  dialogDescription,
  submitButtonText,
  submitButtonIcon,
  isMaximized = false,
  onMaximizeToggle,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
  }, [initialTitle, initialContent]);

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      onSubmit({ id, title, content });
    },
    [id, title, content, onSubmit],
  );

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.target.value);
    },
    [],
  );

  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);
    },
    [],
  );

  return (
    <DialogContent
      className="sm:max-w-2xl"
      onMaximizeToggle={onMaximizeToggle}
      isMaximized={isMaximized}
    >
      <DialogHeader>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogDescription>{dialogDescription}</DialogDescription>
      </DialogHeader>
      <form
        id="context-form"
        onSubmit={handleSubmit}
        className={cn("grid gap-4 py-4", isMaximized && "flex flex-1 flex-col")}
      >
        <Input
          id="title"
          value={title}
          onChange={handleTitleChange}
          placeholder="Title (optional, will be auto-generated if blank)"
        />
        <Textarea
          id="content"
          value={content}
          onChange={handleContentChange}
          className={cn("min-h-[250px] resize-none", isMaximized && "flex-1")}
          placeholder="Paste your context content here."
        />
      </form>
      <DialogFooter>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" form="context-form">
          {submitButtonIcon}
          {submitButtonText}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default ContextForm;
