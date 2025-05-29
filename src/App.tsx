import { LucideMoon, LucideSun } from "lucide-react";
import PromptEditor from "./components/PromptEditor";
import { Button } from "./components/ui/button";
import { useTheme } from "./hooks/useTheme";
import { Toaster } from "./components/ui/toaster";
import { useToast } from "./hooks/use-toast";

function App() {
  // Remove the old handleCopy and use the one from PromptEditor + useToast
  const { toast } = useToast(); // Get toast function

  const handleCopySuccess = () => {
    // The toast notification is now handled within copyPromptWithContexts hook
    // but if you need an additional app-level notification, you can add it here.
    // For now, we assume the hook's toast is sufficient.
  };

  const { setTheme, theme } = useTheme();

  const handleToggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="py-5 px-5">
        <div className="flex flex-row justify-between mx-auto max-w-7xl items-center">
          <h1 className="text-2xl text-primary font-semibold">Prompt Forge</h1>
          <Button variant="ghost" size="icon" onClick={handleToggleTheme}>
            {theme === "light" ||
            (theme === "system" &&
              !window.matchMedia("(prefers-color-scheme: dark)").matches) ? (
              <LucideSun className="text-foreground h-5 w-5" strokeWidth={2} />
            ) : (
              <LucideMoon className="text-foreground h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
      <PromptEditor onCopySuccess={handleCopySuccess} />
      <Toaster />
    </div>
  );
}

export default App;
