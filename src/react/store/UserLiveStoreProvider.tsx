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
import { migrateUserData } from "@/lib/migrateUserData";

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
  const [isMigrating, setIsMigrating] = useState(false);

  useEffect(() => {
    const initializeUserStore = () => {
      if (!isLoaded) return;

      let userId: string;
      let anonymousId: string | null = null;

      if (user) {
        userId = user.id;
        anonymousId = sessionStorage.getItem("anonymousUserId");
      } else {
        const existingAnonymousId = sessionStorage.getItem("anonymousUserId");
        if (existingAnonymousId) {
          userId = existingAnonymousId;
        } else {
          userId = uuidv4();
          sessionStorage.setItem("anonymousUserId", userId);
        }
      }

      const adapter = makePersistedAdapter({
        storage: { type: "opfs" },
        worker: UserLiveStoreWorker,
        sharedWorker: UserLiveStoreSharedWorker,
      });

      createStorePromise({
        schema: userSchema,
        adapter,
        storeId: userId,
        batchUpdates,
      })
        .then((store) => {
          if (anonymousId && anonymousId !== userId) {
            console.log(
              "Data migration needed from",
              anonymousId,
              "to",
              userId,
            );
            setIsMigrating(true);
            return migrateUserData(anonymousId, store)
              .then(() => {
                sessionStorage.removeItem("anonymousUserId");
                setIsMigrating(false);
                setUserStore(store);
              })
              .catch((error) => {
                console.error(
                  "Migration failed, continuing without migration:",
                  error,
                );
                setIsMigrating(false);
                setUserStore(store);
              });
          } else {
            setUserStore(store);
            return Promise.resolve();
          }
        })
        .catch((error) => {
          console.error("Error initializing user store:", error);
        });
    };

    initializeUserStore();
  }, [user, isLoaded]);

  if (!userStore || isMigrating) {
    return <LoadingScreen />;
  }
  return (
    <UserStoreContext.Provider value={userStore}>
      {children}
    </UserStoreContext.Provider>
  );
};
