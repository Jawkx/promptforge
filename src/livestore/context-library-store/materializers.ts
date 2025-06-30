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
  },
);
