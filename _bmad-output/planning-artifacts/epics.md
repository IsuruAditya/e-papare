---
status: final
version: 2
updated: 2026-10-24
stepsCompleted: ["step-01-validate-prerequisites", "step-02-design-epics", "step-03-create-stories", "step-04-final-validation", "step-05-v7-architecture-migration"]
inputDocuments:
  - _bmad-output/planning-artifacts/prd-e-papere-2026-10-16/prd.md
  - _bmad-output/planning-artifacts/prd-e-papere-2026-10-16/addendum.md
  - _bmad-output/planning-artifacts/arch-e-papere-2026-10-16/ARCHITECTURE-SPINE.md (v7)
  - _bmad-output/ux/ux-epapere-2026-10-16/DESIGN.md
  - _bmad-output/ux/ux-epapere-2026-10-16/EXPERIENCE.md
changes-v2: >
  MVP Architecture Simplification (2026-10-24) — applied in sync with Architecture Spine v7.
  Decision 1 (NestJS + Prisma + Neon PostgreSQL): Story 1.1 deps updated; Story 1.8 fully
  rewritten for NestJS bootstrap + Prisma + ZodValidationPipe; Stories 2.1/2.2/2.3/2.4/2.5/2.6
  updated for Prisma schemas and NestJS guards; Story 3.2 updated for Prisma upsert; Story 4.1
  updated for PostgreSQL advisory lock + Prisma upsert; Story 4.2 same; Story 4.6 updated for
  Prisma interactive transaction; Story 6.1 Notification model updated for Prisma; Story 8.2
  MigrationBatch/Row updated for Prisma; all remaining stories: terminology updated
  (Mongoose → Prisma model, MongoDB index → PostgreSQL unique constraint, etc.).
  Decision 2 (Subject/Grade in CourseModule): Story 3.1 scope updated.
  Decision 3 (TeacherModule → AdminModule): Stories referencing TeacherModule updated.
  Decision 4 (@nestjs/swagger): Story 1.8 and all stories with OpenAPI scope updated.
  All 51 stories preserved. No story removed. No story added.
  Validation record updated.
---

# e-Paperé SMS - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for the e-Paperé Student Management System, decomposing requirements from the PRD, UX Design Contract, and Architecture Spine v7 (AD-1–AD-52) into implementable stories.

**Technology stack (v2 — from Architecture Spine v7):**
- Backend: NestJS 11 + TypeScript + Prisma + Neon PostgreSQL (Singapore)
- Frontend: React + TypeScript + Vite + Tailwind CSS v4 (unchanged)
- Shared: packages/shared-types — Zod schemas for API contracts + TS types (unchanged)
- Deployment: Vercel Pro primary; Railway/Render portable alternative (unchanged)

---

## Requirements Inventory

### Functional Requirements

*(Requirements text unchanged from v1. All FRs preserved.)*

**FR-REG: Registration and Account Management**
- FR-REG-001: Student self-registration with full name, date of birth/age, and grade (6–11); email and phone not required.
- FR-REG-002: Duplicate detection (minimum: full name + grade + DOB) before creating account; potential matches flagged for admin review; name-only auto-merge prohibited.
- FR-REG-003: Backend-generated permanent EP Student ID (EP-000001 format) at registration, before any payment.
- FR-REG-004: Self-registering student sets own password and account transitions to ACTIVE within the same session; no separate activation step.
- FR-REG-005: Administrator can register a student on their behalf; creates account in PENDING_ACTIVATION.
- FR-REG-006: Admin-assisted registration generates a secure one-time activation link (single-use, 48h expiry, securely regenerable); admin never sees resulting password.
- FR-REG-007: Guardian contact info (name, phone, WhatsApp) optionally collectable; stored against student record; does not grant portal access.
- FR-REG-008: Four account states only: PENDING_ACTIVATION, ACTIVE, SUSPENDED, DISABLED; independent of enrollment/invoice/payment status.
- FR-REG-009: Admin can suspend (ACTIVE → SUSPENDED) and reinstate (SUSPENDED → ACTIVE) a student account.
- FR-REG-010: Super Admin can disable (ACTIVE or SUSPENDED → DISABLED) and reactivate (DISABLED → ACTIVE) a student account.
- FR-REG-011: PENDING_ACTIVATION student can view public course listings; enrollment and paid content access blocked until ACTIVE.
- FR-REG-012: Administrator can update a student's grade without creating a new account.
- FR-REG-013: EP IDs never change, never expire, never reassigned.
- FR-REG-014: Explicit admin action required (confirm-new, merge, or defer) before a flagged duplicate record is committed.

**FR-AUTH: Authentication and Account Recovery**
- FR-AUTH-001: Login via permanent Student ID + password only.
- FR-AUTH-002: Passwords hashed server-side (bcrypt); never stored plaintext, logged, or transmitted except over HTTPS.
- FR-AUTH-003: No OTP for normal authentication flows in MVP.
- FR-AUTH-004: Login rate limiting and brute-force protection on the auth endpoint.
- FR-AUTH-005: Short-lived access tokens; session tokens invalidated on logout.
- FR-AUTH-006: All auth traffic over HTTPS; no plain HTTP in production.
- FR-AUTH-007: No role — including Super Admin — may retrieve or view an existing student password.
- FR-AUTH-008: Admin-initiated account recovery generates a new one-time activation link; student sets new password.
- FR-AUTH-009: Account recovery not initiatable from easily discoverable info alone.

**FR-COURSE: Course and Subject Management**
- FR-COURSE-001: Admin can create, update, and deactivate courses (subject + grade + teacher + category).
- FR-COURSE-002: Courses persist across billing months; not recreated per billing cycle.
- FR-COURSE-003: Course fee, schedule, and category configurable via admin UI without code changes.
- FR-COURSE-004: MVP launches with four subjects (Mathematics, Science, Sinhala, ICT); additional subjects addable without code changes.
- FR-COURSE-005: MVP launches with Grades 6–11; additional grades addable without code changes.
- FR-COURSE-006: Teaching categories (Theory, Revision, Paper Class, etc.) configurable without code changes.
- FR-COURSE-007: Deactivated course hidden from student browser; existing enrollments, invoices, and payment records preserved.

**FR-ENROL: Enrollment and Withdrawal**
- FR-ENROL-001 through FR-ENROL-011: Persistent enrollment records; invoice stub on enrollment; duplicate enrollment prevention; withdrawal with effective month; prior access preserved on withdrawal; re-enrollment preserves history.

**FR-INV: Invoice Management**
- FR-INV-001 through FR-INV-008: One invoice per student per billing month; idempotent scheduled batch; configurable deadline; OVERDUE transition on missed deadline.

**FR-PAY: Payment Submission and Verification**
- FR-PAY-001 through FR-PAY-018: Bank slip upload; Finance Admin claim/verify; multi-course allocation; partial payment; excess; unmatched; duplicate detection; atomic entitlement on approval.

**FR-ACCESS: Learning Access**
- FR-ACCESS-001 through FR-ACCESS-008: Entitlement-gated Zoom/materials/recordings; historical access preserved.

**FR-LEARN: Learning Resource Management**
- FR-LEARN-001 through FR-LEARN-006: Zoom details; study materials (R2); recording URLs; publish/unpublish control; authorization-gated delivery.

**FR-NOTIF: Notifications**
- FR-NOTIF-001 through FR-NOTIF-004: 13 in-app notification types; WhatsApp templates; channel decoupling; overdue reminders.

**FR-MIG: Migration**
- FR-MIG-001 through FR-MIG-011: Individual and bulk import; per-row failure isolation; UNVERIFIED payment seeding; five-stage transition.

**FR-REPORT: Reporting**
- FR-REPORT-001 through FR-REPORT-005: Role-segmented dashboards for all five roles.

**FR-I18N: Internationalization and Localization**
- FR-I18N-001 through FR-I18N-013: Full en/si-LK bilingual support; language selector; persistence; write-time notifications.

### Non-Functional Requirements

*(All NFRs from v1 preserved. See PRD for full text.)*

NFR-PERF-001–004, NFR-DEPLOY-001–009, NFR-AVAIL-001–002, NFR-MAINT-001–004, NFR-EXT-001–004, NFR-TEST-001–003, NFR-ACCESS-001–003, NFR-I18N-001–010, EQ-001–015.

### Additional Requirements (from Architecture Spine v7 AD-1–AD-52)

- **Monorepo scaffold**: pnpm workspaces with three packages: `packages/frontend`, `packages/backend`, `packages/shared-types`. Two Vercel projects from same Git repo (AD-20).
- **Node.js 24 LTS**: Required across all environments (local, CI, Vercel `nodejs24.x`, Railway/Render). AD-2 v7.
- **NestJS 11** with Express platform adapter. Built-in modules, guards, pipes, filters, interceptors (AD-2 v7).
- **JWT + refresh cookie**: Access token 15 min (HS256, `{ sub, role, epId }`); refresh token 7 days, rotated on every use, stored hashed in `refresh_tokens` table. SameSite per `COOKIE_SAME_SITE` env (AD-3).
- **bcrypt cost factor 12**: On all password and activation token hashing (AD-4).
- **Atomic EP Student ID**: Via PostgreSQL `nextval('ep_student_id_seq')`; never max+1 (AD-5).
- **react-i18next v15**: All translation via `t()` or `<Trans>`; namespace-per-module file structure (AD-6, AD-7).
- **Stable machine-readable error codes**: `{ code: "ERR_*", params?, requestId }` via global `ExceptionFilter` (AD-8).
- **ThemeContext + `html.dark`**: Tailwind v4 dark mode via `@custom-variant dark (&:where(.dark, .dark *))` (AD-9, AD-10, AD-46).
- **Prisma interactive transactions**: Required for payment approval → entitlement creation path (AD-11).
- **Cloudflare R2 private storage**: Presigned GET URLs (15 min) after entitlement check; no raw R2 URLs in API responses (AD-12, AD-35).
- **Stateless request handling**: No singleton state between requests (AD-13).
- **Dual-key rate limiting**: Upstash Redis, `express-rate-limit` + `rate-limit-redis`; **30 req/15 min per IP**, 5 req/15 min per Student ID; IP from `x-real-ip` on Vercel; configurable via env (AD-14, AD-34).
- **Synchronous in-request notification writes**: Within Prisma transaction for critical paths (AD-15).
- **Invoice batch job**: Plain async function (NOT `@nestjs/schedule`); Vercel Cron GET `30 18 24 * *` UTC; daily catch-up GET `5 19 * * *` UTC; PostgreSQL advisory lock; idempotent via Prisma upsert (AD-16, AD-33).
- **PostgreSQL unique constraints + indexes**: All 17 constraints from AD-17 created via Prisma schema.
- **TanStack Query v5**: All frontend server state (AD-18).
- **React Hook Form + Zod shared schemas**: `packages/shared-types` Zod schemas; `ZodValidationPipe` backend; `zodResolver` frontend (AD-19).
- **@nestjs/swagger OpenAPI**: Decorator-driven spec; Swagger UI at `/api/docs` non-production only; `redocly lint` in CI (AD-21).
- **Vitest + Playwright**: Integration tests against real PostgreSQL; E2E UJ-1–UJ-5 in en+si, light+dark (AD-22).
- **ZodValidationPipe**: Applied per-endpoint; returns `ERR_VALIDATION` on parse failure (AD-23).
- **Pino structured JSON logger**: NestJS `LoggerService` implementation; `AsyncLocalStorage` request ID (AD-24).
- **GitHub Actions CI/CD**: TypeScript → ESLint → Prisma validate → Vitest → validate-i18n → Playwright → redocly lint (AD-25).
- **Neon PostgreSQL Singapore**: NUMERIC(12,2) for money; PITR; connection pooler for runtime; direct connection for migrations (AD-26, AD-32).
- **Vercel Pro + Railway/Render portability**: `AppModule`; no provider SDK in domain services (AD-27, AD-31).
- **Noto Sans Sinhala self-hosted** (AD-28).
- **Helmet + CORS allowlist**: Applied in NestJS bootstrap (AD-29).
- **CI i18n gate**: `validate-i18n.ts` (AD-30).
- **Vercel project configuration**: `nodejs24.x`; `DATABASE_URL` + `DIRECT_DATABASE_URL` env vars (AD-36).
- **One-time activation token strategy**: bcrypt-hashed; stored in `users` table columns; single-use (AD-38).
- **Duplicate adjudication table**: `duplicate_reviews` with JSONB snapshot (AD-39).
- **Unmatched payment state**: `UNMATCHED` status in `payment_submissions` (AD-40).
- **Migration batch data model**: `migration_batches` + `migration_rows` tables (AD-41).
- **Daily overdue-marking job**: Plain async function; PostgreSQL advisory lock; write-time notification language (AD-42, AD-51).
- **Duplicate submission detection**: 5% threshold; `is_duplicate_flag` column (AD-43, AD-44).
- **Reporting aggregation**: On-demand SQL via Prisma `$queryRaw` or `groupBy`; paginated (AD-45).
- **Pagination helper**: `getPaginationParams(query)` from pagination util; default 20, max 100 (AD-47).
- **Account recovery rate limiting**: 3/24h per student via Redis (AD-48).
- **User preferences API**: `PATCH /api/v1/users/me/preferences`; `preferred_theme` column on `users` table (AD-49).
- **TanStack Query polling**: 10s payment detail; 15s finance queue (AD-50).
- **Notification language write-time rule**: Rendered at write time from `user.preferred_language` (AD-51).
- **Account state enforcement at session boundary**: `AuthGuard` re-checks `account_state` from DB on sensitive routes (AD-52).

