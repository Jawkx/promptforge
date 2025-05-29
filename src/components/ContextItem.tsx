import React from "react";
import { Context } from "../types";
import { Button } from "@/components/ui/button";
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
}) => {
  const getFirstNLines = (text: string, n: number) => {
    return text.split("\n").slice(0, n).join("\n");
  };


  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, context)}
      className="cursor-grab active:cursor-grabbing transition-shadow duration-150 bg-background"
    >
      <Accordion type="single" collapsible className="w-full cursor-auto">
        <AccordionItem value="preview" className="py-2 border-muted border-b-2">
          <AccordionTrigger className="py-0.5 text-xs text-muted-foreground hover:no-underline focus-visible:ring-0 focus-visible:ring-offset-0 [&>svg]:size-3.5">

            <div className="flex flex-row items-center flex-1">
              <GripVertical className="text-muted-foreground w-4 h-4" />
              <p className="font-medium text-sm text-muted-foreground">{context.title}</p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild className="mr-2">
                <Button variant="ghost" size="icon" className="h-4 w-4">
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
          </AccordionTrigger>

          <AccordionContent className="pt-1 pb-0 text-xs text-muted-foreground">
            <pre className="whitespace-pre-wrap break-all overflow-hidden bg-background p-1 rounded-sm">
              {getFirstNLines(context.content, 5)}
              {context.content.split("\n").length > 5 ? "\n..." : ""}
            </pre>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default ContextItem;


//
// <h2 className="text-sm font-medium flex items-center">
//   {context.title}
// </h2>
//
