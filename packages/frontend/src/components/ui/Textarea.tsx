import React from 'react';
import { cx } from './cx';
import { FieldLabel, FieldMessage, controlBase, controlError, controlDefaultBorder } from './Input';

/**
 * Textarea — multi-line text field (DESIGN.md "Form Controls"). Shares the
 * Input label/error/helper wiring. Uses `min-height` (not fixed height) so
 * long Sinhala content grows without clipping.
 */

type NativeTextareaProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'className' | 'aria-invalid' | 'aria-required' | 'aria-describedby'
>;

export interface TextareaProps extends NativeTextareaProps {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, helperText, error, required, id, rows = 4, className, ...rest },
  ref,
) {
  const reactId = React.useId();
  const areaId = id ?? `textarea-${reactId}`;
  const messageId = `${areaId}-message`;
  const hasMessage = Boolean(error) || Boolean(helperText);

  return (
    <div className="w-full">
      {label && <FieldLabel htmlFor={areaId} label={label} required={required} />}
      <textarea
        ref={ref}
        id={areaId}
        rows={rows}
        required={required}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={hasMessage ? messageId : undefined}
        className={cx(
          controlBase,
          'min-h-[80px] resize-y',
          error ? controlError : controlDefaultBorder,
          className,
        )}
        {...rest}
      />
      <FieldMessage id={messageId} error={error} helperText={helperText} />
    </div>
  );
});
