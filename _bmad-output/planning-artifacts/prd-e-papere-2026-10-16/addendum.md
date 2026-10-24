---
title: "e-Paperé PRD — Addendum"
status: final
created: 2026-10-16
updated: 2026-10-16
---

# e-Paperé PRD — Addendum

Captures material that informed the PRD but belongs in downstream artifacts (Architecture, UX, Solution Design). Decisions, overrides, and audit content are never stored here — those go in `.memlog.md`.

---

## A. Recording Storage — Options Considered (OD-R01 — APPROVED: Option A) ✅

The PRD recommends link-based management (Option A) as the MVP default for class recordings. This note preserves the rationale for Architecture.

**Option A — Link-based (APPROVED for MVP)** ✅
- Teachers or administrators enter a URL pointing to an existing recording hosted externally (Zoom cloud recording, Google Drive, an approved external host).
- The platform stores the URL and access-controls exposure: only students with a valid entitlement see the link.
- No video infrastructure required. No storage cost for recordings on the platform itself.
- Tradeoff: recordings can become unavailable if the external host removes or expires them. Institute must manage its Zoom cloud recording retention separately.

**Option B — Direct file upload**
- Recordings uploaded as files into the platform's private object storage.
- Full control over availability and access.
- Significant ongoing storage cost at scale (Zoom recordings are large). Not appropriate for an MVP without a confirmed storage budget.

**Architecture phase must:**
- Option A is confirmed. Architecture must define: which external hosts are approved (Zoom cloud, Google Drive, or institute-approved equivalent), whether the platform validates that a URL is accessible at entry time, and how expired or removed recordings are surfaced to students (e.g., a broken-link indicator rather than silent failure).
- The access control layer must be designed to permit future integration with dedicated video hosting or streaming services (NFR-EXT-004) without structural redesign.

---

## B. Invoice and Payment Model — Data Relationships (for Architecture reference)

### Invoice structure

A student has **one invoice per billing month**. That invoice contains **one line item per enrolled course** for that month. This allows a single monthly invoice to cover all of a student's courses rather than issuing separate invoices per subject.

```
Invoice
  ├── student (ref)
  ├── billing_month (YYYY-MM)
  ├── generation_date
  ├── payment_deadline
  ├── status: UNPAID | PARTIAL | PAID | OVERDUE
  └── line_items[]
        ├── course (ref)
        ├── fee (server-side calculated at generation time)
        ├── payment_status: UNPAID | ALLOCATED | PAID
        └── access_entitlement (ref, created on verified full allocation)
```

### Payment submission structure

A payment submission records one bank transaction and its allocation against one or more invoice line items.

```
PaymentSubmission
  ├── student (ref)
  ├── bank_slip_file (ref, private storage)
  ├── evidence_items[] (appended on clarification, each with upload_timestamp)
  ├── student_stated_total (entered by student at submission)
  ├── verified_amount (confirmed by finance admin from bank records)
  ├── status: SUBMITTED | UNDER_REVIEW | APPROVED | REQUIRES_CLARIFICATION | REJECTED
  ├── claimed_by (finance admin ref, set on claim)
  ├── allocations[]
  │     ├── invoice_line_item (ref)
  │     ├── allocated_amount (finance admin confirms or adjusts before approval)
  │     └── allocation_status: PENDING | APPROVED | REJECTED
  └── audit_trail[] (actor, timestamp, action, notes — immutable)
```

### Key invariants

- **Verified amount**: the amount the finance administrator confirms from actual bank records. Not the student's stated amount.
- **Allocated amount**: the portion of the verified amount assigned to a specific line item by the finance administrator.
- **Outstanding balance** for a line item: `line_item.fee − sum(approved allocated_amounts for that line item)`.
- **Unallocated excess**: `verified_amount − sum(all allocated_amounts across all line items in this submission)`.
- A line item receives an **access entitlement** only when its full fee is covered by the confirmed allocation (`allocated_amount ≥ line_item.fee`).
- Partial coverage of a line item does not generate an entitlement — it leaves an outstanding balance.
- The unallocated excess is recorded on the submission; it does not automatically carry forward to future invoices.

