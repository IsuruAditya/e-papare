import React from 'react';
import { cx } from './cx';

/**
 * Skeleton — loading placeholder (DESIGN.md / EXPERIENCE.md "Loading State").
 *
 * Renders a shimmer block (the `.ep-skeleton` utility defined in index.css,
 * token-colored for light + dark). `aria-hidden` because it conveys no content
 * to assistive tech; the surrounding region should carry the loading status.
 *
 * Dimensions are passed by the caller so the skeleton matches the eventual
 * content and causes no layout shift.
 */

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** CSS width (e.g. '100%', 120, '12rem'). */
  width?: string | number;
  /** CSS height (e.g. 16, '1rem'). */
  height?: string | number;
  /** Border radius utility; defaults to `rounded-md`. */
  radius?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
}

const radiusClass: Record<NonNullable<SkeletonProps['radius']>, string> = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

export function Skeleton({
  width = '100%',
  height = '1rem',
  radius = 'md',
  className,
  style,
  ...rest
}: SkeletonProps): React.JSX.Element {
  return (
    <div
      aria-hidden="true"
      className={cx('ep-skeleton', radiusClass[radius], className)}
      style={{ width, height, ...style }}
      {...rest}
    />
  );
}
