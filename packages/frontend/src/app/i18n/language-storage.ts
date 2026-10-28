/**
 * Language persistence + resolution helpers (AD-6, AD-7).
 *
 * Pure functions, no React. The full resolution order per AD-6 is
 * `user.preferred_language` (DB) → `localStorage('epapere_lang')` → Super-Admin
 * default → `en`. The DB and Super-Admin layers are Epic 2+; this story wires the
 * localStorage-first + `en`-fallback layers.
 */

export type Language = 'en' | 'si';

/** Supported UI languages — English and Sinhala (si-LK) are both mandatory. */
export const SUPPORTED_LANGUAGES: readonly Language[] = ['en', 'si'] as const;

/** Default/fallback language (AD-6 final fallback). */
export const DEFAULT_LANGUAGE: Language = 'en';

/** localStorage key — matches AD-6 (`localStorage('epapere_lang')`). */
export const LANGUAGE_STORAGE_KEY = 'epapere_lang';

export function isSupportedLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

/** Read the stored language, or `null` when absent/corrupt/unavailable. */
export function readStoredLanguage(): Language | null {
  try {
    const raw = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isSupportedLanguage(raw) ? raw : null;
  } catch {
    return null;
  }
}

/** Persist the chosen language. Silent no-op when storage is unavailable. */
export function writeStoredLanguage(language: Language): void {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Non-fatal: the in-memory i18next language is still correct for this session.
  }
}

/** Stored preference → default (`en`). */
export function resolveInitialLanguage(): Language {
  return readStoredLanguage() ?? DEFAULT_LANGUAGE;
}

/** Reflect the language onto `<html lang>` for screen readers / SEO (AD-6, a11y floor). */
export function applyDocumentLanguage(language: Language): void {
  document.documentElement.setAttribute('lang', language);
}
