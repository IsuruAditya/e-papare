---
title: "e-Paperé PRD — Reconciliation Against Master Requirements"
created: 2026-10-16
source: docs/project/master-requirements.md
prd: _bmad-output/planning-artifacts/prd-e-papere-2026-10-16/prd.md
addendum: _bmad-output/planning-artifacts/prd-e-papere-2026-10-16/addendum.md
---

# Reconciliation: master-requirements.md → prd.md + addendum.md

---

## 1. Items Fully Covered

The following master-requirements sections are fully and faithfully reflected in prd.md (and addendum.md where noted):

- **§1 Project Overview** — purpose, scope statement, country, live-institute context, "not an LMS" framing. Covered in PRD §1.
- **§2 Business Problem** — WhatsApp manual loop, the specific failure to eliminate. Covered in PRD §2.
- **§3 Business Objectives** — BO-01 through BO-07 and all four primary success criteria. Covered in PRD §3.
- **§4 Target Users** — all five confirmed roles plus guardian deferral. Covered in PRD §4.
- **§5 Confirmed MVP Scope** — all in-scope items, including migration five-stage plan and bulk import field set note. Covered in PRD §5.
- **§6 Out-of-Scope Features** — all exclusions. Covered in PRD §5 Out of Scope.
- **§7 Role Matrix and Key Constraints** — full RBAC matrix including password-retrieval prohibition. Covered in PRD §4 RBAC Matrix.
- **§8 Student Registration and Authentication** — self-registration flow, admin-assisted flow, four account states, state machine, duplicate detection. Covered in PRD FR-REG and FR-AUTH.
- **§9 Student ID Management** — EP-000001 format, permanence, grade independence, migration parity. Covered in PRD FR-REG-003, FR-REG-013, FR-MIG-006.
- **§10 Course Model** — persistent courses, configurable categories, teacher assignment. Covered in PRD FR-COURSE.
- **§11 Enrollment and Access Entitlement** — persistent enrollment, payment lapse rules, per-period access, Zoom blocked for unpaid periods, migrated student activation. Covered in PRD FR-ENROL and FR-ACCESS.
- **§12 Invoices and Payment Verification** — all three invoice triggers, deduplication, server-side fee, two payment lanes, state machine, claim/lock, three outcomes, duplicate-approval prevention, audit trail, single-verifier rule. Covered in PRD FR-INV and FR-PAY plus Business Rules BR-INV/BR-PAY.
- **§13 Zoom and Learning Resources** — management-layer only, manual entry, private storage for uploads, access restriction, recording link model. Covered in PRD FR-LEARN.
- **§14 Notifications** — all event triggers, WhatsApp template bridge, decoupled notification architecture. Covered in PRD FR-NOTIF.
- **§15 Migration Five-Stage Plan** — all five stages and the live-operation constraint. Covered in PRD FR-MIG-011 and §5 In Scope.
- **§15 Migration Data Quality** — validation, duplicate detection, UNVERIFIED imports, audit trail, no duplicate creation. Covered in PRD FR-MIG.
- **§16 Administrative Reports** — all four dashboards with correct role scoping. Covered in PRD FR-REPORT.
- **§17 FR-REG through FR-REPORT** — all functional requirement IDs present in prd.md (with expanded detail in some areas).
- **§18 NFRs** — performance (deferred), availability, maintainability, extensibility, testability, accessibility. Covered in PRD §9.
- **§19 Security and Privacy** — SEC-001 through SEC-016 (master-requirements numbering). Covered in PRD §10 SEC-001 through SEC-017.
- **§20 Mandatory Technology Stack** — React + TypeScript + Vite + Tailwind / Node.js + Express.js + TypeScript / MongoDB + Mongoose / modular monolith. Covered in PRD §1 and EQ table.
- **§21 Engineering Quality Standards** — EQ-001 through EQ-015. Covered in PRD §9 Engineering Quality Standards.
- **§22 Deployment and Production** — DEP-001 through DEP-010. Covered implicitly in PRD §9 NFRs and EQ; see Gap 2 below.
- **§23 Future Extensibility** — full deferred-feature list, guardian data-model constraint. Covered in PRD §9 NFR-EXT and OD-FUTURE register.
- **§24 Open Decisions** — OD-01 through OD-12. Covered in PRD §11 Open Decision Register with expanded structure.
- **Addendum A–G** — recording storage options (OD-R01), multi-course payment allocation, billing cycle timing, account state transition authority, duplicate adjudication, WhatsApp templates, bulk import field spec. All captured in prd.md addendum.md.

---

## 2. Gaps — Items in master-requirements.md Not Covered or Covered More Weakly

