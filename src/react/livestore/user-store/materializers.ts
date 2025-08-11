import { State } from "@livestore/livestore";
import { userEvents } from "./events";
import { userTables } from "./tables";

export const userMaterializers = State.SQLite.materializers(userEvents, {
  "v1.PreferenceUpdated": ({ theme }) => {
    // To ensure the preference is always correctly set, we perform a
    // "delete-then-insert" operation. This is transactionally safe
    // within a materializer and effectively acts as an "upsert".
    const deleteOp = userTables.preferences.delete().where({ id: "main" });
    const insertOp = userTables.preferences.insert({ id: "main", theme });
    return [deleteOp, insertOp];
  },
  "v1.ContextLibraryCreated": () => {
    // Since users can only have one library, we don't need to track library membership
    // This event is kept for compatibility but doesn't perform any database operations
    return [];
  },
});
