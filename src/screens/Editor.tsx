import React, { useState } from "react";
import PromptInput from "@/features/prompt-editor/PromptInput";
import ContextsLibrary from "@/features/context-library/ContextsLibrary";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { LucideAnvil } from "lucide-react";
import { useQuery, useStore } from "@livestore/react";
import { contexts$ } from "@/livestore/queries";
import { events } from "@/livestore/events";
import { useToast } from "@/hooks/use-toast";
import { SelectedContexts } from "@/features/selected-contexts/SelectedContexts";
import { useRoute } from "wouter";
import AddContext from "./AddContext";
import EditContext from "./EditContext";
import { ConfirmationDialog } from "@/features/shared/ConfirmationDialog";

const Editor: React.FC = () => {
  const { store } = useStore();
  const contexts = useQuery(contexts$);
  const { toast } = useToast();

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

  const handleDeleteContextRequest = (id: string) => {
    setContextToDeleteId(id);
    setDeleteConfirmationOpen(true);
  };

  const confirmDeleteContext = () => {
    if (contextToDeleteId) {
      store.commit(events.contextDeleted({ ids: [contextToDeleteId] }));
      toast({
        title: "Context Deleted",
        description: `Context "${
          contexts.find((c) => c.id === contextToDeleteId)?.title
        }" has been deleted from library.`,
        variant: "destructive",
      });
    }
    setDeleteConfirmationOpen(false);
    setContextToDeleteId(null);
  };

  const handleDeleteMultipleContextsRequest = (ids: string[]) => {
    if (ids.length === 0) return;
    setContextsToDeleteIds(ids);
    setDeleteMultipleConfirmationOpen(true);
  };

  const confirmDeleteMultipleContexts = () => {
    if (contextsToDeleteIds.length > 0) {
      store.commit(events.contextDeleted({ ids: contextsToDeleteIds }));
      toast({
        title: `${contextsToDeleteIds.length} Contexts Deleted`,
        description: `Successfully deleted ${contextsToDeleteIds.length} context(s) from the library.`,
        variant: "destructive",
      });
    }
    setDeleteMultipleConfirmationOpen(false);
    setContextsToDeleteIds([]);
  };

  return (
    <>
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
                <strong>
                  {contexts.find((c) => c.id === contextToDeleteId)?.title ||
                    "this context"}
                </strong>
                " from the library.
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
      {isAddModalOpen && <AddContext />}
      {isEditModalOpen &&
        params &&
        (params.type === "library" || params.type === "selected") && (
          <EditContext type={params.type} id={params.id} />
        )}
    </>
  );
};

export default Editor;
