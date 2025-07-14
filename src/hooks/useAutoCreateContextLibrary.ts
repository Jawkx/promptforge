import { useEffect, useRef } from "react";
import { useQuery } from "@livestore/react";
import { useUser } from "@clerk/clerk-react";
import { useLiveStores } from "@/store/LiveStoreProvider";
import { userContextLibraries$ } from "@/livestore/user-store/queries";
import { userEvents } from "@/livestore/user-store/events";

export const useAutoCreateContextLibrary = () => {
  const { isLoaded } = useUser();
  const { userStore } = useLiveStores();
  const userContextLibraries = useQuery(userContextLibraries$, {
    store: userStore,
  });
  const initStarted = useRef(false);

  useEffect(() => {
    const createDefaultLibrary = async () => {
      // Prevent re-entry
      if (initStarted.current) return;
      if (!isLoaded) return;

      if (userContextLibraries.length === 0) {
        initStarted.current = true;
        const libraryId = "default";
        userStore.commit(userEvents.contextLibraryCreated({ libraryId }));
      }
    };

    createDefaultLibrary();
  }, [isLoaded, userContextLibraries.length, userStore]);
};
