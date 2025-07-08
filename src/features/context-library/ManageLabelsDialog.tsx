import React, { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@livestore/react";
import { toast as sonnerToast } from "sonner";
import { LucideEdit, LucidePlus, LucideSave, LucideTrash2 } from "lucide-react";
import { useLiveStores } from "@/store/LiveStoreProvider";
import { labels$ } from "@/livestore/context-library-store/queries";
import { contextLibraryEvents } from "@/livestore/context-library-store/events";
import { Label as LabelType } from "@/types";
import { generateLabelId, cn } from "@/lib/utils";
import { LABEL_COLORS } from "@/constants/labelColors";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConfirmationDialog } from "@/features/shared/ConfirmationDialog";
import { Separator } from "@/components/ui/separator";

export const ManageLabelsDialog: React.FC = () => {
  const [, navigate] = useLocation();
  const { contextLibraryStore } = useLiveStores();
  const labels = useQuery(labels$, { store: contextLibraryStore });

  // Edit state
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingColor, setEditingColor] = useState("");

  // Create state
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(LABEL_COLORS[0]);

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [labelToDelete, setLabelToDelete] = useState<LabelType | null>(null);

  const handleClose = () => navigate("/");

  const handleSelectLabelForEdit = (label: LabelType) => {
    setEditingLabelId(label.id);
    setEditingName(label.name);
    setEditingColor(label.color);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = editingName.trim();
    if (!trimmedName) {
      sonnerToast.error("Label name cannot be empty.");
      return;
    }

    if (editingLabelId) {
      contextLibraryStore.commit(
        contextLibraryEvents.labelUpdated({
          id: editingLabelId,
          name: trimmedName,
          color: editingColor,
        }),
      );
      sonnerToast.success("Label updated", {
        description: `Label "${trimmedName}" has been updated.`,
      });
      setEditingLabelId(null);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newTagName.trim();
    if (!trimmedName) {
      sonnerToast.error("Label name cannot be empty.");
      return;
    }

    contextLibraryStore.commit(
      contextLibraryEvents.labelCreated({
        id: generateLabelId(),
        name: trimmedName,
        color: newTagColor,
      }),
    );
    sonnerToast.success("Label created", {
      description: `Label "${trimmedName}" has been created.`,
    });

    setNewTagName("");
    setNewTagColor(LABEL_COLORS[0]);
  };

  const handleDeleteRequest = (label: LabelType) => {
    setLabelToDelete(label);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (labelToDelete) {
      contextLibraryStore.commit(
        contextLibraryEvents.labelDeleted({ id: labelToDelete.id }),
      );
      sonnerToast.error(`Label "${labelToDelete.name}" deleted.`);
      if (editingLabelId === labelToDelete.id) {
        setEditingLabelId(null);
      }
      setLabelToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <Dialog open onOpenChange={(isOpen) => !isOpen && handleClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Tags</DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-60">
            <div className="space-y-1 rounded-md border border-dotted p-2">
              {labels.map((label) =>
                editingLabelId === label.id ? (
                  <form
                    key={label.id}
                    onSubmit={handleUpdateSubmit}
                    className="flex items-center gap-2 rounded-md bg-muted/50 p-2"
                  >
                    <span
                      className="h-4 w-4 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: editingColor }}
                    />
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="h-8 flex-1"
                      autoFocus
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {LABEL_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setEditingColor(c)}
                          className={cn(
                            "h-4 w-4 rounded-full border-2 transition-all",
                            editingColor === c
                              ? "border-primary"
                              : "border-transparent hover:border-muted-foreground/50",
                          )}
                          style={{ backgroundColor: c }}
                          aria-label={`Select color ${c}`}
                        />
                      ))}
                    </div>
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <LucideSave className="h-4 w-4" />
                    </Button>
                  </form>
                ) : (
                  <div
                    key={label.id}
                    className="flex items-center justify-between rounded-md p-2 hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: label.color }}
                      />
                      <span className="font-medium">{label.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleSelectLabelForEdit(label)}
                      >
                        <LucideEdit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDeleteRequest(label)}
                      >
                        <LucideTrash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ),
              )}
              {labels.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No tags created yet.
                </p>
              )}
            </div>
          </ScrollArea>

          <Separator />

          <form onSubmit={handleCreateSubmit} className="space-y-3 pt-1">
            <div className="flex items-center gap-2">
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="New tag name"
                className="h-9"
              />
              <Button type="submit" variant="outline" size="icon">
                <LucidePlus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {LABEL_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewTagColor(c)}
                  className={cn(
                    "h-5 w-5 rounded-full border-2 transition-all",
                    newTagColor === c
                      ? "border-primary ring-1 ring-ring"
                      : "border-transparent hover:border-muted-foreground/50",
                  )}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </form>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Label?"
        description={
          <>
            Are you sure you want to delete the label "
            <strong>{labelToDelete?.name}</strong>"? This will remove it from
            all associated contexts.
          </>
        }
        onConfirm={confirmDelete}
        confirmText="Delete"
        confirmVariant="destructive"
      />
    </>
  );
};
