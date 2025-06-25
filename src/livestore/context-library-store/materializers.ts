import { contextLibraryEvents } from "./events";
import { State } from "@livestore/livestore";
import { contextLibraryTables } from "./tables";
import { generateContextHash, estimateTokens } from "@/utils";

export const contextLibraryMaterializers = State.SQLite.materializers(
  contextLibraryEvents,
  {
    "v1.ContextCreated": ({ id, title, content, createdAt }) => {
      const contextHash = generateContextHash(title, content);
      const tokenCount = estimateTokens(content);
      return contextLibraryTables.contexts.insert({
        id,
        title,
        content,
        tokenCount,
        originalHash: contextHash,
        createdAt,
        updatedAt: createdAt,
      });
    },
    "v1.ContextUpdated": ({ id, title, content, updatedAt }) => {
      const contextHash = generateContextHash(title, content);
      const tokenCount = estimateTokens(content);
      return contextLibraryTables.contexts
        .update({
          title,
          content,
          tokenCount,
          originalHash: contextHash,
          updatedAt,
        })
        .where({ id });
    },
    "v1.ContextsDeleted": ({ ids }) => {
      return ids.map((id) =>
        contextLibraryTables.contexts.delete().where({ id }),
      );
    },
  },
);
