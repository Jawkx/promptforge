import { useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { useUserStore } from "@/store/UserLiveStoreProvider";
import { userEvents } from "@/livestore/user-store/events";

export const useAutoCreateContextLibrary = () => {
  const { isLoaded } = useUser();
  const userStore = useUserStore();
  const initStarted = useRef(false);

  useEffect(() => {
    const createDefaultLibrary = async () => {
      // Prevent re-entry
      if (initStarted.current) return;
      if (!isLoaded) return;

      // Since users can only have one library, we always create the default library
      // The library creation logic will handle any existing library scenarios
      initStarted.current = true;
      const libraryId = "default";
      userStore.commit(userEvents.contextLibraryCreated({ libraryId }));
    };

    createDefaultLibrary();
  }, [isLoaded, userStore]);
};
