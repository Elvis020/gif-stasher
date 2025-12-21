"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: (event?: React.MouseEvent) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper to apply theme to DOM
function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  // On mount, read from localStorage and apply immediately
  useEffect(() => {
    const stored = localStorage.getItem("gif-stash-theme");
    const initialTheme: Theme = stored === "dark" ? "dark" : "light";
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  // When theme changes, apply to DOM and save
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("gif-stash-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback((event?: React.MouseEvent) => {
    const newTheme = theme === "light" ? "dark" : "light";

    // Skip fancy animation on mobile for performance
    const isMobile = window.innerWidth < 768;

    // Use View Transitions API if available and not on mobile
    if (document.startViewTransition && !isMobile) {
      // Get click coordinates for circular reveal
      const x = event?.clientX ?? window.innerWidth / 2;
      const y = event?.clientY ?? 0;

      // Calculate the maximum radius needed to cover the entire screen
      const maxRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      // Set CSS custom properties for the animation origin
      document.documentElement.style.setProperty("--theme-toggle-x", `${x}px`);
      document.documentElement.style.setProperty("--theme-toggle-y", `${y}px`);
      document.documentElement.style.setProperty("--theme-toggle-radius", `${maxRadius}px`);

      const transition = document.startViewTransition(() => {
        setTheme(newTheme);
        applyTheme(newTheme);
        localStorage.setItem("gif-stash-theme", newTheme);
      });

      // Add class during transition for additional effects
      transition.ready.then(() => {
        document.documentElement.classList.add("theme-transitioning");
      });

      transition.finished.then(() => {
        document.documentElement.classList.remove("theme-transitioning");
      });
    } else {
      // Simple instant switch on mobile
      setTheme(newTheme);
      applyTheme(newTheme);
      localStorage.setItem("gif-stash-theme", newTheme);
    }
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
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
