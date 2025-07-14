import { queryDb } from "@livestore/livestore";
import { userTables } from "./tables";

export const preference$ = queryDb(
  userTables.preferences.select().where({ id: "main" }),
  {
    map: (results) => results[0] ?? { id: "main", theme: "dark" },
    label: "preferences",
  },
);
