"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type MaxTheme =
  | "platinum"
  | "obsidian"
  | "arctic"
  | "midnight"
  | "emerald"
  | "amethyst";

type ThemeContextValue = {
  theme: MaxTheme;
  setTheme: (theme: MaxTheme) => void;
};

const ThemeContext =
  createContext<ThemeContextValue | undefined>(
    undefined
  );

const STORAGE_KEY = "max-erp-theme";

const DEFAULT_THEME: MaxTheme = "platinum";

function isValidTheme(
  value: string | null
): value is MaxTheme {
  return (
    value === "platinum" ||
    value === "obsidian" ||
    value === "arctic" ||
    value === "midnight" ||
    value === "emerald" ||
    value === "amethyst"
  );
}

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setThemeState] = useState<MaxTheme>(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (isValidTheme(saved)) {
        return saved;
      }
    }
    return DEFAULT_THEME;
  });

  useEffect(() => {
    const html =
      document.documentElement;

    /*
     * Main theme identifier.
     */
    html.setAttribute(
      "data-max-theme",
      theme
    );
    html.setAttribute(
      "data-theme",
      theme
    );

    /*
     * Synchronize Tailwind "dark" class & color-scheme
     */
    const isDark =
      theme === "obsidian" ||
      theme === "midnight" ||
      theme === "emerald" ||
      theme === "amethyst";

    if (isDark) {
      html.classList.add("dark");
      html.style.colorScheme = "dark";
    } else {
      html.classList.remove("dark");
      html.style.colorScheme = "light";
    }

    /*
     * Additional class for reliable CSS targeting.
     */
    html.classList.remove(
      "max-theme-platinum",
      "max-theme-obsidian",
      "max-theme-arctic",
      "max-theme-midnight",
      "max-theme-emerald",
      "max-theme-amethyst"
    );

    html.classList.add(
      `max-theme-${theme}`
    );

    /*
     * Persist selection.
     */
    window.localStorage.setItem(
      STORAGE_KEY,
      theme
    );
  }, [theme]);

  function setTheme(nextTheme: MaxTheme) {
    setThemeState(nextTheme);
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useMaxTheme() {
  const context =
    useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useMaxTheme must be used inside ThemeProvider"
    );
  }

  return context;
}