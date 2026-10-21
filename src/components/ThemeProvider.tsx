"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";
export type SidebarLayoutOption = "always-visible" | "auto-hide" | "icons-only";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  sidebarLayout: SidebarLayoutOption;
  setSidebarLayout: (layout: SidebarLayoutOption) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("system");
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [sidebarLayout, setSidebarLayout] = useState<SidebarLayoutOption>("always-visible");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }

    const savedContrast = localStorage.getItem("highContrast");
    if (savedContrast !== null) {
      setHighContrast(savedContrast === "true");
    }

    const savedSidebar = localStorage.getItem("sidebarLayout") as SidebarLayoutOption | null;
    if (savedSidebar) {
      setSidebarLayout(savedSidebar);
    }
  }, []);

  // Sync theme class
  useEffect(() => {
    if (!mounted) return;
    
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    localStorage.setItem("theme", theme);

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme, mounted]);

  // Sync high contrast class
  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;
    if (highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }
    localStorage.setItem("highContrast", String(highContrast));
  }, [highContrast, mounted]);

  // Sync sidebar layout
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("sidebarLayout", sidebarLayout);
  }, [sidebarLayout, mounted]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        highContrast,
        setHighContrast,
        sidebarLayout,
        setSidebarLayout,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
