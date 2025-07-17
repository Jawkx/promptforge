import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  ResizablePanelGroup,
  ResizableHandle,
} from "@/components/ui/resizable";
import { LucideFile, LucideFiles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@livestore/react";
import { contexts$ } from "@/livestore/context-library-store/queries";
import { contextLibraryEvents } from "@/livestore/context-library-store/events";
import { toast as sonnerToast } from "sonner";
import { useRoute } from "wouter";
import AddContext from "./AddContext";
import EditContext from "./EditContext";
import { ConfirmationDialog } from "@/features/shared/ConfirmationDialog";
import { useContextLibraryStore } from "@/store/ContextLibraryLiveStoreProvider";
import { LeftPanel } from "./LeftPanel";
import { RightPanel } from "./RightPanel";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useDragAndDrop } from "./useDragAndDrop";
import { ManageLabelsDialog } from "@/features/context-library/ManageLabelsDialog";
import { useLocalStore } from "@/store/localStore";
import { useAutoCreateContextLibrary } from "@/hooks/useAutoCreateContextLibrary";

const Editor: React.FC = () => {
  const contextLibraryStore = useContextLibraryStore();
  const contexts = useQuery(contexts$, { store: contextLibraryStore });

  // Auto-create context library for new users
  useAutoCreateContextLibrary();

  const [isAddModalOpen] = useRoute("/add");
  const [isLabelsModalOpen] = useRoute("/labels");
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

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const { prompt, selectedContexts } = useLocalStore.getState();

      const hasContentInPrompt =
        typeof prompt === "string" && prompt.trim() !== "";
      const hasSelectedContexts = selectedContexts.length > 0;

      if (hasContentInPrompt || hasSelectedContexts) {
        event.preventDefault();
        // Modern browsers show a generic message, but this is required for the prompt to appear.
        const message = "Information might not be saved";
        return message;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const {
    activeDraggedContexts,
    dropAnimation,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useDragAndDrop();

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

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex justify-center h-screen w-screen">
        <div className="h-full w-full max-w-screen-2xl">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <LeftPanel />

            <ResizableHandle withHandle />

            <RightPanel
              onDeleteContext={handleDeleteContextRequest}
              onDeleteSelectedContexts={handleDeleteMultipleContextsRequest}
            />
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
      <DragOverlay dropAnimation={dropAnimation}>
        {activeDraggedContexts ? (
          <div className="pointer-events-none flex items-center gap-3 rounded-lg border bg-background p-3 shadow-xl">
            {activeDraggedContexts.length > 1 ? (
              <LucideFiles className="h-5 w-5 text-primary flex-shrink-0" />
            ) : (
              <LucideFile className="h-5 w-5 text-primary flex-shrink-0" />
            )}
            <div className="flex items-center justify-between w-full">
              <span className="truncate font-medium text-foreground max-w-[150px]">
                {activeDraggedContexts.length > 1
                  ? `${activeDraggedContexts.length} contexts`
                  : activeDraggedContexts[0].title}
              </span>
              {(() => {
                // Collect all unique labels from all contexts
                const allLabels = activeDraggedContexts.flatMap(
                  (context) => context.labels || [],
                );
                const uniqueLabels = allLabels.filter(
                  (label, index, arr) =>
                    arr.findIndex((l) => l.id === label.id) === index,
                );

                return (
                  <div className="flex items-center gap-1 flex-wrap justify-end ml-auto">
                    {uniqueLabels.length > 0
                      ? uniqueLabels.map((label) => (
                          <Badge
                            key={label.id}
                            variant="outline"
                            className="text-xs px-1.5 py-0.5 h-4 border flex-shrink-0"
                            style={{
                              backgroundColor: label.color + "20",
                              borderColor: label.color,
                              color: label.color,
                            }}
                          >
                            {label.name}
                          </Badge>
                        ))
                      : null}
                  </div>
                );
              })()}
            </div>
          </div>
        ) : null}
      </DragOverlay>
      {isAddModalOpen && <AddContext />}
      {isLabelsModalOpen && <ManageLabelsDialog />}
      {isEditModalOpen &&
        params &&
        (params.type === "library" || params.type === "selected") && (
          <EditContext key={params.id} type={params.type} id={params.id} />
        )}
    </DndContext>
  );
};

export default Editor;
