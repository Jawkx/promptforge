import { Store, createStorePromise } from "@livestore/livestore";
import { makePersistedAdapter } from "@livestore/adapter-web";
import { contextLibrarySchema } from "@/livestore/context-library-store/schema";
import { contexts$, labels$ } from "@/livestore/context-library-store/queries";
import { contextLibraryEvents } from "@/livestore/context-library-store/events";
import { unstable_batchedUpdates as batchUpdates } from "react-dom";
import ContextLibraryLiveStoreWorker from "@/livestore/context-library.worker.ts?worker";
import ContextLibraryLiveStoreSharedWorker from "@livestore/adapter-web/shared-worker?sharedworker&name=contextLibrarySharedWorker";

type ContextLibraryStore = Store<typeof contextLibrarySchema>;

const createAnonymousContextStore = (anonymousId: string) => {
  const adapter = makePersistedAdapter({
    storage: { type: "opfs" },
    worker: ContextLibraryLiveStoreWorker,
    sharedWorker: ContextLibraryLiveStoreSharedWorker,
  });

  return createStorePromise({
    schema: contextLibrarySchema,
    adapter,
    storeId: `context-${anonymousId}`,
    batchUpdates,
  });
};

const readAnonymousContextData = (anonymousStore: ContextLibraryStore) => {
  const contextsPromise = anonymousStore.query(contexts$);
  const labelsPromise = anonymousStore.query(labels$);

  return Promise.all([contextsPromise, labelsPromise]);
};

const applyContextMigrationEvents = async (
  authenticatedStore: ContextLibraryStore,
  contexts: readonly any[],
  labels: readonly any[],
  authenticatedUserId: string,
) => {
  const events = [];

  // Create the library for the authenticated user
  events.push(
    contextLibraryEvents.libraryCreated({
      libraryId: "default",
      name: "My Context Library",
      creatorId: authenticatedUserId,
    }),
  );

  // Migrate all labels first
  labels.forEach((label) => {
    events.push(
      contextLibraryEvents.labelCreated({
        id: label.id,
        name: label.name,
        color: label.color,
      }),
    );
  });

  // Migrate all contexts
  contexts.forEach((context) => {
    // Create the context
    events.push(
      contextLibraryEvents.contextCreated({
        id: context.id,
        title: context.title,
        content: context.content,
        createdAt: context.createdAt,
        version: context.version,
        creatorId: authenticatedUserId,
      }),
    );

    // Restore label associations if they exist
    if (context.labels && context.labels.length > 0) {
      const labelIds = context.labels.map((label: any) => label.id);
      events.push(
        contextLibraryEvents.contextLabelsUpdated({
          contextId: context.id,
          labelIds,
        }),
      );
    }
  });

  // Apply all events to the authenticated store
  events.forEach((event) => authenticatedStore.commit(event));
};

const cleanupAnonymousContextStore = async (
  _anonymousStore: ContextLibraryStore,
) => {
  // For now, we'll just resolve. In the future, we might want to
  // clean up the anonymous store data from OPFS
};

export const migrateContextLibraryData = async (
  anonymousId: string,
  authenticatedStore: ContextLibraryStore,
  authenticatedUserId: string,
) => {
  try {
    const anonymousStore = await createAnonymousContextStore(anonymousId);

    try {
      const [contexts, labels] = await readAnonymousContextData(anonymousStore);

      await applyContextMigrationEvents(
        authenticatedStore,
        contexts,
        labels,
        authenticatedUserId,
      );

      await cleanupAnonymousContextStore(anonymousStore);
      console.log("Context library migration completed successfully");
    } catch (error) {
      console.error("Context library migration data processing failed:", error);
      await cleanupAnonymousContextStore(anonymousStore);
      throw error;
    }
  } catch (error) {
    console.error("Context library migration failed:", error);
    throw error;
  }
};
