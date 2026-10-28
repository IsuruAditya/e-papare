import React from 'react';
import { useTranslation } from 'react-i18next';
import { cx } from '../../components/ui/cx';
import { focusRing } from '../../components/ui/Button';
import { NavList } from './NavList';
import { navConfig } from './nav-config';
import type { Role } from '../auth/AuthContext';

/**
 * Slide-in navigation drawer (EXPERIENCE.md Tablet/Mobile navigation). Used on
 * tablet (768–1023px) and for non-Student roles on mobile. Behavior:
 *   - semi-transparent backdrop (sanctioned `rgba(0,0,0,.4)`)
 *   - focus moves into the drawer on open, is TRAPPED, and is restored to the
 *     opener (the topbar hamburger) on close
 *   - ESC or a backdrop click closes it
 *   - transition respects `prefers-reduced-motion` (handled in CSS utility)
 * Renders ONLY the current role's nav (five-role scoping).
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  role: Role;
}

export function Drawer({ open, onClose, role }: DrawerProps): React.JSX.Element | null {
  const { t } = useTranslation('common');
  const panelRef = React.useRef<HTMLDivElement>(null);
  const openerRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!open) return;

    openerRef.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    if (panel) {
      const first = panel.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? panel).focus();
    }

    return () => {
      const opener = openerRef.current;
      if (opener?.isConnected) opener.focus();
    };
  }, [open]);

  if (!open) return null;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;

    const panel = panelRef.current;
    if (!panel) return;
    const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (focusable.length === 0) {
      event.preventDefault();
      panel.focus();
      return;
    }
    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    // Backdrop — sanctioned rgba(0,0,0,.4); z-index 300 (overlay layer).
    <div
      className="fixed inset-0 z-[300] bg-[rgba(0,0,0,0.4)] lg:hidden"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('nav.mainLabel')}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={cx(
          'ep-drawer-panel flex h-full w-[280px] max-w-[85vw] flex-col gap-2 overflow-y-auto bg-surface p-4 shadow-elevated outline-none',
        )}
      >
        <div className="flex items-center justify-between pb-2">
          <span className="text-lg font-bold text-brand">{t('app.name')}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('topbar.closeMenu')}
            className={cx(
              'inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-text',
              focusRing,
            )}
          >
            <span aria-hidden="true" className="text-xl leading-none">
              ✕
            </span>
          </button>
        </div>
        <nav aria-label={t('nav.mainLabel')}>
          <NavList items={navConfig[role]} onNavigate={onClose} />
        </nav>
      </div>
    </div>
  );
}