---

### UX Design Requirements *(unchanged from v1)*

UX-DR1–UX-DR38 apply unchanged. See Architecture Spine v7 UX–Architecture Integration Checklist (all ✅ Verified).

---

### FR Coverage Map *(unchanged from v1)*

| Requirement | Epic |
|---|---|
| FR-REG-001–014 | Epic 2 |
| FR-AUTH-001–009 | Epic 2 |
| FR-COURSE-001–007 | Epic 3 |
| FR-ENROL-001–011 | Epic 3 |
| FR-INV-001–008 | Epic 4 |
| FR-PAY-001–018 | Epic 4 |
| FR-ACCESS-001–008 (entitlement creation) | Epic 4 |
| FR-ACCESS-001 (resource display), FR-LEARN-001–006 | Epic 5 |
| FR-NOTIF-001–004 | Epics 4 + 6 |
| FR-REPORT-001–005 | Epics 4/5 + 7 |
| FR-MIG-001–011 | Epic 8 |
| FR-I18N-001–013 | Epics 1 + 2–8 + 9 |
| NFR + EQ | Epic 1 (established) + enforced per story |
| NFR-PERF, NFR-DEPLOY, NFR-AVAIL | Epic 9 |
| SEC-001–017 | Epics 2 + 4 (enforced per story) |
| UX-DR1–UX-DR38 | Epics 1–9 |

---

## Milestone Map

| Milestone | Epics Included | Core Outcome |
|---|---|---|
| **Controlled Pilot** | Epics 1–4 + Zoom-access slice of Epic 5 | Student registers → enrolls → receives invoice → uploads bank slip → Finance Admin verifies and approves → access activates → student opens Zoom class link. |
| **Full MVP** | Epics 5–9 | All roles, all dashboards, full learning resources, notifications, migration, bilingual completeness, accessibility audit, production hardening, legal release gates. |
| **Future Roadmap** | Deferred items | Guardian accounts, payment gateway, WhatsApp API, SMS/email, Zoom API, A/L grades, native apps, dual-approval, self-service recovery, grace-period access. |

---

## Epic List

### Epic 1: Monorepo Foundation, Design System, and CI Pipeline
Establishes the pnpm monorepo with all three workspaces, TypeScript strict mode, linting, Vitest + `@nestjs/testing`, Playwright, GitHub Actions CI with i18n gate, full semantic design token system (light + dark), Noto Sans Sinhala, bilingual i18n scaffold, shared Zod schemas, NestJS app bootstrap with Prisma + Neon, and a passing CI pipeline. Every subsequent epic builds on this verified foundation.

### Epic 2: Student Identity — Registration, Authentication, and Account Management
Students self-register, receive a permanent EP Student ID, log in. Administrators register students via secure one-time activation links. All five roles authenticate. Account states enforced. Duplicate detection prevents duplicate records. RBAC via NestJS guards protects every API route.

### Epic 3: Course Catalogue and Persistent Enrollment
Administrators manage bilingual courses (with Subject and Grade as reference tables in the CourseModule). Students and administrators enroll students in persistent course relationships. Withdrawals recorded. Invoice stub generated on enrollment. Teachers access course rosters.

### Epic 4: Invoicing, Payment Verification, and Access Entitlement (+ Pilot Zoom Slice)
Complete financial workflow: scheduled invoice generation (PostgreSQL advisory lock; Prisma upsert idempotency), bank-slip upload, Finance Admin verification with atomic entitlement activation (Prisma interactive transaction), overdue marking, and Zoom link access for the pilot milestone.

### Epic 5: Full Learning Resource Management
Teachers and administrators manage study materials and recording URL entries. Students with paid access see the full resource library. Historical content access enforced per configured policy.

### Epic 6: Notifications, WhatsApp Templates, and Bilingual Delivery
All 13 in-app notification types delivered in recipient's preferred language. WhatsApp templates in both languages.

### Epic 7: Administrator Dashboards, Reporting, and System Configuration
All administrative roles have complete dashboards. Super Administrator configures billing dates, access policy, and default language.

### Epic 8: Existing Student Migration
Individual and bulk CSV import. Duplicate detection, EP ID generation, UNVERIFIED payment seeding, post-batch flagged-row review.

### Epic 9: Bilingual Completion, Accessibility Audit, and Production Release Gates
Full bilingual coverage verified. WCAG 2.1 AA audited. All five UJs pass E2E in both languages and themes. Production infrastructure operational. Legal/compliance sign-offs recorded.

---

## Epic 1: Monorepo Foundation, Design System, and CI Pipeline

The development team has a working pnpm monorepo with three verified packages, TypeScript strict mode, linting, Vitest + `@nestjs/testing` + Playwright, GitHub Actions CI with i18n and type gates, the complete semantic design token system, Noto Sans Sinhala, react-i18next bilingual skeleton, all shared Zod schemas, NestJS bootstrap with Prisma + Neon PostgreSQL, and a passing CI pipeline.

### Story 1.1: pnpm Monorepo Scaffold with Three Packages

As a developer,
I want a pnpm workspaces monorepo with `packages/frontend`, `packages/backend`, and `packages/shared-types` packages,
So that all three workspaces share a single lockfile, toolchain, and TypeScript configuration while remaining independently deployable.

**Source requirements:** AD-20, EQ-001–002, NFR-MAINT-001, NFR-EXT-001

**Scope:**
- Root `pnpm-workspace.yaml` listing all three packages
- Root `tsconfig.base.json` with strict mode (`"strict": true`, `"noUncheckedIndexedAccess": true`, `"exactOptionalPropertyTypes": true`)
- Each package has its own `package.json` and `tsconfig.json` extending the base
- `packages/shared-types`: exports only Zod schemas (for API request/response validation) and inferred TypeScript types; Zod is the only runtime dependency; no React, NestJS, Prisma, database, secrets, or infrastructure deps (AD-20)
- `packages/backend`: Node.js 24 LTS target; `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`, `@nestjs/config`, `@nestjs/jwt`, `@nestjs/swagger`, `@nestjs/testing`; `prisma` dev dep; `@prisma/client` runtime dep; `pino`, `pino-http` for logging; `express-rate-limit`, `rate-limit-redis` for rate limiting; `helmet`, `bcrypt`, `uuid`
- `packages/frontend`: Vite + React + TypeScript; Tailwind CSS v4; TanStack Query v5; React Hook Form; react-i18next v15; React Router v7
- Root `.nvmrc` / `.node-version` pinned to Node 24 LTS
- `.gitignore` covering `node_modules`, `dist`, `.env*`, `prisma/migrations/*.sql` is NOT gitignored (migrations are version-controlled)
- `docker-compose.yml` at root with a `postgres:16` service for local development and integration tests

**Acceptance Criteria:**

**Given** a clean checkout of the repository
**When** `pnpm install` is run from the root
**Then** all three packages install without errors

**Given** `packages/shared-types/package.json`
**When** its dependency list is inspected
**Then** `zod` is the only runtime dependency; `@prisma/client`, NestJS, React, and any database packages are absent

**Given** any TypeScript file in any package
**When** a type error is introduced
**Then** `pnpm -r typecheck` reports the error with the correct file and line

**Given** the `docker-compose.yml` at root
**When** `docker compose up -d postgres` is run
**Then** a PostgreSQL 16 container starts and is accessible at `localhost:5432`

---

### Story 1.2: ESLint, Prettier, and Pre-commit Hooks

As a developer,
I want consistent code style enforced by ESLint and Prettier with pre-commit hooks,
So that every commit meets the project's style and quality baseline automatically.

**Source requirements:** EQ-001–002, EQ-010, AD-25

