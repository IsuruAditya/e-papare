import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/AuthContext';
import { roleHomePath } from '../layout/nav-config';

/**
 * Shown when an authenticated user reaches a route their role may not access
 * (EXPERIENCE.md 403: "Access restricted" with a route back to their own
 * dashboard). We NEVER render the target role's surface or nav.
 */
export function AccessRestricted(): React.JSX.Element {
  const { t } = useTranslation('common');
  const { role } = useAuth();
  const home = role ? roleHomePath[role] : '/';

  return (
    <div className="mx-auto flex max-w-[600px] flex-col items-center gap-4 py-10 text-center">
      <h1 tabIndex={-1} className="text-2xl font-bold text-text">
        {t('accessRestricted.title')}
      </h1>
      <p className="text-md text-text-muted">{t('accessRestricted.body')}</p>
      <Link
        to={home}
        className="text-md font-semibold text-brand underline-offset-2 hover:underline focus-visible:outline-none focus-visible:[outline:var(--focus-outline-width)_solid_var(--color-brand)] focus-visible:[outline-offset:var(--focus-ring-offset)]"
      >
        {t('accessRestricted.goToDashboard')}
      </Link>
    </div>
  );
}
