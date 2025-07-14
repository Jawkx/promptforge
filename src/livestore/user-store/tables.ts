import { State } from "@livestore/livestore";

export const userTables = {
  preferences: State.SQLite.table({
    name: "preferences",
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      theme: State.SQLite.text({ default: "dark" }), // Default theme set to 'dark'
    },
  }),
};
