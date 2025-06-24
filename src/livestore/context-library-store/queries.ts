import { queryDb } from "@livestore/livestore";
import { contextLibraryTables } from "./tables";

export const contexts$ = queryDb(() => {
  return contextLibraryTables.contexts;
});
