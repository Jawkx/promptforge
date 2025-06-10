import { useTheme } from "@/hooks/useTheme";
import { Button } from "./ui/button"; // Ensure this path is correct
import { LucideMoon, LucideSun } from "lucide-react";
import { useState, useEffect } from "react";

export const ThemeToggler = () => {
  const { setTheme, theme } = useTheme();
  const [currentIcon, setCurrentIcon] = useState(
    theme === "dark"
      ? "moon"
      : "sun"
  );

  useEffect(() => {
    const newIcon =
      theme === "dark"
        ? "moon"
        : "sun";
    setCurrentIcon(newIcon);
  }, [theme]);

  const handleToggleTheme = () => {
    const newTheme =
      currentIcon === "sun"
        ? "dark"
        : currentIcon === "moon" && theme === "dark"
          ? "light"
          : "dark";
    setTheme(newTheme);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggleTheme}
      aria-label="Toggle theme"
    >
      <div className="relative w-6 h-6">
        <LucideSun
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-foreground transform transition-all duration-500 ease-in-out ${currentIcon === "sun"
              ? "rotate-0 scale-100 opacity-100"
              : "rotate-90 scale-0 opacity-0"
            }`}
        />
        <LucideMoon
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-foreground transform transition-all duration-500 ease-in-out ${currentIcon === "moon"
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0"
            }`}
        />
      </div>
    </Button>
  );
};
