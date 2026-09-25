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
  | "midnight";

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
    value === "midnight"
  );
}

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setThemeState] =
    useState<MaxTheme>(DEFAULT_THEME);

  useEffect(() => {
    const saved =
      window.localStorage.getItem(STORAGE_KEY);

    if (isValidTheme(saved)) {
      setThemeState(saved);
    }
  }, []);

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

    /*
     * Additional class for reliable CSS targeting.
     */
    html.classList.remove(
      "max-theme-platinum",
      "max-theme-obsidian",
      "max-theme-arctic",
      "max-theme-midnight"
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