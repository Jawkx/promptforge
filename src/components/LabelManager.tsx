import React from "react";
import { ContextLabel, PREDEFINED_LABEL_COLORS, LabelColorValue } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X as XIcon, PlusCircle } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

interface LabelManagerUIProps {
  currentLabels: ContextLabel[];
  newLabelText: string;
  setNewLabelText: (text: string) => void;
  newLabelColor: LabelColorValue;
  setNewLabelColor: (color: LabelColorValue) => void;
  onAddLabel: () => void;
  onRemoveLabel: (id: string) => void;
  onUpdateLabelColor: (id: string, newColor: LabelColorValue) => void;
}

const LabelManagerUI: React.FC<LabelManagerUIProps> = ({
  currentLabels,
  newLabelText,
  setNewLabelText,
  newLabelColor,
  setNewLabelColor,
  onAddLabel,
  onRemoveLabel,
  onUpdateLabelColor,
}) => {
  return (
    <div className="flex flex-col gap-2 border border-muted p-3 rounded-md">
      <Label className="text-sm font-medium text-foreground">Text Labels</Label>
      <div className="flex items-end gap-2">
        <div className="flex-grow">
          <Label htmlFor="newLabelText" className="sr-only">New Label Text</Label>
          <Input
            id="newLabelText"
            value={newLabelText}
            onChange={(e) => setNewLabelText(e.target.value)}
            placeholder="Enter label text"
            className="h-9"
          />
        </div>
        <div>
          <Label htmlFor="newLabelColor" className="sr-only">New Label Color</Label>
          <Select value={newLabelColor} onValueChange={(v) => setNewLabelColor(v as LabelColorValue)}>
            <SelectTrigger id="newLabelColor" className="h-9 w-[120px]">
              <SelectValue placeholder="Color" />
            </SelectTrigger>
            <SelectContent>
              {PREDEFINED_LABEL_COLORS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  <div className="flex items-center gap-2">
                    <span className={`inline-block h-3 w-3 rounded-full ${opt.twBgClass}`} />
                    {opt.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="button" size="icon" className="h-9 w-9" onClick={onAddLabel} variant="outline">
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
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colorInfo?.twChipClass || 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-500'}`}>
                    {label.text}
                  </span>
                  <div className="flex items-center gap-1">
                    <Select
                      value={label.color}
                      onValueChange={(newColor) => onUpdateLabelColor(label.id, newColor as LabelColorValue)}
                    >
                      <SelectTrigger className="h-6 w-[80px] text-xs px-1.5 py-0">
                        <div className="flex items-center gap-1">
                          <span className={`inline-block h-2 w-2 rounded-full ${PREDEFINED_LABEL_COLORS.find(c => c.value === label.color)?.twBgClass}`} />
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {PREDEFINED_LABEL_COLORS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value} className="text-xs">
                            <div className="flex items-center gap-2">
                              <span className={`inline-block h-2.5 w-2.5 rounded-full ${opt.twBgClass}`} />
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
                      onClick={() => onRemoveLabel(label.id)}
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
  );
};

export default LabelManagerUI;
