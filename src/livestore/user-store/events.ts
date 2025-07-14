import { Events, Schema } from "@livestore/livestore";

export const userEvents = {
  preferenceUpdated: Events.synced({
    name: "v1.PreferenceUpdated",
    schema: Schema.Struct({
      theme: Schema.Literal("light", "dark"),
    }),
  }),
};
