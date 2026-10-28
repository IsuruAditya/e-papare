import React from 'react';
import { useTranslation } from 'react-i18next';
import { cx } from './cx';
import {
  statusToken,
  isStatusKey,
  type StatusKey,
  type StatusLang,
  type StatusTokenName,
} from './status-labels';

/**
 * StatusPill — a semantic status badge (DESIGN.md "Status Pills / Badges").
 *
 * Label resolution (Story 1.7 i18n migration):
 *   - no `lang` prop  → resolves via the app language context (`t('status:KEY')`)
 *   - `lang` provided → resolves THAT language explicitly (`getFixedT(lang)`),
 *     preserving the Story-1.6 `<StatusPill status="APPROVED" lang="si" />` API.
 *
 * Colors resolve from `statusToken[status]` to a Story 1.5 semantic token pair:
 *   bg  -> `--color-{token}-bg`, text -> `--color-{token}`, dot/border -> `--color-{token}-border`.
 *
 * Unknown `status` -> renders nothing + a dev-only console warning.
 */

export interface StatusPillProps {
  status: StatusKey;
  /**
   * Force a specific label language. Omit to follow the app language (the
   * normal case). Retained for backward compatibility with Story 1.6.
   */
  lang?: StatusLang;
  className?: string;
}

/** Static maps keep Tailwind's JIT able to see every class name literally. */
const bgClass: Record<StatusTokenName, string> = {
  success: 'bg-success-bg',
  warning: 'bg-warning-bg',
  danger: 'bg-danger-bg',
  info: 'bg-info-bg',
};

const textClass: Record<StatusTokenName, string> = {
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  info: 'text-info',
};

const borderClass: Record<StatusTokenName, string> = {
  success: 'border-success-border',
  warning: 'border-warning-border',
  danger: 'border-danger-border',
  info: 'border-info-border',
};

export function StatusPill({ status, lang, className }: StatusPillProps): React.JSX.Element | null {
  const { t, i18n } = useTranslation('status');

  if (!isStatusKey(status)) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn(`[StatusPill] unknown status "${String(status)}" — rendering nothing.`);
    }
    return null;
  }

  const token = statusToken[status];
  // Explicit `lang` → fixed translator for that language; else the app language.
  const label = lang ? i18n.getFixedT(lang, 'status')(status) : t(status);

  return (
    <span
      className={cx(
        // Fully-rounded pill (DESIGN.md "Status Pills / Badges": 9999px).
        'inline-flex items-center gap-1 rounded-full border px-[9px] py-[3px] text-xs font-semibold',
        bgClass[token],
        textClass[token],
        borderClass[token],
        className,
      )}
    >
      {/* 6px dot in the foreground color (DESIGN.md). Decorative — label carries meaning. */}
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
