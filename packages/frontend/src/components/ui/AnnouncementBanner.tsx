import React from 'react';
import { cx } from './cx';

/**
 * AnnouncementBanner — inline, in-page state banner (DESIGN.md "Announcement /
 * State Banners"). Distinct from Toast: this lives within page content, not in
 * the toast stack.
 *
 * Variants map to semantic token families. The optional `icon` and the `title`
 * / `children` body text are all supplied by the caller (label-agnostic). Uses
 * `--radius-lg` and a flex layout with `gap` so Sinhala text wraps without
 * clipping.
 */

export type BannerVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface AnnouncementBannerProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'title'
> {
  variant: BannerVariant;
  /** Optional decorative icon (24px slot). Caller supplies the glyph/SVG. */
  icon?: React.ReactNode;
  /** Already-translated title. */
  title?: React.ReactNode;
  className?: string;
}

const variantClass: Record<BannerVariant, string> = {
  success: 'bg-success-bg text-success border-success-border',
  warning: 'bg-warning-bg text-warning border-warning-border',
  danger: 'bg-danger-bg text-danger border-danger-border',
  info: 'bg-info-bg text-info border-info-border',
  // Neutral uses the brand-subtle surface with default text/border.
  neutral: 'bg-brand-subtle text-text border-border',
};

export function AnnouncementBanner({
  variant,
  icon,
  title,
  children,
  className,
  ...rest
}: AnnouncementBannerProps): React.JSX.Element {
  return (
    <div
      className={cx(
        'flex items-start gap-3.5 rounded-lg border px-5 py-4',
        variantClass[variant],
        className,
      )}
      {...rest}
    >
      {icon != null && (
        <span aria-hidden="true" className="mt-0.5 shrink-0 text-2xl leading-none">
          {icon}
        </span>
      )}
      <div className="min-w-0 flex-1">
        {title != null && <p className="text-base font-bold">{title}</p>}
        {/* Full-opacity current color: the variant's foreground token is AA on
            its background only at full strength; a /90 tint eroded that margin. */}
        {children != null && <div className="text-sm leading-[1.55]">{children}</div>}
      </div>
    </div>
  );
}
