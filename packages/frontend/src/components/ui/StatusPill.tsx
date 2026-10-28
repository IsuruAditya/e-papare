import React from 'react';
import { cx } from './cx';
import {
  statusLabels,
  statusToken,
  isStatusKey,
  type StatusKey,
  type StatusLang,
  type StatusTokenName,
} from './status-labels';

/**
 * StatusPill — a semantic status badge (DESIGN.md "Status Pills / Badges").
 *
 * This is the ONE component carrying a bilingual label (via `status-labels.ts`)
 * as a self-contained Story-1.7 stopgap. The `lang` prop defaults to `'en'`
 * until the app-wide language context exists.
 *
 * Colors resolve from `statusToken[status]` to a Story 1.5 semantic token pair:
 *   bg  -> `--color-{token}-bg`
 *   text-> `--color-{token}`
 *   dot/border -> `--color-{token}-border`
 *
 * Unknown `status` -> renders nothing + a dev-only console warning.
 */

export interface StatusPillProps {
  status: StatusKey;
  /** Label language. Defaults to `'en'` (Story 1.7 will source this from context). */
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

export function StatusPill({
  status,
  lang = 'en',
  className,
}: StatusPillProps): React.JSX.Element | null {
  if (!isStatusKey(status)) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn(`[StatusPill] unknown status "${String(status)}" — rendering nothing.`);
    }
    return null;
  }

  const token = statusToken[status];
  const label = statusLabels[status][lang];

  return (
    <span
      className={cx(
        // Fully-rounded pill (DESIGN.md "Status Pills / Badges": border-radius
        // 9999px). Compact non-status badges/chips use --radius-sm (4px); status
        // pills are the deliberate exception — resolved 2026-10-28.
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
