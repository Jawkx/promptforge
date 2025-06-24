import { Events, Schema } from "@livestore/livestore";

export const contextLibraryEvents = {
  contextCreated: Events.synced({
    name: "v1.ContextCreated",
    schema: Schema.Struct({
      id: Schema.String,
      title: Schema.String,
      content: Schema.String,
      createdAt: Schema.Number,
    }),
  }),
  contextUpdated: Events.synced({
    name: "v1.ContextUpdated",
    schema: Schema.Struct({
      id: Schema.String,
      title: Schema.String,
      content: Schema.String,
      updatedAt: Schema.Number,
    }),
  }),
  contextsDeleted: Events.synced({
    name: "v1.ContextsDeleted",
    schema: Schema.Struct({ ids: Schema.Array(Schema.String) }),
  }),
};
