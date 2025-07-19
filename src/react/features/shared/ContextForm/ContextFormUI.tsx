import React from "react";
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
import { Maximize2, Minimize2 } from "lucide-react";
import { Label } from "@/types";

interface ContextFormUIProps {
  title: string;
  content: string;
  labels: readonly Label[];
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  dialogTitle: string;
  dialogDescription: string;
  submitButtonText?: string;
  submitButtonIcon?: React.ReactNode;
  autoSave?: boolean;
  isMaximized?: boolean;
  onMaximizeToggle?: () => void;
  labelSelector: React.ReactNode;
}

const ContextFormUI: React.FC<ContextFormUIProps> = ({
  title,
  content,
  onTitleChange,
  onContentChange,
  onSubmit,
  onCancel,
  dialogTitle,
  dialogDescription,
  submitButtonText,
  submitButtonIcon,
  autoSave = false,
  isMaximized = false,
  onMaximizeToggle,
  labelSelector,
}) => {
  const handleMaximizeToggle = React.useCallback(() => {
    onMaximizeToggle?.();
  }, [onMaximizeToggle]);

  return (
    <DialogContent
      className={cn(
        "sm:max-w-3xl max-h-[90vh] w-[95vw] flex flex-col overflow-hidden",
        isMaximized ? "max-w-none h-[95vh] flex flex-col" : "",
      )}
    >
      <div className="absolute right-10 top-4">
        <button
          onClick={handleMaximizeToggle}
          className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label={isMaximized ? "Minimize" : "Maximize"}
        >
          {isMaximized ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className={cn("flex flex-col", isMaximized && "flex-1 min-h-0")}>
        <DialogHeader className="space-y-3 pb-6 flex-shrink-0">
          <DialogTitle className="text-xl font-semibold">
            {dialogTitle}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>

        <form
          id="context-form"
          onSubmit={onSubmit}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              e.target !== e.currentTarget.querySelector("#content")
            ) {
              e.preventDefault();
            }
          }}
          className={cn(
            "space-y-6",
            isMaximized && "flex flex-1 flex-col min-h-0 space-y-6",
          )}
        >
          <div className="space-y-2 flex-shrink-0">
            <label
              htmlFor="title"
              className="text-sm font-medium text-foreground"
            >
              Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Enter a title (optional, will be auto-generated if blank)"
              className="h-10"
            />
          </div>

          {labelSelector}

          <div
            className={cn(
              "space-y-2",
              isMaximized && "flex-1 flex flex-col min-h-0",
            )}
          >
            <label
              htmlFor="content"
              className="text-sm font-medium text-foreground"
            >
              Content
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              className={cn(
                "min-h-[300px] resize-none font-mono text-sm leading-relaxed",
                "border-2 focus:border-primary/50 transition-colors",
                isMaximized && "flex-grow flex-shrink basis-0 h-full min-h-0",
              )}
              placeholder="Paste your context content here..."
            />
          </div>
        </form>

        {!autoSave && (
          <DialogFooter className="pt-6 gap-3 flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="context-form"
              className="min-w-[140px] gap-2"
            >
              {submitButtonIcon}
              {submitButtonText}
            </Button>
          </DialogFooter>
        )}
      </div>
    </DialogContent>
  );
};

export default ContextFormUI;
