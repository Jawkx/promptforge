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
import { AppLogo } from "@/components/AppLogo";

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
      <div className="flex flex-row">
        <AppLogo />
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-1 flex-col p-2 rounded-md transition-colors",
          isOver && "bg-primary/5",
        )}
      >
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
            <SelectedContexts />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      <CopyAllButton />
    </ResizablePanel>
  );
};
