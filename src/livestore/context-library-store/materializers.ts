import { contextLibraryEvents } from "./events";
import { State } from "@livestore/livestore";
import { contextLibraryTables } from "./tables";
import { estimateTokens } from "@/lib/utils";

export const contextLibraryMaterializers = State.SQLite.materializers(
  contextLibraryEvents,
  {
    "v1.LibraryCreated": ({ libraryId, name, creatorId }) => {
      // Perform an "upsert" for the library metadata and the initial member.
      const deleteLibraryOp = contextLibraryTables.library
        .delete()
        .where({ id: libraryId });
      const insertLibraryOp = contextLibraryTables.library.insert({
        id: libraryId,
        name,
        creatorId,
      });

      const deleteMemberOp = contextLibraryTables.members
        .delete()
        .where({ userId: creatorId });
      const insertMemberOp = contextLibraryTables.members.insert({
        userId: creatorId,
      });

      return [deleteLibraryOp, insertLibraryOp, deleteMemberOp, insertMemberOp];
    },
    "v1.ContextCreated": ({
      id,
      title,
      content,
      createdAt,
      version,
      creatorId,
    }) => {
      const tokenCount = estimateTokens(content);
      return [
        contextLibraryTables.contexts.insert({
          id,
          title,
          content,
          tokenCount,
          version,
          createdAt,
          updatedAt: createdAt,
        }),
        // Make member insertion idempotent
        contextLibraryTables.members.delete().where({ userId: creatorId }),
        contextLibraryTables.members.insert({ userId: creatorId }),
      ];
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
    "v1.UserJoined": ({ userId }) => {
      // Make this idempotent to prevent UNIQUE constraint errors
      const deleteOp = contextLibraryTables.members.delete().where({ userId });
      const insertOp = contextLibraryTables.members.insert({ userId });
      return [deleteOp, insertOp];
    },
  },
);
