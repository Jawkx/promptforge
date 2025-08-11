import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Store, createStorePromise } from "@livestore/livestore";
import { makePersistedAdapter } from "@livestore/adapter-web";
import { userSchema } from "@/livestore/user-store/schema";
import { useUser } from "@clerk/clerk-react";
import { v4 as uuidv4 } from "uuid";
import { unstable_batchedUpdates as batchUpdates } from "react-dom";
import UserLiveStoreWorker from "@/livestore/user.worker.ts?worker";
import UserLiveStoreSharedWorker from "@livestore/adapter-web/shared-worker?sharedworker&name=userSharedWorker";
import { LoadingScreen } from "@/components/LoadingScreen";

type UserStore = Store<typeof userSchema>;

const UserStoreContext = createContext<UserStore | null>(null);

export const useUserStore = (): UserStore => {
  const context = useContext(UserStoreContext);
  if (!context) {
    throw new Error("useUserStore must be used within a UserLiveStoreProvider");
  }
  return context;
};

export const UserLiveStoreProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { user, isLoaded } = useUser();
  const [userStore, setUserStore] = useState<UserStore | null>(null);

  useEffect(() => {
    const initializeUserStore = async () => {
      if (!isLoaded) return;

      let storeId: string;

      if (user) {
        storeId = `user-${user.id}`;
      } else {
        const existingAnonymousId = sessionStorage.getItem("anonymousUserId");
        if (existingAnonymousId) {
          storeId = existingAnonymousId;
        } else {
          storeId = uuidv4();
          sessionStorage.setItem("anonymousUserId", storeId);
        }
      }

      console.log({ userStoreId: storeId })
      const adapter = makePersistedAdapter({
        storage: { type: "opfs" },
        worker: UserLiveStoreWorker,
        sharedWorker: UserLiveStoreSharedWorker,
      });

      try {
        const store = await createStorePromise({
          schema: userSchema,
          adapter,
          storeId: storeId,
          batchUpdates,
        });

        setUserStore(store);
      } catch (error) {
        console.error("Error initializing user store:", error);
      }
    };

    initializeUserStore();
  }, [user, isLoaded]);

  if (!userStore) {
    return <LoadingScreen />;
  }
  return (
    <UserStoreContext.Provider value={userStore}>
      {children}
    </UserStoreContext.Provider>
  );
};
