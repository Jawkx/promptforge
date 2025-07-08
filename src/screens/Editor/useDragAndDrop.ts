import { useState, useCallback } from "react";
import {
  type DragStartEvent,
  type DragEndEvent,
  type DropAnimation,
  defaultDropAnimation,
} from "@dnd-kit/core";
import { toast as sonnerToast } from "sonner";
import { Context, SelectedContext } from "@/types";
import { useLocalStore } from "@/store/localStore";
import { generateId } from "@/lib/utils";

export const useDragAndDrop = () => {
  const addContextToPrompt = useLocalStore((state) => state.addContextToPrompt);
  const [activeDraggedContexts, setActiveDraggedContexts] = useState<
    Context[] | null
  >(null);

  const [dropAnimation, setDropAnimation] = useState<DropAnimation | null>(
    defaultDropAnimation,
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setDropAnimation(defaultDropAnimation);
    const { active } = event;
    const draggedData = active.data.current as
      | { contexts: Context[]; type: string }
      | undefined;

    if (draggedData?.type === "context-library-item" && draggedData.contexts) {
      setActiveDraggedContexts(draggedData.contexts);
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { over } = event;

      if (
        over?.id === "selected-contexts-droppable-area" &&
        activeDraggedContexts
      ) {
        // If it's inside context, don't need to animate the overlay to go back to the original position
        setDropAnimation(null);
        activeDraggedContexts.forEach((libraryContext) => {
          const newSelectedContextCopy: SelectedContext = {
            id: generateId(),
            title: libraryContext.title,
            content: libraryContext.content,
            tokenCount: libraryContext.tokenCount,
            version: libraryContext.version,
            originalVersion: libraryContext.version,
            originalContextId: libraryContext.id,
            createdAt: libraryContext.createdAt,
            updatedAt: libraryContext.updatedAt,
            labels: libraryContext.labels,
          };
          addContextToPrompt(newSelectedContextCopy);
        });
        sonnerToast.success(
          `${activeDraggedContexts.length} Context(s) Added`,
          {
            description: `Copied ${activeDraggedContexts.length} context(s) to prompt.`,
          },
        );
      }

      setActiveDraggedContexts(null);
    },
    [activeDraggedContexts, addContextToPrompt],
  );

  const handleDragCancel = useCallback(() => {
    setActiveDraggedContexts(null);
  }, []);

  return {
    activeDraggedContexts,
    dropAnimation,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
};
