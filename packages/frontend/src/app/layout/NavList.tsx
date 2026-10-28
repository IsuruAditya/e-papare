import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cx } from '../../components/ui/cx';
import { focusRing } from '../../components/ui/Button';
import type { NavItem } from './nav-config';

/**
 * Renders a vertical list of role nav items (shared by Sidebar and Drawer to
 * keep active/hover/focus styling identical — DRY). Active state uses React
 * Router's `NavLink` `isActive`, styled with the DESIGN.md Sidebar active
 * treatment (brand-subtle bg, brand text, left border).
 */
export interface NavListProps {
  items: NavItem[];
  /** Called after a nav item is activated (e.g. close the drawer). */
  onNavigate?: () => void;
}

export function NavList({ items, onNavigate }: NavListProps): React.JSX.Element {
  const { t } = useTranslation('common');

  return (
    <ul className="flex flex-col gap-0.5">
      {items.map((item) => (
        <li key={item.path}>
          <NavLink
            to={item.path}
            end={item.end ?? false}
            onClick={onNavigate}
            className={({ isActive }) =>
              cx(
                'flex items-center gap-3 rounded-md px-[18px] py-2 text-base font-medium',
                'border-l-[3px] border-transparent',
                'hover:bg-surface-elevated hover:text-brand',
                focusRing,
                isActive
                  ? 'border-brand bg-brand-subtle font-semibold text-brand'
                  : 'text-text-muted',
              )
            }
          >
            <span aria-hidden="true" className="w-[18px] text-center text-sm">
              {item.icon}
            </span>
            <span>{t(item.labelKey)}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  );
}
