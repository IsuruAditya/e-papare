/**
 * Tiny className joiner. Filters out falsy values (`false`, `undefined`, `null`,
 * `''`) so conditional classes read cleanly at call sites:
 *
 *   cx('btn', isActive && 'btn-active', disabled && 'btn-disabled')
 *
 * A local helper avoids pulling in `clsx` / `classnames` as a dependency for the
 * one thing this project needs from them (spec: "prefer a small local cx").
 */
export type ClassValue = string | false | null | undefined;

export function cx(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}
