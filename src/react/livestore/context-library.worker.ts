import { makeWorker } from "@livestore/adapter-web/worker";
import { contextLibrarySchema } from "./context-library-store/schema.ts";

makeWorker({
  schema: contextLibrarySchema,
});
