---
title: "Reconciliation: Brief Addendum → PRD (prd.md + prd-addendum.md)"
created: 2026-10-16
---

# Reconciliation Report — Brief Addendum vs. PRD

**Source:** `_bmad-output/planning-artifacts/brief-epapere-2026-10-16/addendum.md`
**PRD files checked:** `prd-e-papere-2026-10-16/prd.md`, `prd-e-papere-2026-10-16/addendum.md`

---

## 1. Confirmed Technical / Data Model Constraints — Coverage Check

| Brief Addendum Constraint | Covered in PRD? | Notes |
|---|---|---|
| EP ID format (EP-000001, sequential, backend-generated, permanent) | ✅ FR-REG-003, BR-ACCT-01, FR-REG-013 | Full coverage |
| Four account states; states independent of enrollment/payment | ✅ FR-REG-008, BR-ACCT-02 | Full coverage |
| Password: bcrypt, never stored plain, never viewable | ✅ FR-AUTH-002, SEC-001, BR-ACCT-06 | Full coverage |
| Rate limiting + brute-force protection + HTTPS | ✅ FR-AUTH-004, FR-AUTH-006, SEC-003, SEC-004 | Full coverage |
| Payment state machine (SUBMITTED → UNDER_REVIEW → APPROVED / REQUIRES_CLARIFICATION / REJECTED) | ✅ FR-PAY section, BR-PAY-* | Full coverage |
| Claim/lock model; no concurrent review | ✅ FR-PAY-004, BR-PAY-01 | Full coverage |
| Duplicate approval prevention | ✅ FR-PAY-011, FR-PAY-017 | Full coverage |
| Invoice deduplication per student + course + billing month | ✅ FR-INV-004, BR-INV-01 | Full coverage |
| Fee calculated server-side; client-submitted amounts rejected | ✅ FR-INV-005, EQ-004 | Full coverage |
| Notification event model decoupled from delivery channels | ✅ FR-NOTIF-003, NFR-EXT-003 | Full coverage |
| Guardian data model must support future promotion to guardian account without schema changes | ✅ NFR-EXT-002 | Full coverage |
| MongoDB: authenticated connections, least-privilege, appropriate indexing from day one | ✅ EQ-006, EQ-012, SEC-011 | Full coverage |
| Modular monolith; future service extraction must be possible | ✅ NFR-MAINT-003 | Full coverage |
| Financial operations use transactional patterns appropriate for MongoDB | ✅ EQ-007 | Full coverage |
| Audit log for all financially significant events and admin account actions | ✅ EQ-008 | Full coverage |

---

## 2. Gaps — Constraints in Brief Addendum NOT Covered (or Weaker) in prd.md / prd-addendum.md

### GAP-1: MongoDB indexing, pagination, and "efficient API design from day one" — underspecified as an NFR

**Brief addendum (§A):** "MongoDB indexing, pagination, and efficient API design from day one" listed as a confirmed architecture principle.

**PRD coverage:** EQ-012 addresses indexing and pagination but is buried in Engineering Quality Standards, not surfaced as an NFR. There is no NFR or business rule that explicitly requires all list endpoints to be paginated and that unbounded queries are prohibited as a production constraint (EQ-012 says this once, but no acceptance-testable NFR enforces it). The PRD's NFR-PERF section defers all performance targets entirely to Architecture phase without anchoring even a "no unbounded queries" floor.

**Recommendation:** Add an NFR under NFR-MAINT or NFR-PERF: "All list-returning API endpoints must implement pagination. Unbounded queries against student, invoice, payment, or enrollment collections are prohibited." This makes EQ-012 enforceable.

---

### GAP-2: Scaling scenario user count dimensions — only referenced in NFRs, not binding on Architecture

**Brief addendum (§B):** Explicitly states the PRD *must* distinguish three user count dimensions (total registered students, monthly active users, simultaneous users) and that architecture *must not require fundamental redesign* to move between Small/Medium/Large tiers.

**PRD coverage:** NFR-PERF-001 and NFR-PERF-002 reference the three scenarios and dimensions but mark both as 🔲 (deferred). The constraint that the architecture must be able to move between tiers without redesign is there, but the three user-count dimension definitions are listed purely as a planning note — there is no binding requirement that Architecture phase must deliver a capacity model against all three dimensions before build starts.

**Recommendation:** Promote the three-dimension distinction to a firm Architecture gate requirement (not just an NFR note). Architecture phase must produce a capacity model covering all three dimensions before any build milestone is approved.

---

### GAP-3: Deployment infrastructure mandatory requirements — absent from PRD NFRs

**Brief addendum (§H — marked 🔲):** Lists nine mandatory deployment requirements that Architecture must satisfy: environment separation (dev/staging/prod), automated database backups with *tested* restoration procedures, production monitoring and structured logging, deployment rollback procedures, CI/CD pipeline, private object storage, secret management, and infrastructure scalability path.

**PRD coverage:** The PRD references CI/CD (EQ-011), secret management (EQ-013, SEC-009), and private object storage (SEC-008) in isolation. However, environment separation, automated backups with *tested* restoration, production monitoring and structured logging, and rollback procedures are not present anywhere in prd.md or prd-addendum.md — not even as deferred NFRs. These are not optional polish; they are safety-critical for a live institute migrating existing students.

