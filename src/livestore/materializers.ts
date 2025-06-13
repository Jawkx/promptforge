import { events } from "./events";
import { State } from "@livestore/livestore";
import { tables } from "./schema";

export const materializers = State.SQLite.materializers(events, {
  "v1.ContextCreated": ({ id, title, content }) => {
    const contextHash = generateContextHash(title, content);
    const charCount = content.length;
    return tables.contexts.insert({
      id,
      title,
      content,
      charCount,
      hash: contextHash,
    });
  },
  "v1.ContextUpdated": ({ id, title, content }) => {
    const contextHash = generateContextHash(title, content);
    const charCount = content.length;
    return tables.contexts
      .update({ title, content, charCount, hash: contextHash })
      .where({ id });
  },
  "v1.ContextsDeleted": ({ ids }) => {
    return ids.map((id) => tables.contexts.delete().where({ id }));
  },
});

const generateContextHash = (title: string, content: string): string => {
  const dataString = JSON.stringify({
    title,
    content,
  });

  let hash = 5381;
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash = (hash << 5) + hash + char; /* hash * 33 + char */
    hash = hash & hash; // Convert to 32bit integer
  }
  return String(hash >>> 0); // Ensure positive integer string
};
