import { events } from "./events";
import { State } from "@livestore/livestore";
import { tables } from "./schema";
import { generateContextHash } from "@/utils";

export const materializers = State.SQLite.materializers(events, {
  "v1.ContextCreated": ({ id, title, content }) => {
    const contextHash = generateContextHash(title, content);
    const charCount = content.length;
    return tables.contexts.insert({
      id,
      title,
      content,
      charCount,
      originalHash: contextHash,
    });
  },
  "v1.ContextUpdated": ({ id, title, content }) => {
    const contextHash = generateContextHash(title, content);
    const charCount = content.length;
    return tables.contexts
      .update({ title, content, charCount, originalHash: contextHash })
      .where({ id });
  },
  "v1.ContextsDeleted": ({ ids }) => {
    return ids.map((id) => tables.contexts.delete().where({ id }));
  },
});
