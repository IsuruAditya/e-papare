/**
 * StatusPill label dictionary — self-contained bilingual stopgap (Story 1.6).
 *
 * Labels are copied VERBATIM from EXPERIENCE.md "Status language" table. The
 * semantic token mapping follows DESIGN.md's pill-background guidance:
 *   success-bg : Active, Approved, Access Active
 *   warning-bg : Pending, Due Soon, Needs Clarification, Partial-adjacent
 *   danger-bg  : Rejected, Suspended, Overdue, Error, Access Locked, Disabled
 *   info-bg    : Under Review, Clarification, Partial, Submitted
 *
 * ── Story 1.7 migration path ──────────────────────────────────────────────
 * This module is the ONLY place a hardcoded user-facing label lives. When the
 * centralized i18n runtime lands (Story 1.7), `statusLabels[status][lang]` is
 * replaced by `t('status:' + status)` and this file is deleted — nothing else
 * in the component library needs to change. Recorded in deferred-work.md.
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

/** Language for the status label. Default `'en'` until Story 1.7 supplies context. */
export type StatusLang = 'en' | 'si';

/** The four semantic color families a pill can resolve to (DESIGN.md Colors). */
export type StatusTokenName = 'success' | 'warning' | 'danger' | 'info';

/**
 * en/si labels — exact strings from the EXPERIENCE.md status table. Do not
 * paraphrase; a drift here is a translation defect.
 */
export const statusLabels: Record<StatusKey, { en: string; si: string }> = {
  PENDING_ACTIVATION: { en: 'Pending Activation', si: 'සක්‍රිය කිරීම් අපේක්ෂිත' },
  ACTIVE: { en: 'Active', si: 'සක්‍රිය' },
  SUSPENDED: { en: 'Suspended', si: 'අත්හිටුවා' },
  DISABLED: { en: 'Disabled', si: 'අක්‍රිය' },
  SUBMITTED: { en: 'Submitted', si: 'ඉදිරිපත් කරන ලදී' },
  UNDER_REVIEW: { en: 'Under Review', si: 'සමාලෝචනය යටතේ' },
  APPROVED: { en: 'Approved', si: 'අනුමත' },
  REQUIRES_CLARIFICATION: { en: 'Needs Clarification', si: 'පැහැදිලිකිරීමක් අවශ්‍යයි' },
  REJECTED: { en: 'Rejected', si: 'ප්‍රතික්ෂේප' },
  OVERDUE: { en: 'Overdue', si: 'කාලය ඉකුත්' },
  PARTIAL: { en: 'Partial Payment', si: 'අර්ධ ගෙවීමක්' },
  UNMATCHED: { en: 'Unmatched', si: 'නොගැළපෙන' },
  ACCESS_ACTIVE: { en: 'Access Active', si: 'ප්‍රවේශය සක්‍රිය' },
  ACCESS_LOCKED: { en: 'Access Locked', si: 'ප්‍රවේශය අවහිර' },
};

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
  return Object.prototype.hasOwnProperty.call(statusLabels, value);
}
