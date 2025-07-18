import { Store, createStorePromise } from "@livestore/livestore";
import { makePersistedAdapter } from "@livestore/adapter-web";
import { userSchema } from "@/livestore/user-store/schema";
import {
  preference$,
  userContextLibraries$,
} from "@/livestore/user-store/queries";
import { userEvents } from "@/livestore/user-store/events";
import { unstable_batchedUpdates as batchUpdates } from "react-dom";
import UserLiveStoreWorker from "@/livestore/user.worker.ts?worker";
import UserLiveStoreSharedWorker from "@livestore/adapter-web/shared-worker?sharedworker&name=userSharedWorker";

type UserStore = Store<typeof userSchema>;

const createAnonymousStore = (anonymousId: string) => {
  const adapter = makePersistedAdapter({
    storage: { type: "opfs" },
    worker: UserLiveStoreWorker,
    sharedWorker: UserLiveStoreSharedWorker,
  });

  return createStorePromise({
    schema: userSchema,
    adapter,
    storeId: anonymousId,
    batchUpdates,
  });
};

const readAnonymousData = (anonymousStore: UserStore) => {
  const preferencesPromise = anonymousStore.query(preference$);
  const librariesPromise = anonymousStore.query(userContextLibraries$);

  return Promise.all([preferencesPromise, librariesPromise]);
};

const applyMigrationEvents = (
  authenticatedStore: UserStore,
  preferences: any,
  libraries: readonly { readonly libraryId: string }[],
) => {
  const events = [];

  if (preferences?.theme) {
    events.push(userEvents.preferenceUpdated({ theme: preferences.theme }));
  }

  libraries.forEach((library) => {
    events.push(
      userEvents.contextLibraryJoined({ libraryId: library.libraryId }),
    );
  });

  events.forEach((event) => authenticatedStore.commit(event));
  return Promise.resolve();
};

const cleanupAnonymousStore = (_anonymousStore: UserStore) => {
  return Promise.resolve();
};

export const migrateUserData = (
  anonymousId: string,
  authenticatedStore: UserStore,
) => {
  return createAnonymousStore(anonymousId)
    .then((anonymousStore) => {
      return readAnonymousData(anonymousStore)
        .then(([preferences, libraries]) => {
          return applyMigrationEvents(
            authenticatedStore,
            preferences,
            libraries,
          )
            .then(() => cleanupAnonymousStore(anonymousStore))
            .then(() => {
              console.log("Migration completed successfully");
            });
        })
        .catch((error) => {
          console.error("Migration data processing failed:", error);
          return cleanupAnonymousStore(anonymousStore).then(() => {
            throw error;
          });
        });
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      throw error;
    });
};
