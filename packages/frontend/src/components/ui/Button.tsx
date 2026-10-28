import React from 'react';
import { cx } from './cx';

/**
 * Button — the single interactive button primitive (DESIGN.md "Buttons").
 *
 * Label-agnostic: the visible text arrives as `children`; the component holds
 * NO hardcoded user-facing English (Story 1.7 supplies translated strings).
 *
 * Variants, sizes, focus ring, and disabled/loading states all come from Story
 * 1.5 semantic tokens. The only sanctioned raw hex here is the DESIGN.md Danger
 * button literal (`#ef4444` / hover `#dc2626`).
 */

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon';
export type ButtonSize = 'md' | 'sm';

/** Shared focus ring: DESIGN.md `outline: 3px solid brand; outline-offset: 2px`. */
export const focusRing =
  'focus-visible:outline-none focus-visible:[outline:var(--focus-outline-width)_solid_var(--color-brand)] focus-visible:[outline-offset:var(--focus-ring-offset)]';

const base =
  'inline-flex items-center justify-center gap-2 rounded-md font-semibold ' +
  'transition-colors select-none disabled:cursor-not-allowed ' +
  'aria-disabled:cursor-not-allowed ' +
  focusRing;

const variantClasses: Record<ButtonVariant, string> = {
  // Primary: brand fill, white text, hover/active token shifts.
  primary:
    'bg-brand text-white hover:bg-brand-hover active:bg-brand-active ' +
    'disabled:bg-disabled-bg disabled:text-text-disabled disabled:hover:bg-disabled-bg ' +
    'aria-disabled:bg-disabled-bg aria-disabled:text-text-disabled',
  // Secondary: surface fill, brand text, strong border.
  secondary:
    'bg-surface text-brand border-[1.5px] border-border-strong ' +
    'hover:bg-brand-subtle hover:border-brand ' +
    'disabled:bg-disabled-bg disabled:text-text-disabled disabled:border-disabled-border disabled:hover:bg-disabled-bg ' +
    'aria-disabled:bg-disabled-bg aria-disabled:text-text-disabled aria-disabled:border-disabled-border',
  // Danger: sanctioned DESIGN.md raw hex (#ef4444 / hover #dc2626).
  danger:
    'bg-[#ef4444] text-white hover:bg-[#dc2626] ' +
    'disabled:bg-disabled-bg disabled:text-text-disabled disabled:hover:bg-disabled-bg ' +
    'aria-disabled:bg-disabled-bg aria-disabled:text-text-disabled',
  // Ghost: transparent, brand text, subtle hover.
  ghost:
    'bg-transparent text-brand hover:bg-brand-subtle ' +
    'disabled:text-text-disabled disabled:hover:bg-transparent ' +
    'aria-disabled:text-text-disabled',
  // Icon: square brand-subtle affordance for icon-only actions.
  icon:
    'bg-brand-subtle text-brand hover:bg-brand-tint ' +
    'disabled:bg-disabled-bg disabled:text-text-disabled disabled:hover:bg-disabled-bg ' +
    'aria-disabled:bg-disabled-bg aria-disabled:text-text-disabled',
};

const sizeClasses: Record<ButtonSize, string> = {
  // md: 36px desktop, >=40px touch target on mobile (DESIGN.md).
  md: 'h-9 min-h-[40px] sm:min-h-0 px-4 text-md',
  // sm: 28px, used in table rows.
  sm: 'h-7 px-3 text-xs',
};

// Icon buttons are square regardless of size.
const iconSizeClasses: Record<ButtonSize, string> = {
  md: 'h-9 w-9 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 p-0',
  sm: 'h-7 w-7 p-0',
};

type NativeButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'>;

interface ButtonBaseProps extends NativeButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner, sets `aria-busy`, and suppresses interaction. */
  loading?: boolean;
  className?: string;
}

/**
 * Icon-only buttons (`variant="icon"`) MUST supply an `aria-label` — enforced at
 * the type level so an unlabelled icon button fails to compile.
 */
type IconButtonProps = ButtonBaseProps & { variant: 'icon'; 'aria-label': string };
type TextButtonProps = ButtonBaseProps & { variant?: Exclude<ButtonVariant, 'icon'> };

export type ButtonProps = IconButtonProps | TextButtonProps;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled,
    className,
    children,
    onClick,
    ...rest
  },
  ref,
) {
  const isIcon = variant === 'icon';
  const inoperable = disabled === true || loading;

  return (
    <button
      ref={ref}
      type={rest.type ?? 'button'}
      disabled={disabled}
      aria-disabled={disabled === true ? true : undefined}
      aria-busy={loading || undefined}
      className={cx(
        base,
        variantClasses[variant],
        isIcon ? iconSizeClasses[size] : sizeClasses[size],
        className,
      )}
      onClick={(event) => {
        // Belt-and-suspenders: a disabled/loading button never fires its handler,
        // even if the DOM `disabled` attribute is bypassed (e.g. aria-disabled only).
        if (inoperable) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        onClick?.(event);
      }}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
});

/** Minimal token-colored spinner (no dependency). `aria-hidden` — state is on the button. */
function Spinner(): React.JSX.Element {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  );
}
