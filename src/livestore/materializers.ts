import { events } from "./events";
import { State } from "@livestore/livestore";
import { tables } from "./schema";
import { generateContextHash } from "@/utils";

export const materializers = State.SQLite.materializers(events, {
  "v1.ContextCreated": ({ id, title, content, createdAt }) => {
    const contextHash = generateContextHash(title, content);
    const charCount = content.length;
    return tables.contexts.insert({
      id,
      title,
      content,
      charCount,
      originalHash: contextHash,
      createdAt,
      updatedAt: createdAt,
    });
  },
  "v1.ContextUpdated": ({ id, title, content, updatedAt }) => {
    const contextHash = generateContextHash(title, content);
    const charCount = content.length;
    return tables.contexts
      .update({
        title,
        content,
        charCount,
        originalHash: contextHash,
        updatedAt,
      })
      .where({ id });
  },
  "v1.ContextsDeleted": ({ ids }) => {
    return ids.map((id) => tables.contexts.delete().where({ id }));
  },
});