### Finance administrator's verification task for a multi-course payment

1. Confirm the actual bank deposit amount (verified amount).
2. Compare to the student's stated allocation across line items.
3. Adjust allocations if needed (e.g., deposit differs from stated amount, or student mis-allocated).
4. Decide which specific line items are fully covered.
5. Approve: system atomically creates access entitlements for all fully covered line items.
6. Record disposition of any unallocated excess (overpayment noted, or allocations adjusted to cover additional line items).

All decisions are manual — no auto-allocation logic exists in the MVP.

---

## C. Billing Cycle Timing — Worked Example

For Architecture reference: how the default timing rules interact.

**Scenario**: Ongoing enrollment for November 2026.

| Event | Date | Triggered By |
|---|---|---|
| October 25 | Renewal invoice for November generated | Scheduled monthly batch |
| November 1 | Billing month begins | Calendar |
| November 10 | Payment deadline | Configured deadline |
| November 11 (if unpaid) | Invoice marked OVERDUE; reminder notification triggered | System |
| Any date before deadline | Student uploads slip | Student action |
| After upload | Finance admin claims, verifies, approves | Manual verification |
| After approval | November access activated automatically | System |

**New enrollment scenario** (student enrolls November 5):
| Event | Date |
|---|---|
| November 5 | Enrollment request submitted; invoice generated immediately |
| November 10 | Payment deadline (same as ongoing students) |
| After payment approval | Access activated for November |

Note: a student enrolling on November 9 and paying the same day will see the deadline as November 10 — one day. This is acceptable under the "full month fee regardless of enrollment date" rule.

---

## D. Account State Machine — Transition Authority Reference

For UX and Architecture reference.

| Transition | From | To | Who Can Initiate |
|---|---|---|---|
| Self-registration completes | PENDING_ACTIVATION | ACTIVE | System (student completes in-session) |
| Admin-assisted activation | PENDING_ACTIVATION | ACTIVE | Student (completes via one-time link) |
| Suspend | ACTIVE | SUSPENDED | Administrator, Super Administrator |
| Reinstate | SUSPENDED | ACTIVE | Administrator, Super Administrator |
| Disable | ACTIVE or SUSPENDED | DISABLED | Super Administrator only |
| Reactivate | DISABLED | ACTIVE | Super Administrator only |
| Account recovery reset | Any ACTIVE | ACTIVE (new credential) | Administrator or Super Administrator initiates; student completes |

---

## E. Duplicate Detection — Adjudication Notes

The PRD requires name + grade + DOB as the duplicate detection minimum. This note captures the adjudication intent for UX design.

When a potential duplicate is found:
1. System presents the candidate match(es) side-by-side with the incoming record.
2. Administrator must take one of: **Confirm as new** (proceed; records are genuinely different students), **Merge** (incoming is the same student as an existing record; flag for administrator to map any incoming data to the existing EP ID), **Defer** (hold for later review; incoming record not committed).
3. Auto-merge based on name alone is prohibited.
4. Records with name only (no DOB, no grade) cannot be auto-activated.

For bulk import: each flagged row is surfaced in the post-import review queue, not during the batch run itself (to avoid blocking the entire import on individual record issues).

---

## F. WhatsApp Template Candidates

Administrator communication templates the system should support (copyable, not automated). For UX design reference.

| Trigger | Template Purpose |
|---|---|
| Enrollment confirmed | "Your enrollment for [Course] — [Month] has been received. Your invoice is ready on the portal." |
| Payment slip received | "We have received your payment slip for [Month]. Our team will verify shortly." |
| Payment approved | "Your payment for [Course] — [Month] has been verified. You can now access your class materials and Zoom link on the portal." |
| Clarification needed | "We need a little more information about your [Month] payment. Please check the portal for details." |
| Payment rejected | "Unfortunately we could not verify your [Month] payment. Please check the portal for the reason and resubmit." |
| Overdue reminder | "Your [Month] payment for [Course] is overdue. Please submit your payment slip through the portal to restore access." |

