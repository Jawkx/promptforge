import { useTheme } from "@/hooks/useTheme";
import { Button } from "./ui/button"; // Ensure this path is correct
import { LucideMoon, LucideSun } from "lucide-react";
import { useState, useEffect } from "react";

export const ThemeToggler = () => {
  const { setTheme, theme } = useTheme();
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
        : currentIcon === "moon" && theme === "dark"
          ? "light"
          : theme === "system" &&
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
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
    // The className="flex items-center justify-center" here is redundant
    // as buttonVariants already provides these for the button itself.
    // It doesn't harm, but isn't the fix.
    >
      <div className="relative w-6 h-6">
        {" "}
        {/* This div is centered by the Button */}
        <LucideSun
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-foreground transform transition-all duration-500 ease-in-out ${ // Applied centering
            currentIcon === "sun"
              ? "rotate-0 scale-100 opacity-100"
              : "rotate-90 scale-0 opacity-0"
            }`}
        // The [&_svg]:size-4 from Button variant will still apply, making the icon size-4 (1rem)
        />
        <LucideMoon
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-foreground transform transition-all duration-500 ease-in-out ${ // Applied centering
            currentIcon === "moon"
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0"
            }`}
        // The [&_svg]:size-4 from Button variant will still apply
        />
      </div>
    </Button>
  );
};
