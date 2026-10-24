# e-Paperé SMS — Agent Instructions

<!-- bmad:context -->
<!-- Verified 2026-10-17 against initial commit (no SHA yet — greenfield, no commits exist; update on first refresh after initial commit). Amended 2026-10-23: v6 pre-implementation reconciliation (AD-14/34 rate limit, AD-33/42 Vercel Cron). Amended 2026-10-24: v7 MVP architecture simplification — NestJS + Neon PostgreSQL + Prisma. Managed by bmad-project-context; edits inside this block are replaced on refresh. Keep anything you want preserved outside the markers. -->

## e-Paperé SMS

Student management and access-control portal for e-Paperé Online Institute (Sri Lanka, Grades 6–11). pnpm workspaces monorepo — three packages: `packages/frontend` (React + TypeScript + Vite + Tailwind CSS v4), `packages/backend` (Node.js + **NestJS 11** + TypeScript + **Prisma**), `packages/shared-types` (Zod schemas for API request/response validation + TypeScript types only). Primary data store: **Neon PostgreSQL (Singapore region)**. Deployment: Vercel Pro (frontend + backend serverless); Railway/Render Singapore as portable alternative. Full English and Sinhala (si-LK) bilingual support across all five roles.

Planning artifacts: `_bmad-output/planning-artifacts/`. UX: `_bmad-output/ux/ux-epapere-2026-10-16/`. Architecture decisions (AD-1–AD-52): `_bmad-output/planning-artifacts/arch-e-papere-2026-10-16/ARCHITECTURE-SPINE.md`. PRD: `_bmad-output/planning-artifacts/prd-e-papere-2026-10-16/prd.md`. Design tokens (authoritative): `_bmad-output/ux/ux-epapere-2026-10-16/DESIGN.md`.

## Policy

- Never push directly to `main`; PRs only.
- Never weaken authentication, authorization, or financial safeguards for any reason, including convenience.
- Never accept fee or payment amounts from the client; always calculate server-side from configured pricing (AD-19, AD-23).
- Never store, log, or persist a raw password or raw activation token. Passwords: hash with bcrypt cost 12 on receipt, never return (AD-4). Activation tokens: emit the raw token once through the approved secure onboarding channel only; persist only the bcrypt-hashed verifier (AD-38).
- Never issue a JWT to a SUSPENDED or DISABLED account (AD-52). A single generic error code `ERR_ACCOUNT_NOT_ACCESSIBLE` is used for both states — no state-discriminating error is exposed to the login surface.
- No role — including Super Administrator — may retrieve or view an existing student password.
- Payment approval and entitlement creation must be wrapped in a Prisma interactive transaction (AD-11); partial state is a data-integrity failure.
- Duplicate entitlements are prohibited; enforced by the unique constraint on `(student_id, course_id, billing_period)` (AD-11).
- All background-job notifications render the translated string at write time from `user.preferred_language`; translation must not be deferred to display time (AD-51).
- Every user-facing string must go through `t()` or `<Trans>`; raw string literals in JSX are a lint error (AD-6).
- DESIGN.md is the authoritative source for all semantic design-token names and hex values; do not introduce or edit hex values directly in `src/styles/tokens.css` — copy values from DESIGN.md (AD-10).
- `packages/shared-types` exports Zod schemas (for API request/response validation) and TypeScript types only; no React, NestJS, Prisma, database connections, secrets, or infrastructure dependencies are permitted in this package. Prisma-generated types are backend-only and do not belong in shared-types (AD-20).
- All list-returning controller endpoints must call `getPaginationParams` from `src/shared/pagination/pagination.util.ts`; unbounded queries against any table are prohibited (AD-47).
- No module may inject another module's repository or Prisma delegate directly; cross-module access is via exported Service functions only (AD-1).
- The internal job endpoints (`/api/v1/internal/jobs/*`) are not user-accessible, must not appear in the Swagger UI, and must never appear in the RBAC matrix. **Vercel Cron triggers use `GET` endpoints secured by `CRON_SECRET` bearer. Manual-recovery triggers use `POST` endpoints secured by `INTERNAL_JOB_SECRET` bearer. These are two distinct secrets — do not conflate them.** (AD-33, AD-42, AD-36)
- Vercel Pro is required for production and staging; Hobby is for non-commercial use only (AD-37).
- Sri Lankan legal/compliance review is required before production launch: child data protection, guardian contact consent, and content-retention policy obligations (PRD §10).
- **Never use floating-point types (`Float`, `Double`, JavaScript `number`) for monetary values.** All money columns are `NUMERIC(12,2)` in PostgreSQL (Prisma: `@db.Decimal(12,2)`). Use `Decimal.js` or string-based arithmetic in service code; never `+` or `*` on JavaScript `number` for LKR amounts.
- **`@nestjs/schedule` is NOT used.** Background jobs (`InvoiceJobService`, `OverdueJobService`) are plain `async` functions, `@Injectable()` NestJS providers, called by `JobsController` via GET/POST internal endpoints. Do not add the `@Cron()` or `@Interval()` decorators (AD-33, AD-42).

