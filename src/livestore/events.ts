import { Events, Schema } from "@livestore/livestore";

export const events = {
  contextCreated: Events.synced({
    name: 'v1.ContextCreated',
    schema: Schema.Struct({
      id: Schema.String,
      title: Schema.String,
      content: Schema.String
    }),
  }),
  contextUpdated: Events.synced({
    name: 'v1.ContextUpdated',
    schema: Schema.Struct({ id: Schema.String, title: Schema.String, content: Schema.String }),
  }),
  contextDeleted: Events.synced({
    name: 'v1.ContextsDeleted',
    schema: Schema.Struct({ ids: Schema.Array(Schema.String) }),
  }),
}