### Gap 1 — FR-REG master §8: Account Recovery Identity Verification Requirement Missing in master-requirements.md FR table, Present Only in PRD

**Direction: master → PRD (not a gap in the PRD — noting for completeness)**
The master-requirements §8 Account Recovery section states: *"administrator-initiated credential reset"* as the MVP floor, with self-service deferred. The master-requirements FR table (§17 FR-AUTH) captures this as FR-AUTH-007 and FR-AUTH-011, but FR-AUTH-011 only covers "initiate a reset without seeing the password." The stronger identity-verification precondition — *"the administrator must confirm student identity by independent means before initiating recovery"* (master-requirements §8) — **is present in the PRD** (FR-AUTH-009) but is **absent from the master-requirements FR table** (§17). Not a PRD gap, but the master-requirements FR table is incomplete on this point.

**No action required in PRD.**

---

### Gap 2 — §22 Deployment Requirements Not Represented as Named Requirements in the PRD

Master-requirements §22 contains ten explicit, numbered deployment requirements (DEP-001 through DEP-010) covering HTTPS, three-environment separation, secrets management, automated backups, production monitoring, rollback procedures, scalability, private storage, Sri Lankan compliance, and cost-appropriate provider selection.

The PRD covers most of these concerns inline (HTTPS in SEC-004, secrets in SEC-009/EQ-013, scalability in NFR-PERF-001), but **DEP-001 through DEP-010 are not cited or reproduced as a discrete deployment-requirements block in prd.md**. Three items have no clear PRD home:

- **DEP-002** (three separated environments: dev, staging, production) — no explicit PRD requirement.
- **DEP-005** (production monitoring and structured logging before launch) — no explicit PRD requirement.
- **DEP-006** (deployment rollback procedures defined and tested before launch) — no explicit PRD requirement.

**Recommendation**: Add a Deployment Requirements section to the PRD (or a note in §9 NFRs) citing DEP-002, DEP-005, and DEP-006 explicitly, or acknowledge they are Architecture-phase decisions with a reference.

---

### Gap 3 — §16 Administrator Dashboard Content Partially Weaker in PRD

Master-requirements §16 specifies the **Administrator Dashboard** content as: *"student management, enrollment assistance, access oversight, **migration status**."* The PRD FR-REPORT-003 reads: *"student list with account status, enrollment status and access status per student, **migration import status and flagged records**."* The PRD is actually **more specific** here, so no gap.

However, master-requirements §16 lists a **Student Dashboard** row — *"own enrollments, payment history, access status, Zoom links, materials, recordings"* — which corresponds to PRD FR-REPORT-005. Both are aligned. No gap here, noted for confirmation.

---

### Gap 4 — §11 Access Entitlement for Migrated Students: Explicit Requirement Weakened

Master-requirements §11 states, as a confirmed (✅) invariant: *"Access entitlements for migrated students are only activated after their payment has been confirmed through approved bank reconciliation."*

The PRD covers the UNVERIFIED import rule (FR-MIG-007, FR-PAY-018) but does not have an explicit access-activation gate tied specifically to migrated students as a distinct business rule in the BR-ACCESS or BR-ENROL tables. The constraint is implied by FR-PAY-018 + FR-ACCESS-002, but it is not stated as an explicit named rule.

**Recommendation**: Add a BR-ENROL or BR-MIG rule stating: *"Access entitlements for migrated student records are only activated after the imported payment record has been reconciled and approved; UNVERIFIED import status alone does not activate access."* This makes the invariant explicit rather than requiring inference.

---

### Gap 5 — §12 REQUIRES_CLARIFICATION Resubmission Model: Confirmed in PRD, Flagged ⚠️ in Master-Requirements — Status Mismatch

Master-requirements §12 marks the clarification resubmission model with *"PRD author to confirm"* (⚠️). The PRD has resolved this: FR-PAY-007 and BR-PAY-08 both confirm the append-to-existing-record model with full evidence history. The PRD is ahead of the master-requirements on this point.

**Action required in master-requirements.md**: update FR-PAY-011 status from ⚠️ to ✅ and remove the "PRD author to confirm" note — it has been confirmed in prd.md.

*(This is a master-requirements maintenance item, not a PRD gap.)*

---

### Gap 6 — §11 Monthly Billing Model Open Decisions: PRD Resolved, Master-Requirements Still Shows ⚠️ Open

Master-requirements §11 flags invoice generation date, payment deadline, grace period, and late-enrollment pricing rules as open (⚠️). The PRD has adopted working positions for all four:

