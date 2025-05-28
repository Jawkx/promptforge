import React from 'react';
import { Context } from '../types';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { X, Copy as CopyIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  selectedContexts: Context[];
  onRemoveContext: (id: string) => void;
  onCopy: () => void;
  isFocused: boolean;
  onFocus: () => void;
}

const PromptInput: React.FC<PromptInputProps> = ({
  value,
  onChange,
  onDrop,
  onDragOver,
  selectedContexts,
  onRemoveContext,
  onCopy,
  isFocused,
  onFocus
}) => {

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <Card
      className={cn("h-full flex flex-col border-2", isFocused ? "border-primary" : "border-border")}
      onClick={onFocus}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <CardContent className="p-4 flex-grow flex flex-col gap-4 overflow-hidden">
        <Textarea
          placeholder="This is a text input. Type your main prompt or instructions here..."
          value={value}
          onChange={handleTextAreaChange}
          className="flex-grow resize-none text-base min-h-[150px] border-transparent"
          onFocus={onFocus} // Ensure Textarea also sets focus
        />
        <div
          id="selected-contexts-area"
          className="border rounded-md p-2 min-h-[80px] bg-muted/30"
        >
          <h3 className="text-sm font-medium mb-2 text-muted-foreground">Selected Contexts (Drag & Drop here or in Text Area)</h3>
          {selectedContexts.length > 0 ? (
            <ScrollArea className="h-[120px] pr-3">
              <div className="space-y-2">
                {selectedContexts.map(context => (
                  <div key={context.id} className="flex items-center justify-between p-2 bg-background border rounded-md text-sm">
                    <span>{context.title} <span className="text-xs text-muted-foreground">({context.content.split('\n').length} lines)</span></span>
                    <Button variant="ghost" size="icon" onClick={() => onRemoveContext(context.id)} className="h-6 w-6">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">No contexts selected. Drag from library.</p>
          )}
        </div>
        <Button onClick={onCopy} className="w-full mt-auto">
          <CopyIcon className="mr-2 h-4 w-4" /> Copy All
        </Button>
      </CardContent>
    </Card>
  );
};

export default PromptInput;
