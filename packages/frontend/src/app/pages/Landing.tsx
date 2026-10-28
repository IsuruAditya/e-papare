import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SkipLink } from '../../components/ui/SkipLink';
import { LanguageSwitcher } from '../layout/LanguageSwitcher';
import { ThemeToggle } from '../layout/ThemeToggle';

/**
 * Landing / Login surface (`/`) — public entry point.
 *
 * Story 1.7 ships the shell, not the login form (Epic 2). This placeholder shows
 * the brand, the language switcher + theme toggle (available pre-login per
 * EXPERIENCE.md), and — when a `ProtectedRoute` redirect sent the user here — a
 * notice echoing the `returnUrl` they were trying to reach.
 */
export function Landing(): React.JSX.Element {
  const { t } = useTranslation('common');
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <SkipLink>{t('skipLink')}</SkipLink>
      <header className="flex items-center justify-between gap-4 border-b border-border bg-surface px-4 py-3 sm:px-6">
        <span className="text-lg font-bold text-brand">{t('app.name')}</span>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      <main
        id="main-content"
        className="mx-auto flex w-full max-w-[600px] flex-1 flex-col items-center justify-center gap-4 px-4 py-10 text-center"
      >
        <h1 className="text-2xl font-bold text-text">{t('landing.title')}</h1>
        <p className="text-md text-text-muted">{t('landing.subtitle')}</p>

        {returnUrl !== null && returnUrl !== '' && (
          <p
            role="status"
            className="rounded-lg border border-border bg-surface px-4 py-3 text-base text-text-muted"
            data-testid="return-notice"
            data-return-url={returnUrl}
          >
            {t('landing.returnNotice', { path: returnUrl })}
          </p>
        )}

        <p className="text-base text-text-muted">{t('landing.signInPlaceholder')}</p>
      </main>
    </div>
  );
}
