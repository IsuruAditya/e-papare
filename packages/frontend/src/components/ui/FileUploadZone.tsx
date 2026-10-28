import React from 'react';
import { cx } from './cx';

/**
 * FileUploadZone — the presentational payment-slip upload zone (DESIGN.md
 * "File upload zone" + EXPERIENCE.md "File Upload" / "Upload States").
 *
 * PRESENTATIONAL ONLY (Story 1.6). It renders every visual phase of the AD-35
 * three-phase presigned flow driven by the `phase` prop — it does NOT perform
 * any network request (presign / PUT to R2 / complete). The real upload logic
 * lands in Epic 4; this component is the reusable shell those stories drive.
 *
 * Phases & ARIA (EXPERIENCE.md "Upload States"):
 *   idle        -> dashed zone, tabindex=0, Enter/Space opens the file dialog
 *   dragging    -> solid brand border + brand-subtle bg, aria-dropeffect="copy"
 *   preparing   -> indeterminate spinner "Preparing…", aria-busy, polite live
 *   uploading   -> determinate role="progressbar" aria-valuenow={progress}
 *   confirming  -> bar full + spinner overlay "Confirming…", aria-busy
 *   complete    -> green border, filename/size/timestamp, polite live
 *   error       -> red border/bg, Try Again, assertive live
 *
 * Label-agnostic: EVERY visible string (labels, messages, button text, the
 * accessible zone label) is supplied by the caller via props.
 */

export type UploadPhase =
  'idle' | 'dragging' | 'preparing' | 'uploading' | 'confirming' | 'complete' | 'error';

export interface FileUploadZoneProps {
  phase: UploadPhase;
  /** Accepted file types for the native picker, e.g. 'image/jpeg,image/png,application/pdf'. */
  accept?: string;
  /** Allow camera capture on mobile (maps to `capture="environment"`). */
  capture?: boolean;
  /** 0–100 progress for the `uploading` phase. */
  progress?: number;
  /** Fired when a file is chosen (via click, keyboard, or drop). Presentational — no upload. */
  onFileSelected?: (file: File) => void;
  /** Fired when the zone is activated (click / Enter / Space) in an openable phase. */
  onOpenPicker?: () => void;
  /** Fired by the Try Again button in the `error` phase. */
  onRetry?: () => void;

  /** Already-translated accessible label for the idle zone (required for a11y). */
  zoneLabel: string;
  /** Already-translated idle instruction text shown inside the zone. */
  idleText?: React.ReactNode;
  /** Already-translated phase status strings. */
  preparingText?: React.ReactNode;
  uploadingText?: React.ReactNode;
  confirmingText?: React.ReactNode;
  errorText?: React.ReactNode;
  retryLabel?: string;

  /** Completed-file metadata (already-formatted / translated by the caller). */
  fileName?: React.ReactNode;
  fileMeta?: React.ReactNode;

  className?: string;
}

/** Phases in which activating the zone opens the file picker. */
const OPENABLE: ReadonlySet<UploadPhase> = new Set<UploadPhase>(['idle', 'dragging', 'error']);

function borderForPhase(phase: UploadPhase): string {
  switch (phase) {
    case 'dragging':
      return 'border-solid border-brand bg-brand-subtle';
    case 'complete':
      return 'border-solid border-success-border bg-success-bg';
    case 'error':
      // Sanctioned DESIGN.md error literal (#ef4444) + danger-bg surface.
      return 'border-solid border-[#ef4444] bg-danger-bg';
    default:
      return 'border-dashed border-border-strong';
  }
}

/** Minimal token-colored spinner (shared shape with Button's). */
function Spinner(): React.JSX.Element {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent"
    />
  );
}

