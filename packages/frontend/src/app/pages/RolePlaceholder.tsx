import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Role } from '../auth/AuthContext';

/**
 * Minimal role-root placeholder rendered inside the shell. Story 1.7 ships only
 * the shell + route skeleton; the real dashboards are Epics 5/7. The `<h1>` is
 * `tabIndex={-1}` so `AppLayout`'s route-change focus can move focus to it.
 */
export function RolePlaceholder({ role }: { role: Role }): React.JSX.Element {
  const { t } = useTranslation('common');
  const roleLabel = t(`roles.${role}`);

  return (
    <section className="flex flex-col gap-3">
      <h1 tabIndex={-1} className="text-2xl font-bold text-text outline-none">
        {t('placeholder.roleDashboard', { role: roleLabel })}
      </h1>
      <p className="text-md text-text-muted">{t('placeholder.comingSoon')}</p>
    </section>
  );
}
