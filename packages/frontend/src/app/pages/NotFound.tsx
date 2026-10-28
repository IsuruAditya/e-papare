import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * 404 surface (`*`). EXPERIENCE.md: "Page not found" with a link to a safe
 * destination. The shell may render this both inside and outside an
 * authenticated layout, so it links to the public home.
 */
export function NotFound(): React.JSX.Element {
  const { t } = useTranslation('common');

  return (
    <div className="mx-auto flex min-h-screen max-w-[600px] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 tabIndex={-1} className="text-2xl font-bold text-text">
        {t('notFound.title')}
      </h1>
      <p className="text-md text-text-muted">{t('notFound.body')}</p>
      <Link
        to="/"
        className="text-md font-semibold text-brand underline-offset-2 hover:underline focus-visible:outline-none focus-visible:[outline:var(--focus-outline-width)_solid_var(--color-brand)] focus-visible:[outline-offset:var(--focus-ring-offset)]"
      >
        {t('notFound.goHome')}
      </Link>
    </div>
  );
}
