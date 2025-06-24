import { makeWorker } from "@livestore/adapter-web/worker";
import { userSchema } from "./user-store/schema.ts";

makeWorker({
  schema: userSchema,
});
