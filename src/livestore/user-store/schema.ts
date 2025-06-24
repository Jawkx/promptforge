import { LiveStoreSchema, makeSchema, State } from "@livestore/livestore";
import { userEvents } from "./events";
import { userTables } from "./tables";

const state = State.SQLite.makeState({
  tables: userTables,
  // Materializer for clientDocument is handled internally by LiveStore
  materializers: {},
});

export const userSchema: LiveStoreSchema = makeSchema({
  events: userEvents,
  state,
});
