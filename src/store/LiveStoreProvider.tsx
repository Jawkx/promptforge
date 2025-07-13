import { Store, createStorePromise } from "@livestore/livestore";
import { makePersistedAdapter } from "@livestore/adapter-web";
import { userSchema } from "@/livestore/user-store/schema";
import { contextLibrarySchema } from "@/livestore/context-library-store/schema";
import { useUser } from "@clerk/clerk-react";
import { v4 as uuidv4 } from "uuid";
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

export const useLiveStores = (): AppStores => {
  const context = useContext(AppStoresContext);
  if (!context) {
    throw new Error("useLiveStores must be used within an AppStoresProvider");
  }
  return context;
};

export const LiveStoresProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoaded } = useUser();
  const [stores, setStores] = useState<AppStores | null>(null);

  useEffect(() => {
    const initializeStores = async () => {
      if (!isLoaded) return;

      let userId: string;

      if (user) {
        userId = user.id;

        const anonymousId = sessionStorage.getItem("anonymousUserId");
        if (anonymousId && anonymousId !== userId) {
          console.log("Data migration needed from", anonymousId, "to", userId);
          sessionStorage.removeItem("anonymousUserId");
        }
      } else {
        const existingAnonymousId = sessionStorage.getItem("anonymousUserId");
        if (existingAnonymousId) {
          userId = existingAnonymousId;
        } else {
          userId = uuidv4();
          sessionStorage.setItem("anonymousUserId", userId);
        }
      }

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

      try {
        const [userStore, contextLibraryStore] = await Promise.all([
          createStorePromise({
            schema: userSchema,
            adapter: userAdapter,
            storeId: userId,
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
      } catch (error) {
        console.error("Error initializing stores:", error);
      }
    };

    initializeStores();
  }, [user, isLoaded]);

  if (!stores) {
    return <LoadingScreen />;
  }

  return (
    <AppStoresContext.Provider value={stores}>
      {children}
    </AppStoresContext.Provider>
  );
};
