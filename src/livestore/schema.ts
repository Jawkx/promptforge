import { makeSchema, Schema, SessionIdSymbol, State } from '@livestore/livestore'

// const contextLivewireColumns = {
//   id: State.SQLite.text({ primaryKey: true }),
//   title: State.SQLite.text({ default: '' }),
//   char: State.SQLite.integer({ nullable: false, default: 0 }),
//   hash: State.SQLite.text({ nullable: false }),
// }

export const tables = {
  // contextsLibrary: State.SQLite.table({
  //   name: 'contextsLibrary',
  //   columns: contextLivewireColumns,
  // }),
  // selectedContext: State.SQLite.table({
  //   name: 'contextsLibrary',
  //   columns: contextLivewireColumns,
  // }),
  // labels: State.SQLite.table({
  //   name: 'labels',
  //   columns: {
  //     id: State.SQLite.text({ primaryKey: true }),
  //     title: State.SQLite.text({ default: '' }),
  //   },
  // }),
  // contextLabels: State.SQLite.table({
  //   name: "contextLabels", columns: {
  //     id: State.SQLite.text({ primaryKey: true }),
  //     contextId: State.SQLite.text(), // either context from selected context or context library
  //     labelId: State.SQLite.text(),
  //   }
  // }),
  preferences: State.SQLite.clientDocument({
    name: 'preference',
    schema: Schema.Struct({
      theme: Schema.Literal('light', 'dark'),
    }),
    default: { id: SessionIdSymbol, value: { theme: "dark" } },
  }),
}

export const events = {
  // uiStateSet: tables.uiState.set,
  // contextCreated: Events.synced({
  //   name: 'v1.contextCreated',
  //   schema: Schema.Struct({ id: Schema.String, title: Schema.String, char: Schema.Int, hash: Schema.String, inSelected: Schema.Boolean }),
  // }),
  // contextAdded: Events.synced({
  //   name: 'v1.contextAdded',
  //   schema: Schema.Struct({ contextId: Schema.String, toSelected: Schema.Boolean }),
  // }),
  // contextDeleted: Events.synced({
  //   name: 'v1.TodoCreated',
  //   schema: Schema.Struct({ id: Schema.String, text: Schema.String }),
  // }),
  // todoCompleted: Events.synced({
  //   name: 'v1.TodoCompleted',
  //   schema: Schema.Struct({ id: Schema.String }),
  // }),
  // todoUncompleted: Events.synced({
  //   name: 'v1.TodoUncompleted',
  //   schema: Schema.Struct({ id: Schema.String }),
  // }),
  // todoDeleted: Events.synced({
  //   name: 'v1.TodoDeleted',
  //   schema: Schema.Struct({ id: Schema.String, deletedAt: Schema.Date }),
  // }),
  // todoClearedCompleted: Events.synced({
  //   name: 'v1.TodoClearedCompleted',
  //   schema: Schema.Struct({ deletedAt: Schema.Date }),
  // }),
}

const materializers = State.SQLite.materializers(events, {})

const state = State.SQLite.makeState({ tables, materializers })

export const schema = makeSchema({ events, state })
