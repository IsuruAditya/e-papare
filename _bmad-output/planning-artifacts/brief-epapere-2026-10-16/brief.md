---
title: "e-Paperé — Product Brief"
status: final
created: 2026-10-16
updated: 2026-10-16
---

# e-Paperé — Product Brief

> **Status key**
> - ✅ **Confirmed** — decided and stable; PRD may treat as requirement
> - ⚠️ **Proposed** — recommended working position; requires final institute approval before PRD locks it
> - 🔲 **Deferred** — delegated to Architecture phase or a future product phase
> - ⚖️ **Legal** — requires Sri Lankan legal/compliance verification before production deployment

---

## 1. Problem

e-Paperé Online Institute is a live, operating Sri Lankan online tuition business serving students in Grades 6–11 across Mathematics, Science, Sinhala, and ICT. All administration — student registration, monthly fee collection, payment verification, and class access distribution — currently runs through WhatsApp and manual processes.

Every billing cycle, administrators receive bank-transfer screenshots on WhatsApp, manually verify payments, and re-add students to new WhatsApp groups to grant class access. Records are scattered across chat history, screenshots, and spreadsheets. Disputes require reconstructing conversations. This does not scale.

The specific failure the platform must fix: **a verified payment should never require an administrator to manually enroll a student into a WhatsApp group.** That step must be eliminated. ✅

---

## 2. Users

### Students (Grades 6–11) ✅
The primary users of the system. Each student has an individual account and can register, log in, browse courses, submit enrollment requests, upload payment slips, and access learning resources independently. The system must not assume every student has a personal phone number or email address. Admin-assisted registration remains available for students who need it.

### Administrators ✅
Register students who need assisted onboarding, manage course configurations, initiate enrollment on behalf of students, handle exceptions, and monitor dashboards. Their workload must decrease as self-service adoption grows. Administrators must never be able to view existing student passwords.

### Finance Administrators ✅
Claim and process payment submissions from the shared verification queue. Verify submissions against actual bank records, then approve, reject, or request clarification. Maintain transaction audit trails. No access to content management or course configuration.

### Teachers ✅
Access their own course rosters, enrollment counts, and student access status. Enter and update Zoom meeting details and class session information for their assigned courses. No access to financial records unless explicitly granted by a super administrator.

### Super Administrator / Institute Owner ✅
Full system access. Views enrollment totals, verified revenue, outstanding invoices, and operational health across all subjects, grades, and courses. Manages all system configuration including subjects, grades, teachers, fee structures, and access policies.

### Guardians 🔲 *(deferred to a future phase)*
Guardian accounts, guardian dashboards, guardian-managed course selection, and multi-child management are not part of the MVP. Guardian contact information may be optionally collected during student registration where appropriate. The architecture must support adding a full guardian account system in a future phase without structural redesign. Privacy, safeguarding, and child-data protection obligations applicable to a minor-serving platform must be reviewed and addressed before production launch, regardless of whether guardian accounts are implemented. ⚖️

---

## 3. Solution

A web-based Student Management System with integrated learning access — built for the institute's existing operational model, replacing the WhatsApp enrollment loop with a permanent, centralized platform.

### Core Workflow ✅
1. Student opens the portal and selects Register.
2. Student enters essential personal information and selects their grade (6–11).
3. System checks for potential duplicate registration.
4. Backend generates a permanent Student ID (EP-000001 format).
5. Student creates a password and completes account setup; account moves to ACTIVE.
6. Student browses available courses and submits an enrollment request; or an administrator initiates enrollment on the student's behalf.
7. System creates a persistent enrollment record and generates an invoice for the applicable billing month.
8. Student uploads a bank payment slip through the portal, or an administrator enters one received via WhatsApp.
9. A finance administrator claims the submission, verifies it against actual bank records, and approves, rejects, or requests clarification.
10. On approval, the system automatically activates course access for the paid billing period.
11. Student accesses Zoom links, study materials, and recordings from their dashboard — no WhatsApp group required.
12. Next month: invoice generated automatically, payment submitted, access renewed. No re-registration. No new group.

