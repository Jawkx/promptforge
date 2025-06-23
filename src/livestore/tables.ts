import { Schema, State } from "@livestore/livestore";

const contextLivewireColumns = {
  id: State.SQLite.text({ primaryKey: true }),
  title: State.SQLite.text({ default: "" }),
  content: State.SQLite.text({ default: "" }),
  charCount: State.SQLite.integer({ nullable: false, default: 0 }),
  originalHash: State.SQLite.text({ nullable: false }),
  createdAt: State.SQLite.integer({ nullable: false, default: 0 }),
  updatedAt: State.SQLite.integer({ nullable: false, default: 0 }),
};

export const tables = {
  contexts: State.SQLite.table({
    name: "contextsLibrary",
    columns: contextLivewireColumns,
  }),
  preferences: State.SQLite.clientDocument({
    name: "preference",
    schema: Schema.Struct({
      theme: Schema.Literal("light", "dark"),
    }),
    default: { id: "main", value: { theme: "dark" } },
  }),
};
