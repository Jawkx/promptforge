import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { Context, Label } from "@/types";
import { contextLibraryEvents } from "@/livestore/context-library-store/events";
import { v4 as uuid } from "uuid";
import { Store } from "@livestore/livestore";
import { contextLibrarySchema } from "@/livestore/context-library-store/schema";

interface ContextBackupData {
  contexts: readonly Context[];
  labels: readonly Label[];
  exportedAt: number;
  version: string;
}

interface ContextBackupProps {
  contexts: readonly Context[];
  labels: readonly Label[];
  contextLibraryStore: Store<typeof contextLibrarySchema>;
}

export const ContextBackup: React.FC<ContextBackupProps> = ({
  contexts,
  labels,
  contextLibraryStore,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownload = () => {
    try {
      const backupData: ContextBackupData = {
        contexts,
        labels,
        exportedAt: Date.now(),
        version: "1.0",
      };

      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });

      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;

      const timestamp = new Date().toISOString().split("T")[0];
      link.download = `contexts-backup-${timestamp}.json`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      sonnerToast.success("Download Complete", {
        description: `${contexts.length} contexts exported successfully.`,
      });
    } catch (error) {
      console.error("Download error:", error);
      sonnerToast.error("Download Failed", {
        description: "Failed to export contexts. Please try again.",
      });
    }
  };

  const validateBackupData = (data: unknown): data is ContextBackupData => {
    if (!data || typeof data !== "object") return false;

    const obj = data as Record<string, unknown>;
    if (!Array.isArray(obj.contexts) || !Array.isArray(obj.labels))
      return false;
    if (typeof obj.exportedAt !== "number" || typeof obj.version !== "string")
      return false;

    // Validate context structure
    for (const context of obj.contexts) {
      if (
        typeof context.id !== "string" ||
        typeof context.title !== "string" ||
        typeof context.content !== "string" ||
        typeof context.tokenCount !== "number" ||
        typeof context.version !== "string" ||
        typeof context.createdAt !== "number" ||
        typeof context.updatedAt !== "number" ||
        !Array.isArray(context.labels)
      ) {
        return false;
      }
    }

    // Validate label structure
    for (const label of obj.labels) {
      if (
        typeof label.id !== "string" ||
        typeof label.name !== "string" ||
        typeof label.color !== "string"
      ) {
        return false;
      }
    }

    return true;
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const backupData = JSON.parse(text);

      if (!validateBackupData(backupData)) {
        sonnerToast.error("Invalid File", {
          description: "The selected file is not a valid context backup.",
        });
        return;
      }

      // Import labels first
      const existingLabels = new Set(labels.map((l) => l.id));
      let newLabelsCount = 0;

      for (const label of backupData.labels) {
        if (!existingLabels.has(label.id)) {
          contextLibraryStore.commit(
            contextLibraryEvents.labelCreated({
              id: label.id,
              name: label.name,
              color: label.color,
            }),
          );
          newLabelsCount++;
        }
      }

      // Import contexts
      const existingContexts = new Set(contexts.map((c) => c.id));
      let newContextsCount = 0;
      let updatedContextsCount = 0;

      for (const context of backupData.contexts) {
        if (existingContexts.has(context.id)) {
          // Update existing context
          contextLibraryStore.commit(
            contextLibraryEvents.contextUpdated({
              id: context.id,
              title: context.title,
              content: context.content,
              updatedAt: Date.now(),
              version: uuid(),
            }),
          );

          // Update labels for this context
          contextLibraryStore.commit(
            contextLibraryEvents.contextLabelsUpdated({
              contextId: context.id,
              labelIds: context.labels.map((l) => l.id),
            }),
          );

          updatedContextsCount++;
        } else {
          // Create new context
          contextLibraryStore.commit(
            contextLibraryEvents.contextCreated({
              id: context.id,
              title: context.title,
              content: context.content,
              createdAt: context.createdAt,
              version: context.version,
              creatorId: "imported", // Mark as imported
            }),
          );

          // Add labels for this context
          if (context.labels.length > 0) {
            contextLibraryStore.commit(
              contextLibraryEvents.contextLabelsUpdated({
                contextId: context.id,
                labelIds: context.labels.map((l) => l.id),
              }),
            );
          }

          newContextsCount++;
        }
      }

      const messages = [];
      if (newContextsCount > 0)
        messages.push(`${newContextsCount} new contexts`);
      if (updatedContextsCount > 0)
        messages.push(`${updatedContextsCount} updated contexts`);
      if (newLabelsCount > 0) messages.push(`${newLabelsCount} new labels`);

      sonnerToast.success("Import Complete", {
        description:
          messages.length > 0
            ? `Imported: ${messages.join(", ")}.`
            : "No new data to import.",
      });
    } catch (error) {
      console.error("Upload error:", error);
      sonnerToast.error("Import Failed", {
        description: "Failed to import contexts. Please check the file format.",
      });
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={handleDownload}
        size="sm"
        title="Download Contexts"
      >
        <Download className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        onClick={handleUploadClick}
        size="sm"
        title="Upload Contexts"
      >
        <Upload className="h-4 w-4" />
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleUpload}
        style={{ display: "none" }}
      />
    </div>
  );
};
