import { LiveStoreSchema, makeSchema, State } from "@livestore/livestore";
import { contextLibraryEvents } from "./events";
import { contextLibraryMaterializers } from "./materializers";
import { contextLibraryTables } from "./tables";

const state = State.SQLite.makeState({
  tables: contextLibraryTables,
  materializers: contextLibraryMaterializers,
});

export const contextLibrarySchema: LiveStoreSchema = makeSchema({
  events: contextLibraryEvents,
  state,
});
