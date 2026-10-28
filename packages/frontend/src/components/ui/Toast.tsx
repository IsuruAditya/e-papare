import React from 'react';
import { cx } from './cx';

/**
 * Toast — transient notification (DESIGN.md "Notification / Toast").
 *
 * ARIA: `role="alert"` with `aria-live` polite for success/warning/info and
 * assertive for error. Error toasts are PERSISTENT (no auto-dismiss); the other
 * variants auto-dismiss after `autoDismissMs` (default 5000ms) by calling
 * `onDismiss`. A left accent border carries the variant color.
 *
 * Label-agnostic: `title` and `children` (body) are supplied by the caller.
 */

export type ToastVariant = 'success' | 'warning' | 'error' | 'info';

export interface ToastProps {
  variant: ToastVariant;
  /** Already-translated title. */
  title?: React.ReactNode;
  /**
   * Called when the toast dismisses. For non-error variants this fires when the
   * auto-dismiss timer elapses OR the close button is pressed; for the
   * persistent error variant it fires only from the close button.
   */
  onDismiss?: () => void;
  /** Auto-dismiss delay for non-error variants. Default 5000ms. Ignored for error. */
  autoDismissMs?: number;
  /**
   * Already-translated accessible label for the close button. REQUIRED for the
   * persistent error variant (its only dismissal path is the button); without
   * it an error toast would be undismissable, so the component asserts its
   * presence in development.
   */
  closeLabel?: string;
  children?: React.ReactNode;
  className?: string;
}

const accent: Record<ToastVariant, string> = {
  success: 'border-l-success',
  warning: 'border-l-warning',
  error: 'border-l-danger',
  info: 'border-l-info',
};

export function Toast({
  variant,
  title,
  onDismiss,
  autoDismissMs = 5000,
  closeLabel,
  children,
  className,
}: ToastProps): React.JSX.Element {
  const isError = variant === 'error';

  // A persistent error toast's ONLY dismissal path is the close button; if the
  // caller wires `onDismiss` but no `closeLabel`, the toast would be impossible
  // to dismiss. Fail loudly in development so the trap is caught at build time.
  if (import.meta.env.DEV && isError && onDismiss && !closeLabel) {
    // eslint-disable-next-line no-console
    console.error(
      '[Toast] A persistent error toast with `onDismiss` must also supply `closeLabel`, ' +
        'otherwise it cannot be dismissed.',
    );
  }

  React.useEffect(() => {
    // Errors are persistent; everything else auto-dismisses.
    if (isError || !onDismiss) return;
    const id = window.setTimeout(onDismiss, autoDismissMs);
    return () => window.clearTimeout(id);
  }, [isError, onDismiss, autoDismissMs]);

  return (
    <div
      role="alert"
      aria-live={isError ? 'assertive' : 'polite'}
      className={cx(
        'flex max-w-[360px] items-start gap-3 rounded-lg border border-border border-l-4 bg-surface p-4 shadow-elevated',
        accent[variant],
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        {title != null && <p className="text-base font-semibold text-text">{title}</p>}
        {children != null && <div className="mt-0.5 text-sm text-text-muted">{children}</div>}
      </div>
      {onDismiss && closeLabel && (
        <button
          type="button"
          aria-label={closeLabel}
          onClick={onDismiss}
          className="shrink-0 rounded-sm text-text-muted hover:text-text focus-visible:outline-none focus-visible:[outline:var(--focus-outline-width)_solid_var(--color-brand)] focus-visible:[outline-offset:var(--focus-ring-offset)]"
        >
          <span aria-hidden="true">×</span>
        </button>
      )}
    </div>
  );
}
