import { Store, createStorePromise } from "@livestore/livestore";
import { makePersistedAdapter } from "@livestore/adapter-web";
import { userSchema } from "@/livestore/user-store/schema";
import { contextLibrarySchema } from "@/livestore/context-library-store/schema";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signInAnonymously, User } from "firebase/auth";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { unstable_batchedUpdates as batchUpdates } from "react-dom";

import UserLiveStoreWorker from "@/livestore/user.worker.ts?worker";
import ContextLibraryLiveStoreWorker from "@/livestore/context-library.worker.ts?worker";

// Give unique names to shared workers to ensure they don't conflict
import UserLiveStoreSharedWorker from "@livestore/adapter-web/shared-worker?sharedworker&name=userSharedWorker";
import ContextLibraryLiveStoreSharedWorker from "@livestore/adapter-web/shared-worker?sharedworker&name=contextLibrarySharedWorker";

import { LoadingScreen } from "@/components/LoadingScreen";

type AppStores = {
  userStore: Store<typeof userSchema>;
  contextLibraryStore: Store<typeof contextLibrarySchema>;
};

const AppStoresContext = createContext<AppStores | null>(null);

export const useAppStores = (): AppStores => {
  const context = useContext(AppStoresContext);
  if (!context) {
    throw new Error("useAppStores must be used within an AppStoresProvider");
  }
  return context;
};

export const AppStoresProvider = ({ children }: { children: ReactNode }) => {
  const [stores, setStores] = useState<AppStores | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        // Adapters for each store
        const userAdapter = makePersistedAdapter({
          storage: { type: "opfs" },
          worker: UserLiveStoreWorker,
          sharedWorker: UserLiveStoreSharedWorker,
        });
        const contextLibraryAdapter = makePersistedAdapter({
          storage: { type: "opfs" },
          worker: ContextLibraryLiveStoreWorker,
          sharedWorker: ContextLibraryLiveStoreSharedWorker,
        });

        // Create both stores in parallel
        const [userStore, contextLibraryStore] = await Promise.all([
          createStorePromise({
            schema: userSchema,
            adapter: userAdapter,
            storeId: user.uid,
            batchUpdates,
          }),
          createStorePromise({
            schema: contextLibrarySchema,
            adapter: contextLibraryAdapter,
            storeId: "default",
            batchUpdates,
          }),
        ]);

        setStores({ userStore, contextLibraryStore });
      } else {
        signInAnonymously(auth).catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.error(`Firebase auth error: ${errorCode}`, errorMessage);
        });
      }
    });

    return () => unsubscribe();
  }, []);

  if (!stores) {
    return <LoadingScreen />;
  }

  return (
    <AppStoresContext.Provider value={stores}>
      {children}
    </AppStoresContext.Provider>
  );
};
