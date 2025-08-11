import { makeWorker } from "@livestore/adapter-web/worker";
import { liveSchema } from "./live-store/schema.ts";
import { makeCfSync } from "@livestore/sync-cf";

const url = import.meta.env.VITE_SYNC_URL;

makeWorker({
  schema: liveSchema,
  sync: { backend: makeCfSync({ url }) },
});
