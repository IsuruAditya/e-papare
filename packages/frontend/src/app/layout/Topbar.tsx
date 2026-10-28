import React from 'react';
import { useTranslation } from 'react-i18next';
import { cx } from '../../components/ui/cx';
import { focusRing } from '../../components/ui/Button';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';

/**
 * Topbar (DESIGN.md "Topbar"): 52px, sticky, z-100. Left = optional hamburger
 * (shown below desktop) + logo. Right = language switcher → theme toggle →
 * notification bell → account avatar (bell + avatar are presentational
 * placeholders in Story 1.7; real behavior is later epics).
 */
export interface TopbarProps {
  /** Whether to show the hamburger (true below the desktop breakpoint). */
  showMenuButton: boolean;
  onOpenMenu: () => void;
}

export function Topbar({ showMenuButton, onOpenMenu }: TopbarProps): React.JSX.Element {
  const { t } = useTranslation('common');

  return (
    <header
      className="sticky top-0 z-[100] flex items-center justify-between gap-2 border-b border-border bg-surface px-3 sm:px-4"
      style={{ height: 'var(--topbar-height)' }}
    >
      <div className="flex items-center gap-2">
        {showMenuButton && (
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label={t('topbar.openMenu')}
            aria-haspopup="dialog"
            className={cx(
              // Hamburger is a tablet/mobile affordance only; desktop (≥1024px)
              // uses the persistent sidebar, so hide it there (EXPERIENCE.md).
              'inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-text lg:hidden',
              focusRing,
            )}
          >
            <span aria-hidden="true" className="text-xl leading-none">
              ☰
            </span>
          </button>
        )}
        <span className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="flex h-[30px] w-[30px] items-center justify-center rounded-md bg-brand text-sm font-bold text-white"
          >
            eP
          </span>
          <span className="text-lg font-bold text-text">{t('app.name')}</span>
        </span>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
        {/*
         * Notification bell + account avatar — presentational placeholders in
         * Story 1.7 (behavior: Epics 6 and 2/7). They are `disabled` so a
         * keyboard/screen-reader user cannot activate a control that silently
         * no-ops (least astonishment / error prevention). Their epics remove
         * `disabled` and wire the real behavior.
         */}
        <button
          type="button"
          disabled
          aria-label={t('topbar.notifications')}
          className={cx(
            'inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md bg-brand-subtle text-brand disabled:cursor-not-allowed disabled:opacity-60',
            focusRing,
          )}
        >
          <span aria-hidden="true" className="text-lg leading-none">
            ◔
          </span>
        </button>
        <button
          type="button"
          disabled
          aria-label={t('topbar.account')}
          className={cx(
            'inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-brand text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60',
            focusRing,
          )}
        >
          <span aria-hidden="true">◉</span>
        </button>
      </div>
    </header>
  );
}
