---
title: "e-Paperé — Brief vs. PRD Reconciliation Report"
created: 2026-10-16
source: brief-epapere-2026-10-16/brief.md
target: prd-e-papere-2026-10-16/prd.md + addendum.md
---

# Brief vs. PRD Reconciliation Report

**Input:** `_bmad-output/planning-artifacts/brief-epapere-2026-10-16/brief.md`
**Against:** `prd-e-papere-2026-10-16/prd.md` + `prd-e-papere-2026-10-16/addendum.md`

---

## 1. Fully Covered Items

The following brief items are substantively reflected in the PRD with equivalent or stronger treatment:

- Problem statement and the specific WhatsApp-group failure to eliminate
- All five user roles and RBAC matrix (Student, Teacher, Finance Admin, Admin, Super Admin)
- EP Student ID generation, format, permanence, and immutability
- Four account states (PENDING\_ACTIVATION / ACTIVE / SUSPENDED / DISABLED) and full state-machine transitions
- Student ID + password authentication, no email/phone required, no OTP, rate limiting, session management
- Admin-assisted registration flow and one-time activation link
- Guardian contact as optional, stored-but-no-portal-access (FR-REG-007)
- Course model: subject + grade + teacher + category, persistent across months, not recreated monthly
- Calendar-month invoice generation (on-enrollment, scheduled batch, admin manual), idempotency, deduplication
- Full monthly fee, no prorating (FR-INV-011, BR-INV-07)
- Payment verification queue: claim/lock, three outcomes, evidence append model, no concurrent review
- Multi-course single-payment submission with explicit allocation (FR-PAY-003, UJ-3)
- Partial, excess, and unmatched payment handling (FR-PAY-014–016)
- Duplicate approval and duplicate access activation prevention
- Historical content access policy (⚠️ proposed, configurable by Super Admin)
- Link-based recording management as MVP default (OD-R01, addendum §A)
- In-app notifications for all key events; copyable WhatsApp templates; decoupled notification architecture
- Existing student migration: individual and bulk import, duplicate detection, UNVERIFIED payment import
- Counter-metrics (duplicate records, conflicting claims, access-not-activated support requests)
- Non-functional requirements: performance scale scenarios, extensibility for deferred features, WCAG 2.1 AA, RBAC at API layer
- All legal/compliance items flagged (child data, guardian consent, content licensing, data residency)
- Out-of-scope list: guardian accounts, OTP, payment gateway, WhatsApp API, SMS, Zoom API, grading, mobile apps, dual-approval

---

## 2. Gaps — Brief Items Not Covered or Covered More Weakly

### GAP-1: Counter-Metrics missing from PRD success criteria section
The brief (§6) defines three counter-metrics explicitly:
- Admin time correcting duplicate student records
- Finance admin time resolving conflicting payment claims
- Student support requests for access not activated after payment

The PRD (§3) includes these verbatim in the "Counter-Metrics" subsection. **No gap on substance**, but the PRD does not attach any measurement methodology or baseline-capture plan. The brief's implicit intent — that these are lagging signals of system failure, not just tracking items — is present in the brief's framing ("signals duplicate detection failure") and absent from the PRD's table format.

**Severity:** Low. Qualitative intent dropped in translation to tabular format.

---

### GAP-2: Incremental migration transition phases not named or sequenced in PRD
The brief (§7, Operational constraints) names the migration transition as a phased sequence:
> Preparation → Migration → Pilot → Gradual Adoption → Portal-Centered Operations

The PRD references the principle ("must not disrupt ongoing operations") in FR-MIG-011 but does not name, sequence, or describe the phases. No migration phase entry/exit criteria appear anywhere in the PRD or addendum.

**Severity:** Medium. Architecture and project planning will need to reconstruct this from the brief. Risk: phases may be collapsed or skipped under delivery pressure.

---

