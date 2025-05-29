import { useTheme } from "@/hooks/useTheme";
import { Button } from "./ui/button";
import { LucideMoon, LucideSun } from "lucide-react";

export const ThemeToggler = () => {

  const { setTheme, theme } = useTheme();

  const handleToggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  return <Button variant="ghost" size="icon" onClick={handleToggleTheme}>
    {theme === "light" ||
      (theme === "system" &&
        !window.matchMedia("(prefers-color-scheme: dark)").matches) ? (
      <LucideSun className="text-foreground h-5 w-5" strokeWidth={2} />
    ) : (
      <LucideMoon className="text-foreground h-5 w-5" />
    )}
  </Button>
}
