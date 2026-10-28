import React from 'react';
import { cx } from './cx';

/**
 * Dialog — modal dialog (DESIGN.md "Dialogs / Modals" + EXPERIENCE.md
 * "Confirmation Dialogs").
 *
 * Behavior:
 *   - `role="dialog" aria-modal="true"`, labelled by the title via `aria-labelledby`
 *   - on open: focus moves into the dialog (first focusable, else the panel)
 *   - focus is TRAPPED inside the dialog (Tab / Shift+Tab cycle)
 *   - ESC closes and restores focus to the element that opened the dialog
 *   - overlay uses the sanctioned DESIGN.md `rgba(0,0,0,.5)` literal
 *
 * Label-agnostic: `title`, body `children`, and `footer` actions are all
 * supplied by the caller.
 */

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  /** Already-translated title; also used for `aria-labelledby`. */
  title: React.ReactNode;
  /** Footer action slot (buttons). Cancel on the left, primary on the right. */
  footer?: React.ReactNode;
  /** Close when the overlay backdrop is clicked. Default true (non-destructive). */
  closeOnOverlayClick?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Dialog({
  open,
  onClose,
  title,
  footer,
  closeOnOverlayClick = true,
  children,
  className,
}: DialogProps): React.JSX.Element | null {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const openerRef = React.useRef<HTMLElement | null>(null);
  const titleId = React.useId();

  // Capture the opener and move focus into the dialog on open; restore on close.
  React.useEffect(() => {
    if (!open) return;

    openerRef.current = document.activeElement as HTMLElement | null;

    const panel = panelRef.current;
    if (panel) {
      const first = panel.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? panel).focus();
    }

    return () => {
      // Restore focus to the opener when the dialog unmounts / closes — but only
      // if it is still in the document. If the opener was removed while the
      // dialog was open, `.focus()` would be a no-op and focus would silently
      // fall to <body>; guarding keeps that an explicit (future) decision.
      const opener = openerRef.current;
      if (opener?.isConnected) opener.focus();
    };
  }, [open]);

  if (!open) return null;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
      return;
    }

    if (event.key !== 'Tab') return;

    // Focus trap: cycle Tab / Shift+Tab within the dialog's focusable set.
    const panel = panelRef.current;
    if (!panel) return;
    // Use the full focusable set (the FOCUSABLE selector already excludes
    // disabled controls and tabindex=-1). We deliberately do NOT filter by
    // `offsetParent`: the dialog panel lives inside a `position: fixed` overlay,
    // and `offsetParent` is null for fixed-positioned subtrees in real browsers
    // (and always null in jsdom) — filtering on it would collapse the set to a
    // single element and let Tab escape the trap.
    const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (focusable.length === 0) {
      event.preventDefault();
      panel.focus();
      return;
    }
    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    // Overlay — sanctioned DESIGN.md rgba(0,0,0,.5). z-index 300 per DESIGN.md stack.
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-[rgba(0,0,0,0.5)] p-4"
      onMouseDown={(event) => {
        if (closeOnOverlayClick && event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={cx(
          'w-[calc(100%-32px)] max-w-[480px] rounded-xl bg-surface p-6 shadow-elevated outline-none',
          className,
        )}
      >
        <h2 id={titleId} className="mb-3 text-lg font-bold text-text">
          {title}
        </h2>
        <div className="text-base text-text">{children}</div>
        {footer != null && <div className="mt-6 flex items-center justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}
