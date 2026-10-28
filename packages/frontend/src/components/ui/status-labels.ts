import enStatus from '../../locales/en/status.json';
import siStatus from '../../locales/si/status.json';

/**
 * StatusPill status metadata.
 *
 * ── Story 1.7 i18n migration ──────────────────────────────────────────────
 * The 14 status strings now live in the centralized i18n `status` namespace
 * (`locales/{en,si}/status.json`) — the SINGLE source of truth. `StatusPill`
 * resolves its label via `t('status:<KEY>')`.
 *
 * Public-API compatibility (approved 2026-10-28): the Story-1.6 barrel exports
 * (`StatusKey`, `StatusLang`, `StatusTokenName`, `statusToken`, `isStatusKey`)
 * are preserved unchanged. `statusLabels` is retained as a DEPRECATED compat
 * export, now DERIVED from the i18n JSON so there is no second translation
 * system to maintain — the JSON is the one source and this object mirrors it.
 */

/** The 14 status states enumerated in EXPERIENCE.md "Status language". */
export type StatusKey =
  | 'PENDING_ACTIVATION'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'DISABLED'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REQUIRES_CLARIFICATION'
  | 'REJECTED'
  | 'OVERDUE'
  | 'PARTIAL'
  | 'UNMATCHED'
  | 'ACCESS_ACTIVE'
  | 'ACCESS_LOCKED';

/** Language for an explicitly-languaged status label. */
export type StatusLang = 'en' | 'si';

/** The four semantic color families a pill can resolve to (DESIGN.md Colors). */
export type StatusTokenName = 'success' | 'warning' | 'danger' | 'info';

/**
 * en/si labels — DERIVED from the i18n `status` namespace JSON (which holds the
 * EXPERIENCE.md strings verbatim). Retained for backward compatibility with the
 * Story-1.6 public barrel API.
 *
 * @deprecated Prefer `t('status:<KEY>')` via react-i18next. This object is a
 * compatibility shim over the centralized i18n resources.
 */
export const statusLabels: Record<StatusKey, { en: string; si: string }> = buildLabels();

function buildLabels(): Record<StatusKey, { en: string; si: string }> {
  const en = enStatus as Record<string, string>;
  const si = siStatus as Record<string, string>;
  const keys = Object.keys(en) as StatusKey[];
  const out = {} as Record<StatusKey, { en: string; si: string }>;
  for (const key of keys) {
    // Both namespaces share the same key set (enforced by validate-i18n), so the
    // `si` lookup is always present; fall back to `en` defensively.
    out[key] = { en: en[key] ?? key, si: si[key] ?? en[key] ?? key };
  }
  return out;
}

/**
 * Status -> semantic color family. Pills render
 * `bg-{token}-bg text-{token} border-{token}-border` from this map.
 */
export const statusToken: Record<StatusKey, StatusTokenName> = {
  PENDING_ACTIVATION: 'warning',
  ACTIVE: 'success',
  SUSPENDED: 'danger',
  DISABLED: 'danger',
  SUBMITTED: 'info',
  UNDER_REVIEW: 'info',
  APPROVED: 'success',
  REQUIRES_CLARIFICATION: 'warning',
  REJECTED: 'danger',
  OVERDUE: 'danger',
  PARTIAL: 'info',
  UNMATCHED: 'warning',
  ACCESS_ACTIVE: 'success',
  ACCESS_LOCKED: 'danger',
};

/** Runtime guard so a bad `status` prop renders nothing instead of crashing. */
export function isStatusKey(value: string): value is StatusKey {
  return Object.prototype.hasOwnProperty.call(statusToken, value);
}
