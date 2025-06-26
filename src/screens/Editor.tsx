import React, { useState, useMemo, useCallback } from "react";
import PromptInput from "@/features/prompt-editor/PromptInput";
import ContextsLibrary from "@/features/context-library/ContextsLibrary";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { LucideAnvil } from "lucide-react";
import { useQuery } from "@livestore/react";
import { contexts$ } from "@/livestore/context-library-store/queries";
import { contextLibraryEvents } from "@/livestore/context-library-store/events";
import { toast as sonnerToast } from "sonner";
import { SelectedContexts } from "@/features/selected-contexts/SelectedContexts";
import { useRoute } from "wouter";
import AddContext from "./AddContext";
import EditContext from "./EditContext";
import { ConfirmationDialog } from "@/features/shared/ConfirmationDialog";
import { CopyAllButton } from "@/features/shared/CopyAllButton";
import { useAppStores } from "@/store/LiveStoreProvider";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { Context, SelectedContext } from "@/types";
import { useLocalStore } from "@/store/app.store";
import { generateContextHash, generateId } from "@/lib/utils";

const Editor: React.FC = () => {
  const { contextLibraryStore } = useAppStores();
  const contexts = useQuery(contexts$, { store: contextLibraryStore });
  const addContextToPrompt = useLocalStore((state) => state.addContextToPrompt);

  const [isAddModalOpen] = useRoute("/add");
  const [isEditModalOpen, params] = useRoute<{
    type: "library" | "selected";
    id: string;
  }>("/edit/:type/:id");

  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [contextToDeleteId, setContextToDeleteId] = useState<string | null>(
    null,
  );
  const [deleteMultipleConfirmationOpen, setDeleteMultipleConfirmationOpen] =
    useState(false);
  const [contextsToDeleteIds, setContextsToDeleteIds] = useState<string[]>([]);
  const [activeDraggedContexts, setActiveDraggedContexts] = useState<
    Context[] | null
  >(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require the mouse to move by 8 pixels before activating
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const contextToDelete = useMemo(() => {
    if (!contextToDeleteId) return null;
    return contexts.find((c) => c.id === contextToDeleteId);
  }, [contexts, contextToDeleteId]);

  const handleDeleteContextRequest = useCallback((id: string) => {
    setContextToDeleteId(id);
    setDeleteConfirmationOpen(true);
  }, []);

  const confirmDeleteContext = useCallback(() => {
    if (contextToDeleteId) {
      contextLibraryStore.commit(
        contextLibraryEvents.contextsDeleted({ ids: [contextToDeleteId] }),
      );
      sonnerToast.error("Context Deleted", {
        description: `Context "${contextToDelete?.title}" has been deleted from library.`,
      });
    }
    setDeleteConfirmationOpen(false);
    setContextToDeleteId(null);
  }, [contextToDeleteId, contextLibraryStore, contextToDelete]);

  const handleDeleteMultipleContextsRequest = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    setContextsToDeleteIds(ids);
    setDeleteMultipleConfirmationOpen(true);
  }, []);

  const confirmDeleteMultipleContexts = useCallback(() => {
    if (contextsToDeleteIds.length > 0) {
      contextLibraryStore.commit(
        contextLibraryEvents.contextsDeleted({ ids: contextsToDeleteIds }),
      );
      sonnerToast.error(`${contextsToDeleteIds.length} Contexts Deleted`, {
        description: `Successfully deleted ${contextsToDeleteIds.length} context(s) from the library.`,
      });
    }
    setDeleteMultipleConfirmationOpen(false);
    setContextsToDeleteIds([]);
  }, [contextsToDeleteIds, contextLibraryStore]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
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
        activeDraggedContexts.forEach((libraryContext) => {
          const newSelectedContextCopy: SelectedContext = {
            id: generateId(),
            title: libraryContext.title,
            content: libraryContext.content,
            tokenCount: libraryContext.tokenCount,
            originalHash:
              libraryContext.originalHash ||
              generateContextHash(libraryContext.title, libraryContext.content),
            originalContextId: libraryContext.id,
            createdAt: libraryContext.createdAt,
            updatedAt: libraryContext.updatedAt,
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

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveDraggedContexts(null)}
    >
      <div className="flex justify-center h-screen w-screen">
        <div className="h-full w-full max-w-screen-2xl">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel
              defaultSize={60}
              minSize={30}
              className="flex flex-col p-4"
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
                  <SelectedContexts />
                </ResizablePanel>

                <CopyAllButton />
              </ResizablePanelGroup>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel
              defaultSize={40}
              minSize={25}
              className="flex flex-col"
            >
              <ContextsLibrary
                onDeleteContext={handleDeleteContextRequest}
                onDeleteSelectedContexts={handleDeleteMultipleContextsRequest}
              />
            </ResizablePanel>
          </ResizablePanelGroup>

          <ConfirmationDialog
            isOpen={deleteConfirmationOpen}
            onOpenChange={setDeleteConfirmationOpen}
            title="Are you sure?"
            description={
              <>
                This action cannot be undone. This will permanently delete the
                context "
                <strong>{contextToDelete?.title || "this context"}</strong>"
                from the library.
              </>
            }
            onConfirm={confirmDeleteContext}
            onCancel={() => setContextToDeleteId(null)}
            confirmText="Delete"
            confirmVariant="destructive"
          />

          <ConfirmationDialog
            isOpen={deleteMultipleConfirmationOpen}
            onOpenChange={setDeleteMultipleConfirmationOpen}
            title="Are you sure?"
            description={
              <>
                This action cannot be undone. This will permanently delete{" "}
                <strong>{contextsToDeleteIds.length}</strong> context(s) from
                the library.
              </>
            }
            onConfirm={confirmDeleteMultipleContexts}
            onCancel={() => setContextsToDeleteIds([])}
            confirmText="Delete"
            confirmVariant="destructive"
          />
        </div>
      </div>
      <DragOverlay>
        {activeDraggedContexts ? (
          <div className="bg-secondary h-24 flex">
            <h2 className="text-lg text-foreground">
              {activeDraggedContexts.length > 1
                ? `${activeDraggedContexts.length} contexts`
                : activeDraggedContexts[0].title}
            </h2>
          </div>
        ) : null}
      </DragOverlay>
      {isAddModalOpen && <AddContext />}
      {isEditModalOpen &&
        params &&
        (params.type === "library" || params.type === "selected") && (
          <EditContext type={params.type} id={params.id} />
        )}
    </DndContext>
  );
};

export default Editor;
