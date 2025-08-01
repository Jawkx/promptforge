import { preference$ } from "@/livestore/user-store/queries";
import { useUserStore } from "@/store/UserLiveStoreProvider";
import { useQuery } from "@livestore/react";

export const AppLogo = () => {
  const userStore = useUserStore();

  const preference = useQuery(preference$, { store: userStore });

  const theme = preference?.theme ?? "dark";

  return (
    <div className="flex items-center justify-center">
      <img
        src={theme === "dark" ? "/android-chrome-512x512.png" : "/android-chrome-512x512-light.png"}
        alt="Prompt Forge"
        className="h-12 w-12 mr-2"
      />
      <h1 className="text-3xl font-semibold">Prompt Forge</h1>
    </div>
  );
};
