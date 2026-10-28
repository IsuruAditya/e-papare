import React from 'react';
import { useTranslation } from 'react-i18next';
import { cx } from '../../components/ui/cx';
import { focusRing } from '../../components/ui/Button';
import { useTheme } from '../theme/ThemeContext';

/**
 * Theme toggle (DESIGN.md Topbar "Theme Toggle").
 *
 * 32px icon button showing ☀ in light mode / 🌙 in dark mode. `aria-pressed`
 * reflects dark-mode-on and the `aria-label` announces the action the press will
 * perform (EXPERIENCE.md). Keyboard operable; persistence + class toggle handled
 * by `ThemeContext`.
 */
export function ThemeToggle({ className }: { className?: string }): React.JSX.Element {
  const { t } = useTranslation('common');
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  // The label describes the NEXT action, not the current state.
  const ariaLabel = isDark ? t('topbar.theme.switchToLight') : t('topbar.theme.switchToDark');

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={ariaLabel}
      aria-pressed={isDark}
      className={cx(
        'inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md bg-brand-subtle text-brand',
        focusRing,
        className,
      )}
    >
      <span aria-hidden="true" className="text-lg leading-none">
        {isDark ? '🌙' : '☀'}
      </span>
    </button>
  );
}
