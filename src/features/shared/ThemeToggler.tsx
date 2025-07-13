import { Button } from "@/components/ui/button";
import { LucideMoon, LucideSun } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@livestore/react";
import { preference$ } from "@/livestore/user-store/queries";
import { userEvents } from "@/livestore/user-store/events";
import { useLiveStores } from "@/store/LiveStoreProvider";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Auth } from "./Auth";

export const ThemeToggler = () => {
  const { userStore } = useLiveStores();
  const preference = useQuery(preference$, { store: userStore });
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const theme = preference.theme ?? "dark";

  const [currentIcon, setCurrentIcon] = useState(
    theme === "dark" ? "moon" : "sun",
  );

  useEffect(() => {
    const newIcon = theme === "dark" ? "moon" : "sun";
    setCurrentIcon(newIcon);

    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  const handleToggleTheme = () => {
    userStore.commit(
      userEvents.preferenceStateSet({
        theme: theme === "dark" ? "light" : "dark",
      }),
    );
  };

  return (
    <div className="flex items-center gap-2">
      <SignedOut>
        <Button variant="outline" onClick={() => setIsAuthOpen(true)}>
          Sign In
        </Button>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>

      <Button
        variant="outline"
        size="icon"
        onClick={handleToggleTheme}
        aria-label="Toggle theme"
      >
        <div className="relative w-6 h-6">
          <LucideSun
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-foreground transform transition-all duration-500 ease-in-out ${
              currentIcon === "sun"
                ? "rotate-0 scale-100 opacity-100"
                : "rotate-90 scale-0 opacity-0"
            }`}
          />
          <LucideMoon
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-foreground transform transition-all duration-500 ease-in-out ${
              currentIcon === "moon"
                ? "rotate-0 scale-100 opacity-100"
                : "-rotate-90 scale-0 opacity-0"
            }`}
          />
        </div>
      </Button>

      <Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </div>
  );
};
