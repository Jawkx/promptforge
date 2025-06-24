import { queryDb } from "@livestore/livestore";
import { userTables } from "./tables";

export const preference$ = queryDb(userTables.preferences.get(), {
  label: "preferences",
});