### GAP-3: Self-service account recovery explicitly deferred in brief; PRD defers but does not record the MVP floor clearly in the FR table
The brief (§8, Decision #10) states:
> "MVP floor confirmed: admin-initiated reset; self-service token flow deferred to Architecture."

The PRD captures this as OD-ARCH-03 in the Open Decision Register and in FR-AUTH-008, which describes admin-initiated recovery. However, **no FR item explicitly states that self-service token-based recovery is out of scope for MVP**. A developer reading only §5 (MVP Scope) and §7 (FR-AUTH) would not find a prohibition — only the absence of a requirement. The out-of-scope list in §5 omits this item.

**Severity:** Medium. Omission from out-of-scope list creates implementation risk.

---

### GAP-4: "Owner dashboard" naming inconsistency — brief uses "Owner"; PRD uses "Super Administrator"
The brief (§5, In Scope) refers to the fifth dashboard as **"Owner dashboard: enrollment totals, verified revenue, outstanding invoices, operational summary."**
The PRD consistently uses "Super Administrator dashboard" throughout, including in FR-REPORT-001 and §4 (Users and Roles).

The brief and PRD treat these as the same role with the same capabilities. However, the brief's language reflects how the institute owner thinks about their own role ("Owner"), while the PRD's "Super Administrator" is a system-level abstraction. No reconciliation note or alias mapping exists in the PRD.

**Severity:** Low–Medium. UX and onboarding language will conflict with role configuration unless explicitly aliased or documented.

---

### GAP-5: Risk register from brief not carried into PRD
The brief (§8, Risks) contains a structured risk table with six named risks, impact levels, and mitigation notes:
- Low student adoption of self-registration → admin bottleneck
- In-app notifications unseen → students don't check portal
- Payment verification bottleneck at scale
- Migration data quality
- Scope creep during build
- Child data protection and safeguarding obligations

The PRD contains no risk register or equivalent section. The legal/compliance items appear in §10 and §11, but the operational and product risks (adoption, notification blindness, scope creep) are not recorded anywhere in the PRD or addendum.

**Severity:** Medium. Risk awareness that informed the brief's design decisions (e.g., why WhatsApp templates are required, why admin-assisted path must remain available) is absent from the PRD. Future reviewers lose the rationale.

---

## 3. Qualitative Items Silently Dropped by FR Structure

### Q-1: "Student-first" framing
The brief opens and closes with a distinct voice: *"student-first management and access-control layer."* This framing appears in the PRD's §1 Purpose and Scope — once. The brief returns to this framing in §4 (Business Value) and §9 (What This Is Not) to anchor scope decisions. In the PRD, the FR table structure shifts the document's centre of gravity toward system behaviour rather than student experience. The "student-first" principle is not stated as a design constraint that reviewers apply when evaluating trade-offs.

### Q-2: Compounding value of data — not just operational relief
The brief (§4) explicitly distinguishes:
1. **Immediate value:** administrators stop doing the same manual work every month.
2. **Compounding value:** for the first time, the institute has a reliable, queryable record — the foundation for every future business decision.

The PRD's BO-05 captures this as a business objective ("Create the institute's first reliable, queryable record") but loses the forward-looking framing. The brief's language signals that data quality is a strategic investment, not just a feature. This informs why audit trails and immutable records are non-negotiable — a reasoning chain absent from the PRD.

### Q-3: Designed for a Grade 6 student on a phone
The brief's user description for Students explicitly states: *"The system must not assume every student has a personal phone number or email address."* The brief's risk section flags: *"self-registration UX must be simple enough for a Grade 6 student."* The PRD captures the no-email/no-phone requirement in FR-AUTH-001 and FR-REG-001, and NFR-ACCESS-001 states the portal must be usable by young adolescents. However, the performance constraint context — that the registration flow must be completable on a phone browser, including by a first-time web user with a parent present — is not stated as a UX constraint. UX phase will need to recover this from the brief.

### Q-4: WhatsApp as a permanent supplementary channel, not a legacy to eliminate
The brief (§7, Operational) states: *"WhatsApp remains a supplementary channel throughout and beyond the transition."* The PRD treats WhatsApp templates as a notification feature. The brief's intent is broader: WhatsApp is a permanent operational reality of this business, not a transition scaffold. This shapes how administrators think about their workflow — the portal does not replace WhatsApp communication, it replaces WhatsApp *as an access-control mechanism*. The PRD's notification section does not carry this nuance.

---

## 4. Contradictions Between Brief and PRD

No outright contradictions found. The PRD is a faithful expansion of the brief on all confirmed (✅) items.

One near-contradiction to watch:
- **Brief §8, Decision #2** lists "Invoice generation date, payment deadline, grace period, late-enrollment pricing" as open institute decisions with *no recommended positions*.
- **PRD §8 BR-INV-03 and BR-INV-05** treat the 25th and 10th defaults as working positions (⚠️), which is consistent — but these are now framed as business rules rather than open decisions. A reader of the PRD's business rules section could reasonably interpret them as settled. The ⚠️ markers mitigate this but do not eliminate the risk of premature treatment as fixed constraints.

---

## Summary

**Input:** `brief-epapere-2026-10-16/brief.md`

**Gaps found (5 key):**
1. Counter-metric intent (failure signals) flattened to tracking table — qualitative reasoning lost
2. Migration transition phases (Preparation → Migration → Pilot → Gradual Adoption → Portal-Centered) not carried into PRD or sequenced
3. Self-service account recovery not listed in MVP out-of-scope — implementation risk
4. "Owner" (brief) vs. "Super Administrator" (PRD) — no alias mapping documented
5. Risk register (6 named risks with mitigations) not carried into PRD at all

**Output file:** `_bmad-output/planning-artifacts/prd-e-papere-2026-10-16/reconcile-brief.md`
