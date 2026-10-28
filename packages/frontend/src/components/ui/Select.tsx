import React from 'react';
import { cx } from './cx';
import {
  FieldLabel,
  FieldMessage,
  controlBase,
  controlError,
  controlDefaultBorder,
  inputHeight,
} from './Input';

/**
 * Select — native `<select>` with a custom CSS arrow (DESIGN.md "Form Controls:
 * Select — `appearance: none`"). Options are supplied as `children` so callers
 * provide already-translated `<option>` text (label-agnostic).
 *
 * Shares the Input label/error/helper wiring: label association, required
 * asterisk + `aria-required`, error border + `--ring-error`, `aria-invalid`,
 * `aria-describedby`.
 */

type NativeSelectProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  'className' | 'aria-invalid' | 'aria-required' | 'aria-describedby'
>;

export interface SelectProps extends NativeSelectProps {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

/**
 * The native control chrome is stripped with `appearance-none`; the custom
 * chevron is drawn by the wrapper's masked `::after` element (see below), so
 * the `<select>` itself only needs right padding to clear the arrow.
 */
const arrow = 'appearance-none pr-9';

/**
 * Chevron arrow — theme-aware WITHOUT a raw hex. The SVG is a `mask-image` (it
 * defines only the SHAPE); the visible color comes from `background-color:
 * var(--color-text-muted)`. Because `.dark` reassigns `--color-text-muted`, the
 * arrow retints for both themes from the single semantic token. The mask is
 * applied to a wrapper pseudo-element (`.ep-select-arrow::after`) rather than to
 * the `<select>` itself, so only the arrow is masked — not the control's text.
 * A data-URI `background-image` could not retint, since a data URI cannot read
 * a CSS variable; this is the token-pure replacement for the former hardcoded
 * `#6b6b8a` stroke.
 */
const wrapperArrow = 'ep-select-arrow relative';

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, helperText, error, required, id, className, children, ...rest },
  ref,
) {
  const reactId = React.useId();
  const selectId = id ?? `select-${reactId}`;
  const messageId = `${selectId}-message`;
  const hasMessage = Boolean(error) || Boolean(helperText);

  return (
    <div className="w-full">
      {label && <FieldLabel htmlFor={selectId} label={label} required={required} />}
      {/* Wrapper carries the token-tinted chevron via its `::after` mask. */}
      <div className={cx(wrapperArrow, 'block')}>
        <select
          ref={ref}
          id={selectId}
          required={required}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={hasMessage ? messageId : undefined}
          className={cx(
            controlBase,
            inputHeight,
            arrow,
            error ? controlError : controlDefaultBorder,
            className,
          )}
          {...rest}
        >
          {children}
        </select>
      </div>
      <FieldMessage id={messageId} error={error} helperText={helperText} />
    </div>
  );
});
