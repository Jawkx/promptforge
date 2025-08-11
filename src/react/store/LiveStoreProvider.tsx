import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Store, createStorePromise } from "@livestore/livestore";
import { makePersistedAdapter } from "@livestore/adapter-web";
import { liveSchema } from "@/livestore/live-store/schema";
import { useUser } from "@clerk/clerk-react";
import { v4 as uuidv4 } from "uuid";
import { unstable_batchedUpdates as batchUpdates } from "react-dom";
import LiveStoreWorker from "@/livestore/live.worker.ts?worker";
import LiveStoreSharedWorker from '@livestore/adapter-web/shared-worker?sharedworker'
import { LoadingScreen } from "@/components/LoadingScreen";

type LiveStore = Store<typeof liveSchema>;

const LiveStoreContext = createContext<LiveStore | null>(null);

export const useLiveStore = (): LiveStore => {
  const context = useContext(LiveStoreContext);
  if (!context) {
    throw new Error("useLiveStore must be used within a LiveStoreProvider");
  }
  return context;
};

export const LiveStoreProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoaded } = useUser();
  const [liveStore, setLiveStore] = useState<LiveStore | null>(null);

  useEffect(() => {
    const initializeLiveStore = async () => {
      if (!isLoaded) return;

      let storeId: string;
      if (user) {
        storeId = `store-${user.id}`;
      } else {
        const existingAnonymousId = sessionStorage.getItem("anonymousStoreId");
        if (existingAnonymousId) {
          storeId = `store-${existingAnonymousId}`;
        } else {
          const newAnonymousId = uuidv4();
          storeId = `store-${newAnonymousId}`;
          sessionStorage.setItem("anonymousStoreId", newAnonymousId);
        }
      }

      console.log({ storeId });

      const adapter = makePersistedAdapter({
        storage: { type: "opfs" },
        worker: LiveStoreWorker,
        sharedWorker: LiveStoreSharedWorker,
      });

      try {
        const store = await createStorePromise({
          schema: liveSchema,
          adapter,
          storeId,
          batchUpdates,
        });

        setLiveStore(store);
      } catch (error) {
        console.error("Error initializing live store:", error);
      }
    };

    initializeLiveStore();
  }, [user, isLoaded]);

  if (!liveStore) {
    return <LoadingScreen />;
  }

  return (
    <LiveStoreContext.Provider value={liveStore}>
      {children}
    </LiveStoreContext.Provider>
  );
};