### Student Identity ✅
Student accounts are permanent. The EP Student ID never changes, never expires, and is never reassigned. A student account exists independently of monthly payment status. Enrollment records persist regardless of payment status — only access to new content for an unpaid period is restricted, not the account or enrollment history. Students progress through grades without creating new accounts.

### Authentication ✅
Login identifier: permanent Student ID (EP-000001 format). Authentication: Student ID + password. No personal email address required. No personal phone number required for login. No OTP dependency for normal login flows. Passwords are securely hashed server-side; administrators can never view existing passwords. Security controls: login rate limiting, secure session management, and account recovery. For admin-assisted registration, a secure one-time activation or credential setup process is used.

### Account Lifecycle ✅
Four account states, independent of enrollment and payment status:
- **PENDING_ACTIVATION** — account registered but not yet activated (e.g., awaiting credential setup via admin-assisted flow)
- **ACTIVE** — account operational; student may browse, enroll, and access paid content
- **SUSPENDED** — temporarily restricted by an administrator (e.g., policy violation or data issue)
- **DISABLED** — account deactivated; access fully removed; records preserved

All students in Grades 6–11 follow the same account workflow regardless of grade.

### Historical Content Access ⚠️ *(Proposed — pending final institute approval)*
Students retain access to study materials and recordings for billing periods they have already paid. A payment lapse restricts access to new content for the unpaid period only — it does not remove access to prior paid periods. Live Zoom class access is never granted for unpaid periods regardless of historical access status. This policy is configurable by a super administrator without code changes, subject to the institute's approved content-retention and licensing policies.

### Course Model ✅
A course is a configurable combination of subject, grade, teacher, and teaching category (e.g., Theory, Revision, Paper Class). Courses persist across months and are not recreated per billing cycle. Monthly billing and access entitlements are managed as separate records against a stable course enrollment.

### Course Enrollment ✅
Two actors may initiate course enrollment: the student (self-initiate) or an authorized administrator (acting on behalf of the student). Enrollment creates a persistent enrollment relationship and triggers invoice generation. Enrollment does not grant paid learning access — access is activated only after payment is verified. Guardian approval is not a default technical prerequisite for enrollment in the MVP.

### Subject and Grade Configuration ✅
All subjects, grades, course types, teachers, schedules, and fees are managed through the administration dashboard — nothing is hardcoded. The MVP launches with Grades 6–11 and four subjects (Mathematics, Science, Sinhala, ICT). New subjects and grades can be added without application code changes.

### Invoice Generation ✅ / ⚠️
Calendar-month billing model. On enrollment request: invoice created for the applicable billing month; fee calculated server-side from configured pricing; duplicate line items prevented. For continuing enrollments: invoices generated automatically via a scheduled, idempotent monthly process. Administrators can manually generate or regenerate missing invoices. An invoice never grants access by itself — access is activated only after payment is verified. Invoice generation date, payment deadline, grace period, and late-enrollment pricing rules are open institute decisions. ⚠️

### Payment Verification ✅
Finance administrators work from a shared, role-restricted verification queue. A finance administrator claims a submission before reviewing, preventing conflicting simultaneous decisions. The reviewer verifies against actual bank records and records their identity and a timestamp.

Outcomes:
- **Approved** — payment confirmed; system activates course access automatically
- **Requires Clarification** — submission incomplete or unmatched (e.g., unreadable slip, missing reference); reviewer records what is needed; student can resubmit evidence without losing invoice history
- **Rejected** — submission invalid; reason recorded; original preserved; student may submit new evidence

Duplicate approval and duplicate access activation are prevented. Financial record corrections preserve originals with an audit trail entry. For ordinary MVP transactions, one authorized finance administrator may approve after verification.

### Learning Access ✅
The student dashboard surfaces Zoom meeting details, study materials, and class recordings for courses with active paid access. Meeting details are entered manually by teachers or administrators. The platform is a management and access layer over Zoom; no video infrastructure is built.

### Notifications ✅
In-app notifications cover all critical events: registration confirmation, invoice availability, payment acknowledgment, payment approval / rejection / clarification request, course access activation, schedule changes, and new materials. Administrators supplement in-app notifications with manual WhatsApp messages using copyable templates provided by the system. No automated SMS, WhatsApp API, or email delivery is required for the MVP. The notification architecture separates event generation from delivery channels to support future integration.

