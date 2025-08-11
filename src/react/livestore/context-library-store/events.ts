import { Events, Schema } from "@livestore/livestore";

export const contextLibraryEvents = {
  // This event initializes the entire library.
  libraryCreated: Events.synced({
    name: "v1.LibraryCreated",
    schema: Schema.Struct({
      libraryId: Schema.String,
      name: Schema.String,
      creatorId: Schema.String,
    }),
  }),
  // This event adds a new item to an existing library.
  contextCreated: Events.synced({
    name: "v1.ContextCreated",
    schema: Schema.Struct({
      id: Schema.String,
      title: Schema.String,
      content: Schema.String,
      createdAt: Schema.Number,
      version: Schema.String,
      creatorId: Schema.String,
    }),
  }),
  contextUpdated: Events.synced({
    name: "v1.ContextUpdated",
    schema: Schema.Struct({
      id: Schema.String,
      title: Schema.String,
      content: Schema.String,
      updatedAt: Schema.Number,
      version: Schema.String,
    }),
  }),
  contextsDeleted: Events.synced({
    name: "v1.ContextsDeleted",
    schema: Schema.Struct({ ids: Schema.Array(Schema.String) }),
  }),
  // Label Events
  labelCreated: Events.synced({
    name: "v1.LabelCreated",
    schema: Schema.Struct({
      id: Schema.String,
      name: Schema.String,
      color: Schema.String,
    }),
  }),
  labelUpdated: Events.synced({
    name: "v1.LabelUpdated",
    schema: Schema.Struct({
      id: Schema.String,
      name: Schema.String,
      color: Schema.String,
    }),
  }),
  labelDeleted: Events.synced({
    name: "v1.LabelDeleted",
    schema: Schema.Struct({ id: Schema.String }),
  }),
  // Context-Label Association Event
  contextLabelsUpdated: Events.synced({
    name: "v1.ContextLabelsUpdated",
    schema: Schema.Struct({
      contextId: Schema.String,
      labelIds: Schema.Array(Schema.String),
    }),
  }),
};
