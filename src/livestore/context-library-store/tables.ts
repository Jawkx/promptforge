import { State } from "@livestore/livestore";

const contextLivewireColumns = {
  id: State.SQLite.text({ primaryKey: true }),
  title: State.SQLite.text({ default: "" }),
  content: State.SQLite.text({ default: "" }),
  tokenCount: State.SQLite.integer({ nullable: false, default: 0 }),
  version: State.SQLite.text({ nullable: false }),
  createdAt: State.SQLite.integer({ nullable: false, default: 0 }),
  updatedAt: State.SQLite.integer({ nullable: false, default: 0 }),
};

export const contextLibraryTables = {
  contexts: State.SQLite.table({
    name: "contextsLibrary",
    columns: contextLivewireColumns,
  }),
  labels: State.SQLite.table({
    name: "labels",
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      name: State.SQLite.text(),
      color: State.SQLite.text(),
    },
  }),
  context_labels: State.SQLite.table({
    name: "context_labels",
    columns: {
      contextId: State.SQLite.text(),
      labelId: State.SQLite.text(),
    },
    // Note: LiveStore's schema definition doesn't have an explicit API for composite primary keys.
    // The combination of (contextId, labelId) should be unique, which we'll enforce
    // through application logic (delete all then insert new).
    // For performance, indices could be added if necessary.
    // e.g. using `indices: (t) => [t.contextId(), t.labelId()]` if API supported it.
  }),
};
