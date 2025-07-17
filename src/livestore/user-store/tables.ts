import { State } from "@livestore/livestore";

export const userTables = {
  preferences: State.SQLite.table({
    name: "preferences",
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      theme: State.SQLite.text({ default: "dark" }), // Default theme set to 'dark'
    },
  }),
  user_context_libraries: State.SQLite.table({
    name: "user_context_libraries",
    columns: {
      libraryId: State.SQLite.text({ primaryKey: true }),
    },
  }),
};
