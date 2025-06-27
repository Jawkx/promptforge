import React from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import PromptInput from "@/features/prompt-editor/PromptInput";
import { SelectedContexts } from "@/features/selected-contexts/SelectedContexts";
import { CopyAllButton } from "@/features/shared/CopyAllButton";
import { LucideAnvil } from "lucide-react";

export const LeftPanel: React.FC = () => {
  const { setNodeRef, isOver } = useDroppable({
    id: "selected-contexts-droppable-area",
  });

  return (
    <ResizablePanel
      defaultSize={60}
      minSize={30}
      className={cn("flex flex-col p-4 transition-colors")}
    >
      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-1 flex-col p-4 transition-colors",
          isOver && "bg-primary/5",
        )}
      >
        <div className="flex flex-row mb-4">
          <LucideAnvil className="h-9 w-9 mr-3" />
          <h1 className="font-semibold text-3xl"> Prompt Forge</h1>
        </div>

        <ResizablePanelGroup direction="vertical" className="flex-grow">
          <ResizablePanel className="flex-1">
            <PromptInput />
          </ResizablePanel>
          <ResizableHandle withHandle className="my-4" />
          <ResizablePanel
            defaultSize={40}
            minSize={20}
            maxSize={80}
            className="flex flex-col"
          >
            <SelectedContexts isDroppableOver={false} />
          </ResizablePanel>
        </ResizablePanelGroup>

        <CopyAllButton />
      </div>
    </ResizablePanel>
  );
};