export function FileUploadZone({
  phase,
  accept = 'image/jpeg,image/png,application/pdf',
  capture = false,
  progress = 0,
  onFileSelected,
  onOpenPicker,
  onRetry,
  zoneLabel,
  idleText,
  preparingText,
  uploadingText,
  confirmingText,
  errorText,
  retryLabel,
  fileName,
  fileMeta,
  className,
}: FileUploadZoneProps): React.JSX.Element {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const openable = OPENABLE.has(phase);
  const clampedProgress = Math.max(0, Math.min(100, Math.round(progress)));

  const openPicker = (): void => {
    if (!openable) return;
    onOpenPicker?.();
    inputRef.current?.click();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (!openable) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openPicker();
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    if (!openable) return;
    const file = event.dataTransfer.files?.[0];
    if (file) onFileSelected?.(file);
  };

  return (
    <div className={cx('w-full', className)}>
      {/* Hidden native input — the zone proxies clicks/keys to it. */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        {...(capture ? { capture: 'environment' as const } : {})}
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFileSelected?.(file);
        }}
      />

      <div
        role="button"
        aria-label={zoneLabel}
        aria-disabled={openable ? undefined : true}
        aria-busy={phase === 'preparing' || phase === 'confirming' || undefined}
        aria-dropeffect={phase === 'dragging' ? 'copy' : undefined}
        tabIndex={openable ? 0 : -1}
        onClick={openPicker}
        onKeyDown={handleKeyDown}
        onDragOver={(event) => {
          if (openable) event.preventDefault();
        }}
        onDrop={handleDrop}
        className={cx(
          'flex min-h-[112px] flex-col items-center justify-center gap-2 rounded-lg border-2 px-5 py-7 text-center',
          'transition-colors focus-visible:outline-none',
          'focus-visible:[outline:var(--focus-outline-width)_solid_var(--color-brand)] focus-visible:[outline-offset:var(--focus-ring-offset)]',
          openable &&
            phase !== 'dragging' &&
            'cursor-pointer hover:border-brand hover:bg-brand-subtle',
          borderForPhase(phase),
        )}
      >
        {(phase === 'idle' || phase === 'dragging') && (
          <p className="text-sm text-text-muted">{idleText}</p>
        )}

        {phase === 'preparing' && (
          <div className="flex items-center gap-2" aria-live="polite">
            <Spinner />
            <span className="text-sm text-text-muted">{preparingText}</span>
          </div>
        )}

        {phase === 'uploading' && (
          <div className="w-full max-w-[280px]">
            <p className="mb-2 text-sm text-text-muted">{uploadingText}</p>
            <div
              role="progressbar"
              aria-valuenow={clampedProgress}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-2 w-full overflow-hidden rounded-full bg-surface-elevated"
            >
              <div
                className="h-full rounded-full bg-brand transition-[width]"
                style={{ width: `${String(clampedProgress)}%` }}
              />
            </div>
            <span className="mt-1 block text-xs text-text-muted">{clampedProgress}%</span>
          </div>
        )}

        {phase === 'confirming' && (
          <div className="w-full max-w-[280px]" aria-busy="true">
            <div
              className="relative h-2 w-full overflow-hidden rounded-full bg-surface-elevated"
              role="progressbar"
              aria-valuenow={100}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="h-full w-full rounded-full bg-brand" />
            </div>
            <div className="mt-2 flex items-center justify-center gap-2">
              <Spinner />
              <span className="text-sm text-text-muted">{confirmingText}</span>
            </div>
          </div>
        )}

        {phase === 'complete' && (
          <div aria-live="polite">
            {fileName != null && <p className="text-base font-semibold text-text">{fileName}</p>}
            {fileMeta != null && <p className="mt-0.5 text-xs text-text-muted">{fileMeta}</p>}
          </div>
        )}

        {phase === 'error' && (
          <div aria-live="assertive" className="flex flex-col items-center gap-2">
            <p className="text-sm text-danger">{errorText}</p>
            {onRetry && retryLabel && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onRetry();
                }}
                className={cx(
                  'rounded-md border-[1.5px] border-border-strong bg-surface px-3 py-1 text-sm font-semibold text-brand',
                  'hover:border-brand hover:bg-brand-subtle focus-visible:outline-none',
                  'focus-visible:[outline:var(--focus-outline-width)_solid_var(--color-brand)] focus-visible:[outline-offset:var(--focus-ring-offset)]',
                )}
              >
                {retryLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
