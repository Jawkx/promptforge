import React, { useState, useMemo, useCallback } from "react";
import {
  ResizablePanelGroup,
  ResizableHandle,
} from "@/components/ui/resizable";
import { LucideFile, LucideFiles } from "lucide-react";
import { useQuery } from "@livestore/react";
import { contexts$ } from "@/livestore/context-library-store/queries";
import { contextLibraryEvents } from "@/livestore/context-library-store/events";
import { toast as sonnerToast } from "sonner";
import { useRoute } from "wouter";
import AddContext from "./AddContext";
import EditContext from "./EditContext";
import { ConfirmationDialog } from "@/features/shared/ConfirmationDialog";
import { useAppStores } from "@/store/LiveStoreProvider";
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

const Editor: React.FC = () => {
  const { contextLibraryStore } = useAppStores();
  const contexts = useQuery(contexts$, { store: contextLibraryStore });

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
              <LucideFiles className="h-5 w-5 text-primary" />
            ) : (
              <LucideFile className="h-5 w-5 text-primary" />
            )}
            <span className="max-w-xs truncate font-medium text-foreground">
              {activeDraggedContexts.length > 1
                ? `${activeDraggedContexts.length} contexts`
                : activeDraggedContexts[0].title}
            </span>
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