**Scope:**
- ESLint flat config at root: `@typescript-eslint/recommended-type-checked`, `no-console` (warn), React hooks rules for frontend
- Custom ESLint rule (or `no-restricted-imports`) preventing cross-module service/repository imports in backend (one module may not import another module's internal service classes directly — only through NestJS DI)
- Prettier config: 2-space indent, single quotes, trailing commas, 100-char line width
- `lint-staged` + `husky` pre-commit hook
- `pnpm -r lint` script running ESLint + Prettier check

**Acceptance Criteria:**

**Given** a backend file in `src/modules/auth/` that imports directly from `src/modules/payment/payment.service.ts` (bypassing NestJS DI)
**When** ESLint is run
**Then** the cross-module import rule reports a lint error

**Given** a staged file before commit
**When** `git commit` is executed
**Then** `lint-staged` runs; the commit is blocked if errors remain

---

### Story 1.3: Vitest and Playwright Test Framework Setup

As a developer,
I want Vitest for unit/integration tests and Playwright for E2E tests configured across the monorepo,
So that tests can be written and run consistently from the first story onward.

**Source requirements:** EQ-009, NFR-TEST-001, AD-22

**Scope:**
- `vitest.config.ts` in `packages/backend` and `packages/frontend`
- `@nestjs/testing` added to backend dev deps — used for `Test.createTestingModule()` in all backend tests
- `playwright.config.ts` at root; Chromium + Firefox projects
- Integration test setup: `vitest.config.ts` uses a `globalSetup` script that runs `prisma migrate reset --force` against a test database (`DATABASE_URL_TEST` env) before the test suite
- Example passing unit test in `packages/shared-types` (Zod schema parse)
- Example passing Vitest test in `packages/backend` (pure service function using `Test.createTestingModule`)
- `pnpm -r test` runs Vitest; `pnpm test:e2e` runs Playwright

**Acceptance Criteria:**

**Given** the example unit test in `packages/shared-types`
**When** `pnpm -r test` is run
**Then** the test passes

**Given** a backend integration test using `Test.createTestingModule({ imports: [AppModule] })`
**When** the test runs against the test PostgreSQL database
**Then** the test passes and Prisma can query the database

---

### Story 1.4: GitHub Actions CI Pipeline with i18n and Type Gates

As a development team,
I want a GitHub Actions CI pipeline that runs on every PR to `main`,
So that broken builds, type errors, missing Sinhala translations, schema violations, and failing tests are caught before merge.

**Source requirements:** AD-25, AD-30, EQ-010–011, NFR-DEPLOY-001–003

**Scope:**
- `.github/workflows/ci.yml` triggered on `pull_request` targeting `main`
- Steps in order: `pnpm install --frozen-lockfile` → `pnpm -r typecheck` → `pnpm -r lint` → `npx prisma validate` → `pnpm -r test --run` (with PostgreSQL service container) → `pnpm validate-i18n` → Playwright E2E smoke → `redocly lint` (on generated spec, skipped until first swagger export exists)
- PostgreSQL service in CI: `services: postgres: image: postgres:16` with `POSTGRES_PASSWORD`, `DATABASE_URL_TEST` env
- `validate-i18n.ts` script diffs `en/` vs `si/` per namespace; exits non-zero on missing keys
- Node 24 LTS pinned in workflow

**Acceptance Criteria:**

**Given** a PR that introduces a TypeScript type error
**When** the CI pipeline runs
**Then** the `typecheck` step fails and the PR cannot be merged

**Given** a PR that adds an English translation key without a corresponding Sinhala key
**When** `pnpm validate-i18n` runs
**Then** the step exits non-zero and reports the missing key

**Given** a PR that modifies `prisma/schema.prisma` with an invalid schema
**When** `npx prisma validate` runs
**Then** the step fails and the PR is blocked

---

### Story 1.5: Semantic Design Token System and Typography

*(Scope and ACs unchanged from v1 — frontend only, no NestJS/Prisma impact)*

As a frontend developer,
I want the complete semantic design token system and Sinhala/English typography configured,
So that every component I build can use token-based utility classes without ever hardcoding hex values or font families.

**Source requirements:** UX-DR1–7, AD-9–10, AD-28, AD-46 (amended), DESIGN.md (authoritative)

**Scope:** `src/styles/tokens.css` with all 28 Light Mode tokens under `:root` and Dark Mode tokens under `.dark`; Tailwind CSS v4 with `@custom-variant dark`; Inter + Noto Sans Sinhala self-hosted; spacing and radius tokens per DESIGN.md.

**Acceptance Criteria:**

**Given** a component using `bg-surface text-brand border-border`
**When** rendered in Light Mode
**Then** computed styles match the exact hex values in DESIGN.md Light Mode token table

**Given** `html.dark` class applied
**When** the same component is rendered
**Then** computed styles match DESIGN.md Dark Mode token table

**Given** the Noto Sans Sinhala font file is loaded
**When** the browser network log is inspected
**Then** the font payload is ≤200 kB; `font-display: swap` is confirmed

---

### Story 1.6: Core UI Component Library

*(Scope and ACs unchanged from v1 — frontend only)*

As a frontend developer,
I want the core reusable UI components implemented against the DESIGN.md spec,
So that every epic can build features using consistent, accessible, bilingual-ready components.

**Source requirements:** UX-DR8–22, UX-DR23–25, DESIGN.md, EXPERIENCE.md

**Scope:** Button, Input/Select/Textarea, File Upload Zone (three-phase presigned upload), Card, Status Pill (all 14 states), Table (paginated), Dialog/Modal, Toast/Notification, Skeleton, Announcement Banner, Skip link. All components: both `en` and `si` labels; semantic tokens only; Light + Dark.

**Acceptance Criteria:**

**Given** a Button with `variant="primary"` in Light Mode
**When** rendered and focus ring inspected
**Then** `outline: 3px solid var(--color-brand)` is applied on focus

**Given** a Status Pill with `status="APPROVED"` and `lang="si"`
**When** rendered
**Then** displays "අනුමත"; pill background is `--color-success-bg`

---

### Story 1.7: React App Shell, Routing, and ThemeContext

*(Scope and ACs unchanged from v1 — frontend only)*

As a frontend developer,
I want the authenticated app shell with role-scoped routing, ThemeContext, I18nProvider, and the language switcher in place,
So that every role dashboard can be built as a feature module without re-establishing layout or global state.

**Source requirements:** UX-DR3, UX-DR8–11, UX-DR21, AD-6–7, AD-9, EXPERIENCE.md

**Scope:** `App.tsx` with `ThemeContext`, `I18nProvider`, `AuthProvider`, React Router v7; Topbar (52px); Desktop Sidebar; Tablet hamburger drawer; Mobile Bottom Navigation (Student role); `<ProtectedRoute role={...}>`; all shell strings via `t()`.

**Acceptance Criteria:**

**Given** a user visits `/student` without a valid JWT
**When** the route renders
**Then** they are redirected to `/` with `returnUrl` preserved

**Given** `i18next.changeLanguage('si')` is called while a form is open
**When** the re-render completes
**Then** all labels display Sinhala; all form field values are unchanged; `html lang` is `"si"`

---

### Story 1.8: NestJS Bootstrap, Prisma, Pino Logger, and Shared Zod Schemas

As a backend developer,
I want the NestJS application bootstrap, Prisma database integration, Pino logger, Helmet/CORS, global exception filter, ZodValidationPipe, and all shared schemas in place,
So that every subsequent API route is built on a secure, validated, observable foundation.

**Source requirements:** AD-2/8/19/21/23/24/29/31/32, EQ-004–006/013

**Scope:**
- `packages/backend/src/app.module.ts`: root `@Module` importing `ConfigModule.forRoot({ isGlobal: true, validate })`, `DatabaseModule`, `AuthModule`, and all feature modules; registers global providers via `APP_FILTER` (`GlobalExceptionFilter`), `APP_PIPE` (deferred to per-endpoint usage for Zod), `APP_INTERCEPTOR` (`RequestIdInterceptor`)
- `packages/backend/src/main.ts`: persistent entrypoint — `NestFactory.create(AppModule, { logger: new PinoLogger() })`, `app.setGlobalPrefix('api/v1')`, `app.use(helmet())`, `app.enableCors({ origin: process.env.CORS_ORIGIN, credentials: true })`, `app.enableShutdownHooks()`, `app.listen(PORT)`
- `packages/backend/api/index.ts`: Vercel entrypoint — module-level `app` variable; `NestFactory.create(AppModule)` called once; `app.init()` (NOT `app.listen()`); forwards to Express instance; no domain logic
- `packages/backend/src/shared/database/prisma.service.ts`: `@Injectable()` extending `PrismaClient`; `onModuleInit()` calls `this.$connect()`; `onModuleDestroy()` calls `this.$disconnect()`; exported from `DatabaseModule`; provided globally
- `packages/backend/prisma/schema.prisma`: datasource with `DATABASE_URL` (pooler) and `DIRECT_DATABASE_URL` (direct); generator `prisma-client-js`; all models from Architecture Spine v7 data model; all enums
- `packages/backend/src/config/configuration.ts`: `@nestjs/config` schema validating all required env vars (`DATABASE_URL`, `DIRECT_DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CRON_SECRET`, `INTERNAL_JOB_SECRET`, `CORS_ORIGIN`, `R2_BUCKET`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `REDIS_URL`, `AUTH_RATE_LIMIT_IP`, `AUTH_RATE_LIMIT_EPI`, `AUTH_RATE_LIMIT_WINDOW_MS`, `COOKIE_SAME_SITE`)
- `packages/backend/src/shared/filters/http-exception.filter.ts`: `@Catch()` global filter; serializes to `{ code, params?, requestId }` (AD-8)
- `packages/backend/src/shared/interceptors/request-id.interceptor.ts`: injects `requestId` via `AsyncLocalStorage` on every request
- `packages/backend/src/shared/logger/pino.logger.ts`: implements NestJS `LoggerService`; wraps Pino JSON logger; `NODE_ENV=production` sets `level: 'info'`; no PII logged
- `packages/backend/src/shared/pipes/zod-validation.pipe.ts`: implements `PipeTransform`; calls `schema.safeParse(value)`; throws `ZodValidationException` → `{ code: 'ERR_VALIDATION', params: [{field, message}], requestId }` on failure (AD-23)
- `packages/backend/src/shared/pagination/pagination.util.ts`: `getPaginationParams(query): { page, pageSize, skip }` — `page ≥ 1`, `pageSize` clamped `[1, 100]`, default 20 (AD-47)
- **Server-side i18next initialization** (required from Story 3.2 onward): initialize `i18next` with `notification` namespace from `packages/shared-types/locales/{en,si}/notification.json`; export `renderNotification(type, params, language): string`; export `NotificationService.write(recipientId, type, params)` stub that reads `user.preferred_language` from DB and inserts a `Notification` row with rendered `body`, stable `type`, and `params` fields (AD-51)
- `packages/backend/src/shared/database/database.module.ts`: `@Global()` module exporting `PrismaService`
- `@nestjs/swagger` setup: `SwaggerModule.setup('api/docs', app, document)` in `main.ts`; `@ApiExcludeController()` on `JobsController`; `VITE_ENV !== 'production'` guard
- All env vars documented in `.env.example`

**Acceptance Criteria:**

**Given** `NestFactory.create(AppModule)` is called and a request is made without the `CORS_ORIGIN` origin header
**When** the response is returned
**Then** the CORS headers do not include the unauthorized origin; Helmet security headers are present (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`)

**Given** a route decorated with `@Body(new ZodValidationPipe(schema))` where the body fails Zod parse
**When** the request is made
**Then** HTTP 422 with `{ code: "ERR_VALIDATION", params: [{ field, message }], requestId }` — no English prose, no raw Zod error shape

**Given** a warm Vercel serverless invocation (module-level `app` already initialized)
**When** `handler(req, res)` is called
**Then** the module-level `app` is reused; `NestFactory.create` is not called again (no new Prisma connection opened)

**Given** `NODE_ENV=production`
**When** the logger is initialized
**Then** log output is newline-delimited JSON; no PII fields (password hashes, tokens, student personal data) appear in any log line

**Given** `GET /api/v1/health` is called
**When** the response is received
**Then** HTTP 200 `{ status: 'ok', db: 'connected', version }`

**Given** `GET /api/docs` is called in a non-production environment
**When** the response is received
**Then** the Swagger UI renders with the generated OpenAPI 3.1 spec; no `/api/v1/internal/jobs/*` endpoints appear in the spec

---

## Epic 2: Student Identity — Registration, Authentication, and Account Management

### Story 2.1: User Prisma Schema and Shared Zod Contracts

As a backend developer,
I want the `users` Prisma model and all shared Zod validation schemas for identity,
So that every subsequent auth and registration story has a single, authoritative data contract.

**Source requirements:** FR-REG-001/003/007/008/013, FR-AUTH-001–002/007, AD-4–5/38/49/52, EQ-001/004/006/012

**Scope:**
- `packages/shared-types/src/schemas/user.schemas.ts`: Zod schemas for `selfRegisterSchema`, `loginSchema`, `activateAccountSchema`, `updatePreferencesSchema`; exported inferred TypeScript types
- `packages/backend/prisma/schema.prisma` `User` model (already scaffolded in Story 1.8): verify all fields from Architecture Spine v7 — `ep_id` (unique), `role` (enum), `account_state` (enum), `password_hash` (never returned), `preferred_language`, `preferred_theme`, `full_name`, `date_of_birth`, `grade`, `guardian_*` nullable columns, `activation_token_*` nullable columns
- All unique constraints and indexes from AD-17 relevant to `users` table present in Prisma schema
- `password_hash` excluded from all query responses using Prisma `select` or model-level transform
- Initial Prisma migration: `prisma migrate dev --name init` creates all tables

**Acceptance Criteria:**

**Given** `selfRegisterSchema` in `shared-types`
**When** a valid registration payload is parsed with `zod.parse()`
**Then** parsing succeeds and TypeScript infers the correct type

**Given** a `User` is fetched via `prisma.user.findUnique()`
**When** the result is serialized to JSON (without explicit `select` on `password_hash`)
**Then** the service layer excludes `password_hash` before returning to the controller (enforced at service level, not Prisma model level — Prisma does not have a `select: false` equivalent)

**Given** `npx prisma migrate status` is run
**When** the command completes
**Then** all migrations are applied; no pending migrations remain

---

### Story 2.2: Student Self-Registration API

As a student,
I want to register with my name, grade, and date of birth,
So that I receive a permanent EP Student ID and my account is immediately active.

**Source requirements:** FR-REG-001–004/007/013, AD-5, EQ-004–005, BR-ACCT-01

**Scope:**
- `POST /api/v1/auth/register` — public route (no `AuthGuard`)
- `@Body(new ZodValidationPipe(selfRegisterSchema))` on controller method
- `StudentService.register()`: duplicate check (full name + grade + DOB match → creates `duplicate_reviews` row, returns `{ status: 'DUPLICATE_FLAGGED' }`); no duplicate → `prisma.$queryRaw<[{nextval: bigint}]>\`SELECT nextval('ep_student_id_seq')\`` to get next ID, format as `EP-000001`, create `users` row in ACTIVE state, hash password with bcrypt cost 12 (AD-4)
- Response on success: `{ epId, fullName, grade, accountState: 'ACTIVE' }` — no `password_hash`, no token returned
- Response on duplicate flag: HTTP 409 `{ code: 'ERR_DUPLICATE_REGISTRATION_FLAGGED' }` — no existing account data in response
- `@ApiOperation`, `@ApiResponse` decorators on controller method
- Unit tests: EP ID uniqueness under concurrent sequence calls, duplicate detection, bcrypt hash produced
- Integration test: full register → verify `users` row in DB with ACTIVE state and bcrypt hash

**Acceptance Criteria:**

**Given** a valid registration payload with no matching duplicate
**When** `POST /api/v1/auth/register` is called
**Then** HTTP 201; response contains `epId` in `EP-XXXXXX` format; `accountState` is `ACTIVE`; `password_hash` is absent from response; DB row has bcrypt hash starting with `$2b$12$`

**Given** the same registration is submitted twice concurrently
**When** both requests complete
**Then** exactly one `users` row is created; EP ID is unique; the second request receives `ERR_DUPLICATE_REGISTRATION_FLAGGED` or a unique-constraint error handled as duplicate

**Given** a payload where full name + grade + DOB match an existing user
**When** `POST /api/v1/auth/register` is called
**Then** HTTP 409 `{ code: 'ERR_DUPLICATE_REGISTRATION_FLAGGED' }`; no existing student data in the response; a `duplicate_reviews` row is created in PENDING state

---

### Story 2.3: Login, JWT Issuance, and Token Refresh

As any authenticated user,
I want to log in with my Student ID and password,
So that I receive a short-lived access token and a secure refresh cookie for my session.

**Source requirements:** FR-AUTH-001–006, AD-3/14/34/52, EQ-005, BR-ACCT-03–05

**Scope:**
- `POST /api/v1/auth/login` — public route
- `@Body(new ZodValidationPipe(loginSchema))` on controller method
- `AuthService.login()`: find user by `ep_id`; check `account_state` — SUSPENDED or DISABLED → write `AuditEvent` → return HTTP 403 `{ code: 'ERR_ACCOUNT_NOT_ACCESSIBLE' }` (no state detail); compare password with bcrypt; on success → issue access JWT (15 min, HS256, `{ sub, role, epId }` via `@nestjs/jwt`) + refresh token (random 32-byte hex, stored as bcrypt hash in `refresh_tokens` table); set HTTP-only `Secure` refresh cookie (`SameSite` from `COOKIE_SAME_SITE` env, default `None`)
- Dual-key Redis rate limiting on login registered in `AppModule.configure()` using `express-rate-limit` + `rate-limit-redis`: **30 req/15 min per IP** (CGNAT); **5 req/15 min per `epId`**; IP extracted from `x-real-ip` header on Vercel (AD-14/34)
- `POST /api/v1/auth/refresh` — reads refresh cookie, rotates token (old record deleted, new record created), returns new access JWT
- `POST /api/v1/auth/logout` — deletes refresh token record in `refresh_tokens`, clears cookie
- `GET /api/v1/auth/me` — returns `{ epId, role, fullName, preferredLanguage, preferredTheme }` (no password_hash)
- `src/shared/guards/auth.guard.ts`: `@Injectable()` implementing `CanActivate`; verifies JWT via `@nestjs/jwt`; attaches `req.user`; re-checks `account_state` from DB on data-mutating and sensitive-read routes (AD-52)
- `src/shared/guards/roles.guard.ts`: `@Injectable()` implementing `CanActivate`; reads `@Roles()` metadata; checks `req.user.role`
- Unit tests: rate limit enforcement, SUSPENDED account blocked, JWT payload shape, `RolesGuard` behavior
- Integration tests: login → refresh → logout cycle; DISABLED account returns generic 403

**Acceptance Criteria:**

**Given** valid credentials for an ACTIVE account
**When** `POST /api/v1/auth/login` is called
**Then** HTTP 200; `accessToken` in response (JWT, 15 min); `Set-Cookie` sets HTTP-only Secure refresh cookie; `password_hash` absent from response

**Given** a SUSPENDED account with valid credentials
**When** `POST /api/v1/auth/login` is called
**Then** HTTP 403 `{ code: 'ERR_ACCOUNT_NOT_ACCESSIBLE' }`; no token issued; `AuditEvent` written with `action: 'LOGIN_BLOCKED_ACCOUNT_STATE'`

**Given** the same `epId` attempts login 6 times in 15 minutes
**When** the 6th attempt is made
**Then** HTTP 429 `{ code: 'ERR_AUTH_RATE_LIMITED' }`; rate limit key is stored in Upstash Redis, not in-memory

**Given** 15 students on the same shared mobile carrier IP log in within 15 minutes
**When** the 15th login is made
**Then** it succeeds (IP counter is 15 of 30; not rate-limited by IP); each student's per-epId counter is independently tracked

---

### Story 2.4: Admin-Assisted Registration and One-Time Activation Link

As an administrator,
I want to register a student on their behalf and generate a secure one-time activation link,
So that the student can set their own password without me ever seeing it.

**Source requirements:** FR-REG-005–006/007/013, AD-38/48, EQ-005/008, BR-ACCT-07, UJ-5

**Scope:**
- `POST /api/v1/admin/students` — requires `@Roles(Role.ADMINISTRATOR, Role.SUPER_ADMIN)`
- `StudentService.adminRegister()`: duplicate check; EP ID generation via `nextval`; create `users` row in PENDING_ACTIVATION state; generate 32-byte cryptographically random raw token; bcrypt hash it (cost 12); store `activation_token_hash`, `activation_token_expires_at: now + 48h`, `activation_token_used_at: null`; return raw token once to caller
- `POST /api/v1/auth/activate` — public route; `@Body(new ZodValidationPipe(activateAccountSchema))`; `AuthService.activate()`: find user by `ep_id`; compare token with stored `activation_token_hash`; check `expires_at > now` and `used_at IS NULL`; atomically update `activation_token_used_at = now`, hash new password, set `account_state = ACTIVE` in a single Prisma `update`; return HTTP 200
- `POST /api/v1/admin/students/:id/recover` — requires admin; same token generation flow; rate-limited 3/24h per studentId (Redis `rl:recovery:{studentId}`); writes `AuditEvent { action: 'ACCOUNT_RECOVERY_INITIATED' }` (AD-48)
- Expired or used token: HTTP 400 `{ code: 'ERR_ACTIVATION_TOKEN_INVALID' }` — no distinction between expired/used/wrong
- Unit tests: token single-use enforcement, expiry check, bcrypt hash, raw token not stored
- Integration test: admin-register → activate → verify ACTIVE state; reuse token → 400

**Acceptance Criteria:**

**Given** an admin calls `POST /api/v1/admin/students`
**When** the response is received
**Then** `activationToken` (raw) is present in the response; the DB row stores only `activation_token_hash` (bcrypt); `account_state` is `PENDING_ACTIVATION`

**Given** a student uses the raw activation token within 48 hours
**When** `POST /api/v1/auth/activate` is called
**Then** HTTP 200; `account_state` transitions to `ACTIVE`; `activation_token_used_at` is set; new password stored as bcrypt hash; raw token not stored or logged

**Given** the same activation token is used a second time
**When** `POST /api/v1/auth/activate` is called
**Then** HTTP 400 `{ code: 'ERR_ACTIVATION_TOKEN_INVALID' }`

---

### Story 2.5: Account State Management (Suspend, Reinstate, Disable, Reactivate)

*(Scope and ACs equivalent to v1. Mongoose/MongoDB terminology replaced.)*

As an administrator or super administrator,
I want to change a student's account state,
So that I can restrict or restore access as needed.

**Source requirements:** FR-REG-008–010/012, AD-52, EQ-005/008, BR-ACCT-02–05

**Scope:**
- `PATCH /api/v1/admin/students/:id/state` — `@Roles(Role.ADMINISTRATOR, Role.SUPER_ADMIN)` for SUSPEND/REINSTATE; `@Roles(Role.SUPER_ADMIN)` for DISABLE/REACTIVATE
- `StudentService.changeAccountState()`: validate transition; `prisma.user.update({ data: { accountState } })`; `prisma.auditEvent.create(...)` — all within a Prisma transaction
- `PATCH /api/v1/admin/students/:id` — grade update; `@Roles(Role.ADMINISTRATOR, Role.SUPER_ADMIN)`
- Integration tests: all valid transitions; attempt invalid transition → 403; suspended user's next data-mutating call → 403

**Acceptance Criteria:**

**Given** an Administrator calls PATCH with `accountState: 'SUSPENDED'` on an ACTIVE student
**When** the request completes
**Then** HTTP 200; `account_state` is `SUSPENDED` in DB; an `audit_events` row is written with actor, timestamp, and new state

**Given** an Administrator calls PATCH with `accountState: 'DISABLED'`
**When** the request completes
**Then** HTTP 403 `{ code: 'ERR_FORBIDDEN' }` — only SuperAdmin may disable accounts

---

### Story 2.6: Duplicate Registration Review Queue

*(Scope and ACs equivalent to v1. MongoDB collection → PostgreSQL table.)*

As an administrator,
I want to see flagged duplicate registration attempts and resolve them,
So that I can confirm distinct students or merge duplicates.

**Source requirements:** FR-REG-002/014, AD-39, UX-DR38

**Scope:**
- `duplicate_reviews` table already defined in Prisma schema (Story 1.8 / Story 2.1)
- `GET /api/v1/admin/duplicate-reviews` — paginated, filtered by `status`; `@Roles(Role.ADMINISTRATOR, Role.SUPER_ADMIN)`
- `POST /api/v1/admin/duplicate-reviews/:id/resolve` — body: `{ action: 'CONFIRM_NEW' | 'MERGE' | 'DEFER', resolutionNotes? }`
  - `CONFIRM_NEW`: creates the pending `users` row in ACTIVE or PENDING_ACTIVATION state; writes `audit_events` row
  - `MERGE`: discards incoming; writes `audit_events` row
  - `DEFER`: sets status to DEFERRED
- Integration tests: all three resolution actions; verify user row created/not created as expected

**Acceptance Criteria:**

**Given** a self-registration that triggered duplicate detection
**When** an admin calls `GET /api/v1/admin/duplicate-reviews?status=PENDING`
**Then** the flagged record appears with `incomingRecord` and `existingCandidates`; no existing student EP ID disclosed to unauthenticated callers

**Given** an admin resolves with `CONFIRM_NEW`
**When** the action completes
**Then** a new `users` row is created; an `audit_events` row is written; the `duplicate_reviews` row has `status: 'CONFIRMED_NEW'`

---

### Story 2.7: Registration, Login, and Account State UI (All Roles)

*(Scope and ACs unchanged from v1 — frontend only. API endpoint contracts preserved.)*

As any user,
I want a bilingual registration form, login page, and activation flow,
So that I can create my account or log in in English or Sinhala from any device.

**Source requirements:** FR-REG-001–006, FR-AUTH-001–005, FR-I18N-001–005, UX-DR21/27/32/33/35/38, EXPERIENCE.md Flow 4

**Scope:** `/` landing; `/register` form (React Hook Form + zodResolver); `/login`; `/activate/:epId`; PENDING_ACTIVATION browse-only state; language switch preserves form values; Light + Dark Mode.

**Acceptance Criteria:**

**Given** a user selects Sinhala before registration
**When** the registration form renders
**Then** all labels and button text are in Sinhala; `html lang` is `"si"`

**Given** a student logs in with a SUSPENDED account
**When** `ERR_ACCOUNT_NOT_ACCESSIBLE` is received
**Then** full-page neutral banner: "Your account is not currently accessible. Please contact your administrator."; "Return to Login" button; no "SUSPENDED" label shown

---

### Story 2.8: User Preferences API and Theme/Language Persistence

*(Scope and ACs equivalent to v1. Mongoose field reference → Prisma column reference.)*

As an authenticated user,
I want my preferred language and theme saved to my account,
So that they are restored when I log in on a different device.

**Source requirements:** AD-49, FR-I18N-005, UX-DR3

**Scope:**
- `PATCH /api/v1/users/me/preferences` — authenticated, any role; `@Body(new ZodValidationPipe(updatePreferencesSchema))`; `prisma.user.update({ where: { id: req.user.id }, data: { preferredLanguage, preferredTheme } })`; returns `{ preferredLanguage, preferredTheme }`
- `GET /api/v1/auth/me` (Story 2.3) already returns `preferredLanguage` and `preferredTheme`
- Frontend `ThemeContext` + `I18nProvider` fire background mutations
- Unit test: partial update only modifies specified fields (Prisma `update` with only provided fields)

**Acceptance Criteria:**

**Given** an authenticated user toggles to Dark Mode
**When** the toggle fires
**Then** `html.dark` class applied immediately; `PATCH /api/v1/users/me/preferences` called in background with `{ preferredTheme: 'dark' }`; DB row updated

**Given** the `PATCH` API call fails
**When** the failure is handled
**Then** local theme remains applied; no error toast shown; failure logged silently

---

## Epic 3: Course Catalogue and Persistent Enrollment

### Story 3.1: Subject, Grade, and Course Schemas and APIs

As an administrator,
I want to create and manage subjects, grades, and courses,
So that the institute can offer configurable courses without code changes.

**Source requirements:** FR-COURSE-001–007, FR-I18N-011, AD-1/17, EQ-004–005

**Scope:**
- Prisma models `Subject`, `Grade`, `Course` (already defined in schema, Story 1.8): `subjects` and `grades` are reference tables managed within `CourseModule` — no standalone module (Decision 2 approval). `Subject` has `name_en`, `name_si`, `is_active`. `Grade` has `level INT UNIQUE`, `is_active`. `Course` has FK to `subject_id`, `grade_id`, `teacher_id`, `category`, `title_en`, `title_si`, `fee NUMERIC(12,2)`, `schedule`, `is_active`.
- Zod schemas in `shared-types`: `createCourseSchema`, `updateCourseSchema`, `createSubjectSchema`, `createGradeSchema`
- `POST /api/v1/admin/subjects` and `PATCH /api/v1/admin/subjects/:id` — Admin/SuperAdmin; manages subject reference table
- `POST /api/v1/admin/grades` and `PATCH /api/v1/admin/grades/:id` — Admin/SuperAdmin; manages grade reference table (levels 6–11 seeded initially; new levels addable without code changes per FR-COURSE-005)
- `POST /api/v1/admin/courses` — create; `@Roles(Role.ADMINISTRATOR, Role.SUPER_ADMIN)`
- `PATCH /api/v1/admin/courses/:id` — update
- `DELETE /api/v1/admin/courses/:id` — soft-deactivate (`is_active = false`); does not delete row
- `GET /api/v1/courses` — public list (active courses only); `getPaginationParams`; filterable by `grade`, `subject`
- `GET /api/v1/courses/:id` — public detail
- Bilingual display: if `title_si` is null, response includes `titleSi: <english value>` and `translationMissing: true`
- All indexes from AD-17 for `courses` table present in Prisma schema
- Integration tests: create → deactivate → verify hidden from public list; deactivated course's existing enrollments preserved

**Acceptance Criteria:**

**Given** an admin creates a course with `titleEn: 'Mathematics'` and `titleSi: 'ගණිතය'`
**When** `GET /api/v1/courses` is called
**Then** the course appears; both title fields present; `fee` is present; `isActive: true`

**Given** a course is soft-deactivated
**When** `GET /api/v1/courses` is called
**Then** the deactivated course is absent from results; DB row still exists with `is_active: false`

**Given** a new subject is created via `POST /api/v1/admin/subjects`
**When** it is subsequently used in a course creation
**Then** the course references the new subject; no code change required

---

### Story 3.2: Course Enrollment and Invoice Stub Generation

As a student or administrator,
I want to enroll in a course,
So that a persistent enrollment record is created and an invoice is generated for the current billing month.

**Source requirements:** FR-ENROL-001–006, FR-INV-001/004–005/008, AD-1/17, EQ-004–005, BR-ENROL-01–04

**Scope:**
- Prisma models `Enrollment`, `Invoice`, `InvoiceLineItem` (defined in schema, Story 1.8)
- Unique constraints: `UNIQUE(student_id, course_id, start_billing_month)` on `enrollments`; `UNIQUE(student_id, billing_month)` on `invoices`; `UNIQUE(invoice_id, course_id)` on `invoice_line_items`
- Zod schemas: `enrollSchema`, `adminEnrollSchema`
- `POST /api/v1/enrollments` — `@Roles(Role.STUDENT)` (ACTIVE state only — PENDING_ACTIVATION blocked by `AuthGuard`)
- `EnrollmentService.enroll()`: check for existing enrollment (`prisma.enrollment.findFirst`); create `Enrollment` row; call `InvoiceService.getOrCreateForMonth()` — `prisma.invoice.upsert({ where: { studentId_billingMonth: ... }, create: {...}, update: {} })` and `prisma.invoiceLineItem.upsert({ where: { invoiceId_courseId: ... }, create: { fee: course.fee }, update: {} })`; fee from `course.fee` at enrollment time (never from request); write `AuditEvent`
- `POST /api/v1/admin/enrollments` — Admin/SuperAdmin on behalf of any student
- Billing month calculated in `Asia/Colombo` timezone
- Unit tests: duplicate enrollment blocked by unique constraint, fee from course not from request body, billing month timezone

**Acceptance Criteria:**

**Given** an ACTIVE student enrolls in Mathematics Grade 9
**When** `POST /api/v1/enrollments` is called
**Then** HTTP 201; an `enrollments` row exists; an `invoices` row exists for the current billing month; one `invoice_line_items` row exists with `fee` equal to the course's configured `fee`; the student-provided amount (if any) is ignored

**Given** the same student enrolls in Mathematics Grade 9 again in the same billing month
**When** `POST /api/v1/enrollments` is called
**Then** HTTP 409 `{ code: 'ERR_DUPLICATE_ENROLLMENT' }`; no duplicate rows created (unique constraint prevents it)

**Given** a PENDING_ACTIVATION student calls `POST /api/v1/enrollments`
**When** the request is made
**Then** HTTP 403 `{ code: 'ERR_ACCOUNT_NOT_ACCESSIBLE' }`

---

### Story 3.3: Course Withdrawal

*(Scope and ACs equivalent to v1. MongoDB references → Prisma.)*

As a student or administrator,
I want to withdraw from a course with an effective month,
So that my enrollment ends cleanly and my payment history is preserved.

**Source requirements:** FR-ENROL-007–011, BR-ENROL-05, BR-INV-11, EQ-005/008

**Scope:**
- `POST /api/v1/enrollments/:id/withdraw` — `@Roles(Role.STUDENT)` (own) or Admin/SuperAdmin
- `EnrollmentService.withdraw()`: validate enrollment is ACTIVE and belongs to requesting student; `prisma.enrollment.update({ data: { status: 'WITHDRAWN', withdrawalEffectiveMonth } })`; write `AuditEvent`
- `GET /api/v1/enrollments` — paginated list of student's own enrollments
- Re-enrollment: if prior WITHDRAWN record exists, creates new Enrollment with new `start_billing_month`; prior record preserved

**Acceptance Criteria:**

**Given** an ACTIVE student withdraws from a course
**When** the withdrawal is processed
**Then** `enrollment.status` is `WITHDRAWN`; `withdrawal_effective_month` is set; prior paid access entitlements are unaffected; prior invoice rows exist unchanged

**Given** the invoice batch runs for the effective month
**When** the batch runs
**Then** no new `invoice_line_items` row is generated for the withdrawn course for the effective month or later

---

### Story 3.4: Course Browse and Enrollment UI (Student and Admin)

*(Scope and ACs unchanged from v1 — frontend only)*

As a student,
I want to browse available courses and enroll with one tap,
So that I can sign up for classes in my preferred language.

**Source requirements:** FR-ENROL-001–002/006, FR-COURSE-001–007, FR-I18N-011/013, UX-DR14/16/30/32/37

**Scope:** `/courses` student browser; enrollment CTA; PENDING_ACTIVATION restriction; admin enrollment UI; teacher roster view.

**Acceptance Criteria:**

**Given** a student in Sinhala mode browses courses
**When** the course list renders
**Then** course titles display `titleI18n.si`; fee displays as "LKR X,XXX"; no raw translation keys visible

**Given** a PENDING_ACTIVATION student tries to tap "Enroll"
**When** they attempt to tap the CTA
**Then** the CTA is replaced by an info banner; no enrollment API call is made

---

## Epic 4: Invoicing, Payment Verification, and Access Entitlement (+ Pilot Zoom Slice)

### Story 4.1: Invoice Generation Service and Batch Job

As the system,
I want an idempotent invoice generation service triggered on enrollment, by scheduled batch, and by admin manual trigger,
So that every enrolled student has exactly one invoice per billing month with correct line items.

**Source requirements:** FR-INV-001–008, AD-16/33, BR-INV-01–11, EQ-008/012

**Scope:**
- `InvoiceService.getOrCreateForMonth(studentId: string, billingMonth: string)`: `prisma.invoice.upsert({ where: { studentId_billingMonth: { studentId, billingMonth } }, create: { ..., paymentDeadline }, update: {} })`; for each ACTIVE enrollment, `prisma.invoiceLineItem.upsert({ where: { invoiceId_courseId: ... }, create: { fee: course.fee }, update: {} })`; fee from `course.fee` at call time; idempotent
- `InvoiceJobService.run({ billingMonth? })`: `@Injectable()` NestJS provider, plain `async function`, **NOT decorated with `@nestjs/schedule`**. Acquires PostgreSQL advisory lock: `prisma.$queryRaw\`SELECT pg_try_advisory_lock(hashtext('invoice-batch'))\``. If lock not acquired → exit with `{ status: 'LOCK_HELD' }`. Processes active enrollments in pages of ≤200 using cursor pagination on `lastProcessedId`. Commits each page independently. Releases lock via `pg_advisory_unlock` in `finally` block. Logs to `job_logs` table. Billing month in `Asia/Colombo`.
- `InvoiceCatchupJobService.run()`: checks if today in Asia/Colombo ≥ billing generation day and ≤ end of month; if so calls `InvoiceJobService.run()`; exits with `{ status: 'NO_WORK' }` otherwise; idempotent no-op if invoices already exist
- **Vercel Cron monthly endpoint:** `GET /api/v1/internal/jobs/invoice-batch` — `CRON_SECRET` bearer; `Cache-Control: no-store`; NOT in Swagger (`@ApiExcludeController()` on `JobsController`); NOT in RBAC matrix; schedule `30 18 24 * *` UTC
- **Vercel Cron daily catch-up:** `GET /api/v1/internal/jobs/invoice-batch-catchup` — `CRON_SECRET` bearer; schedule `5 19 * * *` UTC
- **Manual recovery:** `POST /api/v1/internal/jobs/invoice-batch` — `INTERNAL_JOB_SECRET` bearer; body `{ billingMonth?: "YYYY-MM" }`; writes `AuditEvent { action: 'MANUAL_JOB_TRIGGERED' }`
- `POST /api/v1/admin/invoices/generate` — Admin/SuperAdmin manual trigger for specific student + billing month
- `Invoice.payment_deadline` = 10th of billing month (configurable via `system_settings`)
- Notification dedup: check for existing `INVOICE_GENERATED` notification for `invoice_id` before writing
- Unit tests: idempotency (`upsert` no-op on second call), concurrent advisory lock (second run → LOCK_HELD), fee stored at generation time, `Asia/Colombo` billing month boundary, catch-up no-op, catch-up creates invoices when missed
- Integration test: enroll → GET monthly endpoint → verify invoice + line items; GET again → no duplicates

**Acceptance Criteria:**

**Given** a student is enrolled in 3 courses for November
**When** `GET /api/v1/internal/jobs/invoice-batch` is called with valid `CRON_SECRET`
**Then** one `invoices` row for `2026-11` exists; three `invoice_line_items` rows exist; calling again produces no new rows (idempotent upsert)

**Given** two concurrent GET requests to the invoice batch endpoint
**When** both requests arrive simultaneously
**Then** only one acquires the advisory lock and runs; the other returns HTTP 200 `{ status: 'LOCK_HELD' }`; one `job_logs` row is created; no duplicate invoices

**Given** the monthly GET was missed entirely
**When** the daily catch-up GET fires on the 26th
**Then** invoices are generated for all enrolled students; `job_logs` records a catch-up run with `jobName: 'invoice-batch-catchup'`

**Given** a course fee is updated after invoice generation
**When** the invoice line item fee is inspected
**Then** it reflects the fee at generation time — not the updated course fee

---

### Story 4.2: Overdue Invoice Marking Job

As the system,
I want overdue invoices to be automatically marked and students notified,
So that the finance team has an accurate view of outstanding obligations.

**Source requirements:** FR-INV-007, FR-NOTIF-004, AD-42/51, BR-INV-10

**Scope:**
- `OverdueJobService.run()`: `@Injectable()` NestJS provider, plain `async function`, **NOT decorated with `@nestjs/schedule`**. Acquires PostgreSQL advisory lock `pg_try_advisory_lock(hashtext('mark-overdue'))`. Queries `prisma.invoice.findMany({ where: { status: { in: ['UNPAID','PARTIAL'] }, paymentDeadline: { lt: nowColombo } } })`. Per invoice: `prisma.invoice.update({ data: { status: 'OVERDUE' } })`, `prisma.auditEvent.create(...)`, `NotificationService.write(...)` with notification body rendered in `user.preferred_language` at write time (AD-51); checks for existing `PAYMENT_OVERDUE` notification for invoice before writing. Processes in pages of ≤200. Logs to `job_logs`.
- **Vercel Cron endpoint:** `GET /api/v1/internal/jobs/mark-overdue` — `CRON_SECRET` bearer; `Cache-Control: no-store`; NOT in Swagger; NOT in RBAC. Schedule: `0 19 * * *` UTC
- **Manual recovery:** `POST /api/v1/internal/jobs/mark-overdue` — `INTERNAL_JOB_SECRET` bearer
- Unit tests: idempotency (re-run does not duplicate notifications), Asia/Colombo deadline boundary, notification in correct language, concurrent GET returns `LOCK_HELD`
- Integration test: create UNPAID invoice with past deadline → GET → verify OVERDUE status, audit_events row, notification row in correct language

**Acceptance Criteria:**

**Given** an invoice has `payment_deadline` in the past and `status: 'UNPAID'`
**When** `GET /api/v1/internal/jobs/mark-overdue` is called with valid `CRON_SECRET`
**Then** `status` updated to `OVERDUE`; one `audit_events` row written; one `notifications` row written with `body` in student's `preferred_language`

**Given** the GET endpoint is called twice concurrently
**When** both invocations complete
**Then** only one proceeds; the second returns HTTP 200 `{ status: 'LOCK_HELD' }`; no duplicate OVERDUE transitions or notifications

**Given** a student's `preferred_language` is `'si'`
**When** the overdue notification is written
**Then** `notifications.body` is a Sinhala string; `type` is `'PAYMENT_OVERDUE'`; `params` contains `billingMonth`

---

### Story 4.3: R2 Presigned Upload Flow

*(Scope and ACs equivalent to v1. No MongoDB references present.)*

As a student or administrator,
I want to upload a bank payment slip securely,
So that the file is stored privately in Cloudflare R2 without ever transiting the Vercel function body.

**Source requirements:** FR-PAY-001–002, AD-12/35, NFR-DEPLOY-008

**Scope:**
- `POST /api/v1/storage/presign` — authenticated; `ZodValidationPipe`; returns `{ uploadUrl, fileKey }`
- `POST /api/v1/storage/complete` — authenticated; HEAD request to R2; if `Content-Length > 5_242_880` → delete object + `ERR_FILE_TOO_LARGE`; otherwise records `fileKey` as confirmed (in `upload_confirmations` table or in-memory validated set per request lifecycle); returns `{ fileKey }`
- R2 bucket private; no raw R2 URLs in any API response

**Acceptance Criteria:**

**Given** an authenticated student calls `POST /api/v1/storage/presign`
**When** the response is received
**Then** `uploadUrl` is a signed R2 PUT URL (15-min expiry); `fileKey` returned; no permanent R2 URL present

**Given** a file larger than 5 MB passes the client-side check but the `/complete` HEAD reveals `Content-Length > 5_242_880`
**When** `POST /api/v1/storage/complete` is called
**Then** HTTP 422 `{ code: 'ERR_FILE_TOO_LARGE' }`; the object is deleted from R2

---

### Story 4.4: Payment Submission Creation

As a student or administrator,
I want to submit a payment slip with explicit allocation to invoice line items,
So that the finance team knows exactly which courses the payment covers.

**Source requirements:** FR-PAY-001–003/007–010/017, AD-43/44, UX-DR26/35

**Scope:**
- Prisma models `PaymentSubmission`, `EvidenceItem`, `PaymentAllocation` (defined in schema, Story 1.8)
- Zod schema: `createPaymentSubmissionSchema` — requires `slipFileKey`, `allocations: [{ lineItemId, studentStatedAmount }]`, `studentStatedTotal`; amounts > 0; fee amounts NOT accepted from client
- `POST /api/v1/payments` — `@Roles(Role.STUDENT)` (ACTIVE only)
- `PaymentService.submitPayment()`: validate line items belong to requesting student's invoices; `prisma.paymentSubmission.create(...)` in SUBMITTED state; `prisma.paymentAllocation.createMany(...)` in PENDING state; duplicate detection (AD-43): query existing SUBMITTED/UNDER_REVIEW submissions for same student + billingMonth within 5%; if found set `is_duplicate_flag = true`, populate `duplicate_candidate_ids`
- `POST /api/v1/admin/payments` — Admin/Finance Admin entry of WhatsApp-origin slip
- `POST /api/v1/payments/:id/evidence` — append `EvidenceItem` row; original slip preserved

**Acceptance Criteria:**

**Given** a student submits a payment covering 3 line items
**When** `POST /api/v1/payments` is called
**Then** HTTP 201; `payment_submissions` row is SUBMITTED; three `payment_allocations` rows exist in PENDING state

**Given** a student submits a second payment for the same billing month within 5% of the same total
**When** the submission is created
**Then** `is_duplicate_flag: true`; `duplicate_candidate_ids` contains the prior submission's UUID; submission is still created (not hard-blocked)

**Given** a student submits allocations targeting a line item from another student's invoice
**When** the request is validated
**Then** HTTP 403 `{ code: 'ERR_FORBIDDEN' }`

---

### Story 4.5: Finance Admin Claim and Verification Queue

*(Scope and ACs equivalent to v1. MongoDB collection → PostgreSQL table. `findOneAndUpdate` → Prisma `updateMany` with `where: { status: 'SUBMITTED' }`.)*

As a finance administrator,
I want to claim payment submissions and see a queue with flag indicators,
So that I can process payments in an organized way without collisions.

**Source requirements:** FR-PAY-004/012–013, FR-REPORT-002, AD-43–45/47/50

**Scope:**
- `GET /api/v1/finance/submissions` — paginated; filterable; `@Roles(Role.FINANCE_ADMIN, Role.SUPER_ADMIN)`
- `POST /api/v1/finance/submissions/:id/claim` — atomic claim: `prisma.paymentSubmission.updateMany({ where: { id, status: 'SUBMITTED' }, data: { claimedById, claimedAt, status: 'UNDER_REVIEW' } })`; if updated count = 0 → HTTP 409 `ERR_SUBMISSION_ALREADY_CLAIMED` (race condition handled)
- `DELETE /api/v1/finance/submissions/:id/claim` — release claim
- `GET /api/v1/finance/submissions/:id` — detail with presigned GET URLs for evidence items
- Finance queue with `refetchInterval: 15_000`

**Acceptance Criteria:**

**Given** two Finance Admins claim the same SUBMITTED submission simultaneously
**When** both requests complete
**Then** exactly one claim succeeds; the other receives HTTP 409 `ERR_SUBMISSION_ALREADY_CLAIMED`; the submission has only one `claimed_by_id` value

---

### Story 4.6: Payment Approval, Clarification, and Rejection

As a finance administrator,
I want to approve, request clarification on, or reject a claimed payment submission,
So that the correct access entitlements are activated and the audit trail is complete.

**Source requirements:** FR-PAY-005–009/011/014–015, AD-11/15/44, EQ-008, BR-PAY-03–08, UJ-2/3

**Scope:**
- `POST /api/v1/finance/submissions/:id/approve` — `@Roles(Role.FINANCE_ADMIN)` (must be claimant); body: `{ verifiedAmount, allocations: [{ lineItemId, allocatedAmount }], excessDispositionNote? }`
- `PaymentService.approve()` runs inside a **Prisma interactive transaction** (`prisma.$transaction(async (tx) => { ... })`):
  1. Re-validate submission is UNDER_REVIEW and claimant matches
  2. Compute `unallocatedExcess = verifiedAmount − Σ(allocatedAmount)`; if `> 0` and no `excessDispositionNote` → throw `ERR_EXCESS_DISPOSITION_REQUIRED`
  3. For each allocation: compute **cumulative approved coverage** for the line item: query `SELECT SUM(allocated_amount) FROM payment_allocations WHERE line_item_id = ? AND status = 'APPROVED'`; if cumulative + current allocation ≥ `line_item.fee` → create `access_entitlements` row (UNIQUE constraint prevents duplicate); update `invoice_line_items.payment_status = 'PAID'`. If cumulative + current < fee → `payment_status = 'PARTIAL'`; no entitlement.
  4. `tx.paymentSubmission.update({ status: 'APPROVED', verifiedAmount, unallocatedExcess, excessDispositionNote })`
  5. Append to `audit_trail JSONB` column (immutable append)
  6. `NotificationService.write(...)` for student in their `preferred_language` (AD-51)
  7. Transaction commits atomically
- `POST /api/v1/finance/submissions/:id/clarify` — sets `status: 'REQUIRES_CLARIFICATION'`; appends to `audit_trail`; writes student Notification
- `POST /api/v1/finance/submissions/:id/reject` — sets `status: 'REJECTED'`; original submission preserved; appends to `audit_trail`; writes student Notification
- Unit tests: Prisma transaction atomicity (all-or-nothing on mock `tx`), duplicate entitlement blocked by unique constraint, partial payment → no entitlement, excess → disposition note required
- Integration test: approve → verify `access_entitlements` row created, `notifications` row written, transaction commits atomically

**Acceptance Criteria:**

**Given** a Finance Admin approves a 3-course submission with `verifiedAmount` covering all line items
**When** the Prisma transaction commits
**Then** three `access_entitlements` rows exist; `payment_submissions.status` is `APPROVED`; one `notifications` row in student's preferred language; all changes are atomic (no partial state); each `invoice_line_items.payment_status` is `PAID`

**Given** a line item with fee LKR 1,500 has a prior APPROVED allocation of LKR 1,000
**When** the Finance Admin approves a second submission allocating LKR 500 to the same line item
**Then** cumulative total is LKR 1,500 ≥ fee; one `access_entitlements` row created; `payment_status` transitions to `PAID`; unique constraint prevents duplicate if the entitlement already somehow exists (Prisma throws P2002 → caught → idempotent)

**Given** `verifiedAmount > Σ(allocatedAmounts)` and `excessDispositionNote` is absent
**When** `POST .../approve` is called
**Then** HTTP 422 `{ code: 'ERR_EXCESS_DISPOSITION_REQUIRED' }`; no entitlements created; submission status unchanged; Prisma transaction rolled back

---

### Story 4.7: Access Entitlement Enforcement and Student Invoice/Payment UI

*(Scope and ACs equivalent to v1. MongoDB/Mongoose references → Prisma.)*

As a student,
I want to see my invoice, submit my payment, and track verification status in real time,
So that I know my payment is being processed and I can act if clarification is needed.

**Source requirements:** FR-ACCESS-001–003/006–007, FR-PAY-001/003/007, FR-REPORT-005, AD-50, UX-DR26/35/36

**Scope:**
- `GET /api/v1/students/me/invoices` — paginated list
- `GET /api/v1/students/me/invoices/:id` — detail
- `EntitlementService.hasAccess(studentId, courseId, billingPeriod)`: `prisma.accessEntitlement.findFirst({ where: { studentId, courseId, billingPeriod } })`; returns boolean
- Frontend `/student/payments`, `/student/payments/:invoiceId`; polling per AD-50

**Acceptance Criteria:**

**Given** payment is approved and `access_entitlements` row exists
**When** the student's invoice list is fetched
**Then** the line item `paymentStatus` is `PAID`; invoice status is `PAID`

**Given** a student with NO entitlement calls `GET /api/v1/resources?courseId=...&billingPeriod=2026-11`
**When** the request is processed
**Then** HTTP 403 `{ code: 'ERR_ACCESS_DENIED' }` — backend enforces independently of frontend visibility

---

### Story 4.8: Unmatched Payment Handling

*(Scope and ACs equivalent to v1. MongoDB → PostgreSQL.)*

As a finance administrator,
I want to record a payment I cannot match to any student invoice.

**Source requirements:** FR-PAY-016, AD-40

**Scope:**
- `POST /api/v1/finance/submissions/unmatched` — Finance Admin; `prisma.paymentSubmission.create({ data: { status: 'UNMATCHED', unmatchedNotes, ... } })`
- `PATCH /api/v1/finance/submissions/:id/resolve-unmatched`

**Acceptance Criteria:**

**Given** a Finance Admin creates an UNMATCHED submission
**When** the record is created
**Then** `payment_submissions.status` is `UNMATCHED`; `allocations` is empty; `unmatched_notes` is stored

---

### Story 4.9: Admin Invoice Management UI

*(Scope and ACs unchanged from v1 — frontend only)*

**Source requirements:** FR-INV-003, FR-REPORT-003 (partial)

---

### Story 4.10: Zoom Meeting Entry (Pilot Zoom Slice)

*(Scope and ACs equivalent to v1. Mongoose → Prisma.)*

As a teacher or administrator,
I want to enter Zoom meeting details for a course and billing period.

**Source requirements:** FR-LEARN-001, FR-ACCESS-002–003, AD-1, EQ-004–005

**Scope:**
- `resources` Prisma model (defined in schema, Story 1.8): `ZOOM_SESSION` type with `meeting_id`, `password`, `link`, `schedule`
- Zod schema: `createZoomResourceSchema`
- `POST /api/v1/resources/zoom` — `@Roles(Role.TEACHER, Role.ADMINISTRATOR, Role.SUPER_ADMIN)`; Teacher: own courses only (service validates `course.teacher_id === req.user.id`)
- `PATCH /api/v1/resources/zoom/:id` — same role restriction

**Acceptance Criteria:**

**Given** a teacher enters Zoom details for Mathematics Grade 9, November 2026
**When** `POST /api/v1/resources/zoom` is called
**Then** HTTP 201; a `resources` row of type `ZOOM_SESSION` exists for the course + billingPeriod

**Given** a teacher tries to enter Zoom details for a course not assigned to them
**When** the request is made
**Then** HTTP 403 `{ code: 'ERR_FORBIDDEN' }`

---

### Story 4.11: Entitlement-Gated Zoom Link Retrieval (Pilot Zoom Slice)

*(Scope and ACs equivalent to v1. MongoDB → Prisma. EntitlementService uses Prisma.)*

As a student with a paid access entitlement,
I want to retrieve my Zoom class link through the portal.

**Source requirements:** FR-ACCESS-001–003/006–007, FR-LEARN-001, AD-1/12, UJ-1

**Scope:**
- `GET /api/v1/resources/zoom?courseId=&billingPeriod=` — authenticated Student; `EntitlementService.hasAccess()` via Prisma; returns `{ meetingId, password, link, schedule }` or 403
- Today's Class Banner on student dashboard

**Acceptance Criteria:**

**Given** a student holds an `access_entitlements` row for Mathematics Grade 9, November 2026
**When** `GET /api/v1/resources/zoom?courseId=...&billingPeriod=2026-11` is called
**Then** HTTP 200 with Zoom credentials; student dashboard shows the banner

**Given** a student has NO entitlement
**When** the same API is called
**Then** HTTP 403 `{ code: 'ERR_ACCESS_DENIED' }`

> **Pilot milestone complete.** Epics 1–4 deliver the full end-to-end business outcome.

---

## Epic 5: Full Learning Resource Management

### Story 5.1: Study Material Upload and Delivery

*(Scope and ACs equivalent to v1. MongoDB Resource → Prisma Resource model. `fileKey` stored in `resources.file_key`.)*

As a teacher or administrator,
I want to upload study materials for a course and billing period.

**Source requirements:** FR-LEARN-002, FR-ACCESS-001/003–004/006, AD-12/35

**Scope:**
- `resources` model extended: `STUDY_MATERIAL` type with `file_key`, `filename`
- `POST /api/v1/resources/materials` — Teacher/Admin; presigned upload flow; `prisma.resource.create(...)`
- `GET /api/v1/resources/materials?courseId=&billingPeriod=` — entitlement checked via `EntitlementService`; returns metadata
- `GET /api/v1/resources/materials/:id/download` — generates presigned GET URL after entitlement check

**Acceptance Criteria:** *(unchanged from v1)*

---

### Story 5.2: Recording URL Management

*(Scope and ACs equivalent to v1. MongoDB Resource → Prisma Resource model.)*

**Source requirements:** FR-LEARN-003–006, FR-ACCESS-004, UX-DR34

**Scope:**
- `resources` model: `RECORDING` type with `url`, `is_published`, `last_confirmed_available_at`
- `POST /api/v1/resources/recordings`, `PATCH /api/v1/resources/recordings/:id`
- `GET /api/v1/resources/recordings/:id/access` — entitlement checked

**Acceptance Criteria:** *(unchanged from v1)*

---

### Story 5.3: Full Student Learning Dashboard

*(Scope and ACs unchanged from v1 — frontend only)*

**Source requirements:** FR-ACCESS-001–004, FR-LEARN-001–006, FR-REPORT-005, UX-DR20/34/37

---

### Story 5.4: Full Teacher Dashboard

*(Scope and ACs unchanged from v1 — frontend only)*

**Source requirements:** FR-REPORT-004 (full), FR-LEARN-001–004

---

## Epic 6: Notifications, WhatsApp Templates, and Bilingual Delivery

### Story 6.1: Notification Model, Write-Time Render, and Backend i18n

As the system,
I want all notifications stored with a rendered body in the recipient's language and stable type/params fields,
So that in-app display works immediately and future delivery channels can re-render from type+params.

**Source requirements:** FR-NOTIF-001/003, AD-15/51, NFR-EXT-003

**Scope:**
- `notifications` Prisma table (defined in schema, Story 1.8): `{ id UUID PK, recipient_id UUID FK, type VARCHAR, params JSONB, body TEXT, read BOOLEAN DEFAULT false, created_at TIMESTAMPTZ }`
- Index: `INDEX(recipient_id, read, created_at DESC)` on `notifications` (AD-17)
- `packages/shared-types/locales/{en,si}/notification.json` — **all 13 notification type strings fully populated** (stubs created in Story 1.8; completed here with production strings + `{{param}}` interpolation)
- `NotificationService.write()` (stub in Story 1.8): complete implementation using the full Prisma `notifications` model
- Unit tests: `renderNotification` for all 13 types in both `en` and `si`; no raw key strings; no unreplaced `{{param}}` placeholders

**Acceptance Criteria:**

**Given** a student with `preferred_language: 'si'` has their payment approved
**When** `NotificationService.write()` is called
**Then** a `notifications` row is inserted with `body` as a Sinhala string; `type` is `'PAYMENT_APPROVED'`; `params` contains `{ courseNames, billingMonth }`

**Given** `renderNotification('PAYMENT_APPROVED', params, 'si')` is called
**When** the function returns
**Then** the string contains the Sinhala course name and billing month; no `{{param}}` placeholders remain

---

### Story 6.2: In-App Notification Panel and Read State

*(Scope and ACs equivalent to v1. MongoDB collection → PostgreSQL table via Prisma.)*

As any authenticated user,
I want a notification panel accessible from the topbar bell icon.

**Source requirements:** FR-NOTIF-001, FR-I18N-009, UX-DR8/18/24

**Scope:**
- `GET /api/v1/notifications` — authenticated; paginated; `?read=false` filter; `orderBy: { createdAt: 'desc' }`
- `PATCH /api/v1/notifications/:id/read` — `prisma.notification.update({ data: { read: true } })`
- `PATCH /api/v1/notifications/read-all` — `prisma.notification.updateMany({ where: { recipientId, read: false }, data: { read: true } })`
- Topbar bell badge with `refetchInterval: 30_000`

**Acceptance Criteria:** *(unchanged from v1)*

---

### Story 6.3: Remaining Notification Triggers

*(Scope and ACs unchanged from v1. All notification writes use `NotificationService.write()` which writes to `notifications` table via Prisma.)*

**Source requirements:** FR-NOTIF-001–004, AD-15/51

---

### Story 6.4: WhatsApp Message Templates

*(Scope and ACs unchanged from v1 — frontend primarily, templates stored in `system_settings` or `shared-types/locales`.)*

**Source requirements:** FR-NOTIF-002, FR-I18N-010, UX-DR29

---

## Epic 7: Administrator Dashboards, Reporting, and System Configuration

### Story 7.1: Finance Administrator Full Dashboard

*(Scope and ACs equivalent to v1. MongoDB aggregation pipelines → SQL via Prisma `$queryRaw` or `groupBy`.)*

**Source requirements:** FR-REPORT-002, AD-45/47

**Scope:**
- `/finance` dashboard; `/finance/queue`; `/finance/audit` — `prisma.auditEvent.findMany({ where: ..., orderBy: { createdAt: 'desc' } })`; `/finance/reports` — `prisma.$queryRaw` for revenue totals by billing period

**Acceptance Criteria:** *(unchanged from v1)*

---

### Story 7.2: Administrator Dashboard and Student Management

*(Scope and ACs unchanged from v1 — frontend primarily with existing backend routes.)*

**Source requirements:** FR-REG-009–010/012, FR-REPORT-003, UX-DR16/17/38

---

### Story 7.3: Owner/Super Administrator Dashboard and System Configuration

*(Scope and ACs equivalent to v1. `SystemSetting` collection → `system_settings` table via Prisma.)*

**Source requirements:** FR-REPORT-001, FR-ACCESS-005, FR-I18N-006, BR-ACCESS-06, AD-45

**Scope:**
- `/owner` dashboard: `prisma.$queryRaw` for revenue aggregates; `prisma.enrollment.groupBy` for enrollment breakdown
- `/owner/config` — billing config, access policy, default language → `prisma.systemSetting.upsert({ where: { key }, create/update: { value } })`
- `GET /api/v1/admin/system-settings` and `PATCH /api/v1/admin/system-settings` — `@Roles(Role.SUPER_ADMIN)` only

**Acceptance Criteria:** *(unchanged from v1)*

---

## Epic 8: Existing Student Migration

### Story 8.1: Individual Student Manual Migration

*(Unchanged from v1. Admin-assisted registration path (Story 2.4) is the migration entry point. AuditEvent written with `source: 'MANUAL'`.)*

**Source requirements:** FR-MIG-001, FR-REG-005–006, AD-39

**Acceptance Criteria:** *(unchanged from v1)*

---

### Story 8.2: Bulk CSV Import — Validation and Row Processing

As an administrator,
I want to upload a CSV of existing students and have the system validate, deduplicate, and import each row independently.

**Source requirements:** FR-MIG-002–009/011, AD-39/41, EQ-008

**Scope:**
- Prisma models `MigrationBatch`, `MigrationRow` (defined in schema, Story 1.8)
- CSV minimum required fields: `fullName` (required), `grade` (required, 6–11); optional: `dateOfBirth`, `guardianContactName`, `guardianPhone`, `guardianWhatsApp`
- `POST /api/v1/admin/migration/batches` — Admin/SuperAdmin; accepts CSV; `prisma.migrationBatch.create({ data: { status: 'PENDING', ... } })`; creates `MigrationRow` rows; processes each row in order
- Row processing: validate required fields → `StudentService.adminRegister()` (runs duplicate check and EP ID generation) → on duplicate: `prisma.duplicateReview.create(...)` + `prisma.migrationRow.update({ status: 'FLAGGED' })` → on success: `prisma.migrationRow.update({ status: 'PROCESSED', epId })` + write `AuditEvent` with `source: 'BULK_IMPORT'` → on error: `prisma.migrationRow.update({ status: 'FAILED', errorMessage })`; row failure does NOT stop other rows
- Name-only rows: flagged with "Insufficient identity data for duplicate detection"
- `GET /api/v1/admin/migration/batches/:id` — status poll

**Acceptance Criteria:**

**Given** a CSV with 5 rows: 2 valid new, 1 likely duplicate, 1 name-only, 1 missing `fullName`
**When** the batch is processed
**Then** 2 rows have `status: 'PROCESSED'` with EP IDs; 1 row `FLAGGED` with a `duplicate_reviews` row; 1 row `FLAGGED` with "Insufficient identity data"; 1 row `FAILED`; batch reaches `COMPLETED_WITH_ERRORS`; all other rows unaffected

---

### Story 8.3: Migration Batch Review UI and Flagged Row Adjudication

*(Scope and ACs equivalent to v1. MongoDB collection rows → Prisma-queried PostgreSQL rows.)*

**Source requirements:** FR-MIG-008/010/011, AD-39/41, UX-DR38

**Scope:**
- `/admin/migration` — batch history; `/admin/migration/:batchId` — row detail; FLAGGED rows show duplicate review with Confirm-as-New / Merge / Defer (same as Story 2.6); FAILED rows show error + "Retry Row"
- UNVERIFIED payment import: `prisma.paymentSubmission.create({ data: { status: 'UNVERIFIED', source: 'IMPORT' } })`; no entitlement activated

**Acceptance Criteria:** *(unchanged from v1)*

---

## Epic 9: Bilingual Completion, Accessibility Audit, and Production Release Gates

### Story 9.1: Full Bilingual String Coverage Verification

*(Scope and ACs unchanged from v1.)*

**Source requirements:** FR-I18N-001/007–008, NFR-I18N-001–010

---

### Story 9.2: WCAG 2.1 AA Accessibility Audit

*(Scope and ACs unchanged from v1.)*

**Source requirements:** NFR-ACCESS-001–003, EXPERIENCE.md Accessibility Floor

---

### Story 9.3: End-to-End Test Suite for All Five User Journeys

*(Scope and ACs unchanged from v1. Integration tests use real PostgreSQL.)*

**Source requirements:** NFR-TEST-002–003, NFR-I18N-009, AD-22

---

### Story 9.4: Concurrent Login Load Test

*(Scope and ACs equivalent to v1. MongoDB connection pool reference → Neon connection pooler. Load test validates Neon pooler does not exhaust under 100 concurrent logins.)*

**Source requirements:** NFR-PERF-003–004, NFR-AVAIL-001

**Updated scope note:** Verify Neon connection pooler connection count stays below configured `connection_limit` during load test. Verify Upstash Redis handles concurrent rate-limit key increments.

---

### Story 9.5: Production Infrastructure and Deployment Verification

As the operations team,
I want all production infrastructure verified and deployment procedures documented,
So that the system is ready for production launch.

**Source requirements:** NFR-DEPLOY-001–009, NFR-AVAIL-001–002, AD-27/37

**Scope:**
- Vercel Pro projects configured: `nodejs24.x`; `DATABASE_URL` (Neon pooler) and `DIRECT_DATABASE_URL` (Neon direct) set; all env vars set; `pnpm install --frozen-lockfile && pnpm build` build command
- Prisma migrations: `npx prisma migrate deploy` runs with `DIRECT_DATABASE_URL` in deploy step; verify all migrations applied; never run migrations through pooler connection
- Railway/Render portability: `src/main.ts` starts cleanly with same env vars; no Vercel SDK in domain modules; health endpoint responds
- Three environments confirmed: `dev` (Hobby), `staging` (Pro), `production` (Pro)
- Neon PostgreSQL: automated backups enabled; PITR enabled; connection string uses Neon pooler
- Upstash Redis: rate-limit store operational in staging and production
- Cloudflare R2: private bucket; CORS policy
- All secrets in Vercel/Railway env vars — not in source control
- Rollback: "Revert Vercel deployment" + "Neon point-in-time restore" documented in `docs/runbooks/rollback.md`
- HTTPS on all production routes; Helmet security headers confirmed
- Structured Pino logging confirmed in Vercel function logs and Railway logs

**Acceptance Criteria:**

**Given** the production Vercel deployment is live
**When** `GET https://[production-domain]/api/v1/health` is called
**Then** HTTP 200 `{ status: 'ok', db: 'connected', version }`; HTTPS; Helmet headers present

**Given** `npx prisma migrate status` is run against `DIRECT_DATABASE_URL`
**When** the command completes
**Then** "Database schema is up to date!" — no pending migrations

**Given** the Railway/Render entrypoint is started with the same env vars
**When** the server starts
**Then** it connects to Neon PostgreSQL and serves `/api/v1/health` correctly; no errors

---

### Story 9.6: Legal and Compliance Release Gate

*(Scope and ACs unchanged from v1. This is a hard production gate requiring Sri Lankan legal advisor sign-off.)*

**Source requirements:** SEC-012–016, OD-LEGAL-01–04, PRD §10

⚠️ **Hard production gate. No override mechanism. Platform must not go live until all five LEGAL-01 through LEGAL-05 items are signed off and documented in `docs/compliance/legal-clearance.md`.**

---

## Summary

| Epic | Stories | Milestone |
|---|---|---|
| 1: Monorepo Foundation | 1.1–1.8 (8 stories) | Pilot prerequisite |
| 2: Student Identity | 2.1–2.8 (8 stories) | Pilot prerequisite |
| 3: Course Catalogue and Enrollment | 3.1–3.4 (4 stories) | Pilot prerequisite |
| 4: Invoicing, Payment, Entitlement + Pilot Zoom Slice | 4.1–4.11 (11 stories) | **Controlled Pilot complete** |
| 5: Full Learning Resource Management | 5.1–5.4 (4 stories) | Full MVP |
| 6: Notifications and WhatsApp Templates | 6.1–6.4 (4 stories) | Full MVP |
| 7: Admin Dashboards and System Configuration | 7.1–7.3 (3 stories) | Full MVP |
| 8: Existing Student Migration | 8.1–8.3 (3 stories) | Full MVP |
| 9: Bilingual Completion, Accessibility, Release Gates | 9.1–9.6 (6 stories) | **Full MVP + Production Release** |
| **Total** | **51 stories** | |

---

## Validation Record (v2 — 2026-10-24)

### Architecture Migration Cross-Check

| Check | Result |
|---|---|
| All MongoDB/Mongoose references replaced with Prisma/PostgreSQL equivalents | ✅ PASS |
| All Express middleware patterns replaced with NestJS guard/pipe/filter equivalents | ✅ PASS |
| `@nestjs/schedule` NOT referenced in any job story | ✅ PASS |
| Advisory lock (PostgreSQL) replaces MongoDB `jobLocks` collection | ✅ PASS |
| Money columns specified as `NUMERIC(12,2)` / Prisma `@db.Decimal(12,2)` | ✅ PASS |
| UUID v4 IDs throughout (no ObjectId references) | ✅ PASS |
| Unique constraints (PostgreSQL) replace MongoDB unique indexes | ✅ PASS |
| Prisma interactive transaction replaces MongoDB multi-document transaction | ✅ PASS |
| `DATABASE_URL` (pooler) + `DIRECT_DATABASE_URL` (direct) documented | ✅ PASS |
| Subject/Grade merged into CourseModule — no standalone SubjectModule or GradeModule | ✅ PASS |
| TeacherModule merged into AdminModule — Teacher role/dashboards/workflows preserved | ✅ PASS |
| `@nestjs/swagger` decorator-driven OpenAPI — no hand-authored spec file referenced | ✅ PASS |
| All 51 stories preserved, no stories removed or added | ✅ PASS |
| All acceptance criteria preserved (terminology updated, observable behavior unchanged) | ✅ PASS |
| All FR/NFR/SEC requirements remain traceable to stories | ✅ PASS |
| Financial invariants (AD-11 transaction, AD-43 duplicate flag, unique entitlement) preserved | ✅ PASS |
| Security controls (AD-14 rate limit, AD-38 activation token, AD-52 account state) preserved | ✅ PASS |
| Legal gates (Story 9.6) preserved as hard production gate with no override | ✅ PASS |

### Previously Applied Corrections (from v1) — Status

| Correction | Status |
|---|---|
| Invoice batch lock TTL corrected to 10 min → replaced by advisory lock (auto-released) | ✅ Applied |
| `/complete` size enforcement via HEAD (not `content-length-range`) | ✅ Applied |
| `generationDay < paymentDeadlineDay` validation removed (operates in different calendar months) | ✅ Applied |
| IP rate limit 30/15 min (CGNAT) | ✅ Applied |
| Cumulative partial-payment entitlement check specified | ✅ Applied |
| Server-side i18next init in Story 1.8 | ✅ Applied |
| Error code `ERR_AUTH_RATE_LIMITED` standardized | ✅ Applied |
| Legal gate hardened to absolute hard block | ✅ Applied |

**epics.md v2 status: `final`.**