### Existing Student Migration ✅
The platform supports controlled onboarding of existing students without disrupting ongoing operations. Administrators register students individually or through a bulk import utility. The process validates records, detects duplicates, and generates EP IDs through the standard mechanism. Imported payment records require reconciliation against bank evidence before being recorded as verified.

---

## 4. Business Value ✅

The immediate value is operational: administrators stop performing the same manual enrollment work every month. The compounding value is data — for the first time, the institute has a reliable, queryable record of who is enrolled, who has paid, and who has access. That record becomes the foundation for every future business decision.

A student-first portal with straightforward login raises the institute's credibility, reduces onboarding friction, supports retention, and enables future capabilities — online payments, guardian accounts, advanced reporting, A/L expansion — without rebuilding from scratch.

---

## 5. MVP Scope

### In Scope ✅
- Student self-registration and admin-assisted registration
- Permanent EP Student ID generation (EP-000001 format, backend-generated at registration)
- Student ID + password authentication; secure hashing; rate limiting; session management; account recovery
- Secure one-time activation flow for admin-assisted registrations
- Four account states: PENDING_ACTIVATION / ACTIVE / SUSPENDED / DISABLED
- Dynamic grade and subject configuration (Grades 6–11; Mathematics, Science, Sinhala, ICT at launch)
- Course management: subject, grade, teacher, category, schedule, and fee
- Course enrollment initiated by student or administrator; persistent enrollment relationship
- Calendar-month invoice generation: on enrollment and via scheduled monthly process; admin manual regeneration
- Bank payment slip upload via student portal and administrator entry
- Shared finance administrator payment verification queue: claim/lock, Approved / Requires Clarification / Rejected states, duplicate prevention, immutable audit trail
- Automatic course access activation on payment approval
- Historical content access for paid periods; restriction for unpaid periods (configurable policy) ⚠️
- Student dashboard: Zoom links, study materials, recordings, schedule, announcements
- Teacher dashboard: course roster, enrollment counts, student access status, Zoom and session entry
- Administrator dashboard: student management, enrollment assistance, access oversight
- Finance administrator dashboard: payment verification queue, audit trail, financial summaries
- Owner dashboard: enrollment totals, verified revenue, outstanding invoices, operational summary
- In-app notifications for key workflow events
- Copyable WhatsApp message templates for common administrator communications
- Role-based access control: student, teacher, finance administrator, administrator, super administrator
- Existing student migration: manual onboarding and bulk import with validation, duplicate detection, and audit trail *(bulk import format: defined in PRD ⚠️)*
- Payment history and role-segmented operational reporting
- Modular monolith architecture: maintainable, secure, extensible, and production-ready

### Out of Scope (MVP) ✅
- Guardian accounts, guardian login, and guardian dashboard
- Mandatory guardian linking and guardian course approval
- Multi-guardian relationship management
- Mandatory OTP or phone-based authentication
- Age-dependent registration workflows
- Online payment gateway integration (PayHere or equivalent)
- Automated WhatsApp Business API messaging
- Automated SMS notifications
- Email notification delivery
- Zoom API automation (meeting creation, attendance tracking)
- Examinations, assessments, or grading
- Advanced analytics, forecasting, or business intelligence
- Grades 1–5 and Grades 12–13
- In-house video infrastructure
- Native mobile applications
- Dual-approval payment verification workflows

The architecture must accommodate all of the above as future additions without structural redesign.

---

## 6. Success Metrics ✅

**Primary (3-month post-launch)**
- Monthly WhatsApp groups for access control are no longer created.
- Verified payments automatically activate correct course access without additional administrator steps.
- Students log in with their Student ID, access Zoom links, materials, and recordings from their permanent accounts.
- Administrators identify all pending payments and access problems from a single dashboard.

**Operational indicators** *(targets set once current baseline is measured)*
- Percentage of monthly verified payments activating course access without manual intervention.
- Reduction in administrator time spent on monthly enrollment tasks.
- Self-service payment slip upload rate (student portal vs. administrator-assisted entry).
- Self-registration completion rate (student self-service vs. admin-assisted).

---

## 7. Constraints

