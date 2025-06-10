import { Events, makeSchema, Schema, SessionIdSymbol, State } from '@livestore/livestore'
import { v4 as uuid } from 'uuid';

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

export const events = {
  contextCreated: Events.synced({
    name: 'v1.ContextCreated',
    schema: Schema.Struct({
      title: Schema.String,
      content: Schema.String
    }),
  }),
  contextUpdated: Events.synced({
    name: 'v1.ContextUpdated',
    schema: Schema.Struct({ id: Schema.String, title: Schema.String, content: Schema.String }),
  }),
  contextDeleted: Events.synced({
    name: 'v1.ContextDeleted',
    schema: Schema.Struct({ id: Schema.String }),
  }),
}

const materializers = State.SQLite.materializers(events, {
  "v1.ContextCreated": ({ title, content }) => {
    const contextHash = generateContextHash(title, content, [])
    const id = uuid()
    const charCount = content.length
    return tables.contexts.insert({ id: id, title, content, charCount, hash: contextHash })
  },
  "v1.ContextUpdated": ({ id, title, content }) => {
    const contextHash = generateContextHash(title, content, [])
    const charCount = content.length
    return tables.contexts.update({ title, content, charCount, hash: contextHash }).where({ id })
  },
  "v1.ContextDeleted": ({ id }) => {
    return tables.contexts.delete().where({ id })
  }
})

const state = State.SQLite.makeState({ tables, materializers })

export const schema = makeSchema({ events, state })


const generateContextHash = (title: string, content: string, labelIds: string[]): string => {
  const sortedLabelsString = [...(labelIds || [])].sort().join(',');
  const dataString = JSON.stringify({ title, content, labels: sortedLabelsString });

  let hash = 5381;
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash = ((hash << 5) + hash) + char; /* hash * 33 + char */
    hash = hash & hash; // Convert to 32bit integer
  }
  return String(hash >>> 0); // Ensure positive integer string
};

