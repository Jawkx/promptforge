import React, { useState, useCallback } from "react";
import { Context } from "../types";
import ContextItem from "./ContextItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggler } from "./ThemeToggler";

interface ContextsLibraryProps {
  contexts: Context[];
  onDragStart: (e: React.DragEvent, context: Context) => void;
  onAddContextButtonClick: () => void; // Renamed to avoid conflict
  onEditContext: (context: Context) => void;
  onDeleteContext: (id: string) => void;
  onPasteToAdd: (pastedText: string) => void;
  isFocused: boolean;
  onFocus: () => void;
}

const ContextsLibrary: React.FC<ContextsLibraryProps> = ({
  contexts,
  onDragStart,
  onAddContextButtonClick,
  onEditContext,
  onDeleteContext,
  onPasteToAdd,
  isFocused,
  onFocus,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const filteredContexts = contexts.filter(
    (context) =>
      context.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      context.content.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handlePaste = useCallback(
    async (event: React.ClipboardEvent) => {
      if (isFocused) {
        event.preventDefault();
        const pastedText = event.clipboardData.getData("text");
        if (pastedText.trim()) {
          onPasteToAdd(pastedText);
        } else {
          toast({
            title: "Paste Error",
            description: "Pasted content is empty.",
            variant: "destructive",
          });
        }
      }
    },
    [isFocused, onPasteToAdd, toast],
  );

  return (
    <div
      className="h-full flex flex-col py-5 px-4"
      onClick={onFocus}
      onPaste={handlePaste}
      tabIndex={0} // Make it focusable
    >
      <div className="flex flex-row items-center justify-between">
        <h1 className="font-medium text-lg">Context Library</h1>
        <div >
          <ThemeToggler />
        </div>
      </div>

      <span className="h-1" />

      <div className="relative mt-2">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search contexts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="h-4" />

      <ScrollArea className="flex-1" >
        {filteredContexts.length > 0 ? (
          filteredContexts.map((context) => (
            <ContextItem
              key={context.id}
              context={context}
              onDragStart={onDragStart}
              onEdit={onEditContext}
              onDelete={onDeleteContext}
              isFocused={isFocused}
            />
          ))
        ) : (
          <div className="text-center text-muted-foreground py-10">
            No contexts found.
            {contexts.length > 0 && searchTerm && (
              <p>Try a different search term.</p>
            )}
            {contexts.length === 0 && !searchTerm && (
              <p>Click the '+' button to add a new context.</p>
            )}
          </div>
        )}
      </ScrollArea>

      <div className="h-4" />

      <Button
        variant="default"
        onClick={onAddContextButtonClick}
      >
        <Plus />
        Add Context
      </Button>
    </div>
  );
};

export default ContextsLibrary;
