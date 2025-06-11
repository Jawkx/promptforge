import { Events, Schema } from "@livestore/livestore";

export const events = {
  contextCreated: Events.synced({
    name: 'v1.ContextCreated',
    schema: Schema.Struct({
      title: Schema.String.pipe(Schema.optional),
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
