import { queryDb } from "@livestore/livestore";
import { userTables } from "./tables";

export const preference$ = queryDb(
  userTables.preferences.select().where({ id: "main" }),
  {
    map: (results) => results[0] ?? { id: "main", theme: "dark" },
    label: "preferences",
  },
);

export const userContextLibraries$ = queryDb(
  userTables.user_context_libraries.select(),
  {
    map: (results) => results,
    label: "userContextLibraries",
  },
);
