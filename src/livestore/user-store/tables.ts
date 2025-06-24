import { Schema, State } from "@livestore/livestore";

export const userTables = {
  preferences: State.SQLite.clientDocument({
    name: "preference",
    schema: Schema.Struct({
      theme: Schema.Literal("light", "dark"),
    }),
    default: { id: "main", value: { theme: "dark" } },
  }),
};
