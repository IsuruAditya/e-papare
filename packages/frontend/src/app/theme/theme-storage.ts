/**
 * Theme persistence + resolution helpers (AD-9).
 *
 * Pure functions, no React — unit-testable in isolation and reused by both the
 * React `ThemeProvider` and the pre-paint guard in `index.html` (which inlines
 * the same precedence by hand, since it runs before any module loads).
 *
 * Precedence for a NEW user (no stored preference): system `prefers-color-scheme`
 * then Light. A returning user's explicit choice in `localStorage` always wins.
 */

export type Theme = 'light' | 'dark';

/** localStorage key — matches DESIGN.md / AD-9 (`localStorage('epapere_theme')`). */
export const THEME_STORAGE_KEY = 'epapere_theme';

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

/** Read the stored theme, or `null` when absent/corrupt/unavailable. */
export function readStoredTheme(): Theme | null {
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(raw) ? raw : null;
  } catch {
    // Private-mode / disabled storage: treat as "no preference".
    return null;
  }
}

/** Persist the chosen theme. Silent no-op when storage is unavailable. */
export function writeStoredTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Non-fatal: the in-memory theme state is still correct for this session.
  }
}

/** `true` when the OS/browser currently prefers a dark color scheme. */
export function prefersDark(): boolean {
  return typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : false;
}

/** Stored preference → system preference → light. */
export function resolveInitialTheme(): Theme {
  return readStoredTheme() ?? (prefersDark() ? 'dark' : 'light');
}

/**
 * Reflect the theme onto the document root. ThemeContext owns the `html.dark`
 * class (AD-9); Tailwind v4's `dark` variant keys off it (AD-46).
 */
export function applyThemeClass(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}
