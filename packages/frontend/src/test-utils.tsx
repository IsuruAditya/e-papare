import React from 'react';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';
import i18n, { initI18n } from './app/i18n/i18n';
import { ThemeProvider } from './app/theme/ThemeContext';
import { I18nProvider } from './app/i18n/I18nProvider';
import { AuthProvider, type Session } from './app/auth/AuthContext';
import type { Language } from './app/i18n/language-storage';

/**
 * Shared test rendering helpers. Keeps every component test on the same i18n
 * instance and lets suites opt into router + auth providers with a seeded
 * session, without each test re-wiring the provider stack.
 */

// Ensure the shared i18next instance exists for any test that renders a
// translated component (idempotent).
initI18n();

/** Synchronously set the i18n language for a test, returning when applied. */
export async function setTestLanguage(lng: Language): Promise<void> {
  await i18n.changeLanguage(lng);
}

/** Render a component wrapped only in the i18n instance (no router/auth). */
export function renderWithI18n(ui: React.ReactElement, options?: RenderOptions): RenderResult {
  return render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>, options);
}

export interface RenderWithProvidersOptions extends RenderOptions {
  /** Initial route for the MemoryRouter. */
  route?: string;
  /** Seeded auth session (default: unauthenticated). */
  session?: Session | null;
}

/**
 * Render under the full shell provider stack (Theme + I18n + Auth + Router).
 * Used by shell/route tests that need navigation and auth state.
 */
export function renderWithProviders(
  ui: React.ReactElement,
  { route = '/', session = null, ...options }: RenderWithProvidersOptions = {},
): RenderResult {
  return render(
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider initialSession={session}>
          <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>,
    options,
  );
}
