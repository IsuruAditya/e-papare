import i18n, { type i18n as I18nInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LANGUAGE, resolveInitialLanguage } from './language-storage';

import enCommon from '../../locales/en/common.json';
import siCommon from '../../locales/si/common.json';
import enStatus from '../../locales/en/status.json';
import siStatus from '../../locales/si/status.json';
import enDashboard from '../../locales/en/dashboard.json';
import siDashboard from '../../locales/si/dashboard.json';

/**
 * i18next instance (AD-6, AD-7).
 *
 * Resources are bundled at build time (small, two languages, two namespaces) so
 * there is no async backend and no Suspense boundary. Feature epics add their
 * namespaces (`auth`, `payment`, …) the same way. Key convention per AD-7 is
 * `namespace:section.identifier`; missing keys fall back to `en` and never show
 * a raw key (`returnNull: false`).
 */

/**
 * The `dashboard` namespace is DEV-ONLY: it holds the strings for the Student
 * Dashboard UI/UX preview (`/preview/student`), which never ships to production
 * (see `routes.tsx`). Gating it on `import.meta.env.DEV` means Vite tree-shakes
 * both the namespace registration AND the imported JSON out of production
 * builds, so no preview copy leaks into the shipped bundle. `validate-i18n`
 * still checks the on-disk locale files, so en/si parity remains enforced.
 */
const DEV_NAMESPACES = import.meta.env.DEV ? (['dashboard'] as const) : ([] as const);

export const NAMESPACES = ['common', 'status', ...DEV_NAMESPACES] as const;
export const DEFAULT_NAMESPACE = 'common';

const devResources = import.meta.env.DEV
  ? { en: { dashboard: enDashboard }, si: { dashboard: siDashboard } }
  : { en: {}, si: {} };

export const resources = {
  en: { common: enCommon, status: enStatus, ...devResources.en },
  si: { common: siCommon, status: siStatus, ...devResources.si },
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
