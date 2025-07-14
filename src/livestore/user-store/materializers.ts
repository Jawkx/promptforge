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
});