## Architecture Decision Amendments Status

All v6 and v7 amendments have been applied. The following items are the only outstanding open questions — they are not implementation blockers unless noted.

**AD-3 amendment — Refresh cookie SameSite policy:** The exact `SameSite` value depends on the production deployment domain arrangement. Use `COOKIE_SAME_SITE` env var (default `None`) to configure without redeploy. `Secure` and `HttpOnly` are always required. If frontend and backend share a domain/subdomain, prefer `Strict` or `Lax`. Document the chosen arrangement in the security runbook. ⏳ Confirm before production.

**AD-20 amendment — shared-types Prisma boundary:** Prisma-generated types (from `@prisma/client`) are backend-only. `shared-types` contains Zod schemas for API request/response contracts and inferred TypeScript types. Do not add Prisma or `@prisma/client` as a dependency of `shared-types`. ✅ Reflected in this file.

**AD-35 amendment — presigned PUT size enforcement:** `content-length-range` is a POST Policy condition and is NOT supported on presigned PUT URLs. Two-layer enforcement: (a) client-side FileUploadZone rejects files > 5 MB before calling `/presign`; (b) server-side `/complete` performs a HEAD request to R2 and checks `Content-Length`. Both layers are required. ✅ AD-35 updated in Spine v7.

**AD-11 amendment — cumulative partial-payment entitlement:** The cumulative approved coverage check must sum `allocatedAmount` across ALL prior APPROVED `PaymentAllocation` rows for the same `lineItemId`. The check and entitlement creation happen inside the Prisma interactive transaction. ✅ Reflected in Story 4.6.

## Where things are

> All paths below are planned — the application scaffold does not exist yet. Verify on first refresh after initial commit.

- NestJS app root module (planned): `packages/backend/src/app.module.ts`. Persistent entrypoint: `src/main.ts`. Vercel entrypoint: `api/index.ts` (thin NestJS adapter, no domain logic).
- Prisma schema (planned): `packages/backend/prisma/schema.prisma`. Migrations: `packages/backend/prisma/migrations/`.
- Thirteen backend modules (planned): `auth · student · course · enrollment · invoice · payment · entitlement · resource · notification · migration · report · admin · audit`. `course` module owns Subject and Grade reference tables. `admin` module owns teacher account management. Each module calls other modules only through exported Service functions (AD-1).
- Shared backend utilities (planned): `src/shared/filters/http-exception.filter.ts`, `src/shared/guards/auth.guard.ts`, `src/shared/guards/roles.guard.ts`, `src/shared/pipes/zod-validation.pipe.ts`, `src/shared/interceptors/request-id.interceptor.ts`, `src/shared/logger/pino.logger.ts`, `src/shared/pagination/pagination.util.ts`, `src/shared/database/prisma.service.ts`.
- Frontend features (planned): `packages/frontend/src/features/{auth,student-dashboard,teacher-dashboard,finance-dashboard,admin-dashboard,owner-dashboard}`.
- Design tokens (planned): `packages/frontend/src/styles/tokens.css` — values copied from DESIGN.md, never edited in isolation.
- Translation files (planned): `packages/frontend/src/locales/{en,si}/{auth,payment,enrollment,course,notification,report,migration,common,errors}.json`. CI blocks PRs with missing `si/` keys (AD-30).
- Server-side notification translations (planned): `packages/shared-types/locales/{en,si}/notification.json` — required for write-time notification render in background jobs (AD-51).
- Monorepo config (planned): `pnpm-workspace.yaml` (root). CI workflows (planned): `.github/workflows/{ci.yml,deploy-frontend.yml,deploy-backend.yml}`.
- OpenAPI spec (planned): generated by `@nestjs/swagger` from controller decorators; validated by `redocly lint` in CI; every `/api/v1` route requires swagger decorators before merging (AD-21).

