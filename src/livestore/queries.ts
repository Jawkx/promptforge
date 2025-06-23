import { queryDb } from "@livestore/livestore";
import { tables } from "./tables";

export const contexts$ = queryDb(() => {
  return tables.contexts;
});

export const preference$ = queryDb(tables.preferences.get(), {
  label: "preferences",
});