---

## G. Bulk Import Field Specification (for PRD FR-MIG-003 reference)

Suggested CSV column set for Architecture phase to finalize.

**Required columns:**
- `student_full_name`
- `grade` (integer 6–11)

**Optional columns:**
- `date_of_birth` (ISO 8601: YYYY-MM-DD)
- `guardian_name`
- `guardian_phone`
- `guardian_whatsapp`
- `enrolled_courses` (pipe-separated list of course identifiers, e.g., `MATH-G9-THEORY|SCI-G9-THEORY`)
- `payment_history` (pipe-separated list of `COURSE-YYYY-MM-AMOUNT` tuples; imported as UNVERIFIED)

**Validation rules:**
- `student_full_name` + `grade` must both be present for a row to be processable.
- If `date_of_birth` is absent, duplicate detection weakens to name + grade only — row is flagged for manual review regardless of duplicate match.
- `enrolled_courses` values must match configured course identifiers at import time; unrecognised values flagged.
- `payment_history` entries are never auto-approved; they seed UNVERIFIED records for reconciliation.

Architecture phase defines the exact file format (CSV encoding, column header names, maximum row count per batch) and validates against data quality constraints.

---

## H. Internationalization and Localization — UX and Architecture Depth Notes

*Added by bilingual amendment, 2026-10-16. Supports FR-I18N and NFR-I18N requirements.*

---

### H.1 UX Design Responsibilities

The UX phase must explicitly address each of the following. These are not implementation decisions — they are UX design constraints that must be resolved before component design begins.

| UX concern | Requirement reference |
|---|---|
| Language-switcher placement and visual design | FR-I18N-002 — must be visible on pre-login, registration, login, and all authenticated screens |
| Language selection before registration begins | FR-I18N-003 — accessible without an account |
| Sinhala and English font pairing | NFR-I18N-001, NFR-I18N-002 — legible at all text sizes, verified on mobile |
| Mobile-first bilingual layouts | NFR-I18N-003 — no clipping or overlapping at any supported viewport |
| Text expansion and wrapping strategy | NFR-I18N-003 — Sinhala text can be longer than English equivalents in some contexts and shorter in others; layouts must flex in both directions |
| Form field and validation message display | FR-I18N-007 — all validation and error messages translated; no raw keys visible |
| Bilingual payment workflow screens | FR-I18N-007, FR-I18N-009 — payment statuses, clarification reasons, and approval messages in both languages |
| Bilingual notification display | FR-I18N-009 — notifications delivered in recipient's selected language |
| Language identification for screen readers | NFR-I18N-008 — HTML `lang` attribute set correctly; assistive technology announces content in the right language |
| Consistent design-system behavior across languages | NFR-I18N-005 — same term translated the same way everywhere; component library must support both scripts |
| WCAG 2.1 AA → 2.2 AA gap analysis | NFR-ACCESS-002 — document gaps, resolve within MVP where feasible, defer remainder with explicit record |

The UX team must walk all five user journeys (UJ-1 through UJ-5) in Sinhala and verify no screen contains an untranslated system string, clipped text, or broken layout.

---

### H.2 Architecture Responsibilities

The following are Architecture-phase decisions (OD-ARCH-06, OD-ARCH-07, OD-ARCH-08). PRD requirements are stated; implementation choices belong here.

**i18n library and file organization (OD-ARCH-06)**

