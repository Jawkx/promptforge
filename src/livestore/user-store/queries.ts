import { queryDb } from "@livestore/livestore";
import { userTables } from "./tables";

export const preference$ = queryDb(
  userTables.preferences.select().where({ id: "main" }).first(),
  {
    map: (result) => result ?? { id: "main", theme: "dark" },
    label: "preferences",
  },
);
