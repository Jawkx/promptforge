import React from "react";
import ContextsLibrary from "@/features/context-library/ContextsLibrary";
import { ResizablePanel } from "@/components/ui/resizable";

interface RightPanelProps {
  onDeleteContext: (id: string) => void;
  onDeleteSelectedContexts: (ids: string[]) => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  onDeleteContext,
  onDeleteSelectedContexts,
}) => {
  return (
    <ResizablePanel defaultSize={40} minSize={25} className="flex flex-col">
      <ContextsLibrary
        onDeleteContext={onDeleteContext}
        onDeleteSelectedContexts={onDeleteSelectedContexts}
      />
    </ResizablePanel>
  );
};