## Running and verifying

> All commands are planned TODOs. No scaffold exists yet. Verify each command against actual config on first refresh.

- TODO: `pnpm install --frozen-lockfile` — installs all workspaces.
- TODO: `pnpm -r typecheck` — TypeScript strict checks across all packages. CI runs this; `pnpm test` does not cover it — run both separately.
- TODO: `pnpm -r lint` — ESLint + Prettier.
- TODO: `pnpm -r test` — Vitest unit + integration tests. Integration tests require a running PostgreSQL instance (local Docker `docker compose up -d postgres` or a Neon dev branch URI in `.env.test`). CI spins a PostgreSQL container automatically.
- TODO: `pnpm -r test:e2e` — Playwright E2E covering UJ-1–UJ-5 in both `en`/`si` and light/dark modes (AD-22).
- TODO: `pnpm validate-i18n` — translation key completeness check; diffs `en/` vs `si/` per namespace; blocks PR on missing keys (AD-30).
- TODO: `npx prisma migrate deploy` — run pending migrations against `DIRECT_DATABASE_URL` (not the pooler). Used in CI deploy step.
- TODO: `npx prisma migrate reset` — reset test database before integration test suite.
- TODO: `redocly lint` — validates the generated OpenAPI spec from `@nestjs/swagger` output (AD-21).
- Node.js 24 LTS across all environments — local development, CI, Vercel (`nodejs24.x`), Railway, and Render (AD-2 v7).

## Conventions that differ from defaults

- **Module boundary:** one module never injects another module's Prisma delegate or repository class directly; cross-module calls go through the exported Service interface. Violating this bypasses transaction boundaries and business rules (AD-1).
- **NestJS patterns:** use `APP_GUARD`, `APP_FILTER`, `APP_PIPE`, `APP_INTERCEPTOR` tokens in `AppModule` for globally applied providers. Do not re-apply guards or pipes on every controller if they are already global.
- **No `@nestjs/schedule`:** background job services are `@Injectable()` providers called by `JobsController`. This is intentional — Vercel Cron fires GET requests; `@nestjs/schedule` would create an in-process timer that conflicts with serverless lifecycle (AD-33/42).
- **Financial logic:** business rules for payment allocation, entitlement activation, invoice generation, and fee calculation belong exclusively in Application Services — never in controllers or repositories.
- **Money arithmetic:** all monetary values are `Decimal` (Prisma `@db.Decimal(12,2)` = PostgreSQL `NUMERIC(12,2)`). In TypeScript, use the `Decimal` type from `@prisma/client/runtime/library` or `decimal.js`. Never cast to JavaScript `number` for arithmetic. Return as string or `Decimal` to controllers; format as `Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' })` on the frontend.
- **Error responses:** all API errors return `{ code: "ERR_*", params?: Record<string,string>, requestId: string }` — no English prose from backend (AD-8). Frontend maps codes via `t('errors:CODE')`. Implemented via global `ExceptionFilter`.
- **EP Student ID generation:** always via PostgreSQL sequence (`SELECT nextval('ep_student_id_seq')`) — never a max+1 query, never client-supplied (AD-5).
- **Tailwind v4 dark mode:** configured via `@custom-variant dark (&:where(.dark, .dark *))` in the CSS import, not via `tailwind.config.js darkMode` key (v3 pattern, ignored in v4). The `html.dark` class toggle is owned by `ThemeContext` (AD-9; AD-46).
- **React server state:** TanStack Query v5 only; no server state in React context. Context is for UI state (theme, language, auth token) only (AD-18).
- **Form validation:** React Hook Form + `zodResolver` on the frontend; `ZodValidationPipe` on the backend; schemas live in `packages/shared-types` (AD-19, AD-23).
- **File uploads:** presigned R2 flow only — `POST /presign` → client PUT directly to R2 → `POST /complete` with server-side HEAD size check (AD-35). File data must never transit the Vercel function body.
- **Pagination:** `getPaginationParams(query)` on every list endpoint; default page size 20, max 100 (AD-47).
- **Sinhala text containers:** use `min-height` not fixed `height`; `line-height: 1.75` minimum on body text; no `text-transform: uppercase` or `letter-spacing` on Sinhala text (DESIGN.md).
- **Billing period:** stored as `YYYY-MM` calendar-month string in `Asia/Colombo` timezone — no rolling-window logic (AD-33).
- **Notification body:** stored as a rendered human-readable string in the recipient's language at write time, plus stable `type` and `params JSONB` fields for future delivery channel use (AD-51).
- **Neon connection strings:** `DATABASE_URL` points to the Neon pooler endpoint (for runtime queries); `DIRECT_DATABASE_URL` points to the direct endpoint (for `prisma migrate deploy` only). Never run migrations through the pooler (AD-32).
- **OpenAPI:** use `@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiBearerAuth`, `@ApiProperty` on all controllers and DTOs. The `jobs.controller.ts` internal job controller must be excluded from the Swagger document (use `@ApiExcludeController()`).

