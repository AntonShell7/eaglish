import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ThemeMode = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "themeMode";

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readStoredMode(): ThemeMode {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    mode === "system" ? getSystemTheme() : mode,
  );

  useEffect(() => {
    const applied = mode === "system" ? getSystemTheme() : mode;
    setResolvedTheme(applied);
    document.documentElement.setAttribute("data-theme", applied);
  }, [mode]);

  useEffect(() => {
    if (mode !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const applied = getSystemTheme();
      setResolvedTheme(applied);
      document.documentElement.setAttribute("data-theme", applied);
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [mode]);

  const setMode = (next: ThemeMode) => {
    localStorage.setItem(STORAGE_KEY, next);
    setModeState(next);
  };

  return (
    <ThemeContext.Provider value={{ mode, resolvedTheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
