import { useTheme } from "@/hooks/useTheme";
import { Button } from "./ui/button"; // Assuming this is your button component
import { LucideMoon, LucideSun } from "lucide-react";
import { useState, useEffect } from "react";

export const ThemeToggler = () => {
  const { setTheme, theme } = useTheme();
  // Fallback to 'light' if theme is initially undefined or 'system' for SSR or non-browser environments
  const [currentIcon, setCurrentIcon] = useState(
    typeof window !== "undefined" &&
      theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "moon"
      : theme === "dark"
        ? "moon"
        : "sun"
  );

  useEffect(() => {
    // Update icon based on theme changes, including system preference
    const newIcon =
      typeof window !== "undefined" &&
        theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "moon"
        : theme === "dark"
          ? "moon"
          : "sun";
    setCurrentIcon(newIcon);
  }, [theme]);

  const handleToggleTheme = () => {
    const newTheme =
      currentIcon === "sun"
        ? "dark"
        : currentIcon === "moon" && theme === "dark" // if current is moon and actual theme is dark
          ? "light"
          : theme === "system" && // if current is moon due to system dark
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "light" // switch to light
            : "dark"; // default to dark if current is sun due to system light

    setTheme(newTheme);
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleToggleTheme} aria-label="Toggle theme" className="text-3xl">
      <div className="relative h-5 w-5">
        <LucideSun
          className={`absolute top-0 left-0 text-foreground h-5 w-5 transform transition-all duration-500 ease-in-out ${currentIcon === "sun"
            ? "rotate-0 scale-100 opacity-100"
            : "rotate-90 scale-0 opacity-0"
            }`}
          strokeWidth={2}
        />
        <LucideMoon
          className={`absolute top-0 left-0 text-foreground h-5 w-5 transform transition-all duration-500 ease-in-out ${currentIcon === "moon"
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-90 scale-0 opacity-0"
            }`}
          strokeWidth={2}
        />
      </div>
    </Button>
  );
};