**Technical — confirmed, non-negotiable** ✅
- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Node.js, Express.js, TypeScript
- Database: MongoDB with Mongoose
- Architecture: modular monolith; no premature microservices

**Infrastructure** 🔲 *(deferred to Architecture phase)*
- Final hosting provider and deployment region selected after evaluating managed options, costs, regional availability, and operational trade-offs
- Requirements: HTTPS, environment separation, secure secret management, automated backups with tested restoration, production monitoring, structured logging, rollback procedures, infrastructure scalability, private object storage, and compliance with Sri Lankan data protection requirements

**Performance** 🔲 *(provisional planning scenarios; targets defined in Architecture phase)*
- Scale scenarios: 200 / 2,000 / 10,000 monthly active students — capacity-planning references, not deployment guarantees
- PRD must distinguish total registered students, monthly active users, and simultaneous users
- Testable performance targets defined and validated through load testing in the Architecture phase

**Operational** ✅
- The institute is live; migration must not disrupt ongoing classes or existing WhatsApp operations
- Transition is incremental: Preparation → Migration → Pilot → Gradual Adoption → Portal-Centered Operations
- WhatsApp remains a supplementary channel throughout and beyond the transition

---

## 8. Risks and Outstanding Decisions

### Risks

| Risk | Impact | Note |
|---|---|---|
| Low student adoption of self-registration — admin bottleneck | High | Admin-assisted path is the safety net; self-registration UX must be simple enough for a Grade 6 student |
| In-app notifications go unseen — students don't check the portal | High | Admin WhatsApp templates bridge the gap; active encouragement required during transition |
| Payment verification bottleneck at scale | Medium | Claim/lock queue supports multiple finance admins; single approver sufficient for MVP |
| Migration data quality | Medium | WhatsApp-sourced records are incomplete; expect validation failures and manual correction effort |
| Scope creep during build | Medium | Online payments, SMS, guardian features, Zoom API will be requested early; architecture must absorb without requiring them |
| Child data protection and safeguarding obligations | Medium | Platform serves minors; legal review required before production regardless of guardian account status ⚖️ |
| Local competition | Low–Medium | Existing Sri Lankan tools cover attendance/fees but not payment-gated content access — that gap is the differentiator |

### Decisions Pending Final Institute Approval ⚠️

| # | Decision | Recommended Working Position |
|---|---|---|
| 1 | Historical content access policy | Retain access to paid periods; restrict unpaid periods; configurable |
| 2 | Invoice generation date, payment deadline, grace period, late-enrollment pricing | Not yet defined — open institute business decisions |
| 3 | Student portal access scope while in PENDING_ACTIVATION | Conservative default: no enrollment or paid access until ACTIVE |

### Legal and Compliance Verification Required Before Production ⚖️

| # | Item |
|---|---|
| 4 | Child data protection and privacy obligations applicable to a minor-serving platform under Sri Lankan law |
| 5 | Whether optional guardian contact collection satisfies applicable consent requirements |
| 6 | Content-retention and licensing policy implications for historical access |

### Decisions Deferred to Architecture Phase 🔲

| # | Decision |
|---|---|
| 7 | Hosting provider, deployment region, and infrastructure cost |
| 8 | Testable performance targets and load-test scenarios |
| 9 | Sri Lanka data residency and cross-border transfer compliance detail |
| 10 | Account recovery self-service mechanism *(MVP floor confirmed: admin-initiated reset; self-service token flow deferred to Architecture)* |
| 11 | Bulk import input format and minimum required field set *(PRD author defines; Architecture phase validates)* |

### Deferred to Future Product Phase 🔲

| # | Capability |
|---|---|
| 12 | Guardian accounts, login, and dashboard |
| 13 | Mandatory guardian linking and guardian course approval |
| 14 | Multi-guardian relationship management |
| 15 | Dual-approval payment verification |

---

## 9. What This Is Not ✅

e-Paperé is not a full LMS — it does not host video, run assessments, or replace Zoom. It is a **student-first management and access-control layer** that makes the institute's existing Zoom-based teaching model sustainable at scale. The platform's job is to ensure the right students have the right access at the right time, with a full audit trail, and without an administrator manually doing it every month.
