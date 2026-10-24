---
title: "e-Paperé — Brief Addendum"
status: final
created: 2026-10-16
updated: 2026-10-16
---

# e-Paperé — Brief Addendum

This document captures material that informed the brief but belongs in downstream planning artifacts (architecture, PRD, solution design). It is the depth behind the brief.

> **Status key**: ✅ Confirmed | ⚠️ Proposed/pending institute approval | 🔲 Deferred to Architecture or future phase | ⚖️ Requires legal/compliance verification

---

## A. Technology Stack ✅ (Confirmed, Non-Negotiable)

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB with Mongoose |
| Architecture pattern | Modular monolith |

### Architecture Principles ✅

- Separation of concerns; clean modular boundaries
- Consistent conventions and established engineering best practices
- Automated testing; production-ready security controls
- No premature microservices or distributed infrastructure
- MongoDB indexing, pagination, and efficient API design from day one
- Modular structure must permit future service extraction if genuine scale demands it
- Data model must accommodate guardian accounts as a future addition without structural redesign

---

## B. Scaling Scenarios 🔲

Actual enrollment figures are not confirmed. Architecture planning uses three reference scenarios:

| Scenario | Monthly Active Students | Notes |
|---|---|---|
| Small | ~200 | Likely initial operational state |
| Medium | ~2,000 | Near-term growth ceiling if adoption succeeds |
| Large | ~10,000 | Long-term scale ambition |

The PRD must distinguish three user count dimensions:
- **Total registered students** — all accounts ever created
- **Monthly active users** — students with at least one verified payment and active access in the billing month
- **Simultaneous users** — peak concurrent sessions (relevant for API and dashboard load planning)

Performance targets — API response time SLAs, login concurrency, invoice generation throughput, file delivery capacity, availability and recovery objectives — are to be defined and validated through load testing in the Architecture phase once real enrollment data establishes a baseline. The architecture must not require fundamental redesign to move between the three tiers.

---

## C. Data Model Notes (for Architecture Phase)

These are constraints and patterns the architecture must accommodate, not implementation decisions.

### Student Identity ✅

- EP ID format: EP-000001 (zero-padded, sequential, backend-generated)
- IDs are permanent: issued at registration, never reassigned, never encoding grade, subject, or status
- Students retain the same ID across grade progression, dormancy, and re-enrollment
- Account states tracked separately from enrollment status, payment status, and access entitlement status

### Account State Machine ✅

```
PENDING_ACTIVATION
  └─► ACTIVE        (account operational — student may browse, enroll, and access paid content)
        ├─► SUSPENDED   (temporarily restricted by administrator)
        └─► DISABLED    (deactivated; access removed; records preserved)
  SUSPENDED
        └─► ACTIVE      (reinstatement by administrator)
  DISABLED
        └─► ACTIVE      (reactivation by super administrator, if permitted)
```

- Account states are independent of enrollment status, invoice status, and access entitlement status
- All students in Grades 6–11 follow the same account lifecycle regardless of grade
- PENDING_ACTIVATION applies when account setup is incomplete (e.g., admin-assisted registration awaiting one-time activation)
- **Self-registration** may transition directly PENDING_ACTIVATION → ACTIVE when the student completes credential setup in-session (no separate activation step required)
- SUSPENDED and DISABLED are administrative controls; they do not delete records
- **Student portal access while in PENDING_ACTIVATION** ⚠️: conservative default — no enrollment or paid access until ACTIVE; exact scope requires final institute approval (see §K item 3)

### Authentication Model ✅

- **Login identifier**: permanent Student ID (EP-000001 format)
- **Credential**: password, securely hashed server-side (bcrypt or equivalent)
- **No email required** for login; no phone number required for login
- **No OTP dependency** for normal authentication flows
- **Security controls**: login rate limiting, brute-force protection, secure session management (short-lived tokens or equivalent), HTTPS-only
- **Admin-assisted registration**: generates a secure one-time activation link or temporary credential; student sets their own password on first use; administrator never sees the resulting password
- **Account recovery — MVP floor**: administrator-initiated credential reset is the minimum requirement for MVP (admin generates a new one-time activation link; student sets a new password; admin never sees the resulting password). Self-service token-based recovery (e.g., via email or phone) is an Architecture phase decision 🔲 and depends on which contact details are collected at registration
- **Administrator constraint**: administrators can initiate account recovery but must never retrieve or view existing student passwords

