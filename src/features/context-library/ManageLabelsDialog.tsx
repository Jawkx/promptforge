import React, { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@livestore/react";
import { toast as sonnerToast } from "sonner";
import { LucideEdit, LucideTrash2 } from "lucide-react";

import { useAppStores } from "@/store/LiveStoreProvider";
import { labels$ } from "@/livestore/context-library-store/queries";
import { contextLibraryEvents } from "@/livestore/context-library-store/events";
import { Label as LabelType } from "@/types";
import { generateLabelId, cn } from "@/lib/utils";
import { LABEL_COLORS } from "@/constants/labelColors";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConfirmationDialog } from "@/features/shared/ConfirmationDialog";
import { Separator } from "@/components/ui/separator";

export const ManageLabelsDialog: React.FC = () => {
  const [, navigate] = useLocation();
  const { contextLibraryStore } = useAppStores();
  const labels = useQuery(labels$, { store: contextLibraryStore });

  // Form state
  const [name, setName] = useState("");
  const [color, setColor] = useState(LABEL_COLORS[0]);
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [labelToDelete, setLabelToDelete] = useState<LabelType | null>(null);

  const handleClose = () => navigate("/");

  const handleSelectLabelForEdit = (label: LabelType) => {
    setEditingLabelId(label.id);
    setName(label.name);
    setColor(label.color);
  };

  const resetForm = () => {
    setEditingLabelId(null);
    setName("");
    setColor(LABEL_COLORS[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      sonnerToast.error("Label name cannot be empty.");
      return;
    }

    if (editingLabelId) {
      contextLibraryStore.commit(
        contextLibraryEvents.labelUpdated({
          id: editingLabelId,
          name: trimmedName,
          color,
        }),
      );
      sonnerToast.success("Label updated", {
        description: `Label "${trimmedName}" has been updated.`,
      });
    } else {
      contextLibraryStore.commit(
        contextLibraryEvents.labelCreated({
          id: generateLabelId(),
          name: trimmedName,
          color,
        }),
      );
      sonnerToast.success("Label created", {
        description: `Label "${trimmedName}" has been created.`,
      });
    }
    resetForm();
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
        resetForm();
      }
      setLabelToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <Dialog open onOpenChange={(isOpen) => !isOpen && handleClose()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Labels</DialogTitle>
            <DialogDescription>
              Create, edit, and delete labels for your contexts.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="flex items-end gap-2">
              <div className="grid flex-1 gap-1.5">
                <Label htmlFor="label-name">
                  {editingLabelId ? "Edit Label" : "New Label"}
                </Label>
                <Input
                  id="label-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., 'API Schemas'"
                />
              </div>
              <Button type="submit">
                {editingLabelId ? "Update" : "Create"}
              </Button>
              {editingLabelId && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={resetForm}
                >
                  <span className="sr-only">Cancel edit</span>×
                </Button>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2 rounded-md border p-2 ">
                {LABEL_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      "h-6 w-6 rounded-full border-2 transition-all",
                      color === c
                        ? "border-primary ring-2 ring-ring ring-offset-2 ring-offset-background"
                        : "border-transparent hover:border-muted-foreground/50",
                    )}
                    style={{ backgroundColor: c }}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
            </div>
          </form>

          <Separator className="my-2" />

          <ScrollArea className="h-60">
            <div className="space-y-2 pr-4">
              {labels.map((label) => (
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
              ))}
              {labels.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No labels created yet.
                </p>
              )}
            </div>
          </ScrollArea>

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
