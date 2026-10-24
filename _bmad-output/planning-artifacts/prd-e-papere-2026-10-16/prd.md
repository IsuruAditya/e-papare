---
title: "e-Paperé Student Management System — Product Requirements Document"
status: final
created: 2026-10-16
updated: 2026-10-16
---

# e-Paperé Student Management System — Product Requirements Document

> **Status key**
> - ✅ **Confirmed** — decided and stable; Architecture and UX may treat as firm
> - ⚠️ **Proposed** — working position; requires final institute approval before this item is locked
> - 🔲 **Deferred** — Architecture phase or future product phase; must not be built in MVP
> - ⚖️ **Legal** — requires Sri Lankan legal/compliance verification before production deployment

---

## Table of Contents

1. [Purpose and Scope](#1-purpose-and-scope)
2. [Problem Statement](#2-problem-statement)
3. [Goals and Success Metrics](#3-goals-and-success-metrics)
4. [Users and Roles](#4-users-and-roles)
5. [MVP Scope](#5-mvp-scope)
6. [User Journeys](#6-user-journeys)
7. [Feature Requirements](#7-feature-requirements)
   - FR-REG: Registration and Account Management
   - FR-AUTH: Authentication and Account Recovery
   - FR-COURSE: Course and Subject Management
   - FR-ENROL: Enrollment and Withdrawal
   - FR-INV: Invoice Management
   - FR-PAY: Payment Submission and Verification
   - FR-ACCESS: Learning Access
   - FR-LEARN: Learning Resource Management
   - FR-NOTIF: Notifications
   - FR-MIG: Migration
   - FR-REPORT: Reporting
   - FR-I18N: Internationalization and Localization *(added: bilingual amendment)*
8. [Business Rules](#8-business-rules)
9. [Non-Functional Requirements](#9-non-functional-requirements)
   - NFR-PERF, NFR-DEPLOY, NFR-AVAIL, NFR-MAINT, NFR-EXT, NFR-TEST, NFR-ACCESS
   - NFR-I18N: Localization Quality *(added: bilingual amendment)*
   - Engineering Quality Standards
10. [Security and Privacy Requirements](#10-security-and-privacy-requirements)
11. [Risks](#11-risks)
12. [Open Decision Register](#12-open-decision-register)
13. [PRD Readiness Gate](#13-prd-readiness-gate)

---

## 1. Purpose and Scope

This document defines the product requirements for the **e-Paperé Student Management System (e-Paperé SMS)** — a web-based platform replacing the manual WhatsApp-based administration of e-Paperé Online Institute.

e-Paperé is not a Learning Management System. It does not host video, run assessments, or replace Zoom. It is a **student-first management and access-control layer** that makes the institute's existing Zoom-based teaching model sustainable at scale. The platform's job is to ensure the right students have the right access at the right time, with a full audit trail, and without an administrator manually performing the same enrollment work every month.

The compounding value of this platform — beyond eliminating daily manual work — is that for the first time the institute will have a reliable, queryable record of who is enrolled, who has paid, and who has access. That record is the foundation for every future business decision. This is the reason audit trails, immutable records, and data integrity are non-negotiable throughout this PRD.

**Institute:** e-Paperé Online Institute
**Country of operation:** Sri Lanka
**Operational status:** Live and actively serving students. This platform replaces current operations; it does not start a new business.
**Supported languages:** English (en) and Sinhala (සිංහල, si-LK) — both mandatory across all five roles for the full MVP. ✅
**Mandatory technology stack:** React + TypeScript + Vite + Tailwind CSS (frontend); Node.js + Express.js + TypeScript (backend); MongoDB + Mongoose (database); modular monolith architecture. ✅ Non-negotiable.

---

## 2. Problem Statement

All student administration — registration, monthly fee collection, payment verification, and class-access distribution — currently runs through WhatsApp and manual processes. Each billing cycle, administrators receive bank-transfer screenshots on WhatsApp, manually verify payments, and re-add students to new WhatsApp groups to grant class access. Records are scattered across chat history, screenshots, and spreadsheets. Disputes require reconstructing conversations. The process does not scale.

**The specific failure the platform must eliminate:** a verified payment must never require an administrator to manually enroll a student into a WhatsApp group. That manual step must be fully replaced by automatic access activation. ✅

WhatsApp remains a permanent supplementary communication channel — used alongside the portal for outreach, announcements, and manual follow-up. The platform replaces WhatsApp as an *access-control mechanism*, not as a communication channel.

---

## 3. Goals and Success Metrics

### Business Objectives

| ID | Objective | Status |
|---|---|---|
| BO-01 | Eliminate monthly WhatsApp group creation as an access-control mechanism. | ✅ |
| BO-02 | Automatically activate correct course access when a payment is verified, without additional administrator steps. | ✅ |
| BO-03 | Provide students with permanent, self-service portal access to Zoom links, study materials, and recordings. | ✅ |
| BO-04 | Give administrators a single dashboard to monitor all pending payments and access problems. | ✅ |
| BO-05 | Create the institute's first reliable, queryable record of enrollments, verified payments, and access status — the foundation for all future business decisions. | ✅ |
| BO-06 | Reduce administrator time spent on monthly enrollment tasks as self-service adoption grows. | ✅ |
| BO-07 | Support incremental migration of existing students without disrupting ongoing classes. | ✅ |

### Primary Success Criteria (3 months post-launch)

- Monthly WhatsApp groups for access control are no longer created.
- Verified payments automatically activate correct course access without any administrator step.
- Students log in independently with their Student ID and access Zoom links, materials, and recordings from a permanent account.
- Administrators identify all pending payments and access problems from a single dashboard.

### Operational Indicators *(targets set once current baseline is measured)*

- Percentage of monthly verified payments activating course access without manual intervention.
- Reduction in administrator time spent on monthly enrollment tasks.
- Self-service payment slip upload rate (student portal vs. administrator-assisted entry).
- Self-registration completion rate (student self-service vs. admin-assisted).

### Counter-Metrics *(lagging signals of system failure — tracked to detect process breakdown)*

| Counter-metric | Failure signal |
|---|---|
| Administrator time correcting duplicate student records | Duplicate detection failure |
| Finance administrator time resolving conflicting payment claims | Claim/lock or queue failure |
| Student support requests for access not activated after payment | Automation failure in payment approval pipeline |

---

## 4. Users and Roles

### Role Definitions ✅

| Role | Primary Concern | Portal alias |
|---|---|---|
| **Student** | Login, learning access, course enrollment, payment submission | Student |
| **Teacher** | Own course rosters, student access status, Zoom and session entry | Teacher |
| **Finance Administrator** | Payment verification queue, audit trail, financial summaries | Finance Admin |
| **Administrator** | Student management, enrollment assistance, course config, migration | Admin |
| **Super Administrator** | Full system access, all configuration, access policy settings, reporting | Owner / Super Admin |

The Super Administrator role corresponds to the institute owner's operational perspective. UX should surface this role as "Owner" in the administration interface where contextually appropriate, while the system internally uses the Super Administrator designation. Guardians are deferred to a future phase. 🔲

### RBAC Matrix ✅

| Capability | Student | Teacher | Finance Admin | Admin | Super Admin |
|---|:---:|:---:|:---:|:---:|:---:|
| Self-register and login | ✓ | — | — | — | ✓ |
| View own profile and dashboard | ✓ | ✓ | ✓ | ✓ | ✓ |
| Browse available courses | ✓ | — | — | — | ✓ |
| Submit enrollment request | ✓ (ACTIVE only) | — | — | — | ✓ |
| Withdraw from a course | ✓ (ACTIVE only) | — | — | ✓ | ✓ |
| Upload payment slips | ✓ (ACTIVE only) | — | — | — | ✓ |
| View own payment and access history | ✓ | — | — | — | ✓ |
| Access learning resources (Zoom, materials, recordings) | ✓ (paid periods) | — | — | — | ✓ |
| View own course roster and student access status | — | ✓ | — | — | ✓ |
| Enter and update Zoom and session details | — | ✓ | — | ✓ | ✓ |
| Upload study materials | — | ✓ | — | ✓ | ✓ |
| Manage recording entries (create, edit, publish, unpublish) | — | ✓ (own courses) | — | ✓ | ✓ |
| Claim and process payment verification queue | — | — | ✓ | — | ✓ |
| View payment audit trail | — | — | ✓ | — | ✓ |
| Enter payment slips received via WhatsApp | — | — | ✓ | ✓ | ✓ |
| Register students (admin-assisted) | — | — | — | ✓ | ✓ |
| Initiate enrollment on behalf of students | — | — | — | ✓ | ✓ |
| Initiate course withdrawal on behalf of students | — | — | — | ✓ | ✓ |
| Manage student accounts (suspend / reinstate) | — | — | — | ✓ | ✓ |
| Disable / reactivate student accounts | — | — | — | — | ✓ |
| Initiate account recovery (credential reset) | — | — | — | ✓ | ✓ |
| Manage courses, subjects, grades, fees | — | — | — | ✓ | ✓ |
| Manage teacher accounts | — | — | — | ✓ | ✓ |
| Manually generate or regenerate invoices | — | — | — | ✓ | ✓ |
| View financial summaries and payment reports | — | — | ✓ | — | ✓ |
| View enrollment and operational reports | — | — | — | ✓ | ✓ |
| Configure billing dates, deadlines, access policies | — | — | — | — | ✓ |
| View or retrieve existing student passwords | ✗ | ✗ | ✗ | ✗ | ✗ |

### Key Role Constraints ✅

- No role — including Super Administrator — may retrieve or view an existing student password.
- Teachers do not access financial records unless a Super Administrator explicitly grants an exception.
- Finance Administrators have no access to content management or course configuration.
- Students in PENDING_ACTIVATION may browse public information and course listings only; no enrollment or paid access.
- Role assignments are managed by Administrators and Super Administrators.

---

## 5. MVP Scope

### In Scope ✅

- Student self-registration and admin-assisted registration
- Permanent EP Student ID generation (EP-000001 format, backend-generated)
- Student ID + password authentication; secure hashing; rate limiting; session management; admin-initiated account recovery (MVP floor)
- Secure one-time activation flow for admin-assisted registrations
- Four account states: PENDING_ACTIVATION / ACTIVE / SUSPENDED / DISABLED
- Dynamic grade and subject configuration (Grades 6–11; Mathematics, Science, Sinhala, ICT at launch)
- Course management: subject, grade, teacher, category, schedule, and fee (persistent, not recreated monthly)
- Course enrollment by student or administrator; persistent enrollment relationship
- Course withdrawal by student or administrator; billing stop and historical record preservation
- Calendar-month invoice generation: on enrollment, via scheduled monthly batch (default: 25th preceding month), via admin manual trigger; configurable billing dates ⚠️
- Configurable payment deadline (default: 10th of billing month); overdue status and reminders ⚠️
- Full monthly fee always; no prorated pricing
- Bank payment slip upload (student portal and admin entry)
- Multi-course payment support: single bank transaction linked to multiple invoice line items with explicit allocation
- Partial, excess, and unmatched payment handling with explicit finance administrator resolution
- Shared finance administrator payment verification queue: claim/lock; Approved / Requires Clarification / Rejected outcomes
- Append-to-existing clarification resubmission model; full evidence history preserved
- Automatic course access activation on payment approval; no grace-period access
- Historical content access for paid periods; restriction for unpaid periods ⚠️
- Content access policy configurable by Super Administrator without code changes
- Link-based recording management: teachers enter recording URLs; platform controls entitlement-gated access ✅ (OD-R01 approved)
- Student dashboard: Zoom links, study materials, recordings, schedule, announcements
- Teacher dashboard: course roster, enrollment counts, student access status, Zoom and session entry
- Administrator dashboard: student management, enrollment assistance, access oversight, migration status
- Finance administrator dashboard: payment verification queue, audit trail, financial summaries
- Super Administrator / Owner dashboard: enrollment totals, verified revenue, outstanding invoices, operational summary
- In-app notifications for all key workflow events; overdue payment reminders
- Copyable WhatsApp message templates for common administrator communications
- Role-based access control: five roles as defined in §4
- Existing student migration: individual onboarding and bulk import (minimum fields: full name + grade); validation, duplicate detection, audit trail
- Payment history and role-segmented operational reporting
- Modular monolith architecture
- **Full bilingual support: English (en) and Sinhala (si-LK) across all five roles and all user journeys** ✅

### Out of Scope (MVP) ✅

- Guardian accounts, guardian login, guardian dashboard, guardian course approval
- Multi-guardian relationship management
- Mandatory OTP or phone-based authentication
- Self-service token-based account recovery
- Age-dependent registration workflows
- Online payment gateway integration (PayHere or equivalent)
- Automated WhatsApp Business API messaging
- Automated SMS or email notifications
- Zoom API automation
- Examinations, assessments, or grading
- Advanced analytics or business intelligence
- Grades 1–5 and 12–13
- In-house or third-party video hosting infrastructure
- Direct large-video file upload or video transcoding
- Native mobile applications
- Dual-approval payment verification
- Automatic grace-period access

The architecture must accommodate all deferred features as future additions without structural redesign.

---

## 6. User Journeys

### UJ-1: Kavya self-registers and enrolls in her first course

Kavya is a Grade 9 student. Her mother heard about e-Paperé from a neighbor. Kavya has a phone but no personal email address; her mother sits with her the first time.

1. Kavya opens the portal on her phone's browser and taps **Register**.
2. She enters her full name, date of birth, and Grade 9. Her mother's WhatsApp number is entered as optional guardian contact.
3. The system checks for duplicates — no match found.
4. The backend generates **EP-000147** as Kavya's permanent Student ID.
5. Kavya creates her password. Her account transitions directly to **ACTIVE** in the same session.
6. She logs in with EP-000147 and lands on her dashboard.
7. She browses available courses and selects **Mathematics — Grade 9 — Theory** for the current billing month.
8. The system immediately generates Invoice INV-2026-11-00147-MAT for November at the full configured monthly fee. No access is granted yet.
9. Kavya receives an in-app notification: *"Your enrollment request has been received. Invoice INV-2026-11-00147-MAT is ready."*
10. Kavya's mother uploads a photo of the bank transfer slip through the portal.
11. A finance administrator claims the submission, verifies it against bank records, and approves it.
12. The system automatically activates Kavya's access to Mathematics — Grade 9 content for November.
13. Kavya's dashboard now shows the Zoom meeting link, uploaded study materials, and class schedule for November.
14. No administrator manually adds her to a WhatsApp group.

**Acceptance criteria:**
- Self-registration completes and activates account to ACTIVE in a single session; no separate activation step required.
- EP ID generated before any payment is made.
- Invoice created immediately on enrollment request; fee server-side calculated from configured price.
- Payment slip upload accessible from the student dashboard without re-login.
- Course access activates automatically on payment approval — no additional administrator step.
- Zoom links and materials visible on student dashboard immediately after access activation.
- Overdue reminder triggered if payment deadline passes without approval.
- The entire registration, enrollment, and access journey is completable in Sinhala with no untranslated system-generated strings.
- The same journey is completable in English.
- Switching language during the registration session does not cause loss of entered form data.

---

### UJ-2: Amal's payment evidence requires clarification

Amal is a Grade 11 Science student who accidentally uploads his October slip against a November invoice.

1. Amal uploads his bank slip. Submission enters **SUBMITTED** status.
2. Finance administrator Priya claims the submission.
3. Priya verifies against bank records: the slip date confirms payment made in October, but the invoice is for November.
4. Priya selects **Requires Clarification** and records: *"Slip date is October 15. Please confirm this payment covers November, or upload the correct slip."*
5. Submission status changes to **REQUIRES_CLARIFICATION**. Amal receives an in-app notification with the reason.
6. Amal views the clarification note. He uploads a corrected November slip as additional evidence. The original October slip is preserved with its timestamp.
7. Submission returns to **UNDER_REVIEW** status in the verification queue.
8. Priya re-claims the submission, sees the full evidence history, verifies the new slip, and approves.
9. November access activates automatically. No duplicate entitlement is created.

**Acceptance criteria:**
- Clarification reason visible to student in-app.
- Student uploads additional evidence against the existing submission record; no new submission created.
- Original slip preserved; all evidence items carry individual upload timestamps.
- Submission returns to the queue after additional evidence is uploaded.
- Finance administrator sees the complete evidence history on the single submission record.
- Access activates automatically on approval; duplicate approval for same entitlement slot is prevented.

---

### UJ-3: Dilshan pays for three subjects with one bank transfer

Dilshan is a Grade 10 student enrolled in Mathematics, Science, and Sinhala. He makes one bank transfer covering all three.

1. Dilshan's dashboard shows his November invoice with three line items: Mathematics (LKR A), Science (LKR B), Sinhala (LKR C). Total: LKR A+B+C.
2. Dilshan uploads one bank slip through the portal. He selects all three line items as the intended allocation and enters the amount for each. The system records his stated allocation.
3. The submission enters the verification queue as a single payment with three line-item allocations.
4. Finance administrator Priya claims the submission, verifies the bank deposit against records, and confirms the actual bank deposit equals LKR A+B+C — matching the sum of all three line items.
5. Priya approves the submission. The system activates access for all three courses simultaneously and atomically.
6. Dilshan receives one notification: *"Payment approved. Access activated for Mathematics, Science, and Sinhala — November."*
7. No duplicate payment records or access entitlements are created.

**Acceptance criteria:**
- A single payment submission can carry allocations across multiple line items on one monthly invoice.
- Student states the allocation at submission time; finance administrator verifies the actual bank deposit and may adjust before approving.
- Approval atomically activates access entitlements for all fully covered line items.
- Duplicate entitlement prevention enforced across all line items in a single approval.
- One notification covers all activated courses.
- If the bank deposit is less than the line-item total, the submission is flagged as partial and no entitlements are auto-activated.
- All payment statuses, confirmation messages, and notifications display correctly in both Sinhala and English.

---

### UJ-4: Nimal withdraws from a course mid-enrollment

Nimal (Grade 8) decides to stop attending ICT classes after paying for November.

1. An administrator opens Nimal's enrollment record for ICT — Grade 8.
2. The administrator records a withdrawal effective from December billing month.
3. The enrollment is marked **WITHDRAWN** effective December.
4. The December invoice for ICT is not generated in the next monthly batch run.
5. Nimal's November access to ICT remains fully active — his paid period is unaffected.
6. Historical invoices and payment records for October and November are preserved.
7. If Nimal re-enrolls in ICT in a future month, a new enrollment and invoice are generated; his prior history remains visible.

**Acceptance criteria:**
- Withdrawal stops future invoice generation without deleting prior records.
- Paid access for the current billing period is not revoked on withdrawal.
- Historical invoices, payments, and learning records are preserved and accessible.
- Re-enrollment in a previously withdrawn course requires no administrator data cleanup.

---

### UJ-5: Administrator onboards a new student who cannot self-register

Tharushi is a Grade 6 student whose parent contacted the institute via WhatsApp. She does not have portal access at registration time.

1. An administrator selects **Admin-Assisted Registration** and enters Tharushi's full name, date of birth, and Grade 6. Guardian WhatsApp number is entered.
2. The system checks for duplicates — no match.
3. The backend generates **EP-000203**. Account is created in **PENDING_ACTIVATION**.
4. The system generates a secure one-time activation link that expires after 48 hours.
5. The administrator provides the link to Tharushi's parent via WhatsApp.
6. Tharushi opens the link, sets her password, and completes activation. The link becomes invalid after this one-time use.
7. Account transitions to **ACTIVE**. Tharushi can log in with EP-000203.
8. If the link expires before use, the administrator can securely regenerate a new activation link.
8. While in PENDING_ACTIVATION, Tharushi can browse course listings but cannot enroll or access paid content.

**Acceptance criteria:**
- Admin-assisted registration creates account in PENDING_ACTIVATION, not ACTIVE.
- One-time activation link generated; administrator never sees resulting password.
- Activation link is single-use and expires after 48 hours.
- Account transitions to ACTIVE only when the student completes credential setup via the link.
- Used or expired links are invalidated; a new link can be securely regenerated by an administrator.
- Student in PENDING_ACTIVATION can browse course listings but cannot submit enrollment requests or view paid content.

---

## 7. Feature Requirements

Requirements are organized by domain. IDs are stable references for downstream documents.

---

### FR-REG: Registration and Account Management

| ID | Requirement | Priority | Status |
|---|---|---|---|
| FR-REG-001 | The system must allow a student to self-register by entering full name, date of birth (or age), and grade (6–11). No email address or phone number is required for registration. | Must | ✅ |
| FR-REG-002 | The system must check for potential duplicate accounts (minimum match: full name + grade + date of birth) before creating a new account. Potential matches must be flagged for administrator review. Name-only matches must never trigger automatic account merging. | Must | ✅ |
| FR-REG-003 | The backend must generate a permanent EP Student ID (EP-000001 format: "EP" prefix + six-digit zero-padded sequential number) automatically at registration, before any payment. | Must | ✅ |
| FR-REG-004 | A self-registering student must be able to set their own password and have their account transition to ACTIVE within the same registration session. No separate activation step is required. | Must | ✅ |
| FR-REG-005 | An administrator must be able to register a student on the student's behalf. Admin-assisted registration creates the account in PENDING_ACTIVATION. | Must | ✅ |
| FR-REG-006 | Admin-assisted registration must generate a secure one-time activation link. The link is single-use and expires after 48 hours (configurable). An administrator must be able to securely regenerate a new link if the previous one expires before use. The administrator must never see the resulting student password. | Must | ✅ |
| FR-REG-007 | Guardian contact information (name, phone, WhatsApp number) must be optionally collectable during student registration. Collected contact data must be stored against the student record and must not grant portal access. | Must | ✅ |
| FR-REG-008 | The system must support exactly four account states: PENDING_ACTIVATION, ACTIVE, SUSPENDED, DISABLED — independent of enrollment, invoice, and payment status. | Must | ✅ |
| FR-REG-009 | An administrator must be able to suspend (ACTIVE → SUSPENDED) and reinstate (SUSPENDED → ACTIVE) a student account. | Must | ✅ |
| FR-REG-010 | A Super Administrator must be able to disable (ACTIVE or SUSPENDED → DISABLED) and reactivate (DISABLED → ACTIVE) a student account. | Must | ✅ |
| FR-REG-011 | A student in PENDING_ACTIVATION must be able to view public information and available course listings. Enrollment requests and paid content access must be blocked until the account is ACTIVE. | Must | ✅ |
| FR-REG-012 | A student's grade must be updatable by an administrator. Students progress through grades without creating new accounts. | Must | ✅ |
| FR-REG-013 | EP IDs must never change, never expire, and never be reassigned — regardless of account state, grade, enrollment status, or payment status. | Must | ✅ |
| FR-REG-014 | When a potential duplicate is flagged, an administrator must take an explicit action (confirm as new, merge, or defer) before the record is committed. Records with insufficient identity data (name only, no DOB or grade) must be flagged for manual review and must not be auto-activated or auto-merged. | Must | ✅ |

---

### FR-AUTH: Authentication and Account Recovery

| ID | Requirement | Priority | Status |
|---|---|---|---|
| FR-AUTH-001 | Students must log in using their permanent Student ID and password only. No email address or phone number is required for normal login. | Must | ✅ |
| FR-AUTH-002 | Passwords must be securely hashed server-side using bcrypt or an equivalent algorithm immediately upon receipt. Passwords must never be stored in plain text, logged in any form, or transmitted except over an encrypted HTTPS connection. The exact hashing and session-management implementation is an Architecture-phase decision. | Must | ✅ |
| FR-AUTH-003 | No OTP mechanism is required or permitted for normal authentication flows in the MVP. | Must | ✅ |
| FR-AUTH-004 | The system must enforce login rate limiting and brute-force protection on the authentication endpoint. | Must | ✅ |
| FR-AUTH-005 | All sessions must use short-lived tokens or equivalent secure session management. Session tokens must be invalidated on logout. | Must | ✅ |
| FR-AUTH-006 | All authentication traffic must be served over HTTPS. Plain HTTP is not permitted in production. | Must | ✅ |
| FR-AUTH-007 | No role — including Super Administrator — may retrieve or view an existing student password. | Must | ✅ |
| FR-AUTH-008 | An administrator must be able to initiate an account recovery (credential reset) for a student. The system generates a new one-time activation link. The student sets a new password. The administrator never sees the resulting password. | Must | ✅ |
| FR-AUTH-009 | Account recovery must not be initiatable based solely on easily discoverable student information (e.g., name alone). The administrator must confirm student identity by independent means before initiating a credential reset. | Must | ✅ |

---

### FR-COURSE: Course and Subject Management

| ID | Requirement | Priority | Status |
|---|---|---|---|
| FR-COURSE-001 | An administrator must be able to create, update, and deactivate courses. A course is defined by subject, grade, teacher, and teaching category. | Must | ✅ |
| FR-COURSE-002 | Courses must persist across billing months. They must not be recreated per billing cycle. | Must | ✅ |
| FR-COURSE-003 | Course fee, schedule, and category must be configurable through the administration interface without code changes. | Must | ✅ |
| FR-COURSE-004 | The system must launch with four subjects: Mathematics, Science, Sinhala, ICT. Additional subjects must be addable without code modifications. | Must | ✅ |
| FR-COURSE-005 | The system must launch with Grades 6–11. Additional grades must be addable without code modifications. | Must | ✅ |
| FR-COURSE-006 | Teaching categories (Theory, Revision, Paper Class, etc.) must be configurable without code changes. | Must | ✅ |
| FR-COURSE-007 | A deactivated course must not appear in the student course browser. Existing enrollments, historical records, and payment records for deactivated courses must be preserved and accessible. | Must | ✅ |

---

### FR-ENROL: Enrollment and Withdrawal

| ID | Requirement | Priority | Status |
|---|---|---|---|
| FR-ENROL-001 | A student in ACTIVE state must be able to submit an enrollment request for an available course for a selected billing month. | Must | ✅ |
| FR-ENROL-002 | An authorized administrator must be able to initiate enrollment on behalf of a student. | Must | ✅ |
| FR-ENROL-003 | Enrollment must create a persistent enrollment relationship. A student does not re-enroll in the same course each month. | Must | ✅ |
| FR-ENROL-004 | Enrollment must not grant paid learning access. Access is activated only after payment is verified and approved. | Must | ✅ |
| FR-ENROL-005 | A payment lapse must not delete or revoke the enrollment record or access to previously paid billing periods. Only the current unpaid period's access is withheld. | Must | ✅ |
| FR-ENROL-006 | Guardian approval is not a default technical prerequisite for enrollment in the MVP. | Must | ✅ |
| FR-ENROL-007 | A student or an authorized administrator must be able to withdraw a student from a course. Withdrawal must specify an effective billing month — the first month for which no invoice will be generated. | Must | ✅ |
| FR-ENROL-008 | Course withdrawal must not delete historical invoices, payment records, or learning records. | Must | ✅ |
| FR-ENROL-009 | Course withdrawal must not revoke access to billing periods already paid at the time of withdrawal. | Must | ✅ |
| FR-ENROL-010 | The scheduled monthly invoice batch must not generate an invoice for an enrollment whose withdrawal is effective in that billing month or earlier. | Must | ✅ |
| FR-ENROL-011 | Re-enrollment in a previously withdrawn course must be possible without administrator data cleanup. Prior enrollment history, invoices, and payments must remain accessible after re-enrollment. | Must | ✅ |
| FR-ENROL-012 | Duplicate enrollment in the same course for the same billing month must be prevented. | Must | ✅ |

---

### FR-INV: Invoice Management

The invoice model: a student has one invoice per billing month, containing one line item per enrolled course for that month. Payment allocations target individual line items. This allows a single bank transfer to cover multiple courses and ensures access activation is tracked at the line-item level.

| ID | Requirement | Priority | Status |
|---|---|---|---|
| FR-INV-001 | The system must generate an invoice line item for the applicable billing month immediately when a student submits or is enrolled into a new course. If an invoice already exists for that student and billing month, the new line item is added to it. If no invoice exists, a new invoice is created. | Must | ✅ |
| FR-INV-002 | The system must run a scheduled, idempotent monthly batch to generate invoice line items for all active continuing enrollments for the upcoming billing month. The default generation date is the 25th of the preceding calendar month. This date must be configurable by a Super Administrator. | Must | ⚠️ |
| FR-INV-003 | An authorized administrator must be able to manually generate or regenerate a missing invoice or missing line item for a student's enrollment. | Must | ✅ |
| FR-INV-004 | Invoice line items must be deduplicated per student + course + billing month. A duplicate line item must not be created regardless of trigger (enrollment event, scheduled batch, or manual generation). | Must | ✅ |
| FR-INV-005 | The fee for each line item must be calculated server-side from the configured course pricing at the time of generation. Client-submitted fee amounts must not be accepted. | Must | ✅ |
| FR-INV-006 | An invoice and its line items must never by themselves grant learning access. Access is activated only after a payment covering the relevant line item is verified and approved. | Must | ✅ |
| FR-INV-007 | An invoice whose payment deadline (default: 10th of the billing month; configurable by Super Administrator) has passed with one or more unpaid line items must be marked OVERDUE and trigger an in-app reminder notification to the student. | Must | ⚠️ |
| FR-INV-008 | An invoice within its payment window must not automatically authorize access to any paid content. | Must | ✅ |
| FR-INV-009 | A student's complete invoice history — including all line items and their payment status — must be accessible from their dashboard regardless of payment status, enrollment status, or account state. | Must | ✅ |
| FR-INV-010 | Each invoice must record: billing month, generation date, and payment deadline. Each line item must record: course, configured fee at generation time, and payment status. | Must | ✅ |
| FR-INV-011 | The full monthly course fee applies to each line item regardless of the student's enrollment date within the billing month. Prorated pricing must not be implemented in the MVP. | Must | ✅ |
| FR-INV-012 | An overdue invoice must not trigger deletion of the student's account, enrollment record, or access to previously paid content. | Must | ✅ |

---

### FR-PAY: Payment Submission and Verification

A payment submission records one bank transaction. It carries a verified amount (the amount confirmed from bank records by the finance administrator) and one or more line-item allocations (each allocation targets a specific invoice line item and records an allocated amount). The sum of allocated amounts must not exceed the verified amount. Outstanding balance for a line item is its fee minus any verified allocated amount covering it. Unallocated excess is the verified amount minus the total of all allocations.

| ID | Requirement | Priority | Status |
|---|---|---|---|
| FR-PAY-001 | A student in ACTIVE state must be able to upload a bank payment slip through the portal and allocate it against one or more invoice line items on their current monthly invoice. | Must | ✅ |
| FR-PAY-002 | An administrator or finance administrator must be able to enter a payment slip received via WhatsApp on behalf of a student and perform the same allocation. | Must | ✅ |
| FR-PAY-003 | A single payment submission must support allocation across one or more invoice line items. The student must explicitly select which line items the payment is intended to cover and enter the amount they believe corresponds to each. The system records the student's stated allocation; the finance administrator verifies the actual bank deposit amount and confirms or adjusts the allocation before any approval. | Must | ✅ |
| FR-PAY-004 | A finance administrator must be able to claim a payment submission from the shared verification queue before reviewing it. A claimed submission must not be concurrently editable by another reviewer. | Must | ✅ |
| FR-PAY-005 | A finance administrator must be able to record one of three outcomes for a claimed submission: **Approved**, **Requires Clarification**, or **Rejected**. | Must | ✅ |
| FR-PAY-006 | On **Approved**: the system must automatically and atomically create a course access entitlement for every invoice line item that is fully covered by the confirmed allocation (verified amount ≥ line item fee for that item). Only fully covered line items receive an access entitlement. | Must | ✅ |
| FR-PAY-007 | On **Requires Clarification**: the finance administrator must record the specific reason. The student must be able to upload additional evidence against the existing submission record without creating a new submission or replacing the original slip. Each evidence item must carry its upload timestamp. The submission must return to UNDER_REVIEW after additional evidence is uploaded. | Must | ✅ |
| FR-PAY-008 | On **Rejected**: the reason must be recorded; the original submission must be preserved; the student may submit a new separate payment submission. | Must | ✅ |
| FR-PAY-009 | The approver's identity and timestamp must be recorded on every payment state transition. | Must | ✅ |
| FR-PAY-010 | The system must detect and flag potential duplicate submissions: the same student + billing month + approximate amount appearing more than once in the queue. | Must | ✅ |
| FR-PAY-011 | The system must prevent duplicate access entitlements for the same line item (student + course + billing period). | Must | ✅ |
| FR-PAY-012 | Financial record corrections must preserve the original record with an audit trail entry. No silent overwrites are permitted. | Must | ✅ |
| FR-PAY-013 | One authorized finance administrator may approve ordinary payments after verification. No dual-approval workflow exists in the MVP. No approval chains or configuration flags for speculative future dual-approval policies may be introduced. | Must | ✅ |
| FR-PAY-014 | When the verified bank deposit amount is less than the total fees of the allocated line items (**partial payment**), the system must flag this to the finance administrator. The finance administrator must explicitly decide which specific line items, if any, are fully covered before recording an approval. A line item must not receive an access entitlement unless its full fee is covered by the confirmed allocation. The outstanding balance for uncovered line items remains due. | Must | ✅ |
| FR-PAY-015 | When the verified bank deposit amount exceeds the total fees of the allocated line items (**excess payment**), the system must flag the unallocated excess amount to the finance administrator. The finance administrator must record the disposition of the excess (noted as overpayment on record, or allocation adjusted to cover additional line items). The system must not automatically credit the excess amount to future invoices. | Must | ✅ |
| FR-PAY-016 | When a payment submission cannot be matched to any student invoice, a finance administrator must be able to record it as an **unmatched payment**, add investigative notes, and either resolve the match manually or mark it for follow-up. Unmatched payments must not be auto-approved or auto-discarded. | Must | ✅ |
| FR-PAY-017 | The system must prevent the same bank transaction reference from being applied as a confirmed allocation against the same invoice line item more than once. | Must | ✅ |
| FR-PAY-018 | Imported historical payment records must enter with UNVERIFIED status and require explicit bank reconciliation before being recorded as confirmed and before any access entitlement is activated. | Must | ✅ |

**Payment state machine** ✅
```
SUBMITTED
  └─► UNDER_REVIEW              (claimed by a finance administrator)
        ├─► APPROVED             → system activates all allocated course entitlements atomically
        ├─► REQUIRES_CLARIFICATION → student uploads additional evidence → returns to UNDER_REVIEW
        └─► REJECTED             → reason recorded; original preserved; new submission allowed
```

---

### FR-ACCESS: Learning Access

| ID | Requirement | Priority | Status |
|---|---|---|---|
| FR-ACCESS-001 | The student dashboard must display Zoom meeting details, study materials, and recording entries only for courses where the student holds an active paid access entitlement for the relevant billing period. | Must | ✅ |
| FR-ACCESS-002 | Learning access must be activated automatically on payment approval — no additional administrator step is required. | Must | ✅ |
| FR-ACCESS-003 | Live Zoom class access (meeting links and credentials) must never be displayed for an unpaid billing period, regardless of historical access status. | Must | ✅ |
| FR-ACCESS-004 | Students retain authorized access to study materials and available recording links for billing periods they have already paid. Non-payment in a later period must not revoke access to prior paid periods. Actual recording availability for prior periods is subject to the retention policies of the external hosting service and applicable licensing requirements — the platform preserves the access entitlement and the stored link, but cannot guarantee the external content remains available. | Must | ✅ |
| FR-ACCESS-005 | The content access policy (which resource types are included in historical access, and for how long) must be configurable by a Super Administrator through the administration interface without code changes. Access policy logic must not be hardcoded into individual frontend components. | Must | ⚠️ |
| FR-ACCESS-006 | Access entitlement is per-student, per-course, per-billing-period. An approved payment for period N activates access to period N content only. | Must | ✅ |
| FR-ACCESS-007 | No access must be granted between the payment deadline and the point of payment approval. Access activates on verified payment only. No grace-period access exists in the MVP. | Must | ✅ |
| FR-ACCESS-008 | Access entitlements for migrated student records are only activated after the imported payment has been reconciled and approved through the standard verification process. UNVERIFIED import status alone must not activate any access entitlement. | Must | ✅ |

---

### FR-LEARN: Learning Resource Management

| ID | Requirement | Priority | Status |
|---|---|---|---|
| FR-LEARN-001 | Teachers or administrators must be able to enter and update Zoom meeting details (meeting ID, password, link, schedule) for their assigned courses by billing period. | Must | ✅ |
| FR-LEARN-002 | Teachers or administrators must be able to upload study materials for their assigned courses. Study materials must be stored in private object storage and must not be served as public files. | Must | ✅ |
| FR-LEARN-003 | For class recordings, the MVP uses link-based management: teachers or administrators enter a URL pointing to an existing recording (Zoom cloud, Google Drive, or an institute-approved external host). Direct large-video file upload, video transcoding, and streaming infrastructure are out of scope for the MVP. | Must | ✅ |
| FR-LEARN-004 | Teachers must be able to create, edit, publish, and unpublish recording entries for their assigned courses. Unpublished recordings must not appear on student dashboards. | Must | ✅ |
| FR-LEARN-005 | The system must restrict disclosure of recording entry URLs to authenticated, authorized API responses only. A recording URL must never appear in an unauthenticated response, a public route, or an API response for a student who does not hold a valid access entitlement for the relevant billing period. | Must | ✅ |
| FR-LEARN-006 | Known limitation: once a recording URL has been legitimately delivered to a student through an authorized API response, the platform has no technical means to prevent that student from sharing the URL with others or accessing the external content outside e-Paperé. This limitation applies to all link-based recording models and must be documented in the system's operational notes. Recording availability is additionally subject to the retention and access policies of the external hosting service (Zoom cloud, Google Drive, or approved equivalent); the institute is responsible for managing recording retention on those services independently. | Must | ✅ |

---

### FR-NOTIF: Notifications

| ID | Requirement | Priority | Status |
|---|---|---|---|
| FR-NOTIF-001 | The system must generate in-app notifications for all key workflow events: registration confirmed, account activated, invoice generated, payment submitted, payment approved and access activated, clarification requested (with reason), payment rejected (with reason), course access activated, schedule changed, new material uploaded, payment due reminder, overdue payment reminder. | Must | ✅ |
| FR-NOTIF-002 | The system must provide copyable WhatsApp message templates for common administrator communications: enrollment confirmed, payment received, payment approved, clarification needed, payment rejected, overdue reminder. | Must | ✅ |
| FR-NOTIF-003 | Notification event generation must be decoupled from delivery channels. The system must emit structured notification events; delivery handlers (in-app, future WhatsApp API, SMS, email) are separate. Adding new delivery channels must not require redesigning the event model. | Must | ✅ |
| FR-NOTIF-004 | The system must trigger an overdue reminder in-app notification when an invoice passes the payment deadline without an approved payment. | Must | ✅ |

---

### FR-MIG: Migration

| ID | Requirement | Priority | Status |
|---|---|---|---|
| FR-MIG-001 | The system must support individual manual registration of existing students using the standard admin-assisted registration flow. | Must | ✅ |
| FR-MIG-002 | The system must support bulk import of existing students via a structured file format (CSV or equivalent). | Must | ✅ |
| FR-MIG-003 | The bulk import minimum required fields are: **student full name** and **current grade** (6–11). Optional fields: date of birth, guardian contact name, guardian phone / WhatsApp, existing course enrollments, historical payment records. | Must | ✅ |
| FR-MIG-004 | Records with insufficient identity data (name only, no grade or DOB) must be flagged for manual review. They must not be auto-activated or auto-merged with existing accounts. | Must | ✅ |
| FR-MIG-005 | Duplicate detection during bulk import must require at least two matching identity fields. Name-only matches must not trigger automatic account merging. | Must | ✅ |
| FR-MIG-006 | EP IDs for imported students must be generated through the same backend mechanism as new self-registrations. | Must | ✅ |
| FR-MIG-007 | Imported payment records must enter as UNVERIFIED. They must not activate course access until explicit bank reconciliation is completed and the payment is approved through the standard verification process. | Must | ✅ |
| FR-MIG-008 | Failed import rows must be individually reviewable and correctable by administrators after the batch completes. The failure of individual rows must not block other rows in the same batch. | Must | ✅ |
| FR-MIG-009 | The bulk import process must not create duplicate students, enrollments, invoices, or payments. | Must | ✅ |
| FR-MIG-010 | The audit trail must record the import origin and verification status of every imported record. | Must | ✅ |
| FR-MIG-011 | The migration must be incremental and must not disrupt ongoing classes or existing WhatsApp operations at any stage. The five-stage transition sequence must be supportable by the system: Preparation → Student Migration → Pilot Operation → Gradual Adoption → Portal-Centered Operations. | Must | ✅ |

---

### FR-REPORT: Reporting

| ID | Requirement | Priority | Status |
|---|---|---|---|
| FR-REPORT-001 | The Super Administrator / Owner dashboard must display: enrollment totals by subject/grade/course, verified revenue for the current billing month, outstanding invoice count and total, and an operational summary. | Must | ✅ |
| FR-REPORT-002 | The Finance Administrator dashboard must display: the payment verification queue with claim/lock status, a transaction audit trail (filterable by date, status, and student), and payment summaries by billing period. Finance administrators must not see payment amounts for individual students in a context accessible to other roles. | Must | ✅ |
| FR-REPORT-003 | The Administrator dashboard must display: student list with account status, enrollment and access status per student, and migration import status with flagged records. | Must | ✅ |
| FR-REPORT-004 | The Teacher dashboard must display: course roster per assigned course, enrollment count, and per-student access status (active or unpaid) for the current billing period. Teachers must not see payment amounts. | Must | ✅ |
| FR-REPORT-005 | The Student dashboard must display: active enrollments, invoice history, payment submission status, and current access entitlements. | Must | ✅ |

---

### FR-I18N: Internationalization and Localization ✅

The e-Paperé SMS must be fully bilingual in **English (en)** and **Sinhala (සිංහල, si-LK)**. Bilingual support is a mandatory MVP requirement across all five roles and all user journeys. Both languages must offer equivalent functionality — no feature, workflow, or role may be available in one language and absent in the other.

**Content type distinctions used in this section:**
- *System interface text* — strings generated and controlled by the application (labels, buttons, messages, statuses, errors, notifications). All must be translated.
- *Institute-configured content* — course names, subjects, announcements, resource titles entered by administrators or teachers. Translation support is defined in FR-I18N-011.
- *User-generated content* — free-text entered by users (e.g., clarification notes, investigative notes). Not automatically translated; displayed as entered.

#### Language Selection

| ID | Requirement | Priority | Status |
|---|---|---|---|
| FR-I18N-001 | The system must support two languages: English (en) and Sinhala (si-LK). Both languages must be available across all five roles and all user journeys without feature gaps. | Must | ✅ |
| FR-I18N-002 | A visible language selector must be present on the pre-login landing page, the registration screen, the login screen, and all authenticated application interfaces, so users can select their preferred language at any point. | Must | ✅ |
| FR-I18N-003 | A first-time user must be able to select their preferred language before beginning the registration flow. The language selector must not require an account or login. | Must | ✅ |
| FR-I18N-004 | Switching language must not cause loss of data already entered in any form in the current session. All field values, selections, and workflow state must be preserved across a language switch. | Must | ✅ |
| FR-I18N-005 | The selected language must persist across page navigation and page refreshes within the current session. Where technically appropriate, the preference must also persist across subsequent sessions for the same user. | Must | ✅ |
| FR-I18N-006 | If no language preference has been set, the system must apply a configurable default language. The default language must be configurable by a Super Administrator without code changes. | Must | ✅ |

#### System Interface Translation

| ID | Requirement | Priority | Status |
|---|---|---|---|
| FR-I18N-007 | All system-generated user-facing interface text must be available in both languages. This includes without limitation: navigation menus, page headings and descriptions, buttons and action labels, registration and login forms, course enrollment and withdrawal interfaces, invoice and payment interfaces, payment status labels (SUBMITTED, UNDER_REVIEW, APPROVED, REQUIRES_CLARIFICATION, REJECTED, OVERDUE, PARTIAL, EXCESS, UNMATCHED), bank-slip upload instructions, validation and error messages, confirmation dialogs, access restriction messages, class schedule interfaces, study-material and recording library interfaces, administrative dashboards, report labels and filtering controls, account recovery and activation instructions, and in-app notification messages. | Must | ✅ |
| FR-I18N-008 | Both languages must provide complete user journeys for all five roles. No critical workflow path — registration, enrollment, payment submission, payment verification, access, course management, reporting, migration — may contain untranslated system-generated interface strings in either language. | Must | ✅ |
| FR-I18N-009 | System-generated notification messages (FR-NOTIF-001) must be delivered in the recipient's selected language at the time of delivery. | Must | ✅ |
| FR-I18N-010 | Copyable WhatsApp message templates (FR-NOTIF-002) must be provided in both languages. The administrator selects which language version to copy. | Must | ✅ |

#### Institute-Configured and User-Generated Content

| ID | Requirement | Priority | Status |
|---|---|---|---|
| FR-I18N-011 | For institute-configured content (course names, subject names, teaching categories, announcements, resource titles) that administrators or teachers have entered with a translation in both languages, the system must display the version matching the user's selected language. Where only one language version of a configured item exists, the system must display the available version with a clear visual indicator that a translation is not yet provided. | Must | ✅ |
| FR-I18N-012 | The system must not automatically machine-translate user-generated free-text content (clarification notes, investigative notes, administrator-entered payment notes). Such content is displayed as entered, in the language in which it was written. | Must | ✅ |
| FR-I18N-013 | Date values must be formatted according to Sri Lankan conventions (DD/MM/YYYY or equivalent locale-appropriate format) in both language modes. Currency values must be displayed as Sri Lankan Rupees (LKR) in a consistent format in both language modes. | Must | ✅ |

---

## 8. Business Rules

Business rules are named, system-wide constraints. They are enforced regardless of which actor triggers the relevant operation.

### BR-INV: Invoice Rules ✅ / ⚠️

| ID | Rule | Status |
|---|---|---|
| BR-INV-01 | A student has one invoice per billing month. That invoice contains one line item per enrolled course for that month. Duplicate line items for the same student + course + billing month are prohibited regardless of trigger. | ✅ |
| BR-INV-02 | The billing period is a calendar month. Billing is not based on a rolling 30-day window. | ✅ |
| BR-INV-03 | Renewal invoices are generated automatically on the 25th of the preceding calendar month (configurable by Super Administrator). | ⚠️ |
| BR-INV-04 | A new enrollment generates a line item on the student's invoice for that billing month immediately on the enrollment request. If no invoice yet exists for that month, one is created. | ✅ |
| BR-INV-05 | The payment deadline is the 10th of the billing month (configurable by Super Administrator). An invoice past this deadline without an approved payment moves to OVERDUE. | ⚠️ |
| BR-INV-06 | An invoice in the payment window does not authorize access. | ✅ |
| BR-INV-07 | The full monthly course fee applies regardless of enrollment date within the billing month. No prorated pricing. | ✅ |
| BR-INV-08 | Each line item fee is server-side calculated from configured pricing. Client-submitted amounts are rejected. | ✅ |
| BR-INV-09 | An invoice and its line items never grant access. Access activates only on payment approval covering the relevant line item. | ✅ |
| BR-INV-10 | An overdue invoice must not trigger deletion of the student account, enrollment record, or access to previously paid content. | ✅ |
| BR-INV-11 | Withdrawal effective month M: no invoice generated for month M or later. All invoices for months before M are preserved. | ✅ |

### BR-PAY: Payment Rules ✅

| ID | Rule | Status |
|---|---|---|
| BR-PAY-01 | A finance administrator must claim a submission before review begins. Claimed submissions cannot be concurrently edited by another reviewer. | ✅ |
| BR-PAY-02 | One finance administrator approval is sufficient for ordinary payment verification. No dual-approval in MVP. | ✅ |
| BR-PAY-03 | Approver identity and timestamp are recorded on every state transition. | ✅ |
| BR-PAY-04 | A partial payment (verified deposit amount < total fees of allocated line items) does not automatically approve any line item. The finance administrator explicitly decides which specific line items are fully covered. Only fully covered line items receive an access entitlement. | ✅ |
| BR-PAY-05 | An excess payment (verified deposit amount > total fees of allocated line items) produces an unallocated excess. The finance administrator records the disposition. The system does not auto-credit the excess to future invoices. | ✅ |
| BR-PAY-06 | The same bank transaction reference must not be applied as a confirmed allocation against the same invoice line item more than once. | ✅ |
| BR-PAY-07 | No payment state may be silently overwritten. All corrections preserve originals with audit trail entries. | ✅ |
| BR-PAY-08 | Clarification resubmission appends evidence to the existing submission record. The original slip is not replaced. The full evidence history is preserved with individual timestamps. | ✅ |
| BR-PAY-09 | Imported historical payments are UNVERIFIED until explicit reconciliation is completed and approved. | ✅ |

### BR-ACCESS: Access Rules ✅ / ⚠️

| ID | Rule | Status |
|---|---|---|
| BR-ACCESS-01 | Access entitlement is per-student + per-course + per-billing-period. | ✅ |
| BR-ACCESS-02 | Payment approval for period N activates access to period N content only. | ✅ |
| BR-ACCESS-03 | Non-payment in period N does not revoke authorized access to previously paid periods 1 through N-1. Recording availability for prior periods is subject to the retention policies of the external hosting service; the platform preserves the entitlement and stored link. | ✅ |
| BR-ACCESS-04 | Live Zoom meeting credentials are never displayed for an unpaid period. | ✅ |
| BR-ACCESS-05 | No grace-period access. Access activates on verified payment only. | ✅ |
| BR-ACCESS-06 | Access policy parameters are configurable by Super Administrator without code changes. Policy logic must not be hardcoded in frontend components. | ⚠️ |
| BR-ACCESS-07 | Withdrawal does not revoke access for previously paid periods. | ✅ |
| BR-ACCESS-08 | Migrated student access entitlements activate only after imported payment has been reconciled and approved. UNVERIFIED import status alone does not activate access. | ✅ |

### BR-ENROL: Enrollment Rules ✅

| ID | Rule | Status |
|---|---|---|
| BR-ENROL-01 | Enrollment is persistent. A student does not re-enroll each month. | ✅ |
| BR-ENROL-02 | A student may have only one active enrollment per course per billing month. | ✅ |
| BR-ENROL-03 | Enrollment does not grant access. | ✅ |
| BR-ENROL-04 | Guardian approval is not a prerequisite for enrollment in MVP. | ✅ |
| BR-ENROL-05 | Withdrawal preserves all prior invoices, payments, and access records. | ✅ |

### BR-ACCT: Account Rules ✅

| ID | Rule | Status |
|---|---|---|
| BR-ACCT-01 | An EP ID is permanent, never reassigned, and never encodes mutable attributes (grade, subject, status). | ✅ |
| BR-ACCT-02 | Account states (PENDING_ACTIVATION, ACTIVE, SUSPENDED, DISABLED) are independent of enrollment and payment status. | ✅ |
| BR-ACCT-03 | PENDING_ACTIVATION students may browse course listings but may not enroll or access paid content. | ✅ |
| BR-ACCT-04 | SUSPENDED accounts block login and access but preserve all records. | ✅ |
| BR-ACCT-05 | DISABLED accounts block login and access. Only Super Administrators may reactivate a DISABLED account. | ✅ |
| BR-ACCT-06 | No role may view or retrieve an existing student password. | ✅ |
| BR-ACCT-07 | Account recovery generates a new one-time activation credential. The initiating administrator never sees the resulting password. Identity must be confirmed by independent means before recovery is initiated. | ✅ |

---

## 9. Non-Functional Requirements

### NFR-PERF: Performance 🔲 *(Targets defined and validated in Architecture phase)*

| ID | Requirement | Status |
|---|---|---|
| NFR-PERF-001 | The system architecture must support at least three scale scenarios without fundamental redesign: ~200 monthly active users (initial), ~2,000 (near-term), ~10,000 (long-term). The Architecture phase must produce a capacity model covering all three tiers before any build milestone is approved. | 🔲 |
| NFR-PERF-002 | Capacity planning must address three distinct user count dimensions: (a) total registered students — all accounts ever created; (b) monthly active users — students with at least one verified payment and active access in the billing month; (c) simultaneous users — peak concurrent sessions. | 🔲 |
| NFR-PERF-003 | Testable API response time SLAs, login concurrency targets, invoice generation throughput, file delivery capacity, availability targets, RTO, and RPO must be defined and validated through load testing in the Architecture phase. | 🔲 |
| NFR-PERF-004 | The system must support the institute-approved concurrent login and immediate dashboard-access workload — characteristic of the class-start spike when many students authenticate and load their dashboards within a short window — without unacceptable response delays, erroneous authentication failures, unauthorized data exposure, or loss of session integrity. Capacity targets and load-test acceptance thresholds for this scenario must be derived from operational estimates (enrollment counts and typical class-start patterns), defined in the Architecture phase, and verified under simulated concurrent load in the staging environment before production release. | 🔲 |

### NFR-DEPLOY: Deployment Requirements 🔲 *(Architecture phase — all are gating deliverables before production launch)*

| ID | Requirement | Status |
|---|---|---|
| NFR-DEPLOY-001 | All endpoints must be served over HTTPS. SSL/TLS certificates must be managed and renewed automatically. | ✅ |
| NFR-DEPLOY-002 | A minimum of three separated environments must exist: development, staging, and production. No production changes may bypass the staging environment. | 🔲 |
| NFR-DEPLOY-003 | Credentials and secrets must not appear in source control. A dedicated secrets management approach must be used. | ✅ |
| NFR-DEPLOY-004 | Automated database backups with a tested restoration procedure must be in place and verified before production launch. | 🔲 |
| NFR-DEPLOY-005 | Production monitoring and structured logging must be in place before production launch. | 🔲 |
| NFR-DEPLOY-006 | Deployment rollback procedures must be defined and verified before production launch. | 🔲 |
| NFR-DEPLOY-007 | The infrastructure must support scalability from the Small scenario (~200 MAU) to the Large scenario (~10,000 MAU) without requiring a fundamental redesign. | 🔲 |
| NFR-DEPLOY-008 | Uploaded payment slips, study materials, and recording links must be managed through private, access-controlled storage. Raw storage URLs must not be publicly accessible. | ✅ |
| NFR-DEPLOY-009 | The infrastructure must comply with applicable Sri Lankan data protection requirements. | ⚖️ 🔲 |
| NFR-DEPLOY-010 | Operating costs must be appropriate to a growing Sri Lankan institute. Provider selection must not be based solely on popularity. | 🔲 |

### NFR-AVAIL: Availability ✅ / 🔲

| ID | Requirement | Status |
|---|---|---|
| NFR-AVAIL-001 | The system must be production-ready, reliable, and available to students during active class periods. | ✅ |
| NFR-AVAIL-002 | RTO and RPO targets must be defined in the Architecture phase based on institute operational needs. | 🔲 |

### NFR-MAINT: Maintainability ✅

| ID | Requirement | Status |
|---|---|---|
| NFR-MAINT-001 | The codebase must be consistently structured with clear module boundaries and separation of concerns, following established project conventions. | ✅ |
| NFR-MAINT-002 | Adding new subjects, grades, course types, fee structures, billing rules, and access policies must not require core code modifications. | ✅ |
| NFR-MAINT-003 | The modular monolith structure must permit future service extraction if genuine scale demands it. | ✅ |
| NFR-MAINT-004 | All list-returning API endpoints must implement pagination. Unbounded queries against student, invoice, payment, or enrollment collections are prohibited in production. | ✅ |

### NFR-EXT: Extensibility ✅

| ID | Requirement | Status |
|---|---|---|
| NFR-EXT-001 | The architecture must support all deferred features (guardian accounts, payment gateways, WhatsApp API, SMS, email, Zoom API, advanced analytics, A/L expansion, mobile apps, dual-approval, grace-period access, self-service recovery) as future additions without structural redesign. | ✅ |
| NFR-EXT-002 | The data model must allow a guardian account to be linked to one or more student records in a future phase without migrating existing student records or requiring structural schema changes. | ✅ |
| NFR-EXT-003 | The notification architecture must allow delivery channels (WhatsApp API, SMS, email) to be added without redesigning the event model. | ✅ |
| NFR-EXT-004 | The recording storage model must permit future integration with dedicated video hosting or streaming services without fundamental redesign of the access control layer. | ✅ |

### NFR-TEST: Testability ✅

| ID | Requirement | Status |
|---|---|---|
| NFR-TEST-001 | Module boundaries must be clear enough to support unit, integration, and end-to-end tests. | ✅ |
| NFR-TEST-002 | Financial workflows (invoice generation, payment verification, multi-course allocation, partial payment handling, access activation, migrated payment reconciliation) must have comprehensive automated test coverage. | ✅ |
| NFR-TEST-003 | All five critical user journeys (UJ-1 through UJ-5) must be coverable by end-to-end tests. | ✅ |

### NFR-ACCESS: Accessibility ✅

| ID | Requirement | Status |
|---|---|---|
| NFR-ACCESS-001 | The student portal must be usable by students across Grades 6–11, including young adolescents who may be first-time web users accessing the platform on a mobile phone browser. | ✅ |
| NFR-ACCESS-002 | The accessibility baseline approved in this PRD is WCAG 2.1 AA. The preferred target is WCAG 2.2 AA. UX and Architecture must document any gaps between the 2.1 AA baseline and the 2.2 AA target and resolve them where feasible within MVP scope; any items deferred beyond MVP must be recorded in the open-decision register. Full validation requires manual testing with assistive technologies and expert accessibility review. | ✅ |
| NFR-ACCESS-003 | The language selector (FR-I18N-002) must be keyboard-accessible and must be identifiable by screen readers. The selected language must be programmatically communicated to assistive technologies (e.g., via the HTML `lang` attribute on the document or relevant subtrees). | ✅ |

### Engineering Quality Standards ✅

| ID | Standard |
|---|---|
| EQ-001 | TypeScript strict mode enabled across frontend and backend. |
| EQ-002 | Consistent project structure with clear module boundaries and documented separation of concerns. |
| EQ-003 | All public APIs versioned from day one (e.g., /api/v1/). |
| EQ-004 | All server-side input validated before processing. Client-submitted values are not trusted. |
| EQ-005 | Authentication and authorization enforced at the API layer on every protected endpoint. |
| EQ-006 | MongoDB: authenticated connections, least-privilege service accounts, restricted network access, appropriate indexes from day one. |
| EQ-007 | Financial operations requiring consistency (invoice generation, payment approval, multi-course access activation) must implement transactional patterns appropriate for MongoDB. |
| EQ-008 | Audit log maintained for all financially significant events and all administrative actions affecting student accounts, enrollments, or payments. |
| EQ-009 | Automated test coverage: unit tests for business logic, integration tests for API endpoints, end-to-end tests for all critical payment and access workflows. |
| EQ-010 | All code changes go through code review before merging to the main branch. |
| EQ-011 | A CI/CD pipeline must automate build, lint, test, and deployment steps. |
| EQ-012 | MongoDB data model designed for efficient querying: indexes on all frequently queried fields, pagination on all list endpoints, no unbounded queries. |
| EQ-013 | Sensitive configuration never in source code. Environment variables or a secrets manager required. |
| EQ-014 | Module documentation sufficient for a developer unfamiliar with the codebase to understand component responsibilities and integration points. |
| EQ-015 | No speculative complexity, premature microservices, or feature flags for capabilities not confirmed in this PRD. |

---

### NFR-I18N: Localization Quality ✅

These requirements are testable acceptance conditions for bilingual correctness. Architecture phase must design to satisfy them; UX phase must validate them.

| ID | Requirement | Status |
|---|---|---|
| NFR-I18N-001 | Sinhala Unicode text (Unicode range U+0D80–U+0DFF) must render correctly in all system interfaces on supported browsers without character corruption, missing glyphs, or substitution with placeholder characters. | ✅ |
| NFR-I18N-002 | Typography for both languages must be legible at all text sizes used in the interface. Sinhala and English font pairings must be verified for readability on mobile phone screens. | ✅ |
| NFR-I18N-003 | Layouts must be responsive and must accommodate the natural text-length differences between Sinhala and English. No interface element may display overlapping, clipped, or unreadable text in either language at the supported viewport sizes. | ✅ |
| NFR-I18N-004 | All text fields that accept Sinhala or English input must correctly accept, store, retrieve, and display Unicode characters. Search and filtering operations on student names, course names, and other text fields must handle Unicode input correctly. | ✅ |
| NFR-I18N-005 | Translations must be consistent within each language across all modules. The same term (e.g., a payment status label, a role name, an action button) must use the same translation wherever it appears. | ✅ |
| NFR-I18N-006 | When a translated string is not available for a given key in the selected language, the system must fall back to the other supported language rather than displaying a raw translation key, an empty string, or a system error. The fallback language must be configurable. | ✅ |
| NFR-I18N-007 | Date values must be formatted in Sri Lankan locale conventions (DD/MM/YYYY or equivalent) in both language modes. Currency amounts must be displayed as LKR with consistent formatting in both language modes. | ✅ |
| NFR-I18N-008 | The HTML `lang` attribute (or equivalent programmatic language identification) must be set correctly for both the document and any subtrees that switch language, so screen readers announce content in the correct language. | ✅ |
| NFR-I18N-009 | All five user journeys (UJ-1 through UJ-5) must be executable end-to-end in Sinhala and in English without encountering untranslated system-generated strings, layout failures, or data loss. | ✅ |
| NFR-I18N-010 | The i18n implementation must support adding a third language in the future without modifying application module code or component logic. | ✅ |

---

## 10. Security and Privacy Requirements

| ID | Requirement | Status |
|---|---|---|
| SEC-001 | All passwords hashed server-side using bcrypt or equivalent immediately upon receipt. Passwords must never be stored in plain text, logged in any form, or transmitted except over an encrypted HTTPS connection. | ✅ |
| SEC-002 | No role may retrieve or view existing student passwords. | ✅ |
| SEC-003 | Login rate limiting and brute-force protection enforced at the authentication layer. | ✅ |
| SEC-004 | All traffic served over HTTPS. No plain HTTP endpoints permitted in production. | ✅ |
| SEC-005 | Session tokens short-lived and invalidated on logout. | ✅ |
| SEC-006 | Role-based access control enforced at the API layer. Frontend enforcement is supplementary only. | ✅ |
| SEC-007 | All server-side validation performed on the backend. Client-submitted values (including payment amounts) not trusted. | ✅ |
| SEC-008 | Uploaded payment slips and study materials stored in private object storage. Recording URLs served through access-controlled routes only. Raw storage URLs must not be exposed publicly or via unauthorized API responses. | ✅ |
| SEC-009 | No credentials or secrets committed to source control. Secret management via environment variables or a secrets manager. | ✅ |
| SEC-010 | Financial records and audit trails immutable. Corrections preserve originals with audit trail entries. No silent overwrites. | ✅ |
| SEC-011 | MongoDB access secured: authenticated connections, minimal privileges, restricted network access. | ✅ |
| SEC-012 | The system serves minors (Grades 6–11). Child data protection and privacy obligations under Sri Lankan law must be reviewed and addressed before production launch. This is a hard production gate condition. | ⚖️ |
| SEC-013 | Whether optional guardian contact collection satisfies applicable consent requirements under Sri Lankan law must be verified before production launch. | ⚖️ |
| SEC-014 | Student personal data handled with appropriate access controls and retention policies consistent with applicable Sri Lankan data protection requirements. | ⚖️ |
| SEC-015 | If the system is hosted outside Sri Lanka, cross-border data transfer obligations must be assessed and addressed before production launch. | ⚖️ 🔲 |
| SEC-016 | Content-retention and licensing policy implications for historical access to recordings and materials must be reviewed before the historical access policy (FR-ACCESS-004, BR-ACCESS-03) is finalized for production. | ⚖️ ⚠️ |
| SEC-017 | Account recovery must not be initiatable based solely on easily discoverable student information. The administrator must confirm student identity by independent means before initiating a credential reset. | ✅ |

---

## 11. Risks

| Risk | Impact | Mitigation built into design |
|---|---|---|
| Low student self-registration adoption — admin bottleneck | High | Admin-assisted registration path is permanent; self-registration UX must be completable by a Grade 6 student on a mobile phone browser |
| In-app notifications go unseen — students don't check the portal | High | Copyable WhatsApp templates bridge the gap during transition; WhatsApp remains a permanent supplementary channel |
| Payment verification bottleneck at scale | Medium | Claim/lock queue supports multiple finance administrators; single approver is sufficient for MVP |
| Migration data quality — WhatsApp records are incomplete | Medium | Validation flags, manual review queue, UNVERIFIED import status — all incomplete records require explicit administrator action before activation |
| Scope creep during build — online payments, SMS, guardian features, Zoom API will be requested early | Medium | Architecture must absorb these without requiring them; EQ-015 prohibits speculative preparation |
| Child data protection and safeguarding obligations | Medium | Hard production gate: SEC-012 through SEC-016 must all be cleared before launch |
| Sinhala translation quality and completeness — missing or poor-quality translations create a degraded experience for Sinhala-first users | Medium | NFR-I18N-005 requires consistent translations across modules; NFR-I18N-006 requires graceful fallback; translation review should be included in the release checklist |
| Sinhala Unicode rendering failures on older or low-end devices — some students may access the portal on budget Android phones | Medium | NFR-I18N-001 and NFR-I18N-002 require rendering verification; Architecture must include device-range testing in the QA plan |
| Recording URL sharing — platform access controls cannot prevent external sharing | Low | FR-LEARN-006 documents this limitation; the platform grants and restricts access to the URL, not the content at the URL |
| Local competition | Low–Medium | Existing Sri Lankan tools lack payment-gated content access — that gap is the primary differentiator at launch |

---

## 12. Open Decision Register

All unresolved items tracked here. None may be silently discarded or treated as resolved without explicit approval.

### ⚠️ Pending Final Institute Approval — Required Before PRD Is Locked

| ID | Decision | Business Impact | Working Position | Owner | Stage |
|---|---|---|---|---|---|
| OD-INV-01 | Invoice renewal generation date | When students see next month's invoice | **APPROVED:** 25th of preceding month, configurable ✅ | Institute owner | Resolved |
| OD-INV-02 | Payment deadline | When invoice becomes overdue and reminders trigger | **APPROVED:** 10th of billing month, configurable ✅ | Institute owner | Resolved |
| OD-R01 | Recording storage model | Cost and workflow implications | **APPROVED:** Option A — link-based management ✅ | Aditya | Resolved |
| OD-ACC-01 | Historical content access policy | Student retention and licensing obligations | **APPROVED:** Students retain authorized access to study materials and available recording links for previously paid billing periods; unpaid periods restricted; live Zoom always blocked for unpaid; recording availability subject to external host retention and licensing requirements ✅ | Institute owner | Resolved |
| OD-ACC-02 | Content categories in historical access (materials only vs. materials + recording links) | Licensing obligation scope | **APPROVED:** Include both study materials and recording links ✅ | Institute owner | Resolved |
| OD-ACT-01 | One-time activation link expiry duration and behaviour | Too short → lockout; too long → security window | **APPROVED:** 48-hour expiry, single-use, securely regenerable by administrator ✅ | Institute owner | Resolved |

### 🔲 Deferred to Architecture Phase

| ID | Decision | Direction | Stage |
|---|---|---|---|
| OD-ARCH-01 | Hosting provider, deployment region, infrastructure cost | Evaluate managed options vs. local Sri Lankan providers; document trade-offs and compliance implications | Architecture phase |
| OD-ARCH-02 | Testable performance SLAs (API latency, login concurrency, invoice throughput, file delivery, availability, RTO, RPO) | Defined after real enrollment baseline established; Architecture must produce capacity model for all three tiers | Architecture phase |
| OD-ARCH-03 | Self-service account recovery mechanism | Depends on confirmed contact fields (see OD-ARCH-05); MVP floor: admin-initiated reset is confirmed | Architecture phase |
| OD-ARCH-04 | Data residency and cross-border transfer compliance detail | Required if hosted outside Sri Lanka | Architecture phase |
| OD-ARCH-05 | Contact fields required for future self-service account recovery (email, phone, or neither) | Decision may require updating FR-REG-001 if a field is promoted from optional to required; must be resolved before Architecture completes account recovery design | Architecture phase |
| OD-ARCH-06 | i18n library and implementation pattern selection | Architecture must select the React i18n library, translation file organization, key naming conventions, language-preference storage mechanism (cookie, localStorage, or user profile), fallback language configuration, and backend error-code strategy for consistent client-side translation. Must satisfy FR-I18N and NFR-I18N. Must not hardcode UI strings in components. Must support adding a third language without module redesign. | Architecture phase |
| OD-ARCH-07 | Sinhala Unicode font strategy | Architecture must specify the Sinhala web font(s), loading strategy (system font fallback vs. web font delivery), and performance impact on mobile devices. Must satisfy NFR-I18N-001 and NFR-I18N-002. | Architecture phase |
| OD-ARCH-08 | Automated missing-translation-key detection | Architecture must evaluate and include a CI/CD check that flags missing translation keys before builds merge. Satisfies NFR-I18N-010 extensibility requirement. | Architecture phase |

### 🔲 Pre-Future-Phase Prerequisites

| ID | Item | Notes |
|---|---|---|
| OD-FUTURE-PRE-01 | Confirm institute business registration status for payment gateway merchant account eligibility (PayHere, webxPay, Mintpay) before gateway integration phase begins | Gateway integration (OD-FUTURE-03) is contingent on this check |

### ⚖️ Legal / Compliance — Hard Production Gate Conditions

| ID | Item | Owner |
|---|---|---|
| OD-LEGAL-01 | Child data protection and privacy obligations under Sri Lankan law for a minor-serving platform | Legal advisor |
| OD-LEGAL-02 | Whether optional guardian contact collection satisfies applicable consent requirements | Legal advisor |
| OD-LEGAL-03 | Content-retention and licensing policy for historical access to recordings and materials | Legal advisor + Institute owner |
| OD-LEGAL-04 | Data residency and cross-border transfer obligations if hosted outside Sri Lanka | Legal advisor |

### 🔲 Deferred to Future Product Phase

| ID | Capability |
|---|---|
| OD-FUTURE-01 | Guardian accounts, login, dashboard, multi-child management |
| OD-FUTURE-02 | Mandatory guardian linking and guardian course approval |
| OD-FUTURE-03 | Online payment gateway integration (PayHere or equivalent) — see OD-FUTURE-PRE-01 |
| OD-FUTURE-04 | Automated WhatsApp Business API messaging |
| OD-FUTURE-05 | Automated SMS (Dialog/Mobitel) and email notifications |
| OD-FUTURE-06 | Zoom API automation |
| OD-FUTURE-07 | Advanced analytics and business intelligence |
| OD-FUTURE-08 | Grades 1–5 (Primary) and 12–13 (A/L) |
| OD-FUTURE-09 | Native mobile applications |
| OD-FUTURE-10 | Dual-approval payment verification |
| OD-FUTURE-11 | Self-service token-based account recovery |
| OD-FUTURE-12 | Automatic grace-period access feature |
| OD-FUTURE-13 | Direct video file upload and streaming infrastructure |

---

## 13. PRD Readiness Gate ✅

*All gate conditions verified as of 2026-10-16. Final corrections applied 2026-10-16.*

### Requirements Consistency
- ✅ No confirmed business rules contradict each other across FR-INV, FR-PAY, FR-ACCESS, and BR-* sections.
- ✅ Invoice model is consistent throughout: one invoice per student per billing month with course line items; payment allocations target line items; access entitlements are per line item. Applied across UJ-3, FR-INV, FR-PAY, BR-INV, BR-PAY, Addendum B.
- ✅ No `[ASSUMPTION]` tags remain unresolved.
- ✅ FR-AUTH-002 and SEC-001 corrected: passwords must not be stored in plain text, must not be logged, and must be transmitted only over HTTPS. "Transmitted in unhashed form" removed — that phrasing implied incorrect client-side pre-hashing.
- ✅ FR-LEARN-005/006 corrected: system must actively restrict recording URL disclosure to authenticated, authorized responses; known limitation of link-based model (inability to control post-delivery sharing) explicitly documented; external host retention dependency documented.
- ✅ OD-ACC-01 APPROVED: historical access to study materials and available recording links for paid periods confirmed; recording availability subject to external host policies and licensing. FR-ACCESS-004 and BR-ACCESS-03 updated from ⚠️ to ✅.
- ✅ OD-ACC-02 APPROVED: historical access covers both study materials and recording links.
- ✅ OD-ACT-01 APPROVED: activation links expire after 48 hours, are single-use, and are securely regenerable. FR-REG-006 and UJ-5 updated.
- ✅ No superseded requirements from master-requirements §24 leaked into this PRD (verified: zero leakage across six superseded items).

### Functional Requirements Coverage
- ✅ FR-REG, FR-AUTH, FR-COURSE, FR-ENROL, FR-INV, FR-PAY, FR-ACCESS, FR-LEARN, FR-NOTIF, FR-MIG, FR-REPORT — all complete.
- ✅ **FR-I18N-001 through FR-I18N-013** — bilingual amendment complete; English and Sinhala mandatory across all five roles.
- ✅ Course withdrawal: FR-ENROL-007 through FR-ENROL-011, BR-ENROL-05, BR-INV-11.
- ✅ Multi-course invoice and payment allocation: FR-INV-001 (line-item model), FR-PAY-003, FR-PAY-006, BR-INV-01, BR-INV-04.
- ✅ Partial, excess, and unmatched payments with explicit financial terminology: FR-PAY-014, FR-PAY-015, FR-PAY-016, BR-PAY-04, BR-PAY-05.
- ✅ Migrated student access gate: FR-ACCESS-008, BR-ACCESS-08.
- ✅ Recording storage model: FR-LEARN-003 through FR-LEARN-006 (OD-R01 resolved).
- ✅ Account recovery identity verification: FR-AUTH-009, BR-ACCT-07.
- ✅ Deployment requirements: NFR-DEPLOY-001 through NFR-DEPLOY-010.
- ✅ Activation link single-use and regeneration: FR-REG-006.

### Non-Functional Requirements Coverage
- ✅ Performance, availability, deployment, maintainability, extensibility, testability, accessibility — all addressed.
- ✅ **NFR-I18N-001 through NFR-I18N-010** — localization quality requirements complete.
- ✅ Accessibility baseline: WCAG 2.1 AA (approved); preferred target WCAG 2.2 AA (documented); gap resolution assigned to UX and Architecture (NFR-ACCESS-002 updated).
- ✅ Architecture-phase deferred items clearly marked 🔲.
- ✅ NFR-MAINT-004 (pagination / no unbounded queries) present as enforceable NFR.

### Critical User Journey Acceptance Criteria
- ✅ UJ-1 (self-registration + first enrollment + payment + access activation) — ACs defined; bilingual ACs added.
- ✅ UJ-2 (clarification resubmission + evidence history) — ACs defined.
- ✅ UJ-3 (multi-course single bank transfer: line-item allocation, finance admin verification, partial-payment gate) — ACs updated; bilingual payment status AC added.
- ✅ UJ-4 (course withdrawal + historical record preservation) — ACs defined.
- ✅ UJ-5 (admin-assisted registration + 48-hour single-use activation + regeneration) — ACs updated.
- ✅ NFR-I18N-009 requires all five UJs to be executable end-to-end in both Sinhala and English without untranslated strings or layout failures.

### MVP Scope Verification
- ✅ All features in §5 In Scope have at least one FR.
- ✅ Bilingual support (English + Sinhala) explicitly listed in §5 In Scope as mandatory.
- ✅ All features in §5 Out of Scope have no FR.
- ✅ Self-service token-based account recovery explicitly listed in Out of Scope.
- ✅ No speculative implementation in any FR.
- ✅ "Owner" / "Super Admin" alias documented (§4).
- ✅ Risk register present (§11) with mitigations for bilingual risks (translation quality, Sinhala Unicode rendering on low-end devices).
- ✅ Migration five-stage transition named and sequenced (FR-MIG-011, §5).

### Open Decisions — Final Status

| ID | Decision | Status |
|---|---|---|
| OD-INV-01 | Invoice renewal generation date (25th, configurable) | ✅ Resolved |
| OD-INV-02 | Payment deadline (10th, configurable) | ✅ Resolved |
| OD-R01 | Recording storage model (link-based, Option A) | ✅ Resolved |
| OD-ACC-01 | Historical content access policy | ✅ Resolved |
| OD-ACC-02 | Content categories in historical access | ✅ Resolved |
| OD-ACT-01 | Activation link expiry (48h, single-use, regenerable) | ✅ Resolved |
| OD-ARCH-01–08 | Hosting, performance SLAs, recovery contact fields, i18n library, font strategy, translation key CI | 🔲 Architecture phase |
| OD-LEGAL-01–04 | Legal sign-offs | ⚖️ Production gate |

### Security and Privacy Release Conditions
- ✅ OD-LEGAL-01 through OD-LEGAL-04 documented as hard production gate conditions.
- ✅ SEC-012 through SEC-016 explicitly flagged ⚖️ with production-gate status.
- ✅ Recording URL delivery restriction actively required (FR-LEARN-005); known limitation documented (FR-LEARN-006).
- ✅ Password handling corrected: no plaintext storage, no logging, HTTPS transport required (FR-AUTH-002, SEC-001).

### PRD Readiness Verdict

**This PRD is ready for UX Design and Architecture phases.**

All open decisions required before downstream phases begin are resolved. Remaining open items are correctly scoped to Architecture phase (OD-ARCH-01–08) or are legal sign-offs gating production launch only (OD-LEGAL-01–04). No confirmed business rule contradictions remain. All critical user journeys have testable acceptance criteria in both languages and consistent with the invoice and payment model.

- **UX phase** may begin immediately. UX must address bilingual layout, language-switcher placement, Sinhala/English font pairing, mobile-first bilingual flows, and WCAG 2.1 AA → 2.2 AA gap documentation (per NFR-ACCESS-002 and the UX dependencies recorded in Addendum H).
- **Architecture phase** may begin immediately; owns OD-ARCH-01 (hosting), OD-ARCH-02 (performance SLAs), OD-ARCH-05 (contact fields for self-service recovery), OD-ARCH-06 (i18n library and implementation), OD-ARCH-07 (Sinhala font strategy), and OD-ARCH-08 (missing-key CI check).
- **Production launch** is gated on OD-LEGAL-01 through OD-LEGAL-04. No exceptions.
