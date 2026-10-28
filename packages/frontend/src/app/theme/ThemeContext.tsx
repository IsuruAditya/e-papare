import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  applyThemeClass,
  resolveInitialTheme,
  writeStoredTheme,
  type Theme,
} from './theme-storage';

/**
 * ThemeContext — app-wide UI state for light/dark mode (AD-9, AD-18).
 *
 * Owns the single source of truth for the current theme, toggles the `html.dark`
 * class, and persists the choice to `localStorage('epapere_theme')`. Theme is UI
 * state (not server state), so it lives in React context, not TanStack Query.
 *
 * A pre-paint inline script in `index.html` applies the correct class BEFORE
 * React mounts (FOUC guard); this provider then takes over and keeps class +
 * storage in sync with user toggles.
 */

export interface ThemeContextValue {
  theme: Theme;
  /** Flip between light and dark. */
  toggleTheme: () => void;
  /** Set an explicit theme. */
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  children: React.ReactNode;
  /** Test seam: force an initial theme instead of reading storage/OS. */
  initialTheme?: Theme;
}

export function ThemeProvider({ children, initialTheme }: ThemeProviderProps): React.JSX.Element {
  // Lazy initializer resolves stored → system → light exactly once on mount,
  // and reflects it onto <html> immediately so state and DOM never diverge.
  const [theme, setThemeState] = useState<Theme>(() => {
    const resolved = initialTheme ?? resolveInitialTheme();
    applyThemeClass(resolved);
    return resolved;
  });

  const setTheme = useCallback((next: Theme) => {
    applyThemeClass(next);
    writeStoredTheme(next);
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark';
      applyThemeClass(next);
      writeStoredTheme(next);
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, toggleTheme, setTheme }),
    [theme, toggleTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Access the theme state. Throws outside a `ThemeProvider` (fail fast). */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx === null) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
