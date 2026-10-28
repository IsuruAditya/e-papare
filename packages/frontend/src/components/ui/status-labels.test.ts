import { describe, it, expect } from 'vitest';
import { statusLabels, statusToken, isStatusKey, type StatusKey } from './status-labels';

/**
 * The authoritative EXPERIENCE.md "Status language" table. A drift between this
 * fixture and the shipped map is a translation defect — these must stay verbatim.
 */
const EXPECTED: Record<StatusKey, { en: string; si: string }> = {
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

describe('status-labels — EXPERIENCE.md contract', () => {
  it('declares exactly the 14 EXPERIENCE.md status states', () => {
    expect(Object.keys(statusLabels).sort()).toEqual(Object.keys(EXPECTED).sort());
  });

  it('matches every en and si label verbatim against EXPERIENCE.md', () => {
    for (const [status, labels] of Object.entries(EXPECTED) as [
      StatusKey,
      { en: string; si: string },
    ][]) {
      expect(statusLabels[status].en, `${status}.en`).toBe(labels.en);
      expect(statusLabels[status].si, `${status}.si`).toBe(labels.si);
    }
  });

  it('maps every status to one of the four semantic token families', () => {
    const allowed = new Set(['success', 'warning', 'danger', 'info']);
    for (const status of Object.keys(statusLabels) as StatusKey[]) {
      expect(allowed.has(statusToken[status]), `${status} token`).toBe(true);
    }
  });

  it('isStatusKey accepts known keys and rejects unknown ones', () => {
    expect(isStatusKey('APPROVED')).toBe(true);
    expect(isStatusKey('definitely-not-a-status')).toBe(false);
  });
});
