import { makeSchema, Schema, SessionIdSymbol, State } from '@livestore/livestore'
import { events } from './events';
import { materializers } from './materializers';

const contextLivewireColumns = {
  id: State.SQLite.text({ primaryKey: true }),
  title: State.SQLite.text({ default: '' }),
  content: State.SQLite.text({ default: '' }),
  charCount: State.SQLite.integer({ nullable: false, default: 0 }),
  hash: State.SQLite.text({ nullable: false }),
}

export const tables = {
  contexts: State.SQLite.table({
    name: 'contextsLibrary',
    columns: contextLivewireColumns,
  }),
  preferences: State.SQLite.clientDocument({
    name: 'preference',
    schema: Schema.Struct({
      theme: Schema.Literal('light', 'dark'),
    }),
    default: { id: SessionIdSymbol, value: { theme: "dark" } },
  }),
}

const state = State.SQLite.makeState({ tables, materializers })

export const schema = makeSchema({ events, state })

