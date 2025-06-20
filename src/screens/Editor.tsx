import React, { useState } from "react";
import PromptInput from "@/features/prompt-editor/PromptInput";
import ContextsLibrary from "@/features/context-library/ContextsLibrary";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LucideAnvil } from "lucide-react";
import { useQuery, useStore } from "@livestore/react";
import { contexts$ } from "@/livestore/queries";
import { events } from "@/livestore/events";
import { useToast } from "@/hooks/use-toast";
import { SelectedContexts } from "@/features/selected-contexts/SelectedContexts";
import { useRoute } from "wouter";
import AddContext from "./AddContext";
import EditContext from "./EditContext";

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

          <AlertDialog
            open={deleteConfirmationOpen}
            onOpenChange={setDeleteConfirmationOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-primary">
                  Are you sure?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  context "
                  {contexts.find((c) => c.id === contextToDeleteId)?.title ||
                    "this context"}
                  " from the library.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setContextToDeleteId(null)}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDeleteContext}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog
            open={deleteMultipleConfirmationOpen}
            onOpenChange={setDeleteMultipleConfirmationOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-primary">
                  Are you sure?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete{" "}
                  {contextsToDeleteIds.length} context(s) from the library.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setContextsToDeleteIds([])}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDeleteMultipleContexts}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
