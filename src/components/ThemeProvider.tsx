import { createContext, useEffect } from "react";
import { useStore } from "@livestore/react"
import { tables } from "@/livestore/schema";

type Theme = "dark" | "light";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "dark",
  setTheme: () => null,
};

export const ThemeProviderContext =
  createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  const { store } = useStore()

  const [preferences, updatePreferences] = store.useClientDocument(tables.preferences)

  const theme = preferences.theme

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      updatePreferences({ theme })
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}
