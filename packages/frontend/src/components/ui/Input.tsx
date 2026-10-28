import React from 'react';
import { cx } from './cx';

/**
 * Input — single-line text field (DESIGN.md "Form Controls").
 *
 * Label-agnostic: `label`, `helperText`, and `error` all arrive as already-
 * translated strings. Wiring:
 *   - `<label htmlFor>` bound to the input `id` (auto-generated if absent)
 *   - required -> danger asterisk + `aria-required`
 *   - error    -> danger border + `--ring-error` glow, `aria-invalid`,
 *                 `aria-describedby` -> error message element
 *
 * The error glow uses the sanctioned DESIGN.md `--ring-error` token (the
 * rgba(239,68,68,.15) literal lives only in tokens.css).
 */

type NativeInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'className' | 'aria-invalid' | 'aria-required' | 'aria-describedby'
>;

export interface InputProps extends NativeInputProps {
  /** Already-translated visible label. */
  label?: string;
  /** Already-translated helper text shown below the field when there is no error. */
  helperText?: string;
  /** Already-translated error message. Presence toggles the error state. */
  error?: string;
  required?: boolean;
  className?: string;
}

/** Base control styling shared by Input / Select / Textarea. */
export const controlBase =
  'w-full rounded-md border-[1.5px] bg-surface px-3 py-[9px] text-base text-text ' +
  'placeholder:text-text-muted transition-shadow ' +
  'focus:outline-none focus:border-brand focus:shadow-[var(--ring-focus)] ' +
  'disabled:cursor-not-allowed disabled:bg-disabled-bg disabled:text-text-disabled disabled:border-disabled-border';

/** Error-state override: danger border + the sanctioned error ring glow. */
export const controlError =
  'border-[#ef4444] focus:border-[#ef4444] shadow-[var(--ring-error)] focus:shadow-[var(--ring-error)]';

export const controlDefaultBorder = 'border-border-strong';

export const inputHeight = 'h-[38px]';

/** Shared label element used by every form control. */
export function FieldLabel({
  htmlFor,
  label,
  required,
}: {
  htmlFor: string;
  label: string;
  required?: boolean | undefined;
}): React.JSX.Element {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-semibold text-text">
      {label}
      {required && (
        <span aria-hidden="true" className="ml-0.5 text-danger">
          *
        </span>
      )}
    </label>
  );
}

/** Shared error / helper text block. Returns the id used for `aria-describedby`. */
export function FieldMessage({
  id,
  error,
  helperText,
}: {
  id: string;
  error?: string | undefined;
  helperText?: string | undefined;
}): React.JSX.Element | null {
  if (error) {
    return (
      <p id={id} className="mt-1 text-xs text-danger">
        {error}
      </p>
    );
  }
  if (helperText) {
    return (
      <p id={id} className="mt-1 text-xs text-text-muted">
        {helperText}
      </p>
    );
  }
  return null;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, helperText, error, required, id, className, ...rest },
  ref,
) {
  const reactId = React.useId();
  const inputId = id ?? `input-${reactId}`;
  const messageId = `${inputId}-message`;
  const hasMessage = Boolean(error) || Boolean(helperText);

  return (
    <div className="w-full">
      {label && <FieldLabel htmlFor={inputId} label={label} required={required} />}
      <input
        ref={ref}
        id={inputId}
        required={required}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={hasMessage ? messageId : undefined}
        className={cx(
          controlBase,
          inputHeight,
          error ? controlError : controlDefaultBorder,
          className,
        )}
        {...rest}
      />
      <FieldMessage id={messageId} error={error} helperText={helperText} />
    </div>
  );
});
