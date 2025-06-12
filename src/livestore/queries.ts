import { queryDb } from "@livestore/livestore";
import { tables } from "./schema";

export const contexts$ = queryDb(() => {
  return tables.contexts;
});
