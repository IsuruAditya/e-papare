import React from 'react';
import { cx } from './cx';

/**
 * SkipLink — "skip to main content" keyboard-accessibility primitive.
 *
 * Visually hidden until focused; the first Tab from the top of the page reveals
 * it. Targets `#main-content` by default — the id EXPERIENCE.md's Accessibility
 * Floor mandates for the `<main>` landmark and skip-link target (Story 1.7's
 * shell renders the matching element). The link text is supplied by the caller
 * (label-agnostic).
 */

export interface SkipLinkProps {
  /** Already-translated link text, e.g. "Skip to main content". */
  children: React.ReactNode;
  /** Target element id (without '#'). Defaults to 'main-content' (EXPERIENCE.md). */
  targetId?: string;
  className?: string;
}

export function SkipLink({
  children,
  targetId = 'main-content',
  className,
}: SkipLinkProps): React.JSX.Element {
  return (
    <a
      href={`#${targetId}`}
      className={cx(
        // Off-screen until focused, then pinned top-left with brand styling.
        'sr-only rounded-md bg-surface px-4 py-2 text-base font-semibold text-brand',
        'focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[400]',
        'focus-visible:outline-none focus:[outline:var(--focus-outline-width)_solid_var(--color-brand)] focus:[outline-offset:var(--focus-ring-offset)]',
        className,
      )}
    >
      {children}
    </a>
  );
}