- Invoice generation date: 25th of preceding month, configurable (FR-INV-002, OD-INV-01).
- Payment deadline: 10th of billing month, configurable (FR-INV-007, OD-INV-02).
- Grace period: explicitly removed — no grace-period access (FR-ACCESS-007, BR-ACCESS-05, OD-FUTURE-12).
- Late-enrollment pricing: full month fee always, no proration (FR-INV-011, BR-INV-07).

These are working positions (⚠️ pending final institute approval), not locked, but the PRD has materially advanced them. The master-requirements §11 no longer fully reflects the current working state.

**Action required in master-requirements.md** (optional, as master-requirements is the authoritative source): acknowledge these working positions or add a cross-reference to the PRD open-decision register. Not a PRD gap.

---

## 3. Confirmed Requirements That Appear Weakened or Missing in the PRD

**None found.** Every confirmed (✅) requirement in master-requirements.md is either directly reproduced in prd.md or is explicitly elevated and expanded. The PRD is additive relative to the master-requirements in all confirmed areas.

The one area where the PRD is structurally weaker is the absence of a discrete DEP-* block (Gap 2 above), but the substance of most DEP requirements is present elsewhere in the document.

---

## 4. Contradictions Between master-requirements.md and prd.md

**None found.** No confirmed (✅) requirement in master-requirements.md is contradicted by any statement in prd.md or addendum.md. All working positions (⚠️) in both documents are consistent in direction and flagging. Deferred items (🔲) align exactly.

One structural difference worth noting: the PRD's FR-AUTH table has 9 entries (FR-AUTH-001 through FR-AUTH-009) vs. the master-requirements §17 FR-AUTH table which has 7 entries (FR-AUTH-001 through FR-AUTH-007). The two additional PRD requirements (FR-AUTH-008: admin account recovery; FR-AUTH-009: identity verification precondition) are drawn from master-requirements §8 prose — they are not contradictions, they are the PRD being more explicit. The master-requirements FR table simply omitted them.

---

## 5. Superseded Requirements from §24 — Confirmed None Leaked Into the PRD

Master-requirements §24 "Confirmed Superseded Requirements" lists six items that must not appear in the PRD:

| Former Requirement | Leaked into PRD? |
|---|---|
| PENDING_GUARDIAN_VERIFICATION account state | **No.** PRD uses four-state model only: PENDING_ACTIVATION, ACTIVE, SUSPENDED, DISABLED (FR-REG-008, BR-ACCT-02). |
| Mandatory guardian linking before paid enrollment | **No.** FR-ENROL-006 and BR-ENROL-04 explicitly state guardian approval is not a prerequisite. |
| Age-dependent registration workflows (Grades 6–9 vs 10–11) | **No.** All Grades 6–11 follow the same lifecycle; no age-branch logic in any FR. |
| Three enrollment actors (student, guardian, administrator) | **No.** Only two actors: student and authorized administrator (FR-ENROL-001, FR-ENROL-002). |
| Dual-approval payment verification | **No.** FR-PAY-013 and BR-PAY-02 explicitly prohibit dual-approval and any configuration flags for it. |
| Mandatory OTP authentication | **No.** FR-AUTH-003 explicitly excludes OTP for normal flows. |

**Conclusion: Zero superseded requirements leaked into the PRD.**

---

## Summary

| Input | Gaps Found |
|---|---|
| `docs/project/master-requirements.md` | **5 actionable items** (2 PRD gaps, 3 master-requirements maintenance items) |

**Key gaps:**

1. **PRD Gap — DEP-002, DEP-005, DEP-006** (§22): Three deployment requirements — three-environment separation, production monitoring, and rollback procedures — have no explicit home in prd.md. Need a Deployment Requirements section or explicit Architecture-phase deferral note.
2. **PRD Gap — Migrated student access gate** (§11): The confirmed invariant that migrated student access activates only after approved bank reconciliation is implied but not stated as an explicit named business rule in the PRD. Needs a discrete BR-MIG or BR-ACCESS rule.
3. **Master-requirements maintenance — FR-PAY-011 status** (§17): Still marked ⚠️ "PRD author to confirm" but the PRD has confirmed the model. Update to ✅.
4. **Master-requirements maintenance — §11 Monthly Billing open decisions**: PRD has adopted working positions for all four open invoice timing items; master-requirements §11 does not reflect this advance.
5. **Master-requirements FR table incomplete — FR-AUTH identity verification precondition** (§8 vs §17): Mentioned in §8 prose, absent from §17 FR table. Minor traceability gap; PRD is correct.

**File:** `_bmad-output/planning-artifacts/prd-e-papere-2026-10-16/reconcile-master-requirements.md`
