import { events } from "./events";
import { State } from "@livestore/livestore";
import { tables } from "./tables";
import { estimateTokens } from "@/lib/utils";

export const materializers = State.SQLite.materializers(events, {
  // User materializers
  "v1.UserPreferenceUpdated": ({ theme }) => {
    // To ensure the preference is always correctly set, we perform a
    // "delete-then-insert" operation. This is transactionally safe
    // within a materializer and effectively acts as an "upsert".
    const deleteOp = tables.preferences.delete().where({ id: "main" });
    const insertOp = tables.preferences.insert({ id: "main", theme });
    return [deleteOp, insertOp];
  },
  "v1.UserContextLibraryCreated": () => {
    // Since users can only have one library, we don't need to track library membership
    // This event is kept for compatibility but doesn't perform any database operations
    return [];
  },

  // Context library materializers
  "v1.LibraryCreated": ({ libraryId, name, creatorId }) => {
    // Perform an "upsert" for the library metadata.
    const deleteLibraryOp = tables.library.delete().where({ id: libraryId });
    const insertLibraryOp = tables.library.insert({
      id: libraryId,
      name,
      creatorId,
    });

    return [deleteLibraryOp, insertLibraryOp];
  },
  "v1.ContextCreated": ({ id, title, content, createdAt, version }) => {
    const tokenCount = estimateTokens(content);
    return [
      tables.contexts.insert({
        id,
        title,
        content,
        tokenCount,
        version,
        createdAt,
        updatedAt: createdAt,
      }),
    ];
  },
  "v1.ContextUpdated": ({ id, title, content, updatedAt, version }) => {
    const tokenCount = estimateTokens(content);
    return tables.contexts
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
    return ids.map((id) => tables.contexts.delete().where({ id }));
  },
  // Label Materializers
  "v1.LabelCreated": ({ id, name, color }) => {
    return tables.labels.insert({ id, name, color });
  },
  "v1.LabelUpdated": ({ id, name, color }) => {
    return tables.labels.update({ name, color }).where({ id });
  },
  "v1.LabelDeleted": ({ id }) => {
    return [
      tables.labels.delete().where({ id }),
      tables.context_labels.delete().where({ labelId: id }),
    ];
  },
  "v1.ContextLabelsUpdated": ({ contextId, labelIds }) => {
    // First, delete all existing associations for this context
    const deleteOp = tables.context_labels.delete().where({ contextId });

    // Then, insert the new associations
    const insertOps = labelIds.map((labelId) =>
      tables.context_labels.insert({ contextId, labelId }),
    );

    return [deleteOp, ...insertOps];
  },
});
