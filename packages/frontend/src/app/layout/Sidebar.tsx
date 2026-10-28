import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavList } from './NavList';
import { navConfig } from './nav-config';
import type { Role } from '../auth/AuthContext';

/**
 * Desktop sidebar (DESIGN.md "Sidebar Navigation"): 210px, sticky below the
 * topbar, role-scoped. Hidden below the desktop breakpoint — tablet/other-role
 * mobile use the Drawer instead. Renders ONLY the current role's nav
 * (five-role scoping).
 */
export function Sidebar({ role }: { role: Role }): React.JSX.Element {
  const { t } = useTranslation('common');

  return (
    <aside
      className="hidden shrink-0 overflow-y-auto border-r border-border bg-surface py-4 lg:block"
      style={{
        width: 'var(--sidebar-width)',
        position: 'sticky',
        top: 'var(--topbar-height)',
        height: 'calc(100vh - var(--topbar-height))',
      }}
    >
      <nav aria-label={t('nav.mainLabel')}>
        <NavList items={navConfig[role]} />
      </nav>
    </aside>
  );
}
