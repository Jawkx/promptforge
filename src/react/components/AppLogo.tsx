import { preferences$ } from "@/livestore/live-store/queries";
import { useLiveStore } from "@/store/LiveStoreProvider";
import { useQuery } from "@livestore/react";

export const AppLogo = () => {
  const liveStore = useLiveStore();

  const preferences = useQuery(preferences$, { store: liveStore });

  const theme = preferences?.[0]?.theme ?? "dark";

  return (
    <div className="flex items-center justify-center">
      <img
        src={
          theme === "dark"
            ? "/android-chrome-512x512.png"
            : "/android-chrome-512x512-light.png"
        }
        alt="Prompt Forge"
        className="h-12 w-12 mr-2"
      />
      <h1 className="text-3xl font-semibold">Prompt Forge</h1>
    </div>
  );
};
