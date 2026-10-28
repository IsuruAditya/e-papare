import React from 'react';
import { useTranslation } from 'react-i18next';
import { cx } from '../../components/ui/cx';
import { focusRing } from '../../components/ui/Button';
import { useLanguage } from '../i18n/I18nProvider';

/**
 * Language switcher (DESIGN.md Topbar "Language Switcher").
 *
 * Shows `සිං | EN` with the active language emphasised and the inactive one
 * dimmed. A single toggle button flips between the two languages — Tab to focus,
 * Enter/Space to activate (EXPERIENCE.md Keyboard Navigation). The switch is
 * immediate (no reload) and preserves form state (handled by `I18nProvider`).
 */
export function LanguageSwitcher({ className }: { className?: string }): React.JSX.Element {
  const { t } = useTranslation('common');
  const { language, setLanguage } = useLanguage();

  const next = language === 'en' ? 'si' : 'en';
  const ariaLabel =
    next === 'si' ? t('topbar.language.switchToSinhala') : t('topbar.language.switchToEnglish');

  return (
    <button
      type="button"
      onClick={() => setLanguage(next)}
      aria-label={ariaLabel}
      className={cx(
        'inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1 rounded-md border-[1.5px] border-border-strong bg-surface px-[9px] py-1 text-base font-semibold',
        focusRing,
        className,
      )}
    >
      {/* Sinhala side — opt into the Sinhala font even on an English page. */}
      <span
        lang="si"
        className={cx(language === 'si' ? 'font-bold text-brand' : 'text-text-muted')}
      >
        සිං
      </span>
      <span aria-hidden="true" className="text-text-disabled">
        |
      </span>
      {/* English side. */}
      <span
        lang="en"
        className={cx(language === 'en' ? 'font-bold text-brand' : 'text-text-muted')}
      >
        EN
      </span>
    </button>
  );
}