### Guardian Contact (Optional) ✅ / 🔲

- Guardian accounts are deferred to a future phase
- Guardian contact information (name, phone, WhatsApp number) may be optionally collected during student registration
- Collected contact information is stored against the student record and used only for manual administrative communication — it does not grant portal access
- The data model must be designed to promote this optional contact record into a full guardian account relationship in a future phase without data migration or schema restructuring
- Privacy obligations for collected contact data must be reviewed as part of the legal/compliance assessment ⚖️

### Course Model ✅

- A course record = subject + grade + teacher + category (Theory / Revision / Paper Class / etc.)
- Courses are persistent entities, not per-month records
- Monthly access entitlements are separate records linked to: student enrollment + course + billing period
- Non-payment restricts access for the unpaid period; it does not delete enrollment history or revoke access to previously paid periods

### Content Access Model ⚠️ *(Proposed policy — pending final institute approval)*

- Access entitlement is per-student, per-course, per-billing-period
- Approved payment for period N activates access to period N content
- Access to periods 1..(N-1) is unaffected by non-payment in period N
- Live Zoom class access is never granted for unpaid periods regardless of historical access status
- The access policy (duration of historical access, content categories included) must be configurable by a super administrator without code changes
- Subject to institute content-retention and licensing policy approval

### Invoice Model ✅ / ⚠️

- Billing model: calendar month
- Invoice generation triggers:
  - **Enrollment request**: system generates invoice for the applicable billing month immediately
  - **Scheduled monthly process**: idempotent job generates invoices for continuing enrollments for the upcoming month
  - **Admin manual trigger**: authorized administrators can generate or regenerate missing invoices
- Invoice line items deduplicated per student + course + billing month
- Fee calculated server-side from configured course pricing — client-submitted amounts not accepted
- An invoice never grants access; access activated only by payment approval
- **Open institute decisions** ⚠️: invoice generation date, payment deadline, grace period, late-enrollment handling, proration of partially-enrolled months

### Payment Model ✅

- Two submission lanes: (a) student uploads slip via portal; (b) admin enters slip received via WhatsApp
- **Payment state machine**:

```
SUBMITTED
  └─► UNDER_REVIEW  (claimed by a finance administrator)
        ├─► APPROVED               → triggers automatic course access activation
        ├─► REQUIRES_CLARIFICATION → student may resubmit evidence; invoice history preserved
        └─► REJECTED               → reason recorded; original preserved; new submission allowed
```

- **Claim/lock model**: a finance administrator claims a submission before reviewing; claimed submissions cannot be concurrently edited by another reviewer
- **On approval**: course access entitlement created for the relevant student + course + billing period
- **Approver identity and timestamp** recorded on every state transition
- **Duplicate submission detection**: flag when the same student + course + billing month + amount appears more than once
- **Duplicate approval prevention**: system prevents two approvals for the same entitlement slot
- **Corrections**: financial record corrections preserve originals with an audit trail entry — no silent overwrites
- **Imported historical payments**: enter as UNVERIFIED; require explicit bank reconciliation before being recorded as confirmed
- **REQUIRES_CLARIFICATION resubmission**: student provides additional evidence against the same existing submission record — the original submission is not replaced; a new evidence attachment and timestamp are appended. This preserves the full audit trail and avoids duplicate submission records. The PRD author must confirm this as the intended model.
- **Single verifier**: one authorized finance administrator may approve ordinary payments after verification; no dual-approval workflow in MVP
- **Dual-approval**: explicitly excluded from MVP; not to be implemented via configuration flags or approval chains speculatively

### Notification Architecture ✅

- Events generated by the system: registration created, account activated, invoice generated, payment submitted, payment approved, payment requires clarification, payment rejected, course access activated, schedule changed, new material uploaded, renewal reminder
- Delivery channels (in-app; future: WhatsApp Business API, SMS, email) are decoupled from event generation
- MVP delivery channel: in-app only
- Event model must not be coupled to any specific delivery channel

### User and Role Model ✅

| Role | Primary Concern |
|---|---|
| Student | Login, learning access, schedule, materials, course enrollment |
| Teacher | Own course rosters, student access status, Zoom and session entry |
| Finance Administrator | Payment verification queue, audit trail, financial summaries |
| Administrator | Student management, enrollment assistance, course config, migration |
| Super Administrator | Full system access, all configuration, access policy settings, reporting |

