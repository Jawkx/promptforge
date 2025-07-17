import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Store, createStorePromise } from "@livestore/livestore";
import { makePersistedAdapter } from "@livestore/adapter-web";
import { contextLibrarySchema } from "@/livestore/context-library-store/schema";
import { unstable_batchedUpdates as batchUpdates } from "react-dom";
import ContextLibraryLiveStoreWorker from "@/livestore/context-library.worker.ts?worker";
import ContextLibraryLiveStoreSharedWorker from "@livestore/adapter-web/shared-worker?sharedworker&name=contextLibrarySharedWorker";
import { LoadingScreen } from "@/components/LoadingScreen";

type ContextLibraryStore = Store<typeof contextLibrarySchema>;

const ContextLibraryStoreContext = createContext<ContextLibraryStore | null>(
  null,
);

export const useContextLibraryStore = (): ContextLibraryStore => {
  const context = useContext(ContextLibraryStoreContext);
  if (!context) {
    throw new Error(
      "useContextLibraryStore must be used within a ContextLibraryLiveStoreProvider",
    );
  }
  return context;
};

export const ContextLibraryLiveStoreProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [contextLibraryStore, setContextLibraryStore] =
    useState<ContextLibraryStore | null>(null);

  useEffect(() => {
    const initializeContextLibraryStore = async () => {
      const adapter = makePersistedAdapter({
        storage: { type: "opfs" },
        worker: ContextLibraryLiveStoreWorker,
        sharedWorker: ContextLibraryLiveStoreSharedWorker,
      });

      try {
        const store = await createStorePromise({
          schema: contextLibrarySchema,
          adapter,
          storeId: "default",
          batchUpdates,
        });
        setContextLibraryStore(store);
      } catch (error) {
        console.error("Error initializing context library store:", error);
      }
    };

    initializeContextLibraryStore();
  }, []);

  if (!contextLibraryStore) {
    return <LoadingScreen />;
  }

  return (
    <ContextLibraryStoreContext.Provider value={contextLibraryStore}>
      {children}
    </ContextLibraryStoreContext.Provider>
  );
};
