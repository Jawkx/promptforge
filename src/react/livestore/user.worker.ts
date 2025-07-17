import { makeCfSync } from "@livestore/sync-cf";
import { makeWorker } from "@livestore/adapter-web/worker";
import { userSchema } from "./user-store/schema.ts";

const url = import.meta.env.VITE_SYNC_URL;

makeWorker({
  schema: userSchema,
  sync: { backend: makeCfSync({ url }) },
});
