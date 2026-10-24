---
title: "e-Paperé — Master Requirements Reference"
version: 1.0.0
status: authoritative
created: 2026-10-16
updated: 2026-10-16
sources:
  - _bmad-output/planning-artifacts/brief-epapere-2026-10-16/brief.md (final, 2026-10-16)
  - _bmad-output/planning-artifacts/brief-epapere-2026-10-16/addendum.md (final, 2026-10-16)
  - _bmad-output/planning-artifacts/brief-epapere-2026-10-16/.memlog.md (session log, 2026-10-16)
  - Consolidated requirements provided in the master-requirements prompt (supersedes any earlier conflicting statements)
---

# e-Paperé — Master Requirements Reference

> **Status key used throughout this document**
> - ✅ **Confirmed** — decided and stable; PRD and Architecture may treat as a firm requirement
> - ⚠️ **Proposed** — recommended working position; requires final institute approval before PRD locks it
> - 🔲 **Deferred** — delegated to Architecture phase or a future product phase; must not be built in MVP
> - ⚖️ **Legal** — requires Sri Lankan legal/compliance verification before production deployment
> - ~~Strikethrough~~ — superseded; retained for traceability only

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Business Problem](#2-business-problem)
3. [Business Objectives](#3-business-objectives)
4. [Target Users](#4-target-users)
5. [Confirmed MVP Scope](#5-confirmed-mvp-scope)
6. [Out-of-Scope Features](#6-out-of-scope-features)
7. [User Roles and Permissions](#7-user-roles-and-permissions)
8. [Student Registration and Authentication](#8-student-registration-and-authentication)
9. [Student ID Management](#9-student-id-management)
10. [Grade, Subject, Teacher, and Course Management](#10-grade-subject-teacher-and-course-management)
11. [Enrollment and Monthly Access](#11-enrollment-and-monthly-access)
12. [Invoices and Payment Verification](#12-invoices-and-payment-verification)
13. [Zoom Classes and Learning Resources](#13-zoom-classes-and-learning-resources)
14. [Notifications and Communication](#14-notifications-and-communication)
15. [Existing Student Migration](#15-existing-student-migration)
16. [Administrative Reports](#16-administrative-reports)
17. [Functional Requirements](#17-functional-requirements)
18. [Non-Functional Requirements](#18-non-functional-requirements)
19. [Security and Privacy Requirements](#19-security-and-privacy-requirements)
20. [Mandatory Technology Stack](#20-mandatory-technology-stack)
21. [Engineering Quality Standards](#21-engineering-quality-standards)
22. [Deployment and Production Requirements](#22-deployment-and-production-requirements)
23. [Future Extensibility](#23-future-extensibility)
24. [Risks, Assumptions, and Open Decisions](#24-risks-assumptions-and-open-decisions)
25. [Requirements Traceability and Source References](#25-requirements-traceability-and-source-references)

---

## 1. Project Overview

**Institute name**: e-Paperé Online Institute ✅  
**System name**: e-Paperé Student Management System (e-Paperé SMS)  
**System type**: Web-based student management and learning access portal  
**Country of operation**: Sri Lanka  
**Operational status**: The institute is live and actively serving students. The platform replaces current WhatsApp-based manual operations; it does not start a new business.

e-Paperé is not a full Learning Management System. It does not host video, run assessments, or replace Zoom. It is a **student-first management and access-control layer** that makes the institute's existing Zoom-based teaching model sustainable at scale. The platform's job is to ensure the right students have the right access at the right time, with a full audit trail, and without an administrator manually performing the same enrollment work every month.

---

## 2. Business Problem

All student administration — registration, monthly fee collection, payment verification, and class-access distribution — currently runs through WhatsApp and manual processes. Each billing cycle, administrators receive bank-transfer screenshots on WhatsApp, manually verify payments, and re-add students to new WhatsApp groups to grant class access. Records are scattered across chat history, screenshots, and spreadsheets. Disputes require reconstructing conversations. The process does not scale.

**The specific failure the platform must eliminate**: a verified payment must never require an administrator to manually enroll a student into a WhatsApp group. That manual step must be fully replaced by automatic access activation. ✅

---

## 3. Business Objectives

- BO-01: Eliminate monthly WhatsApp group creation as an access-control mechanism. ✅
- BO-02: Automatically activate correct course access when a payment is verified, without additional administrator steps. ✅
- BO-03: Provide students with permanent, self-service portal access to Zoom links, study materials, and recordings. ✅
- BO-04: Give administrators a single dashboard to monitor all pending payments and access problems. ✅
- BO-05: Create the institute's first reliable, queryable record of enrollments, verified payments, and access status — the foundation for all future business decisions. ✅
- BO-06: Reduce administrator time spent on monthly enrollment tasks as self-service adoption grows. ✅
- BO-07: Support incremental migration of existing students without disrupting ongoing classes. ✅

**Primary success criterion (3-month post-launch)**:
- Monthly WhatsApp groups for access control are no longer created.
- Verified payments automatically activate correct course access.
- Students log in independently with their Student ID and access learning resources.
- Administrators manage all pending work from a single dashboard.

---

## 4. Target Users

### Students (Grades 6–11) ✅
The primary users. Each student holds a permanent individual account. Students can register independently, log in using their Student ID and password, browse courses, submit enrollment requests, upload payment slips, and access learning resources. The system must not assume every student has a personal phone number or email address. Admin-assisted registration remains available for students who need it.

### Administrators ✅
Register students who need assisted onboarding, manage course configurations, initiate enrollment on behalf of students, handle exceptions, and monitor operational dashboards. Administrator workload decreases as self-service adoption grows. Administrators must never be able to view existing student passwords.

### Finance Administrators ✅
Claim and process payment submissions from the shared verification queue. Verify submissions against actual bank records. Approve, reject, or request clarification. Maintain transaction audit trails. Finance administrators have no access to content management or course configuration.

### Teachers ✅
Access their own course rosters, enrollment counts, and student access status. Enter and update Zoom meeting details and class session information for their assigned courses. Teachers do not access financial records unless explicitly granted by a super administrator.

### Super Administrator / Institute Owner ✅
Full system access. Views enrollment totals, verified revenue, outstanding invoices, and operational health across all subjects, grades, and courses. Manages all system configuration including subjects, grades, teachers, fee structures, and access policies.

### Guardians 🔲 *(Deferred to a future phase)*
Guardian accounts, dashboards, guardian-managed course selection, and multi-child management are not part of the MVP. Guardian contact information may be optionally collected during student registration for administrative communication only. The architecture must support adding a full guardian account system in a future phase without structural redesign.

---

## 5. Confirmed MVP Scope

The following features are confirmed in scope for the initial release. ✅

- Student self-registration and administrator-assisted registration
- Permanent EP Student ID generation (EP-000001 format, backend-generated at registration, independent of payment status)
- Student ID + password authentication; secure password hashing; login rate limiting; session management; account recovery (admin-initiated reset as MVP floor)
- Secure one-time activation flow for admin-assisted registrations
- Four account states: PENDING_ACTIVATION / ACTIVE / SUSPENDED / DISABLED
- Dynamic grade and subject configuration: Grades 6–11 and four initial subjects (Mathematics, Science, Sinhala, ICT); all configurable through the administration interface without code changes
- Course management: subject, grade, teacher, category, schedule, and fee — persistent courses, not recreated monthly
- Course enrollment initiated by student or authorized administrator; persistent enrollment relationship
- Calendar-month invoice generation: on enrollment request, via scheduled monthly idempotent process, and via admin manual trigger; duplicate line items prevented; server-side fee calculation
- Bank payment slip upload via student portal; administrator entry of WhatsApp-origin slips
- Shared finance administrator payment verification queue: claim/lock, three outcomes (Approved / Requires Clarification / Rejected), duplicate-approval prevention, immutable audit trail
- Automatic course access activation on payment approval
- Historical content access for previously paid billing periods; access restriction for unpaid periods ⚠️ *(pending institute approval)*
- Student dashboard: Zoom links, study materials, recordings, schedule, announcements
- Teacher dashboard: course roster, enrollment counts, student access status, Zoom and session data entry
- Administrator dashboard: student management, enrollment assistance, access oversight
- Finance administrator dashboard: payment verification queue, audit trail, financial summaries
- Owner/super administrator dashboard: enrollment totals, verified revenue, outstanding invoices, operational summary
- In-app notifications for all key workflow events
- Copyable WhatsApp message templates for common administrator communications
- Role-based access control: Student, Teacher, Finance Administrator, Administrator, Super Administrator
- Existing student migration: manual onboarding and bulk import with validation, duplicate detection, and audit trail *(bulk import field set and format: defined in PRD* ⚠️*)*
- Payment history and role-segmented operational reporting
- Modular monolith architecture: maintainable, secure, extensible, and production-ready

---

## 6. Out-of-Scope Features

The following are explicitly excluded from the MVP. None may require architectural rework to add later. ✅

- Guardian accounts, guardian login, and guardian dashboard
- Mandatory guardian linking and guardian course approval
- Multi-guardian relationship management
- Mandatory OTP or phone-based authentication
- Age-dependent registration workflows
- Online payment gateway integration (PayHere or equivalent)
- Automated WhatsApp Business API messaging
- Automated SMS notifications
- Email notification delivery
- Zoom API automation (meeting creation, attendance tracking, participant management)
- Examinations, assessments, and grading
- Advanced analytics, forecasting, and business intelligence
- Grades 1–5 (Primary) and Grades 12–13 (Advanced Level)
- In-house or third-party video hosting infrastructure
- Native mobile applications
- Dual-approval payment verification workflows

> **Superseded requirement (retained for traceability)**: An earlier session decision (memlog entry dated 2026-10-16) introduced PENDING_GUARDIAN_VERIFICATION as a mandatory account state, guardian approval as a prerequisite for enrollment, and guardian-linked age-dependent registration workflows. These were **fully superseded and removed** by the final confirmed decision captured in brief.md and addendum.md. The MVP account lifecycle has four states only: PENDING_ACTIVATION, ACTIVE, SUSPENDED, DISABLED. Mandatory guardian linking is deferred.

---

## 7. User Roles and Permissions

### Role Matrix ✅

| Capability | Student | Teacher | Finance Admin | Administrator | Super Admin |
|---|:---:|:---:|:---:|:---:|:---:|
| Self-registration and login | ✓ | — | — | — | ✓ |
| View own profile and dashboard | ✓ | ✓ | ✓ | ✓ | ✓ |
| Browse and request course enrollment | ✓ | — | — | — | ✓ |
| Upload payment slips | ✓ | — | — | — | ✓ |
| View own payment and access history | ✓ | — | — | — | ✓ |
| Access learning resources (Zoom, materials, recordings) | ✓ (paid only) | — | — | — | ✓ |
| View own course roster and student access status | — | ✓ | — | — | ✓ |
| Enter and update Zoom and session details | — | ✓ | — | ✓ | ✓ |
| Upload study materials and recordings | — | ✓ | — | ✓ | ✓ |
| Claim and process payment verification queue | — | — | ✓ | — | ✓ |
| View payment audit trail | — | — | ✓ | — | ✓ |
| Register students (admin-assisted) | — | — | — | ✓ | ✓ |
| Initiate enrollment on behalf of students | — | — | — | ✓ | ✓ |
| Enter payment slips received via WhatsApp | — | — | ✓ | ✓ | ✓ |
| Manage student accounts (suspend/reactivate) | — | — | — | ✓ | ✓ |
| Manage courses, subjects, grades, fees | — | — | — | ✓ | ✓ |
| Manage teacher accounts | — | — | — | ✓ | ✓ |
| Manually generate or regenerate invoices | — | — | — | ✓ | ✓ |
| View financial summaries and reports | — | — | ✓ | — | ✓ |
| View enrollment and operational reports | — | — | — | ✓ | ✓ |
| Full system configuration (access policies, fee structures) | — | — | — | — | ✓ |
| Disable student accounts | — | — | — | — | ✓ |
| Reactivate disabled accounts | — | — | — | — | ✓ |
| View or retrieve existing student passwords | ✗ | ✗ | ✗ | ✗ | ✗ |

### Key Constraints ✅
- No role — including Super Administrator — may retrieve or view an existing student password.
- Teachers do not access financial records unless explicitly granted by a Super Administrator.
- Finance Administrators have no access to content management or course configuration.
- Role assignments are managed by Administrators and Super Administrators.

---

## 8. Student Registration and Authentication

### Self-Registration Sequence ✅

1. Student opens the portal and selects Register.
2. Student enters essential information: full name, date of birth (or age), grade (6–11). Guardian contact information (name, phone, WhatsApp number) may be optionally collected.
3. System checks for potential duplicate registrations (minimum: full name + grade + date of birth).
4. Backend generates a permanent EP Student ID (EP-000001 format).
5. Student creates a password; account transitions directly to ACTIVE.
6. Student logs in using Student ID + password.
7. Student proceeds to course enrollment.

### Admin-Assisted Registration Sequence ✅

1. Administrator enters student information on behalf of the student.
2. System generates a permanent EP Student ID.
3. System generates a secure one-time activation link or temporary credential.
4. Administrator provides the activation details to the student through a secure channel.
5. Student completes activation by setting their own password; account transitions to ACTIVE.
6. Administrator never sees the resulting password.

### Authentication Model ✅

- **Login identifier**: permanent Student ID (EP-000001 format).
- **Credential**: password, securely hashed server-side (bcrypt or equivalent). Passwords are never stored in plain text.
- **No personal email address required** for login or normal authentication.
- **No personal phone number required** for login.
- **No OTP dependency** for normal authentication flows.
- **Security controls**: login rate limiting, brute-force protection, secure session management (short-lived tokens), HTTPS-only.
- **No role may retrieve or view existing student passwords.**

### Account Recovery ✅ / 🔲

- **MVP floor (confirmed)**: administrator-initiated credential reset. The administrator generates a new one-time activation link; the student sets a new password; the administrator never sees the resulting password.
- **Self-service token-based recovery** (e.g., via email or phone): deferred to Architecture phase 🔲, dependent on which contact details are confirmed for collection at registration.

### Account State Machine ✅

```
PENDING_ACTIVATION
  └─► ACTIVE          — account operational; student may browse, enroll, and access paid content
        ├─► SUSPENDED — temporarily restricted by administrator
        └─► DISABLED  — deactivated; access fully removed; records preserved

SUSPENDED
  └─► ACTIVE          — reinstated by administrator

DISABLED
  └─► ACTIVE          — reactivated by super administrator (if permitted)
```

- Self-registration transitions directly PENDING_ACTIVATION → ACTIVE when the student completes credential setup in-session (no separate activation step is required for self-registration).
- Account states are independent of enrollment status, invoice status, and access entitlement status.
- SUSPENDED and DISABLED are administrative controls; they do not delete records.
- All students in Grades 6–11 follow the same account lifecycle regardless of grade.

### Student Portal Access While in PENDING_ACTIVATION ⚠️
Conservative default: no enrollment or paid content access until the account is ACTIVE. Exact scope requires final institute approval.

### Duplicate Detection ✅
System flags potential duplicates (minimum: full name + grade + date of birth) for administrator review before creating a new account, preventing EP ID wastage and duplicate records.

---

## 9. Student ID Management

- **Format**: EP-000001 — two-letter prefix "EP" followed by a six-digit zero-padded sequential number. ✅
- **Generation**: backend-generated automatically at registration, before any payment is made. ✅
- **Permanence**: the EP ID never changes, never expires, and is never reassigned. ✅
- **Independence**: the EP ID does not encode grade, subject, status, or any mutable attribute. ✅
- **Grade progression**: a student retains the same EP ID when moving between grades. Historical enrollments, payments, and records are preserved. ✅
- **Dormancy and re-enrollment**: a student retains the same EP ID after periods of inactivity or re-enrollment. ✅
- **Migration**: EP IDs for migrated students are generated through the same backend mechanism as new registrations. ✅

---

## 10. Grade, Subject, Teacher, and Course Management

### Grade Configuration ✅

- MVP supports **Grades 6–11 only**.
- Grades 1–5 and 12–13 are outside the initial MVP scope.
- Grades are managed through the administration interface; nothing is hardcoded.
- The data model must support adding new grades (including 1–5 and 12–13) in a future phase without code changes.

### Subject Configuration ✅

- MVP launches with **four subjects**: Mathematics, Science, Sinhala, ICT.
- All subjects are configurable through the administration interface; nothing is hardcoded.
- Additional subjects can be added without modifying application code.
- All system modules must accommodate new subjects dynamically.

### Teacher Management ✅

- Teacher accounts are managed by Administrators and Super Administrators.
- Teachers are assigned to courses; the course record links subject, grade, teacher, and category.
- Teacher access to financial records is not permitted by default; a Super Administrator may grant an explicit exception.

### Course Model ✅

- A course is a configurable, persistent entity combining: subject + grade + teacher + teaching category (e.g., Theory, Revision, Paper Class).
- Courses persist across billing months; they are not recreated per billing cycle.
- Monthly billing and access entitlements are separate records linked to: student enrollment + course + billing period.
- Course fee, schedule, and metadata are managed through the administration interface.
- New course types and categories must be configurable without code changes.

---

## 11. Enrollment and Monthly Access

### Enrollment Actors ✅

Two actors may initiate course enrollment:
- **Student**: browse available courses and submit an enrollment request.
- **Authorized Administrator**: initiate enrollment on behalf of a student.

Guardian approval is **not** a default technical prerequisite for enrollment in the MVP.

### Enrollment Invariants ✅

- **Enrollment ≠ access**: enrollment creates a persistent record; learning access is activated only after payment is verified.
- **Enrollment is persistent**: a student does not re-enroll in the same course each month. Enrollment is a standing relationship.
- **Payment lapse**: a payment lapse preserves the enrollment record and prior paid access. Only the current unpaid period's access is withheld. The account and enrollment history are never deleted due to non-payment.

### Access Entitlement Model ✅

- Access entitlement is per-student, per-course, per-billing-period.
- Approved payment for period N activates access to period N content only.
- Access to previously paid periods (1 through N-1) is unaffected by non-payment in period N.
- **Live Zoom class access is never granted for unpaid periods**, regardless of historical access status.
- Access entitlements for migrated students are only activated after their payment has been confirmed through approved bank reconciliation.

### Historical Content Access Policy ⚠️ *(Proposed — pending final institute approval)*
Students retain access to study materials and recordings for billing periods they have already paid. Non-payment restricts access to new content for the unpaid period only. The policy (duration of historical access, content categories included) must be configurable by a Super Administrator without code changes. Subject to institute content-retention and licensing policy approval.

### Monthly Billing Model ✅
- Billing is calendar-month based.
- The billing period is defined by calendar month, not by a sliding 30-day window.
- Open institute decisions ⚠️: invoice generation date, payment deadline, grace period, and late-enrollment pricing rules. These must be confirmed before PRD locks the invoice specification.

---

## 12. Invoices and Payment Verification

### Invoice Generation ✅

- **On enrollment request**: system generates an invoice for the applicable billing month immediately.
- **Continuing enrollments**: a scheduled, idempotent monthly process generates invoices for the upcoming month.
- **Admin manual trigger**: authorized administrators can generate or regenerate missing invoices.
- Invoice line items are deduplicated per student + course + billing month.
- Fee is calculated server-side from configured course pricing. Client-submitted amounts are not accepted.
- An invoice never grants access by itself — access is activated only after payment is verified and approved.

### Payment Submission Lanes ✅

- **Lane A**: student uploads a bank payment slip through the portal.
- **Lane B**: an administrator enters a payment slip received via WhatsApp.

### Payment State Machine ✅

```
SUBMITTED
  └─► UNDER_REVIEW          — claimed by a finance administrator
        ├─► APPROVED         — triggers automatic course access activation
        ├─► REQUIRES_CLARIFICATION — submission incomplete or unmatched; student may resubmit evidence
        └─► REJECTED         — submission invalid; reason recorded; original preserved; new submission allowed
```

### Payment Verification Rules ✅

- A finance administrator claims a submission before reviewing it. A claimed submission cannot be concurrently edited by another reviewer (claim/lock model).
- The reviewer verifies the submission against actual bank records.
- The approver's identity and a timestamp are recorded on every state transition.
- Approved: course access entitlement is created automatically for the relevant student + course + billing period.
- Requires Clarification: submission is incomplete or unmatched (e.g., unreadable slip, missing reference). The reviewer records what is needed. The student may provide additional evidence against the same existing submission record — the original is not replaced; a new evidence attachment and timestamp are appended. *(PRD author must confirm this as the intended resubmission model.* ⚠️*)*
- Rejected: the reason is recorded; the original submission is preserved; the student may submit new evidence.
- **Duplicate submission detection**: the system flags when the same student + course + billing month + amount appears more than once.
- **Duplicate approval prevention**: the system prevents two approvals for the same entitlement slot.
- **Financial record corrections**: corrections preserve the original record with an audit trail entry — no silent overwrites.
- **Imported historical payments**: imported records enter as UNVERIFIED and require explicit bank reconciliation before being recorded as confirmed.
- **Single verifier**: one authorized finance administrator may approve ordinary payments after verification. No dual-approval workflow exists in the MVP. No approval chains or configuration flags for speculative future policies.

### Audit Trail ✅
Every payment state transition records: actor identity, timestamp, outcome, and any notes. The audit trail is immutable. No record may be silently overwritten.

---

## 13. Zoom Classes and Learning Resources

- The platform is a **management and access layer** over Zoom. No video infrastructure is built. ✅
- Zoom meeting details (meeting ID, password, link, schedule) are entered manually by teachers or administrators. ✅
- No Zoom API automation (meeting creation, attendance tracking, participant management) in MVP. 🔲
- The student dashboard surfaces Zoom meeting details, study materials, and class recordings for courses with active paid access. ✅
- The teacher dashboard provides a course roster, enrollment counts, student access status, and forms for entering Zoom and session information. ✅
- Study materials and class recordings are managed through the platform (upload and delivery). ✅
- Private object storage is required for uploaded payment slips, study materials, and recordings. 🔲 *(hosting provider: Architecture phase)*
- Learning resource access is restricted to students with a verified payment for the applicable billing period.
- Access to previously paid content persists regardless of payment status in later periods ⚠️ *(pending institute content-retention policy approval)*.

---

## 14. Notifications and Communication

### In-App Notifications ✅
System events that must trigger in-app notifications:

- Registration confirmation
- Account activated
- Invoice generated / available
- Payment slip submitted
- Payment approved / access activated
- Payment requires clarification
- Payment rejected
- Course access activated
- Schedule changed
- New material uploaded
- Access renewal reminder

### WhatsApp Communication Bridge ✅
- No automated WhatsApp Business API or SMS in MVP.
- Administrators supplement in-app notifications with manual WhatsApp messages.
- The system provides copyable WhatsApp message templates for common administrator communications.

### Notification Architecture ✅
- Event generation is decoupled from delivery channels.
- The notification model must not be coupled to any specific delivery channel.
- The architecture must support adding WhatsApp Business API, SMS, and email channels in a future phase without redesigning the event model.

---

## 15. Existing Student Migration

### Five-Stage Transition Plan ✅

| Stage | Activity |
|---|---|
| 1 — Preparation | Configure grades, subjects, teachers, courses, fees, and admin accounts |
| 2 — Student Migration | Register or import existing students; reconcile enrollments and payment history |
| 3 — Pilot Operation | Introduce portal to a selected cohort while maintaining existing WhatsApp operations |
| 4 — Gradual Adoption | Encourage self-service for registration, payment upload, and learning access |
| 5 — Portal-Centered Operations | Portal becomes the authoritative system; WhatsApp retained as a supplementary channel |

**Operational constraint**: the institute is live during the entire migration. The transition must not disrupt ongoing classes or existing WhatsApp communications. ✅

### Migration Data Quality Requirements ✅

- Mandatory fields are validated before record creation.
- Duplicate detection by name + date of birth + grade combination at minimum.
- EP IDs for migrated students are generated through the same backend mechanism as new registrations.
- Imported payment records are not auto-verified; they require explicit bank reconciliation evidence.
- Access entitlements for migrated students are only activated after payment has been confirmed through approved reconciliation.
- Audit trail: origin and verification status preserved for every imported record.
- Failed imports are reviewable and correctable by administrators.
- Bulk import must not create duplicate students, enrollments, invoices, or payments.
- **Bulk import input format and minimum required field set**: defined in PRD ⚠️; validated in Architecture phase.

---

## 16. Administrative Reports

Reports are operational dashboards, not advanced analytics. ✅

| Dashboard | Role | Content |
|---|---|---|
| Owner Dashboard | Super Administrator | Enrollment totals, verified revenue, outstanding invoices, operational summary by subject/grade/course |
| Finance Dashboard | Finance Administrator | Payment verification queue, transaction audit trail, payment summaries |
| Administrator Dashboard | Administrator | Student management, enrollment assistance, access oversight, migration status |
| Teacher Dashboard | Teacher | Own course roster, enrollment counts, student access status per course |
| Student Dashboard | Student | Own enrollments, payment history, access status, Zoom links, materials, recordings |

No advanced analytics, churn forecasting, or business intelligence in MVP. Role-segregation of financial, enrollment, and learning data is strictly enforced.

---

## 17. Functional Requirements

Requirements are organized by domain. Identifiers are stable references for downstream documents.

### FR-REG: Registration and Account Management

| ID | Requirement | Status |
|---|---|---|
| FR-REG-001 | The system must allow a student to self-register by entering full name, date of birth (or age), and grade (6–11). | ✅ |
| FR-REG-002 | The system must check for potential duplicate accounts (minimum: full name + grade + date of birth) and flag matches for administrator review before creating a new account. | ✅ |
| FR-REG-003 | The backend must generate a permanent EP Student ID (EP-000001 format) automatically at registration, before any payment. | ✅ |
| FR-REG-004 | A self-registering student must be able to set their own password and have their account transition to ACTIVE within the same registration session. | ✅ |
| FR-REG-005 | An administrator must be able to register a student on the student's behalf (admin-assisted registration). | ✅ |
| FR-REG-006 | Admin-assisted registration must generate a secure one-time activation link or temporary credential for the student to complete account setup independently. | ✅ |
| FR-REG-007 | Guardian contact information (name, phone, WhatsApp number) must be optionally collectable during student registration. | ✅ |
| FR-REG-008 | The system must support four account states: PENDING_ACTIVATION, ACTIVE, SUSPENDED, DISABLED — independent of enrollment and payment status. | ✅ |
| FR-REG-009 | An administrator must be able to suspend and reinstate a student account. | ✅ |
| FR-REG-010 | A super administrator must be able to disable and reactivate a student account. | ✅ |
| FR-REG-011 | An administrator must be able to initiate an account recovery (credential reset) for a student without seeing the student's existing or resulting password. | ✅ |

### FR-AUTH: Authentication

| ID | Requirement | Status |
|---|---|---|
| FR-AUTH-001 | Students must log in using their permanent Student ID and password only. No email address or phone number is required for login. | ✅ |
| FR-AUTH-002 | Passwords must be securely hashed server-side using bcrypt or an equivalent algorithm. Passwords must never be stored in plain text. | ✅ |
| FR-AUTH-003 | No OTP mechanism is required for normal authentication flows in the MVP. | ✅ |
| FR-AUTH-004 | The system must enforce login rate limiting and brute-force protection. | ✅ |
| FR-AUTH-005 | All sessions must use short-lived tokens or equivalent secure session management. | ✅ |
| FR-AUTH-006 | All authentication traffic must be served over HTTPS only. | ✅ |
| FR-AUTH-007 | No role — including Super Administrator — may retrieve or view an existing student password. | ✅ |

### FR-COURSE: Course and Subject Management

| ID | Requirement | Status |
|---|---|---|
| FR-COURSE-001 | An administrator must be able to create and manage courses through the administration interface. A course is defined by subject, grade, teacher, and category. | ✅ |
| FR-COURSE-002 | Courses must persist across billing months. They must not be recreated per billing cycle. | ✅ |
| FR-COURSE-003 | Course fee and schedule must be configurable through the administration interface without code changes. | ✅ |
| FR-COURSE-004 | The system must launch with four subjects: Mathematics, Science, Sinhala, ICT. Additional subjects must be addable through the administration interface without code modifications. | ✅ |
| FR-COURSE-005 | The system must launch with Grades 6–11. Additional grades must be addable through the administration interface without code modifications. | ✅ |
| FR-COURSE-006 | Teaching categories (Theory, Revision, Paper Class, etc.) must be configurable without code changes. | ✅ |

### FR-ENROL: Enrollment

| ID | Requirement | Status |
|---|---|---|
| FR-ENROL-001 | A student must be able to submit an enrollment request for an available course. | ✅ |
| FR-ENROL-002 | An authorized administrator must be able to initiate enrollment on behalf of a student. | ✅ |
| FR-ENROL-003 | Enrollment must create a persistent enrollment relationship. A student does not re-enroll in the same course each month. | ✅ |
| FR-ENROL-004 | Enrollment must not grant paid learning access. Access is activated only after payment is verified. | ✅ |
| FR-ENROL-005 | A payment lapse must not delete or revoke the enrollment record or access to previously paid billing periods. | ✅ |
| FR-ENROL-006 | Guardian approval is not a default technical prerequisite for enrollment in the MVP. | ✅ |

### FR-INV: Invoice Management

| ID | Requirement | Status |
|---|---|---|
| FR-INV-001 | The system must generate an invoice for the applicable billing month when an enrollment request is submitted. | ✅ |
| FR-INV-002 | The system must run a scheduled, idempotent monthly process to generate invoices for continuing enrollments for the upcoming billing month. | ✅ |
| FR-INV-003 | An authorized administrator must be able to manually generate or regenerate missing invoices. | ✅ |
| FR-INV-004 | Invoice line items must be deduplicated per student + course + billing month. | ✅ |
| FR-INV-005 | The fee on an invoice must be calculated server-side from configured course pricing. Client-submitted amounts must not be accepted. | ✅ |
| FR-INV-006 | An invoice must never by itself grant learning access. Access is activated only on payment approval. | ✅ |

### FR-PAY: Payment Submission and Verification

| ID | Requirement | Status |
|---|---|---|
| FR-PAY-001 | A student must be able to upload a bank payment slip through the portal. | ✅ |
| FR-PAY-002 | An administrator must be able to enter a payment slip received via WhatsApp on behalf of a student. | ✅ |
| FR-PAY-003 | A finance administrator must be able to claim a payment submission from a shared verification queue before reviewing it. A claimed submission must not be editable by another reviewer simultaneously. | ✅ |
| FR-PAY-004 | A finance administrator must be able to record one of three outcomes for a claimed submission: Approved, Requires Clarification, or Rejected. | ✅ |
| FR-PAY-005 | On approval, the system must automatically create a course access entitlement for the relevant student + course + billing period. | ✅ |
| FR-PAY-006 | The approver's identity and timestamp must be recorded on every payment state transition. | ✅ |
| FR-PAY-007 | The system must detect and flag potential duplicate submissions (same student + course + billing month + amount). | ✅ |
| FR-PAY-008 | The system must prevent duplicate approvals for the same entitlement slot. | ✅ |
| FR-PAY-009 | Financial record corrections must preserve the original record with an audit trail entry. No silent overwrites are permitted. | ✅ |
| FR-PAY-010 | One authorized finance administrator may approve ordinary payments after verification. No dual-approval workflow exists in the MVP. | ✅ |
| FR-PAY-011 | When a clarification is requested, the student must be able to submit additional evidence against the existing submission record without creating a new submission. The original submission record must not be replaced. | ⚠️ *(PRD to confirm resubmission model)* |

### FR-ACCESS: Learning Access

| ID | Requirement | Status |
|---|---|---|
| FR-ACCESS-001 | The student dashboard must display Zoom meeting details, study materials, and class recordings for courses with active paid access for the current billing period. | ✅ |
| FR-ACCESS-002 | Learning access must be activated automatically on payment approval — no additional administrator step is required. | ✅ |
| FR-ACCESS-003 | Live Zoom class access must never be granted for an unpaid billing period, regardless of historical access status. | ✅ |
| FR-ACCESS-004 | Students must retain access to study materials and recordings for billing periods they have already paid. | ⚠️ *(pending institute content-retention policy approval)* |
| FR-ACCESS-005 | The content access policy must be configurable by a super administrator without code changes. | ⚠️ |

### FR-LEARN: Learning Resource Management

| ID | Requirement | Status |
|---|---|---|
| FR-LEARN-001 | Teachers or administrators must be able to enter and update Zoom meeting details for their assigned courses. | ✅ |
| FR-LEARN-002 | Teachers or administrators must be able to upload study materials for their assigned courses. | ✅ |
| FR-LEARN-003 | Teachers or administrators must be able to upload class recordings for their assigned courses. | ✅ |

### FR-NOTIF: Notifications

| ID | Requirement | Status |
|---|---|---|
| FR-NOTIF-001 | The system must generate in-app notifications for all key workflow events: registration, account activation, invoice generated, payment submitted, payment approved, clarification requested, payment rejected, access activated, schedule changed, material uploaded, renewal reminder. | ✅ |
| FR-NOTIF-002 | The system must provide copyable WhatsApp message templates for common administrator communications. | ✅ |
| FR-NOTIF-003 | Notification event generation must be decoupled from delivery channels. Adding new delivery channels (WhatsApp API, SMS, email) must not require redesigning the event model. | ✅ |

### FR-MIG: Migration

| ID | Requirement | Status |
|---|---|---|
| FR-MIG-001 | The system must support individual manual registration of existing students by administrators. | ✅ |
| FR-MIG-002 | The system must support bulk import of existing students with field validation, duplicate detection, and audit trail. | ✅ |
| FR-MIG-003 | EP IDs for migrated students must be generated through the same backend mechanism as new registrations. | ✅ |
| FR-MIG-004 | Imported payment records must enter as UNVERIFIED and require explicit bank reconciliation before being recorded as confirmed. | ✅ |
| FR-MIG-005 | Failed imports must be reviewable and correctable by administrators. | ✅ |
| FR-MIG-006 | The bulk import process must not create duplicate students, enrollments, invoices, or payments. | ✅ |
| FR-MIG-007 | The audit trail must preserve the origin and verification status of every imported record. | ✅ |

### FR-REPORT: Reporting

| ID | Requirement | Status |
|---|---|---|
| FR-REPORT-001 | The super administrator dashboard must display enrollment totals, verified revenue, outstanding invoices, and an operational summary by subject, grade, and course. | ✅ |
| FR-REPORT-002 | The finance administrator dashboard must provide the payment verification queue, transaction audit trail, and payment summaries. | ✅ |
| FR-REPORT-003 | The administrator dashboard must provide student management, enrollment assistance, access oversight, and migration status. | ✅ |
| FR-REPORT-004 | The teacher dashboard must display the course roster, enrollment counts, and student access status for the teacher's own courses. | ✅ |

---

## 18. Non-Functional Requirements

### NFR-PERF: Performance 🔲 *(Targets defined in Architecture phase)*

| ID | Requirement | Status |
|---|---|---|
| NFR-PERF-001 | The system architecture must support at least three scale scenarios without fundamental redesign: ~200 monthly active students (initial), ~2,000 (near-term), ~10,000 (long-term). | 🔲 |
| NFR-PERF-002 | The PRD must distinguish: total registered students, monthly active users, and simultaneous users for capacity planning. | 🔲 |
| NFR-PERF-003 | Testable API response time SLAs, login concurrency targets, invoice generation throughput, file delivery capacity, and availability objectives must be defined and validated through load testing in the Architecture phase. | 🔲 |

### NFR-AVAIL: Availability and Reliability

| ID | Requirement | Status |
|---|---|---|
| NFR-AVAIL-001 | The system must be production-ready, reliable, and available to students during active class periods. | ✅ |
| NFR-AVAIL-002 | Recovery Time Objective (RTO) and Recovery Point Objective (RPO) must be defined in the Architecture phase based on institute operational needs. | 🔲 |

### NFR-MAINT: Maintainability

| ID | Requirement | Status |
|---|---|---|
| NFR-MAINT-001 | The codebase must be maintainable: consistently structured, clearly documented at module boundaries, and following established project conventions. | ✅ |
| NFR-MAINT-002 | Adding new subjects, grades, course types, fee structures, and access policies must not require core code modifications. | ✅ |
| NFR-MAINT-003 | The modular monolith structure must permit future service extraction if genuine scale demands it. | ✅ |

### NFR-EXT: Extensibility

| ID | Requirement | Status |
|---|---|---|
| NFR-EXT-001 | The architecture must support all deferred features (guardian accounts, online payment gateways, WhatsApp API, SMS, email, Zoom API, advanced analytics, AL expansion, mobile apps) as future additions without structural redesign. | ✅ |
| NFR-EXT-002 | The data model must be designed so a guardian account can be linked to one or more students in a future phase without migrating existing student records. | ✅ |

### NFR-TEST: Testability

| ID | Requirement | Status |
|---|---|---|
| NFR-TEST-001 | The system must be testable: module boundaries must be clear enough to support unit, integration, and end-to-end tests. | ✅ |
| NFR-TEST-002 | Financial workflows (invoice generation, payment verification, access activation) must have comprehensive test coverage. | ✅ |

### NFR-ACCESS: Accessibility

| ID | Requirement | Status |
|---|---|---|
| NFR-ACCESS-001 | The student portal must be accessible to students across the full grade range (Grades 6–11), including young adolescents who may be first-time web users. | ✅ |
| NFR-ACCESS-002 | WCAG 2.1 AA compliance is the target standard. Full validation requires manual testing with assistive technologies. | ✅ |

---

## 19. Security and Privacy Requirements

| ID | Requirement | Status |
|---|---|---|
| SEC-001 | All passwords must be hashed server-side using bcrypt or equivalent. Passwords must never be stored or transmitted in plain text. | ✅ |
| SEC-002 | No role may retrieve or view existing student passwords. | ✅ |
| SEC-003 | Login rate limiting and brute-force protection must be enforced at the authentication layer. | ✅ |
| SEC-004 | All traffic must be served over HTTPS. No plain HTTP endpoints permitted in production. | ✅ |
| SEC-005 | Session tokens must be short-lived and managed securely. | ✅ |
| SEC-006 | Role-based access control must be enforced at the API layer. Frontend enforcement is supplementary only. | ✅ |
| SEC-007 | All server-side validation must be performed on the backend. Client-submitted values (including payment amounts) must not be trusted. | ✅ |
| SEC-008 | Uploaded payment slips, study materials, and recordings must be stored in private object storage with access controlled by the application layer. | ✅ |
| SEC-009 | No credentials or secrets may be committed to source control. Secret management must use environment variables or a secrets manager. | ✅ |
| SEC-010 | Financial records and audit trails must be immutable. Corrections must preserve originals with an audit trail entry. | ✅ |
| SEC-011 | MongoDB access must be secured: authenticated connections, minimal privileges, restricted network access. | ✅ |
| SEC-012 | The system serves minors (students in Grades 6–11). Child data protection and privacy obligations applicable under Sri Lankan law must be reviewed and addressed before production launch. | ⚖️ |
| SEC-013 | Whether optional guardian contact collection satisfies applicable consent requirements under Sri Lankan law must be verified before production launch. | ⚖️ |
| SEC-014 | Student personal data must be handled with appropriate access controls and retention policies consistent with applicable data protection requirements. | ⚖️ |
| SEC-015 | If the system is hosted outside Sri Lanka, cross-border data transfer obligations must be assessed and addressed. | ⚖️ 🔲 |
| SEC-016 | Content-retention and licensing policy implications for historical access to recordings and materials must be reviewed. | ⚖️ ⚠️ |

---

## 20. Mandatory Technology Stack

The following technology choices are **confirmed and non-negotiable**. ✅

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB with Mongoose |
| Architecture pattern | Modular monolith |

No substitutions, additions, or deviations from this stack are permitted without an explicit, documented institute-level decision. This constraint applies across all phases of the project.

---

## 21. Engineering Quality Standards

These standards define the expected quality baseline. They are requirements, not aspirational guidelines. Detailed implementation decisions (specific libraries, test frameworks, CI/CD tooling) are for the Architecture phase.

| ID | Standard | Status |
|---|---|---|
| EQ-001 | TypeScript strict mode must be enabled across both the frontend and backend codebases. | ✅ |
| EQ-002 | The codebase must follow a consistent, documented project structure with clear module boundaries and separation of concerns. | ✅ |
| EQ-003 | All public APIs must be versioned (e.g., /api/v1/) from day one to support future changes without breaking clients. | ✅ |
| EQ-004 | All server-side input must be validated before processing. Client-submitted values must not be trusted. | ✅ |
| EQ-005 | Authentication and authorization must be enforced at the API layer on every protected endpoint. | ✅ |
| EQ-006 | MongoDB access must be secured: authenticated connections, least-privilege service accounts, restricted network access, and appropriate indexing from day one. | ✅ |
| EQ-007 | Financial operations that require consistency (invoice generation, payment approval, access activation) must implement transactional patterns appropriate for MongoDB. | ✅ |
| EQ-008 | An audit log must be maintained for all financially significant events and all administrative actions that affect student accounts, enrollments, or payments. | ✅ |
| EQ-009 | The codebase must include automated tests covering at minimum: unit tests for business logic, integration tests for API endpoints, and end-to-end tests for critical payment and access workflows. | ✅ |
| EQ-010 | All code changes must go through a code review process before merging to the main branch. | ✅ |
| EQ-011 | A CI/CD pipeline must automate build, lint, test, and deployment steps. | ✅ |
| EQ-012 | MongoDB data model must be designed for efficient querying: appropriate indexes, pagination on all list endpoints, and no unbounded queries. | ✅ |
| EQ-013 | Sensitive configuration (database URIs, secrets, API keys) must never appear in source code. Environment variables or a secrets manager must be used. | ✅ |
| EQ-014 | Code and module documentation must be sufficient for a developer unfamiliar with the codebase to understand component responsibilities and integration points. | ✅ |
| EQ-015 | Unnecessary complexity, premature microservices, and speculative infrastructure must be avoided. Complexity is introduced only when justified by confirmed requirements. | ✅ |

---

## 22. Deployment and Production Requirements

Hosting provider, deployment region, and infrastructure cost are deferred to the Architecture phase. The following requirements constrain that decision. 🔲

| ID | Requirement | Status |
|---|---|---|
| DEP-001 | All endpoints must be served over HTTPS. SSL/TLS certificates must be managed and renewed automatically. | ✅ |
| DEP-002 | A minimum of three separated environments must exist: development, staging, and production. | ✅ |
| DEP-003 | Credentials and secrets must not appear in source control. A dedicated secrets management solution must be used. | ✅ |
| DEP-004 | Automated database backups with a tested restoration procedure must be in place before production launch. | ✅ |
| DEP-005 | Production monitoring and structured logging must be in place before production launch. | ✅ |
| DEP-006 | Deployment rollback procedures must be defined and tested before production launch. | ✅ |
| DEP-007 | The infrastructure must support scalability from the Small scenario (~200 MAU) to the Large scenario (~10,000 MAU) without requiring a fundamental redesign. | ✅ |
| DEP-008 | Uploaded payment slips, study materials, and recordings must be stored in private object storage (not served as public files). | ✅ |
| DEP-009 | The infrastructure must comply with applicable Sri Lankan data protection requirements. | ⚖️ |
| DEP-010 | Operating costs must be appropriate to a growing Sri Lankan institute. Provider selection must not be based solely on popularity. | ✅ |

---

## 23. Future Extensibility

The architecture must support all of the following as future additions without requiring structural redesign. None of these may be partially implemented or prepared via speculative feature flags in the MVP. ✅

- Guardian accounts, guardian login and authentication, guardian dashboard, multi-child management
- Guardian approval of course enrollment for minors
- Guardian-initiated account recovery for linked students
- PayHere (or equivalent Sri Lankan payment gateway) online payment integration
- WhatsApp Business Platform API — automated messaging
- Automated SMS notifications (Dialog / Mobitel)
- Email notification delivery
- Zoom API automation (meeting creation, participant management, attendance)
- Advanced examinations, assessments, and grading
- Student churn forecasting and advanced business intelligence dashboards
- Grades 1–5 (Primary) and Grades 12–13 (Advanced Level / A/L)
- In-house or third-party video hosting infrastructure
- Native mobile applications (iOS, Android)
- Dual-approval payment verification workflows
- Self-service account recovery (token-based, via email or phone)

**Data model constraint**: the student record and account/authentication model must be designed so a guardian account can be linked to one or more students in a future phase without migrating existing records or requiring structural schema changes.

---

## 24. Risks, Assumptions, and Open Decisions

### Risks

| Risk | Impact | Note |
|---|---|---|
| Low student self-registration adoption — admin bottleneck | High | Admin-assisted path is the safety net; self-registration UX must be simple enough for a Grade 6 student |
| In-app notifications go unseen | High | Admin WhatsApp templates bridge the gap during transition; active encouragement required |
| Payment verification bottleneck at scale | Medium | Claim/lock queue supports multiple finance admins; single approver is sufficient for MVP |
| Migration data quality | Medium | WhatsApp-sourced records are incomplete; expect validation failures and manual correction effort |
| Scope creep during build | Medium | Online payments, SMS, guardian features, and Zoom API will be requested early; architecture must absorb them without requiring them |
| Child data protection and safeguarding obligations | Medium | Platform serves minors; legal review is required before production launch regardless of guardian account status |
| Local competition | Low–Medium | Existing local tools do not offer payment-gated content access — that gap is the primary differentiator |

### Open Decisions — Pending Final Institute Approval ⚠️

| # | Decision | Recommended Working Position |
|---|---|---|
| OD-01 | Historical content access policy | Retain access to paid periods; restrict unpaid periods; configurable by super admin |
| OD-02 | Invoice generation date, payment deadline, grace period, and late-enrollment pricing rules | Not yet defined — open institute business decisions; must be confirmed before PRD locks the invoice specification |
| OD-03 | Student portal access scope while in PENDING_ACTIVATION | Conservative default: no enrollment or paid access until ACTIVE |
| OD-04 | REQUIRES_CLARIFICATION resubmission model | Student appends additional evidence to existing submission record; original is not replaced; PRD author to confirm |

### Decisions Requiring Legal/Compliance Verification Before Production ⚖️

| # | Item |
|---|---|
| OD-05 | Child data protection and privacy obligations applicable to a minor-serving platform under Sri Lankan law |
| OD-06 | Whether optional guardian contact collection satisfies applicable consent requirements under Sri Lankan law |
| OD-07 | Content-retention and licensing policy implications for historical access to recordings and materials |
| OD-08 | Data residency and cross-border transfer obligations if the system is hosted outside Sri Lanka |

### Decisions Deferred to Architecture Phase 🔲

| # | Decision |
|---|---|
| OD-09 | Hosting provider, deployment region, infrastructure cost |
| OD-10 | Testable performance targets (API latency, concurrency, availability, RTO/RPO) and load-test scenarios |
| OD-11 | Self-service account recovery mechanism (MVP floor confirmed: admin-initiated reset; self-service token flow deferred) |
| OD-12 | Bulk import input format and minimum required field set (PRD author defines; Architecture phase validates) |

### Confirmed Superseded Requirements (Retained for Traceability)

The following requirements appeared in the planning session log but were **explicitly superseded** by later confirmed decisions. They must not be carried forward into the PRD.

| Former Requirement | Superseded By |
|---|---|
| PENDING_GUARDIAN_VERIFICATION account state | Removed; four-state model confirmed: PENDING_ACTIVATION, ACTIVE, SUSPENDED, DISABLED |
| Mandatory guardian linking before paid enrollment | Guardian system deferred; guardian approval is not a prerequisite for enrollment in MVP |
| Age-dependent registration workflows (different flows for Grades 6–9 vs 10–11) | Removed; all Grades 6–11 students follow the same account lifecycle |
| Three enrollment actors: student, guardian, administrator | Reduced to two: student and authorized administrator |
| Dual-approval payment verification | Explicitly excluded; single authorized finance administrator approves ordinary payments |
| Mandatory OTP authentication | Excluded; Student ID + password only for normal flows |

---

## 25. Requirements Traceability and Source References

| Source Document | Location | Applicable Sections |
|---|---|---|
| e-Paperé Product Brief (final, 2026-10-16) | `_bmad-output/planning-artifacts/brief-epapere-2026-10-16/brief.md` | All sections — primary source |
| e-Paperé Brief Addendum (final, 2026-10-16) | `_bmad-output/planning-artifacts/brief-epapere-2026-10-16/addendum.md` | Technology stack, data model, enrollment flow, migration model, deferred capabilities |
| Session Memory Log (2026-10-16) | `_bmad-output/planning-artifacts/brief-epapere-2026-10-16/.memlog.md` | Decision history and superseded requirements |
| Consolidated requirements (this document) | `docs/project/master-requirements.md` | Authoritative reference; supersedes any earlier conflicting statements |

### Source Priority Order

1. Consolidated project requirements provided in the master-requirements prompt (highest authority)
2. Confirmed decisions in brief.md and addendum.md (final status, 2026-10-16)
3. Session memory log decisions (decision trail, used for traceability and identifying superseded items)
4. Earlier or implicit planning assumptions (lowest authority — must not override confirmed decisions)

When an apparent conflict cannot be resolved from these sources, it is documented as an open decision above (§24). No policy has been silently invented or promoted from proposed to confirmed in this document.

---

*Document created: 2026-10-16 | Last updated: 2026-10-16 | Prepared for: PRD handoff*
