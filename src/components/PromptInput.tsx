import React from "react";
import { Context } from "../types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Copy as CopyIcon } from "lucide-react";

export interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onDrop: (event: React.DragEvent) => void;
  onDragOver: (event: React.DragEvent) => void;
  selectedContexts: Context[];
  onRemoveContext: (id: string) => void;
  onCopyPromptAndContextsClick: () => void;
  onFocus: () => void;
}

const PromptInput: React.FC<PromptInputProps> = ({
  value,
  onChange,
  onDrop,
  onDragOver,
  selectedContexts,
  onRemoveContext,
  onCopyPromptAndContextsClick,
  onFocus,
}) => {
  const handleTextAreaChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    onChange(event.target.value);
  };

  return (
    <div onClick={onFocus} className="flex flex-col h-full">
      <Textarea
        placeholder="This is a text input. Type your main prompt or instructions here..."
        value={value}
        className="ring-inset h-full resize-none"
        onChange={handleTextAreaChange}
        onFocus={onFocus}
      />

      <div className="h-8" />

      <div onDragOver={onDragOver} onDrop={onDrop}>
        <ContextSelection
          selectedContexts={selectedContexts}
          onRemoveContext={onRemoveContext}
        />
      </div>

      <div className="h-5" />

      <Button
        onClick={onCopyPromptAndContextsClick}
        className="mt-auto w-full"
        size="lg"
      >
        <CopyIcon className="mr-2 h-4 w-4" /> Copy All
      </Button>
    </div>
  );
};

interface ContextSelectionProps {
  selectedContexts: Context[];
  onRemoveContext: (id: string) => void;
}

const ContextSelection: React.FC<ContextSelectionProps> = ({
  selectedContexts,
  onRemoveContext,
}) => {
  return (
    <div className="border-2 border-secondary rounded-md p-4 min-h-64">
      <h1 className="font-semibold text-muted-foreground">Selected Contexts</h1>
      {selectedContexts.length > 0 ? (
        <ScrollArea className="pr-3 max-h-[160px]">
          <div className="flex flex-wrap gap-2">
            {selectedContexts.map((context) => (
              <div
                key={context.id}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-background border border-border rounded-md text-sm shadow-sm"
              >
                <span className="font-medium text-foreground">
                  {context.title}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveContext(context.id)}
                  className="h-5 w-5 p-0 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  aria-label={`Remove ${context.title}`}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-4">
          No contexts selected. Drag from library or use "Add Selected" button.
        </p>
      )}
    </div>
  );
};

export default PromptInput;
