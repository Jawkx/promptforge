import { LiveStoreSchema, makeSchema, State } from "@livestore/livestore";
import { userEvents } from "./events";
import { userTables } from "./tables";
import { userMaterializers } from "./materializers";

const state = State.SQLite.makeState({
  tables: userTables,
  materializers: userMaterializers,
});

export const userSchema: LiveStoreSchema = makeSchema({
  events: userEvents,
  state,
});