Architecture must select and document:
- React i18n library (e.g., `react-i18next`, `lingui`, or equivalent). Selection criteria: bundle size impact on mobile, TypeScript support, namespace/key organization, plural/gender handling for both languages.
- Translation file structure: namespace per module (e.g., `auth`, `enrollment`, `payment`, `admin`) vs. single flat file. Namespacing is recommended for a codebase of this scale.
- Key naming convention: must be stable (not display-text-based), so renaming a label does not break a key reference.
- Language preference storage: where the preference is stored (cookie, `localStorage`, authenticated user profile in the database) and how it is retrieved on session resume. User-profile storage is preferred for authenticated users so the preference follows them across devices.
- Fallback chain: if a key is missing in `si-LK`, fall back to `en`; never display a raw key or empty string (NFR-I18N-006).
- Backend error codes: all API error responses must return a stable machine-readable code (not a human-readable English string) so the frontend can look up the correct translation for each language (FR-I18N-007).
- Default language: configurable by Super Administrator via the administration interface without code changes (FR-I18N-006).

**Sinhala Unicode font strategy (OD-ARCH-07)**

Architecture must specify:
- The Sinhala Unicode web font(s) to be used. Candidates: Noto Sans Sinhala (Google Fonts), Yaldevi, or a system font stack that reliably covers `si-LK` on Android and iOS.
- Web font loading strategy: `font-display: swap` with a system-font fallback to prevent invisible text during load (FOIT). This is especially important on low-bandwidth Sri Lankan mobile connections.
- Performance budget: Sinhala web fonts can be 300–800 kB. Architecture must document the acceptable font payload and the subsetting or variable-font strategy used to stay within it.
- Rendering verification: the QA plan must include rendering tests on representative low-end Android devices.

**Automated missing-translation-key detection (OD-ARCH-08)**

Architecture must include a CI/CD check that:
- Compares translation key sets between `en` and `si-LK` on every pull request.
- Fails the build (or raises a blocking warning) if keys are present in one language file and absent in the other.
- This check is the primary safeguard against the "partial translation" risk identified in §11.

**MongoDB and Unicode (supporting FR-I18N-004)**

MongoDB stores strings as UTF-8 by default, which correctly handles Sinhala Unicode (U+0D80–U+0DFF). Architecture must verify:
- All string fields that may contain Sinhala text (student names, course names, announcement bodies, clarification notes) use `String` type in Mongoose schemas — no `Buffer` or binary encoding.
- Text indexes for search must use the appropriate collation or a Unicode-aware search strategy. MongoDB's default text search does not support Sinhala stemming; Architecture must decide whether simple substring matching is acceptable for MVP search use cases.

---

### H.3 Translation Scope Reference

For use by the translation team and UX. Organized by module.

| Module | Key content areas requiring translation |
|---|---|
| Pre-auth | Landing page, language selector, registration form labels and instructions, login form, activation link instructions, account recovery instructions |
| Student dashboard | Welcome message, enrollment status, invoice summary, payment status labels, access status indicators, Zoom link labels, materials library labels, recording library labels, schedule display, announcement banners |
| Enrollment | Course browser labels, enrollment request flow, withdrawal confirmation |
| Invoice and payment | Invoice table headings, line item labels, fee display, deadline display, overdue status, payment submission form, bank-slip upload instructions, allocation UI, payment status labels (all seven states) |
| Notifications | All 13 notification event types defined in FR-NOTIF-001; WhatsApp template variants in both languages (FR-NOTIF-002) |
| Admin dashboard | Student list headings, account status labels, enrollment actions, migration status labels, flagged record indicators |
| Finance dashboard | Queue headings, claim/lock indicators, outcome buttons, clarification reason field labels, audit trail column headings, partial/excess/unmatched flags |
| Teacher dashboard | Course roster headings, access status labels, Zoom entry form labels, material upload labels, recording entry form labels |
| Owner dashboard | Metric labels, report filter labels, revenue summary headings |
| Validation and errors | All form validation messages, all API error code translations, access restriction messages, confirmation dialog text |
| Account management | Account state labels (PENDING_ACTIVATION, ACTIVE, SUSPENDED, DISABLED), activation link instructions, recovery instructions, role labels |

*User-generated free text (clarification notes, investigative notes, admin-entered payment notes) is displayed as entered and is not translated.*
