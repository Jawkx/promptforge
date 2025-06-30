import { contextLibraryEvents } from "./events";
import { State } from "@livestore/livestore";
import { contextLibraryTables } from "./tables";
import { estimateTokens } from "@/lib/utils";

export const contextLibraryMaterializers = State.SQLite.materializers(
  contextLibraryEvents,
  {
    "v1.ContextCreated": ({ id, title, content, createdAt, version }) => {
      const tokenCount = estimateTokens(content);
      return contextLibraryTables.contexts.insert({
        id,
        title,
        content,
        tokenCount,
        version,
        createdAt,
        updatedAt: createdAt,
      });
    },
    "v1.ContextUpdated": ({ id, title, content, updatedAt, version }) => {
      const tokenCount = estimateTokens(content);
      return contextLibraryTables.contexts
        .update({
          title,
          content,
          tokenCount,
          version,
          updatedAt,
        })
        .where({ id });
    },
    "v1.ContextsDeleted": ({ ids }) => {
      return ids.map((id) =>
        contextLibraryTables.contexts.delete().where({ id }),
      );
    },
    // Label Materializers
    "v1.LabelCreated": ({ id, name, color }) => {
      return contextLibraryTables.labels.insert({ id, name, color });
    },
    "v1.LabelUpdated": ({ id, name, color }) => {
      return contextLibraryTables.labels.update({ name, color }).where({ id });
    },
    "v1.LabelDeleted": ({ id }) => {
      return [
        contextLibraryTables.labels.delete().where({ id }),
        contextLibraryTables.context_labels.delete().where({ labelId: id }),
      ];
    },
    "v1.ContextLabelsUpdated": ({ contextId, labelIds }) => {
      // First, delete all existing associations for this context
      const deleteOp = contextLibraryTables.context_labels
        .delete()
        .where({ contextId });

      // Then, insert the new associations
      const insertOps = labelIds.map((labelId) =>
        contextLibraryTables.context_labels.insert({ contextId, labelId }),
      );

      return [deleteOp, ...insertOps];
    },
  },
);