- Administrators must never view existing student passwords
- Teachers do not access financial records unless explicitly granted by a super administrator
- Guardian role: not present in MVP; data model must accommodate it as a future addition

---

## D. Course Enrollment Flow ✅

### Enrollment Actors and Authority

| Actor | Can Do |
|---|---|
| Student | Browse available courses; submit an enrollment request |
| Administrator | Initiate enrollment on behalf of a student |

Guardian approval is not a default technical prerequisite for enrollment in the MVP.

### Enrollment Sequence

1. Enrollment request created (by student or administrator)
2. System creates or updates persistent enrollment relationship
3. System generates invoice for the applicable billing month (deduplicated)
4. Student submits payment evidence
5. Finance administrator claims, verifies, and approves
6. System activates monthly course access entitlement
7. Next month: invoice generated automatically; process repeats from step 4

### Key Invariants

- Enrollment ≠ access (enrollment creates the record; access requires verified payment)
- A student never re-registers for the same course each month — enrollment is persistent
- A payment lapse preserves the enrollment record and prior paid access; only the new month's access is withheld
- A student account exists independently of monthly payment and enrollment status

---

## E. Registration Flow ✅

### Self-Registration Sequence

1. Student opens portal → selects Register
2. Enters essential information: full name, date of birth (or age), grade (6–11); guardian contact information optionally collected
3. System checks for potential duplicates (by name + grade + date of birth at minimum)
4. Backend generates EP Student ID (EP-000001 format)
5. Student creates a password; account moves to ACTIVE
6. Student logs in using Student ID + password
7. Student proceeds to course enrollment

### Admin-Assisted Registration Sequence

1. Administrator enters student information on behalf of the student
2. System generates EP Student ID
3. System generates a secure one-time activation link or temporary credential
4. Administrator provides the activation details to the student through a secure channel
5. Student completes activation by setting their own password; account moves to ACTIVE

### Duplicate Detection

- Minimum check: full name + grade + date of birth
- System flags potential duplicates for administrator review before creating a new account
- Prevents EP ID wastage from duplicate accounts

---

## F. Migration Model ✅

### Five-Stage Transition Plan

| Stage | Activity |
|---|---|
| 1 — Preparation | Configure grades, subjects, teachers, courses, fees, and admin accounts |
| 2 — Student Migration | Register or import existing students; reconcile enrollments and payment history |
| 3 — Pilot Operation | Introduce portal to a selected cohort while maintaining existing WhatsApp operations |
| 4 — Gradual Adoption | Encourage self-service for registration, payment upload, and learning access |
| 5 — Portal-Centered Operations | Portal becomes the authoritative system; WhatsApp retained as a supplementary channel |

### Migration Data Quality Requirements ✅

- Mandatory fields validated before record creation
- Duplicate detection: by name + date of birth + grade combination at minimum
- Imported payment records: not auto-verified; require bank reconciliation evidence
- Access entitlements for migrated students only activated after payment confirmed through approved reconciliation
- Audit trail: origin and verification status preserved for every imported record
- Failed imports: reviewable and correctable by administrators
- EP IDs for migrated students: generated through the same backend mechanism as new registrations
- Bulk import input format and minimum required field set: defined in PRD ⚠️

---

## G. Deferred Guardian System 🔲 *(Future phase)*

The following capabilities are explicitly deferred. They must not be built in the MVP but the architecture must support them as future additions:

- Guardian account registration, login, and authentication
- Guardian dashboard with multi-child management
- Guardian-specific invoice and payment submission views
- Guardian approval of course enrollment for minors
- Multi-guardian relationship per student (primary + additional guardians)
- Guardian notification preferences and communication routing
- Guardian-initiated account recovery for linked students

**Data model requirement**: the student record structure and the account/authentication model must be designed so that a guardian account can be linked to one or more students in a future phase without requiring migration of existing student records or structural schema changes.

---

## H. Deployment Infrastructure Requirements 🔲 *(Architecture phase)*

The Architect must evaluate options against these requirements and document hosting choices, costs, regional availability, operational trade-offs, and security implications. Do not select a provider solely on popularity.

### Mandatory Requirements

