import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cx } from '../../components/ui/cx';
import { focusRing } from '../../components/ui/Button';
import { studentBottomNav } from './nav-config';

/**
 * Mobile bottom navigation (DESIGN.md "Mobile Bottom Navigation") — STUDENT
 * role only, exactly 5 items (Home · Courses · Payments · Notifications ·
 * Account). Fixed to the bottom, 60px tall, respecting the safe-area inset.
 * Shown only below the tablet breakpoint (`md`). Active item is brand-colored
 * (icon + label), no colored background bar.
 */
export function BottomNav(): React.JSX.Element {
  const { t } = useTranslation('common');

  return (
    <nav
      aria-label={t('nav.mainLabel')}
      className="fixed inset-x-0 bottom-0 z-[100] flex border-t border-border bg-surface md:hidden"
      style={{
        height: 'var(--mobile-nav-height)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {studentBottomNav.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.end ?? false}
          className={({ isActive }) =>
            cx(
              'flex min-w-[44px] flex-1 flex-col items-center justify-center gap-0.5 py-1',
              focusRing,
              isActive ? 'text-brand' : 'text-text-muted',
            )
          }
        >
          <span aria-hidden="true" className="text-xl leading-none">
            {item.icon}
          </span>
          <span className="text-xs font-semibold">{t(item.labelKey)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
