import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n, { initI18n } from './i18n';
import {
  applyDocumentLanguage,
  isSupportedLanguage,
  resolveInitialLanguage,
  writeStoredLanguage,
  type Language,
} from './language-storage';

/**
 * I18nProvider — wraps react-i18next and exposes the current UI language plus a
 * `setLanguage` action (AD-6, AD-18). Language is UI state, so it lives in
 * context alongside theme.
 *
 * Critically (Story 1.7 AC-2): switching language re-renders strings via
 * react-i18next WITHOUT remounting the tree, so open-form values survive. This
 * provider never keys children on language and never reloads the page. It syncs
 * `<html lang>` and `localStorage('epapere_lang')` on every language change,
 * including changes triggered directly via `i18n.changeLanguage(...)`.
 */

export interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

// Ensure the instance exists before the provider mounts (idempotent).
initI18n();

export interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps): React.JSX.Element {
  const [language, setLanguageState] = useState<Language>(() => {
    const initial = resolveInitialLanguage();
    applyDocumentLanguage(initial);
    // Keep the i18next instance in step with the resolved initial language. The
    // instance is initialized with this value at startup, but re-aligning here
    // guards against a stale language on re-mount (e.g. across test cases that
    // share the module-scoped instance).
    if (i18n.language !== initial) {
      void i18n.changeLanguage(initial);
    }
    return initial;
  });

  // Single source of truth for side effects: subscribe to i18next's own event so
  // that BOTH our `setLanguage` and a direct `i18n.changeLanguage()` call (the
  // AC-2 trigger) keep `<html lang>` + storage + context in sync.
  useEffect(() => {
    function handleLanguageChanged(lng: string): void {
      if (!isSupportedLanguage(lng)) return;
      applyDocumentLanguage(lng);
      writeStoredLanguage(lng);
      setLanguageState(lng);
    }
    i18n.on('languageChanged', handleLanguageChanged);
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, []);

  const setLanguage = useCallback((next: Language) => {
    // Fire-and-forget: the `languageChanged` listener performs the sync. The
    // promise only matters for lazy backends, which we do not use.
    void i18n.changeLanguage(next);
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage }),
    [language, setLanguage],
  );

  return (
    <I18nextProvider i18n={i18n}>
      <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
    </I18nextProvider>
  );
}

/** Access the current UI language + setter. Throws outside an `I18nProvider`. */
export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (ctx === null) {
    throw new Error('useLanguage must be used within an I18nProvider');
  }
  return ctx;
}