- Secure HTTPS for all endpoints
- Environment separation: development, staging, production
- Secure secret management (no credentials in source control)
- Automated database backups with tested restoration procedures
- Production monitoring and structured logging
- Deployment rollback procedures
- Infrastructure scalability path from Small to Large scenario without redesign
- Private object storage for uploaded payment slips, study materials, and recordings
- CI/CD pipeline support
- Reasonable operating costs appropriate to a growing Sri Lankan institute

### Compliance Requirements ⚖️

- Compliance with applicable Sri Lankan data protection legislation
- Assessment of cross-border data-transfer obligations if hosting outside Sri Lanka
- Student personal data handled with appropriate access controls and retention policies

---

## I. Sri Lankan Market Context *(Reference — research-sourced)*

### Local Competitive Landscape

- Existing local tools (EduMix, GenixEdu, TuitionFee.lk, ClassFlow.lk, Schoowi) cover attendance tracking and basic fee management but do not offer payment-gated content access or a self-service student portal
- Indian market leaders (Classplus, Classpro) offer full-stack solutions including payment gating, but are built on UPI payment rails, not Sri Lankan banking infrastructure
- e-Paperé's differentiator at launch: the only Sri Lankan product combining bank-slip-upload verification, automatic course access activation, and a permanent student portal accessible via Student ID login

### Payment Infrastructure

- Dominant payment method for tuition fees: bank transfer with screenshot or slip, not cards
- Local payment gateways: PayHere (most widely integrated), webxPay, Mintpay — all require registered business documentation for merchant accounts; verify business registration status before planning gateway integration
- Lanka QR (scan-to-pay) is an emerging in-person standard
- MVP payment lane covers the majority of actual transactions; gateway integration is a planned future upgrade

### Notification Delivery Context

- Email delivery is unreliable for reaching the Sri Lankan student and guardian demographic
- WhatsApp is the established trusted channel; SMS via Dialog/Mobitel APIs is widely used
- In-app notifications are the correct MVP starting point; engagement depends on the WhatsApp manual bridge during transition

---

## J. Deferred Capabilities (Post-MVP) ✅

Explicitly confirmed as out of scope. None may require architectural rework to add later:

- Guardian accounts, login, dashboard, and multi-child management
- Guardian course approval and enrollment authorization
- PayHere (or equivalent) online payment gateway integration
- WhatsApp Business Platform API — automated messaging
- Automated SMS notifications (Dialog/Mobitel)
- Email notification delivery
- Zoom API automation (meeting creation, participant management, attendance)
- Advanced examinations, assessments, and grading
- Student churn forecasting and advanced business intelligence
- Grades 1–5 (Primary) and Grades 12–13 (Advanced Level)
- In-house or third-party video hosting
- Native mobile applications
- Dual-approval payment verification workflows

---

## K. Outstanding Decisions Summary

### Pending Final Institute Approval ⚠️

| # | Decision | Recommended Working Position |
|---|---|---|
| 1 | Historical content access policy | Retain paid-period access; restrict unpaid periods; configurable by super admin |
| 2 | Invoice generation date, payment deadline, grace period, late-enrollment pricing | Not yet defined |
| 3 | Student portal access scope while in PENDING_ACTIVATION | Conservative default: no enrollment or paid access until ACTIVE |

### Requiring Legal/Compliance Verification Before Production ⚖️

| # | Item |
|---|---|
| 4 | Child data protection and privacy obligations under Sri Lankan law for a minor-serving platform |
| 5 | Whether optional guardian contact collection satisfies applicable consent requirements |
| 6 | Content-retention and licensing policy implications for historical access |

### Deferred to Architecture Phase 🔲

| # | Decision |
|---|---|
| 7 | Hosting provider, deployment region, infrastructure cost |
| 8 | Performance targets and load-test scenarios |
| 9 | Data residency and cross-border transfer compliance |
| 10 | Account recovery self-service mechanism (MVP floor: admin-initiated reset is confirmed; self-service token flow deferred) |
| 11 | Bulk import input format and minimum required field set *(PRD author defines; Architecture phase validates)* |

### Deferred to Future Product Phase 🔲

| # | Capability |
|---|---|
| 12 | Guardian accounts, login, and dashboard |
| 13 | Mandatory guardian linking and guardian course approval |
| 14 | Multi-guardian relationship management |
| 15 | Dual-approval payment verification |
