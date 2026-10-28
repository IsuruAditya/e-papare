import i18n, { type i18n as I18nInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LANGUAGE, resolveInitialLanguage } from './language-storage';

import enCommon from '../../locales/en/common.json';
import siCommon from '../../locales/si/common.json';
import enStatus from '../../locales/en/status.json';
import siStatus from '../../locales/si/status.json';

/**
 * i18next instance (AD-6, AD-7).
 *
 * Resources are bundled at build time (small, two languages, two namespaces) so
 * there is no async backend and no Suspense boundary. Feature epics add their
 * namespaces (`auth`, `payment`, …) the same way. Key convention per AD-7 is
 * `namespace:section.identifier`; missing keys fall back to `en` and never show
 * a raw key (`returnNull: false`).
 */

export const NAMESPACES = ['common', 'status'] as const;
export const DEFAULT_NAMESPACE = 'common';

export const resources = {
  en: { common: enCommon, status: enStatus },
  si: { common: siCommon, status: siStatus },
} as const;

let initialized = false;

/** Initialize the shared i18next instance exactly once (idempotent for tests). */
export function initI18n(): I18nInstance {
  if (!initialized) {
    void i18n.use(initReactI18next).init({
      resources,
      lng: resolveInitialLanguage(),
      fallbackLng: DEFAULT_LANGUAGE,
      ns: [...NAMESPACES],
      defaultNS: DEFAULT_NAMESPACE,
      // A missing key renders the fallback-language value, never an empty string
      // or the raw key (AD-7).
      returnNull: false,
      returnEmptyString: false,
      interpolation: {
        // React already escapes rendered output, so i18next must not double-escape.
        escapeValue: false,
      },
    });
    initialized = true;
  }
  return i18n;
}

export default i18n;
