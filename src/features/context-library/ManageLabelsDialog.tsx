import React, { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@livestore/react";
import { toast as sonnerToast } from "sonner";
import { LucideEdit, LucidePlus, LucideTrash2, LucideX } from "lucide-react";
import { useContextLibraryStore } from "@/store/ContextLibraryLiveStoreProvider";
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
  const contextLibraryStore = useContextLibraryStore();
  const labels = useQuery(labels$, { store: contextLibraryStore });

  // Edit state
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingColor, setEditingColor] = useState("");

  // Create state
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState(LABEL_COLORS[0]);

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [labelToDelete, setLabelToDelete] = useState<LabelType | null>(null);

  const handleClose = () => {
    // Auto-save any pending changes before closing
    if (editingLabelId && editingName.trim()) {
      contextLibraryStore.commit(
        contextLibraryEvents.labelUpdated({
          id: editingLabelId,
          name: editingName.trim(),
          color: editingColor,
        }),
      );
    }
    navigate("/");
  };

  const handleSelectLabelForEdit = (label: LabelType) => {
    setEditingLabelId(label.id);
    setEditingName(label.name);
    setEditingColor(label.color);
  };

  const handleUpdateSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleUpdateSubmit();
    } else if (e.key === "Escape") {
      setEditingLabelId(null);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newLabelName.trim();
    if (!trimmedName) {
      sonnerToast.error("Label name cannot be empty.");
      return;
    }

    contextLibraryStore.commit(
      contextLibraryEvents.labelCreated({
        id: generateLabelId(),
        name: trimmedName,
        color: newLabelColor,
      }),
    );
    sonnerToast.success("Label created", {
      description: `Label "${trimmedName}" has been created.`,
    });

    setNewLabelName("");
    setNewLabelColor(LABEL_COLORS[0]);
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
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-semibold">
              Manage Labels
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Create New Label Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Create New Label
              </h3>
              <form onSubmit={handleCreateSubmit} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Input
                      value={newLabelName}
                      onChange={(e) => setNewLabelName(e.target.value)}
                      placeholder="Enter label name..."
                      className="h-10"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {LABEL_COLORS.map((color) => {
                      const isInputEmpty = !newLabelName.trim();
                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() =>
                            !isInputEmpty && setNewLabelColor(color)
                          }
                          disabled={isInputEmpty}
                          className={cn(
                            "h-6 w-6 rounded-full border-2 transition-all",
                            isInputEmpty ? "opacity-50" : "hover:scale-110",
                            newLabelColor === color && !isInputEmpty
                              ? "ring-2 ring-offset-2"
                              : "border-border hover:border-foreground/50",
                          )}
                          style={{
                            backgroundColor: color,
                            borderColor:
                              newLabelColor === color && !isInputEmpty
                                ? `${color}80`
                                : "transparent",
                          }}
                          aria-label={`Select color ${color}`}
                        />
                      );
                    })}
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    className="px-4"
                    disabled={!newLabelName.trim()}
                  >
                    <LucidePlus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </form>
            </div>

            <Separator />

            {/* Existing Labels Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Existing Labels ({labels.length})
              </h3>

              <ScrollArea className="h-64">
                <div className="space-y-2 pr-4">
                  {labels.map((label) =>
                    editingLabelId === label.id ? (
                      <div
                        key={label.id}
                        className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3"
                      >
                        <div
                          className="h-5 w-5 flex-shrink-0 rounded-full border border-border"
                          style={{ backgroundColor: editingColor }}
                        />
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="h-8 flex-1 text-sm"
                          autoFocus
                        />
                        <div className="flex gap-1">
                          {LABEL_COLORS.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setEditingColor(color)}
                              className={cn(
                                "h-4 w-4 rounded-full border transition-all",
                                editingColor === color
                                  ? "ring-1 ring-offset-1"
                                  : "border-border hover:border-foreground/50",
                              )}
                              style={{
                                backgroundColor: color,
                                borderColor:
                                  editingColor === color
                                    ? `${color}80`
                                    : "transparent",
                              }}
                              aria-label={`Select color ${color}`}
                            />
                          ))}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setEditingLabelId(null)}
                          >
                            <LucideX className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        key={label.id}
                        className="group flex items-center justify-between rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="h-5 w-5 rounded-full border border-border"
                            style={{ backgroundColor: label.color }}
                          />
                          <span className="font-medium text-sm">
                            {label.name}
                          </span>
                        </div>
                        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleSelectLabelForEdit(label)}
                          >
                            <LucideEdit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDeleteRequest(label)}
                          >
                            <LucideTrash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ),
                  )}
                  {labels.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="rounded-full bg-muted p-3 mb-4">
                        <LucidePlus className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        No labels created yet
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Create your first label above to get started
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          <DialogFooter className="pt-6">
            <Button
              variant="outline"
              onClick={handleClose}
              className="w-full sm:w-auto"
            >
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