**Recommendation:** Add an NFR-DEPLOY group (or expand NFR-AVAIL) covering: environment separation, automated + tested backup/restore, monitoring and structured logging, and rollback capability. Mark as 🔲 Architecture phase but make them gating Architecture deliverables, not advisory notes.

---

### GAP-4: Sri Lankan payment infrastructure context and gateway pre-conditions — not reflected in PRD business rules

**Brief addendum (§I):** States that local payment gateways (PayHere, webxPay, Mintpay) "require registered business documentation for merchant accounts; verify business registration status before planning gateway integration." Also notes Lanka QR as an emerging in-person standard.

**PRD coverage:** The PRD marks payment gateway integration as out of scope (OD-FUTURE-03) and correctly defers it. However, there is no PRD business rule or open decision flagging that gateway integration is *contingent on confirming business registration status* — a prerequisite that could block or delay that future phase. If this check is not tracked, the future phase may discover the blocker late.

**Recommendation:** Add an item to the Open Decision Register (or a note under OD-FUTURE-03): "Gateway integration depends on confirming institute business registration status for merchant account eligibility (PayHere/webxPay/Mintpay). Initiate verification before the gateway integration phase begins."

---

### GAP-5: Self-service account recovery dependency on contact-field collection — circular dependency not surfaced in PRD

**Brief addendum (§C, §K item 10):** States that self-service token-based account recovery "depends on which contact details are confirmed for collection" at registration. The MVP floor is admin-initiated reset; self-service is deferred. The brief explicitly links the decision to the contact-field collection decision.

**PRD coverage:** OD-ARCH-03 defers self-service recovery to Architecture phase and notes "depends on which contact fields are confirmed for collection." The PRD does not, however, identify an explicit open decision for *which contact fields are required vs. optional* for students — only that guardian contact is optional. There is no open decision tracking whether a student email or phone number will ever be required for self-service recovery, which means Architecture phase may receive contradictory constraints (no email required for login per FR-AUTH-001, but email may be needed for self-service recovery).

**Recommendation:** Add an open decision: "Contact fields required for student self-service account recovery (email, phone, or neither) must be decided before Architecture phase completes the account recovery design. Decision may require updating FR-REG-001 if a contact field is promoted from optional to required."

---

## 3. Architecture Constraints That the PRD Must Reference

The following items from the brief addendum are architecture-phase constraints that the PRD references adequately for forwarding, but should be confirmed as explicit Architecture phase gates (not just advisory):

| Constraint | Brief Addendum Source | PRD Reference | Action Needed |
|---|---|---|---|
| Data model must accommodate guardian accounts without structural redesign | §G, §C | NFR-EXT-002 | ✅ Adequate |
| Modular monolith must permit future service extraction | §A | NFR-MAINT-003 | ✅ Adequate |
| No premature microservices; no distributed infrastructure in MVP | §A | EQ-015 | ✅ Adequate |
| MongoDB transactional patterns for financial operations | §C Invoice/Payment model | EQ-007 | ✅ Adequate — Architecture must validate MongoDB multi-doc transaction approach |
| Deployment infrastructure mandatory requirements (§H) | §H | **MISSING** — see GAP-3 | ❌ Add NFR-DEPLOY group |
| Three-scale-tier capacity model (§B) | §B | NFR-PERF-001/002 | ⚠️ Promoted to Architecture gate per GAP-2 |
| Private object storage for slips, materials, recordings | §H | SEC-008 | ✅ Adequate — Architecture must confirm provider |
| CI/CD pipeline | §H | EQ-011 | ✅ Referenced — Architecture must implement |
| Sri Lankan legal/compliance review (child data, cross-border) | §K items 4–6 | SEC-012 to SEC-016, OD-LEGAL-01 to OD-LEGAL-04 | ✅ Adequate |

---

## 4. Contradictions

No direct contradictions found between brief addendum and prd.md / prd-addendum.md. All confirmed (✅) items in the brief addendum are consistently reflected in the PRD. Proposed (⚠️) items are correctly marked as proposed in the PRD. Deferred (🔲) items are consistently deferred.

One potential tension to flag (not a contradiction, but a consistency risk):

**FR-AUTH-001 vs. self-service recovery (OD-ARCH-03):** The PRD states "no email address or phone number is required for normal login." If self-service recovery is later approved and requires a contact field, FR-AUTH-001's "no email required" language may need qualification to "no email required *for login*" — which is how the brief addendum phrases it. The PRD already uses this phrasing, so this is low risk if Architecture keeps the distinction clear.

---

## Summary

| Input | Gaps Found |
|---|---|
| `brief-epapere-2026-10-16/addendum.md` | 5 gaps identified |

**Key gaps:**
1. MongoDB pagination/no-unbounded-queries not surfaced as an enforceable NFR
2. Three-user-dimension capacity model not gated as an Architecture deliverable
3. Deployment infrastructure mandatory requirements (env separation, tested backup/restore, monitoring, rollback) absent from PRD NFRs
4. Payment gateway pre-condition (business registration check) not tracked in Open Decision Register
5. Contact-field collection / self-service recovery circular dependency not surfaced as a linked open decision

**Output file:** `_bmad-output/planning-artifacts/prd-e-papere-2026-10-16/reconcile-brief-addendum.md`
