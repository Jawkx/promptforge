import React from "react";
import { Context } from "../types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, Edit3, GripVertical } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

interface ContextItemProps {
  context: Context;
  onDragStart: (e: React.DragEvent, context: Context) => void;
  onEdit: (context: Context) => void;
  onDelete: (id: string) => void;
  isFocused: boolean;
}

const ContextItem: React.FC<ContextItemProps> = ({
  context,
  onDragStart,
  onEdit,
  onDelete,
  isFocused,
}) => {
  const getFirstNLines = (text: string, n: number) => {
    return text.split("\n").slice(0, n).join("\n");
  };

  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(e, context)}
      className="mb-2 cursor-grab active:cursor-grabbing transition-shadow duration-150"
    >
      <CardHeader className="flex flex-row items-center justify-between p-3 space-y-0">
        <CardTitle className="text-sm font-medium flex items-center">
          <GripVertical className="h-4 w-4 mr-2 text-muted-foreground" />
          {context.title}
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(context)}>
              <Edit3 className="mr-2 h-4 w-4" />
              Edit / View
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(context.id)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <Accordion type="single" collapsible className="w-full px-3 pb-3 pt-0">
        <AccordionItem value="preview" className="border-b-0">
          <AccordionTrigger className="py-1 text-xs text-muted-foreground hover:no-underline focus-visible:ring-0 focus-visible:ring-offset-0 [&>svg]:size-3.5">
            <span className="font-normal">Toggle Preview</span>
          </AccordionTrigger>
          <AccordionContent className="pt-1 pb-0 text-xs text-muted-foreground">
            <pre className="whitespace-pre-wrap break-all overflow-hidden">
              {getFirstNLines(context.content, 5)}
              {context.content.split("\n").length > 5 ? "\n..." : ""}
            </pre>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};

export default ContextItem;
