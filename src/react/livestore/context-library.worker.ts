import { makeWorker } from "@livestore/adapter-web/worker";
import { contextLibrarySchema } from "./context-library-store/schema.ts";
import { makeCfSync } from "@livestore/sync-cf";

const url = import.meta.env.VITE_SYNC_URL;

makeWorker({
  schema: contextLibrarySchema,
  sync: { backend: makeCfSync({ url }) },
});
