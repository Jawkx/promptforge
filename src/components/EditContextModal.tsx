import React, { useState, useEffect } from "react";
import { Context, PREDEFINED_LABEL_COLORS, LabelColorValue, ContextLabel } from "../types";
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
import { X as XIcon, PlusCircle } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

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
  const [currentLabels, setCurrentLabels] = useState<ContextLabel[]>([]);
  const [newLabelText, setNewLabelText] = useState("");
  const [newLabelColor, setNewLabelColor] = useState<LabelColorValue>(PREDEFINED_LABEL_COLORS[0].value);
  const { toast } = useToast();

  useEffect(() => {
    if (context && isOpen) {
      setTitle(context.title);
      setContent(context.content);
      // Ensure all labels have an id, important for managing them in the UI
      setCurrentLabels(context.labels.map(l => ({ ...l, id: l.id || `temp - id - ${Math.random()} ` })));
      setNewLabelText("");
      setNewLabelColor(PREDEFINED_LABEL_COLORS[0].value);
    }
  }, [context, isOpen]);

  if (!isOpen || !context) return null;

  const handleAddTextLabel = () => {
    const text = newLabelText.trim();
    if (!text) {
      toast({ title: "Label text cannot be empty.", variant: "destructive" });
      return;
    }
    if (currentLabels.some(label => label.text.toLowerCase() === text.toLowerCase())) {
      toast({ title: `Label "${text}" already added.`, variant: "destructive" });
      return;
    }
    // For new labels in edit mode, generate a temporary unique ID
    const newId = `label - ${Date.now()} -${Math.random().toString(36).substring(2, 9)} `;
    setCurrentLabels(prev => [...prev, { id: newId, text, color: newLabelColor }]);
    setNewLabelText("");
  };

  const handleRemoveTextLabel = (idToRemove: string) => {
    setCurrentLabels(prev => prev.filter(label => label.id !== idToRemove));
  };

  const handleUpdateLabelColor = (idToUpdate: string, newColor: LabelColorValue) => {
    setCurrentLabels(prev => prev.map(label =>
      label.id === idToUpdate ? { ...label, color: newColor } : label
    ));
  };


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

    // Filter out any labels that might have become empty during editing (if applicable)
    const finalLabels = currentLabels.filter(label => label.text.trim() !== "");

    onSave({
      ...context,
      title: trimmedTitle,
      content: trimmedContent,
      labels: finalLabels,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-muted h-auto max-h-[85vh] max-w-screen-lg flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-primary">Edit Context</DialogTitle>
          <DialogDescription className="text-foreground">
            Modify the title, content, or labels of your context snippet.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 overflow-hidden">
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
          />

          <div className="flex flex-col gap-2 border border-muted p-3 rounded-md">
            <Label className="text-sm font-medium text-foreground">Text Labels</Label>
            <div className="flex items-end gap-2">
              <div className="flex-grow">
                <Label htmlFor="editNewLabelText" className="sr-only">New Label Text</Label>
                <Input
                  id="editNewLabelText"
                  value={newLabelText}
                  onChange={(e) => setNewLabelText(e.target.value)}
                  placeholder="Enter label text"
                  className="h-9"
                />
              </div>
              <div>
                <Label htmlFor="editNewLabelColor" className="sr-only">New Label Color</Label>
                <Select value={newLabelColor} onValueChange={(v) => setNewLabelColor(v as LabelColorValue)}>
                  <SelectTrigger id="editNewLabelColor" className="h-9 w-[120px]">
                    <SelectValue placeholder="Color" />
                  </SelectTrigger>
                  <SelectContent>
                    {PREDEFINED_LABEL_COLORS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <span className={`inline - block h - 3 w - 3 rounded - full ${opt.twBgClass} `} />
                          {opt.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="button" size="icon" className="h-9 w-9" onClick={handleAddTextLabel} variant="outline">
                <PlusCircle className="h-4 w-4" />
                <span className="sr-only">Add Text Label</span>
              </Button>
            </div>
            {currentLabels.length > 0 && (
              <ScrollArea className="max-h-[100px] pr-2">
                <div className="space-y-1.5 mt-1">
                  {currentLabels.map((label) => {
                    const colorInfo = PREDEFINED_LABEL_COLORS.find(c => c.value === label.color);
                    return (
                      <div key={label.id} className="flex items-center justify-between gap-2 text-xs p-1.5 rounded-md border bg-muted/30">
                        <span className={`px - 2 py - 0.5 rounded - full text - xs font - medium border ${colorInfo?.twChipClass || 'bg-gray-100 text-gray-700 border-gray-300'} `}>
                          {label.text}
                        </span>
                        <div className="flex items-center gap-1">
                          <Select
                            value={label.color}
                            onValueChange={(newColor) => handleUpdateLabelColor(label.id, newColor as LabelColorValue)}
                          >
                            <SelectTrigger className="h-6 w-[80px] text-xs px-1.5 py-0">
                              <div className="flex items-center gap-1">
                                <span className={`inline - block h - 2 w - 2 rounded - full ${PREDEFINED_LABEL_COLORS.find(c => c.value === label.color)?.twBgClass} `} />
                                <SelectValue />
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              {PREDEFINED_LABEL_COLORS.map(opt => (
                                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                                  <div className="flex items-center gap-2">
                                    <span className={`inline - block h - 2.5 w - 2.5 rounded - full ${opt.twBgClass} `} />
                                    {opt.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveTextLabel(label.id)}
                          >
                            <XIcon className="h-3 w-3" />
                            <span className="sr-only">Remove label {label.text}</span>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
            {currentLabels.length === 0 && <p className="text-xs text-muted-foreground text-center py-1">No labels added yet.</p>}
          </div>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 min-h-[150px] resize-none" // Adjusted min-h
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