## Known pitfalls

- **Cookie SameSite policy** depends on the actual deployment domain arrangement (see AD-3 amendment). Do not default to `SameSite=None` without confirming no shared-origin configuration is available. Whatever is chosen: `Secure` and `HttpOnly` are always required; JWT goes in the `Authorization` header for all API calls; the cookie is used for refresh only; CORS is locked to the known origin.
- **Internal job endpoints** must never appear in RBAC checks or Swagger UI. Vercel Cron fires GET (not POST) — implementing cron endpoints as POST-only is a compatibility defect (AD-33/42). Use `CRON_SECRET` for GET cron endpoints; use `INTERNAL_JOB_SECRET` for POST manual-recovery endpoints. Exclude the `JobsController` from Swagger with `@ApiExcludeController()`.
- **In-memory rate-limit stores** are forbidden in production; always use the Upstash Redis store via `rate-limit-redis` (AD-14/34). The auth login IP limit is **30 req/15 min** (not 10) to accommodate Sri Lankan CGNAT; the per-epId limit is **5 req/15 min** and is the primary brute-force guard. Extract the client IP from `x-real-ip` on Vercel — never use `req.ip` alone on a proxied deployment.
- **Neon pooler vs direct connection:** the `DATABASE_URL` pooler connection uses PgBouncer in transaction mode. This is compatible with Prisma interactive transactions but not with advisory locks held across multiple queries in a single session. Use PostgreSQL advisory locks via `prisma.$queryRaw` calls within a short, single transaction. Never hold advisory locks across multiple database calls outside a transaction. Use `DIRECT_DATABASE_URL` only for `prisma migrate` commands.
- **Money arithmetic:** never use JavaScript `number` for LKR amounts. Use `Decimal` throughout. `Decimal('1500.00').plus(Decimal('500.00'))` not `1500 + 500`. Prisma returns `Decimal` objects for `@db.Decimal(12,2)` fields.
- **Prisma `upsert` for idempotent job operations:** invoice batch upserts use `prisma.invoice.upsert({ where: { studentId_billingMonth: ... }, create: {...}, update: {} })`. The `update: {}` empty object means "do nothing if the record already exists" — this is the idempotency mechanism.
- **`@nestjs/schedule` is NOT used.** If you see a `@Cron()` decorator on any job service, it is an error. Background jobs are called via GET/POST controller endpoints.
- **i18n CI gate:** `validate-i18n.ts` blocks merges where `en/` keys are not mirrored in `si/`. Bypassing this gate causes raw key strings to appear in the Sinhala UI.
- **Invoice line item fee** is calculated and stored at generation time from the configured course price; it must not be recalculated at payment time. Recalculating allows fee drift between invoice generation and payment approval.
- **AuditEvent is append-only:** never update or delete audit records. Direct writes to the `audit_events` table bypassing the `audit` module are a boundary violation.
- **PENDING_ACTIVATION account access:** `AuthGuard` must check `account_state`, not just token validity. A PENDING_ACTIVATION user may call `GET /api/v1/courses` (public listing) but must be blocked from `POST /api/v1/enrollments` and all paid-content routes (AD-52, PRD FR-REG-011).
- **Prisma schema `auditTrail` as JSONB:** `payment_submissions.audit_trail` is a `Json` column (PostgreSQL JSONB). It is append-only at the application layer. Append via Prisma: `prisma.paymentSubmission.update({ data: { auditTrail: { push: newEntry } } })` only works if Prisma treats it as an array; otherwise use raw SQL. Prefer a typed append helper in the service.

<!-- /bmad:context -->
