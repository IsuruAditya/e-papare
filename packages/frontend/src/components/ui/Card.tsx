import React from 'react';
import { cx } from './cx';

/**
 * Card — surface container (DESIGN.md "Cards").
 *
 * Elevation comes from the border, not a shadow (DESIGN.md: "No shadow by
 * default"). Interactive cards opt into a hover affordance (`--color-border-
 * strong` + `--shadow-card-hover`). Uses `min-height`-friendly flow so long
 * Sinhala content grows instead of clipping.
 *
 * `header` and `body`/`children` are rendered as slots; all text is supplied by
 * the caller (label-agnostic).
 */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional header slot (rendered above a divider). */
  header?: React.ReactNode;
  /** Enables the hover affordance for clickable cards. */
  interactive?: boolean;
  className?: string;
}

export function Card({
  header,
  interactive = false,
  className,
  children,
  ...rest
}: CardProps): React.JSX.Element {
  return (
    <div
      className={cx(
        'rounded-lg border border-border bg-surface',
        interactive &&
          'cursor-pointer transition-all hover:border-border-strong hover:shadow-card-hover',
        className,
      )}
      {...rest}
    >
      {header != null && <div className="border-b border-border px-[18px] py-[14px]">{header}</div>}
      <div className="px-[18px] py-4">{children}</div>
    </div>
  );
}
