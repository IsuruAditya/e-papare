---
title: "e-Paperé Student Management System — Architecture Spine"
status: final
version: 7
created: 2026-10-16
updated: 2026-10-24
prd: _bmad-output/planning-artifacts/prd-e-papere-2026-10-16/prd.md
addendum: _bmad-output/planning-artifacts/prd-e-papere-2026-10-16/addendum.md
memlog: _bmad-output/planning-artifacts/arch-e-papere-2026-10-16/.memlog.md
altitude: Initiative / Full System MVP
ads: AD-1 through AD-52 (with v7 amendments)
changes-v3: >
  Review pass: 11 gaps resolved. Added AD-38–AD-48.
  Data model updated; index set expanded; UX checklist extended.
changes-v4: >
  Pre-UX-review confirmation pass. 11 items confirmed against spine.
  Two sharpening patches applied. Pre-review attestation block added.
changes-v5: >
  UX–Architecture integration review corrections applied (2026-10-17).
  CRIT-02/03/04 resolved. AD-49–AD-52 added.
  Status: final.
changes-v6: >
  Pre-implementation architecture reconciliation (2026-10-23).
  AD-14/34: IP rate limit 10→30/15 min (CGNAT). AD-33/42: GET endpoints for
  Vercel Cron; CRON_SECRET; corrected invoice schedule; daily catch-up.
  AD-36: nodejs20.x→nodejs24.x; CRON_SECRET added. AD-46: @custom-variant dark.
changes-v7: >
  MVP Architecture Simplification (2026-10-24) — four approved decisions applied.
  Decision 1: Replace MongoDB Atlas + Mongoose with Neon PostgreSQL + Prisma.
    AD-2 amended: backend framework Express 5 → NestJS 11 (Express platform adapter).
    AD-26 superseded: MongoDB Atlas M10 → Neon PostgreSQL (serverless, Singapore region).
    AD-32 superseded: MongoDB connection caching → Prisma Client with Neon connection pooler.
    All data model sections rewritten from MongoDB document model to PostgreSQL relational model.
    All Mongoose schema references replaced by Prisma model references.
    MongoDB multi-document transactions replaced by Prisma interactive transactions.
    MongoDB ObjectIds replaced by portable UUID v4 identifiers.
    MongoDB distributed locks replaced by PostgreSQL advisory locks.
    MongoDB unique indexes replaced by PostgreSQL unique constraints.
    MongoDB aggregation pipelines replaced by Prisma/SQL queries.
    MongoMemoryServer in tests replaced by local PostgreSQL / test container.
  Decision 2: Subject/Grade merged into CourseModule as reference tables (no standalone module).
  Decision 3: Teacher administration merged into AdminModule; Teacher role/dashboards/workflows preserved.
  Decision 4: @nestjs/swagger decorator-driven OpenAPI replaces hand-authored spec; redocly lint retained.
  AD-35 amended: /complete size check adapted for presigned PUT (no content-length-range on PUT).
  AD-11 amended: transaction boundary respecified for Prisma interactive transactions.
  Backend module count: 14 → 13 (TeacherModule merged into AdminModule).
  Upstash Redis retained for rate limiting and recovery rate limiting.
  Cloudflare R2 and all business logic unchanged.
  Frontend stack (React, Vite, Tailwind v4, TanStack Query, react-i18next) unchanged.
  Status: final.
---

# e-Paperé SMS — Architecture Spine

## Paradigm

**Feature-bounded modular monolith, deployment-portable.**

A single NestJS application owns all domains. Module boundaries are enforced by NestJS module declarations and explicit service-interface contracts, not by network. Every module follows the same layered flow: Controller → Guard → Pipe → Service → Repository → PostgreSQL. Business logic lives exclusively in Services. Modules do not reach into each other's repositories; they call each other's exported Service functions.

The application bootstraps as a hosting-portable NestJS app. It deploys as a long-running Node.js process (Railway, Render) or as a Vercel serverless function — different entrypoint file, zero domain code changes. Infrastructure concerns (process management, scheduling, connection pooling) are isolated from the domain.

---

## System Context

```mermaid
C4Context
  title e-Paperé System Context
  Person(student, "Student", "Grade 6–11, phone browser")
  Person(teacher, "Teacher", "Course content, Zoom entry")
  Person(finAdmin, "Finance Admin", "Payment verification queue")
  Person(admin, "Administrator", "Student mgmt, migration")
  Person(superAdmin, "Super Admin / Owner", "Full config, reporting")

  System(frontend, "e-Paperé Frontend", "React SPA — Vercel CDN")
  System(backend, "e-Paperé API", "NestJS modular monolith")

  System_Ext(postgres, "Neon PostgreSQL", "Primary data store (Singapore)")
  System_Ext(r2, "Cloudflare R2", "Private file storage")
  System_Ext(redis, "Upstash Redis", "Distributed rate limiting")
  System_Ext(scheduler, "External Scheduler", "Vercel Cron Pro or Railway/Render cron")
  System_Ext(zoom, "Zoom", "Live class — URL reference only")

  Rel(student, frontend, "HTTPS browser")
  Rel(teacher, frontend, "HTTPS browser")
  Rel(finAdmin, frontend, "HTTPS browser")
  Rel(admin, frontend, "HTTPS browser")
  Rel(superAdmin, frontend, "HTTPS browser")
  Rel(frontend, backend, "HTTPS REST /api/v1")
  Rel(backend, postgres, "Prisma Client / Neon TLS")
  Rel(backend, r2, "S3-compat / presigned URLs")
  Rel(backend, redis, "Upstash TLS")
  Rel(scheduler, backend, "GET /api/v1/internal/jobs/* (CRON_SECRET) | POST /api/v1/internal/jobs/* (INTERNAL_JOB_SECRET recovery)")
```

---

## Deployment Topology

```mermaid
graph TB
  subgraph "Git Monorepo"
    FE[packages/frontend]
    BE[packages/backend]
    ST[packages/shared-types]
  end

  subgraph "Vercel — Primary"
    VFE[e-papere-frontend\nVite static → CDN]
    VBE[e-papere-backend\napi/index.ts → serverless\nnodejs24.x]
    VCRON[Vercel Cron Pro\ninvoice-batch GET: 30 18 24 * * UTC\n= midnight Colombo on 25th\nmark-overdue GET: 0 19 * * * UTC\n= 00:30 Colombo\ndaily-catchup GET: 5 19 * * * UTC\n= 00:35 Colombo]
  end

  subgraph "Portable Alternative"
    RBE[Railway / Render Singapore\nsrc/main.ts → node dist/main.js]
    RCRON[Built-in cron or HTTP scheduler]
  end

  subgraph "Shared Infrastructure"
    NEON[(Neon PostgreSQL\nSingapore region)]
    R2[(Cloudflare R2)]
    REDIS[(Upstash Redis)]
  end

  FE --> VFE
  BE --> VBE & RBE
  VBE & RBE --> NEON & R2 & REDIS
  VCRON --> VBE
  RCRON --> RBE
```

---

## Monorepo Folder Hierarchy

```
e-papere/
├── pnpm-workspace.yaml
├── .github/workflows/
│   ├── ci.yml
│   ├── deploy-frontend.yml
│   └── deploy-backend.yml
│
├── packages/
│   ├── shared-types/src/
│   │   ├── schemas/            ← Zod schemas for API request/response validation
│   │   └── types/              ← Inferred TS types + enums
│   │
│   ├── backend/
│   │   ├── api/index.ts        ← Vercel serverless entrypoint (thin adapter)
│   │   ├── prisma/
│   │   │   ├── schema.prisma   ← Authoritative data model
│   │   │   └── migrations/     ← Version-controlled migration files
│   │   ├── src/
│   │   │   ├── app.module.ts   ← Root NestJS module
│   │   │   ├── main.ts         ← Persistent host entrypoint
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── student/
│   │   │   │   ├── course/         ← includes Subject + Grade reference tables
│   │   │   │   ├── enrollment/
│   │   │   │   ├── invoice/
│   │   │   │   │   ├── invoice-job.service.ts
│   │   │   │   │   └── overdue-job.service.ts
│   │   │   │   ├── payment/
│   │   │   │   ├── entitlement/
│   │   │   │   ├── resource/
│   │   │   │   ├── notification/
│   │   │   │   ├── migration/
│   │   │   │   ├── report/
│   │   │   │   ├── admin/          ← includes Teacher account management
│   │   │   │   └── audit/
│   │   │   ├── jobs/
│   │   │   │   └── jobs.controller.ts
│   │   │   ├── config/
│   │   │   │   └── configuration.ts
│   │   │   └── shared/
│   │   │       ├── filters/
│   │   │       │   └── http-exception.filter.ts
│   │   │       ├── guards/
│   │   │       │   ├── auth.guard.ts
│   │   │       │   └── roles.guard.ts
│   │   │       ├── pipes/
│   │   │       │   └── zod-validation.pipe.ts
│   │   │       ├── interceptors/
│   │   │       │   └── request-id.interceptor.ts
│   │   │       ├── decorators/
│   │   │       │   ├── roles.decorator.ts
│   │   │       │   └── current-user.decorator.ts
│   │   │       ├── logger/
│   │   │       │   └── pino.logger.ts
│   │   │       ├── pagination/
│   │   │       │   └── pagination.util.ts
│   │   │       └── database/
│   │   │           └── prisma.service.ts
│   │   └── vercel.json
│   │
│   └── frontend/src/
│       ├── features/
│       │   ├── auth/
│       │   ├── student-dashboard/
│       │   ├── teacher-dashboard/
│       │   ├── finance-dashboard/
│       │   ├── admin-dashboard/
│       │   └── owner-dashboard/
│       ├── shared/
│       │   ├── ui/
│       │   ├── hooks/
│       │   ├── api/
│       │   ├── i18n/
│       │   └── theme/
│       └── locales/
│           ├── en/
│           └── si/
```

---

## Architecture Decision Records

### AD-1 — Modular Monolith
**Binds:** single deployable; all modules co-deployed.
**Prevents:** premature microservice extraction.
**Rule:** module boundary = NestJS `@Module()` declaration + exported Service interface. One module never injects another module's repository or Prisma delegate directly. Cross-module access only through exported Service functions. [ADOPTED]

### AD-2 — Node.js 24 LTS + NestJS 11 *(amended v7: Express 5 → NestJS 11)*
**Binds:** backend runtime and framework.
**Prevents:** framework boilerplate replacing NestJS built-ins; Vercel runtime incompatibility.
**Rule:** Node.js 24 LTS across all environments (local, CI, Vercel `nodejs24.x`, Railway/Render).
NestJS 11.x with default Express platform adapter. Use NestJS built-ins: `@Module`, `@Injectable`, `@Controller`, `@Guard`, `@Pipe`, `@ExceptionFilter`, `@nestjs/config`, `@nestjs/jwt`, `@nestjs/swagger`. Do not re-implement functionality NestJS provides.
`@nestjs/schedule` is explicitly NOT used — background jobs remain plain async functions called by `JobsController` (AD-33/42 requirement).

> **Superseded decision:** AD-2 v1–v6 specified Express 5 with `createApp()` factory. That factory pattern is replaced by NestJS `AppModule` + `bootstrap()`. The portability goal (AD-31) is met by NestJS's own architecture. [ADOPTED — amended v7]

### AD-3 — JWT Access Token + HTTP-only Refresh Cookie
**Binds:** all authentication and session flows.
**Prevents:** server-side session store as required infrastructure.
**Rule:** Access token = 15 min, HS256, `{ sub, role, epId }`. Refresh token = 7 days, HTTP-only Secure cookie (`SameSite` value from `COOKIE_SAME_SITE` env — see AD-3 amendment note in AGENTS.md), stored hashed in `refresh_tokens` table, rotated on every use. Logout invalidates DB record. CORS allows credentials from `CORS_ORIGIN` env only. [ADOPTED]

### AD-4 — bcrypt Cost Factor 12
**Binds:** all password storage.
**Prevents:** weak hashing.
**Rule:** hash on receipt; never log plaintext; never return hash. [ADOPTED]

### AD-5 — Atomic EP Student ID via PostgreSQL Sequence
**Binds:** Student ID generation.
**Prevents:** race-condition duplicates.
**Rule:** Use a dedicated PostgreSQL sequence `ep_student_id_seq`. In Prisma: `autoincrement()` on a `counters` table or a raw `SELECT nextval('ep_student_id_seq')` call wrapped in a service. Zero-padded 6 digits, prefixed `EP-`. Atomic because `nextval` is transactionally safe — multiple concurrent callers each receive a unique value. Never derive EP IDs from max+1 queries or client-supplied values.

> **Superseded decision:** AD-5 v1–v6 used `counters.findOneAndUpdate` MongoDB atomic upsert. PostgreSQL `nextval` is the equivalent and requires no additional collection. [ADOPTED — amended v7]

### AD-6 — react-i18next v15 + i18next
**Binds:** all frontend translation calls.
**Prevents:** hardcoded strings in JSX; parallel translation stacks.
**Rule:** every user-facing string via `t()` or `<Trans>`; raw literals in JSX are a lint error. Language resolution: `user.preferred_language` (DB) → `localStorage('epapere_lang')` → Super Admin system default → `en`. [ADOPTED]

### AD-7 — Feature-Organised Translation Files
**Binds:** translation file structure and key naming.
**Prevents:** monolithic strings files; key collisions.
**Rule:** path `src/locales/{en,si}/{module}.json`. Key: `namespace:section.identifier`. Missing key fallback = `en`; no raw key or empty string in UI. [ADOPTED]

### AD-8 — Stable Machine-Readable Backend Error Codes
**Binds:** all API error response bodies.
**Prevents:** English prose from backend reaching translated UI.
**Rule:** `{ code: string, params?: Record<string,string>, requestId: string }`. Frontend: `t('errors:CODE')`. Implemented via NestJS global `ExceptionFilter`. [ADOPTED]

### AD-9 — Tailwind `darkMode` + React ThemeContext
**Binds:** all component theming.
**Prevents:** duplicated pages per theme.
**Rule:** `ThemeContext` toggles `html` class, persists to `localStorage('epapere_theme')`. Optional `prefers-color-scheme` as initial default. [ADOPTED]

### AD-10 — CSS Custom Properties as Semantic Design Tokens *(amended v5)*
**Binds:** colour contract between design and code.
**Authoritative source:** `DESIGN.md` owns all token names, hex values, and semantic roles.
**Rule:** Token names implemented in `src/styles/tokens.css`. Tailwind CSS v4 maps utility classes to `var(--color-*)` via `@theme`. Components reference semantic token names only. [ADOPTED — amended v5]

### AD-11 — Prisma Interactive Transactions for Payment Approval *(amended v7)*
**Binds:** payment approval code path.
**Prevents:** partial state (payment recorded, entitlements not created).
**Rule:** `prisma.$transaction(async (tx) => { ... })` (interactive transaction) wraps:
1. `PaymentSubmission` → APPROVED
2. `InvoiceLineItem` → paymentStatus PAID/PARTIAL
3. `AccessEntitlement` upsert for each fully covered item (guarded by unique constraint on `{student_id, course_id, billing_period}`)
4. `Notification` write for student
5. `AuditEvent` append

Use Prisma's interactive transaction, not `$transaction([...])` batch array. The interactive form allows conditional logic (checking cumulative coverage per line item) within the transaction boundary. Duplicate entitlement guarded by unique constraint + Prisma will throw `P2002` on conflict.

> **Superseded decision:** AD-11 v1–v6 used `session.withTransaction()` (MongoDB multi-document transaction). Prisma interactive transactions are simpler and more reliable for this use case. [ADOPTED — amended v7]

### AD-12 — Cloudflare R2 for Private File Storage
**Binds:** all file storage and retrieval.
**Prevents:** raw public bucket URLs; files transiting function body.
**Rule:** opaque object keys; served via 15-min presigned GET URLs after entitlement check. No raw R2 URL in API response. [ADOPTED]

### AD-13 — Stateless Request Handling
**Binds:** all request handlers and module code.
**Prevents:** in-process shared state that breaks on multi-instance or serverless deployments.
**Rule:** no singleton state surviving between requests. JWT validates per-request. Refresh token state in PostgreSQL only. [ADOPTED]

### AD-14 — Dual-Key Rate Limiting (Redis-backed) *(amended v6)*
**Binds:** `POST /api/v1/auth/login`.
**Prevents:** brute-force, credential stuffing, per-instance bypass.
**Rule:** `express-rate-limit` + `rate-limit-redis` (Upstash). Registered as NestJS middleware in `AppModule.configure()`.

**Per-epId limit:** `rl:sid:{epId}` — **5 req / 15 min** (primary brute-force guard; unchanged).
**Per-IP limit:** `rl:ip:{extracted_ip}` — **30 req / 15 min** (CGNAT-tolerant; see rationale in Spine v6).

**IP extraction:** `req.headers['x-real-ip']` on Vercel; stripped `X-Forwarded-For` first public hop on Railway/Render. Never use a private-range address as the rate-limit key.

**Configurable via env:** `AUTH_RATE_LIMIT_IP` (default 30), `AUTH_RATE_LIMIT_EPI` (default 5), `AUTH_RATE_LIMIT_WINDOW_MS` (default 900000).

In-memory store forbidden in production. On 429: `{ code: 'ERR_AUTH_RATE_LIMITED', requestId }`. [ADOPTED — amended v6]

### AD-15 — In-Request Notification Writes
**Binds:** in-request notification paths.
**Prevents:** lost notifications; coupling to delivery channel.
**Rule:** domain services write `Notification` rows synchronously within the request. Critical downstream effects (entitlement creation) inside Prisma transaction (AD-11). Future channels registered as post-transaction async. [ADOPTED]

### AD-16 — Deployment-Neutral Billing Job Service *(amended v6)*
**Binds:** monthly invoice batch.
**Rule:** `InvoiceJobService.run()` is a plain async function, not decorated with `@nestjs/schedule`. See AD-33 for full specification. [ADOPTED — amended v6]

### AD-17 — PostgreSQL Index and Constraint Set *(amended v7)*
**Binds:** all query performance-critical paths.
**Prevents:** full table scans on hot paths.

| Table | Constraint / Index | Notes |
|---|---|---|
| `users` | `UNIQUE (ep_id)` | Login, lookup |
| `users` | `INDEX (account_state)` | State filtering |
| `users` | `INDEX (activation_token_expires_at) WHERE activation_token_expires_at IS NOT NULL` | Partial index; expired token queries |
| `enrollments` | `UNIQUE (student_id, course_id, start_billing_month)` | Dedup guard |
| `invoices` | `UNIQUE (student_id, billing_month)` | One invoice/student/month |
| `invoices` | `INDEX (student_id, billing_month, status)` | Overdue query |
| `invoice_line_items` | `UNIQUE (invoice_id, course_id)` | Dedup guard |
| `payment_submissions` | `INDEX (student_id, status)` | Queue filter |
| `payment_submissions` | `INDEX (claimed_by_id, status)` | Reviewer's queue |
| `payment_submissions` | `INDEX (student_id, status, created_at DESC)` | Duplicate detection query |
| `access_entitlements` | `UNIQUE (student_id, course_id, billing_period)` | Duplicate entitlement guard |
| `notifications` | `INDEX (recipient_id, read, created_at DESC)` | Dashboard bell |
| `job_locks` | `INDEX (locked_until)` | Stale lock query |
| `enrollments` | `INDEX (course_id, status)` | Enrollment counts (reporting) |
| `invoices` | `INDEX (status, created_at DESC)` | Revenue aggregation |
| `duplicate_reviews` | `INDEX (status, created_at DESC)` | Admin review queue |
| `migration_rows` | `INDEX (batch_id, status)` | Batch progress query |

> **Superseded decision:** AD-17 v1–v6 listed MongoDB indexes. PostgreSQL unique constraints, B-tree indexes, and partial indexes are the direct equivalents. [ADOPTED — amended v7]

### AD-18 — TanStack Query v5
**Binds:** all frontend server-state fetching.
**Rule:** no server state in React context. Context is for UI state only (theme, language, auth token). [ADOPTED]

### AD-19 — React Hook Form + Zod Shared Schemas
**Binds:** all frontend forms and both frontend/backend validation.
**Rule:** Zod schemas in `packages/shared-types`; backend uses `ZodValidationPipe`; frontend uses `zodResolver`. Fee amounts never accepted from client. [ADOPTED]

### AD-20 — PNPM Workspaces Monorepo (Two Vercel Projects)
**Binds:** project structure and deployment configuration.
**Rule:** three packages. Two Vercel projects from same Git repo. `shared-types` exports Zod schemas (for API request/response validation) and TS types only — Zod is the only permitted runtime dependency. Prisma-generated types are used for backend data models; they do not belong in `shared-types`. [ADOPTED]

### AD-21 — @nestjs/swagger + redocly lint for OpenAPI *(amended v7)*
**Binds:** all `/api/v1` routes.
**Prevents:** undocumented endpoints; client-server contract drift.
**Rule:** `@nestjs/swagger` decorators (`@ApiOperation`, `@ApiResponse`, `@ApiProperty`, `@ApiTags`) on all controllers and DTOs. OpenAPI 3.1 spec generated via `SwaggerModule.setup()`. Swagger UI at `/api/docs` in non-production only. `redocly lint` validates the generated spec in CI; any schema violation blocks the merge. No separate hand-authored spec file maintained.

> **Superseded decision:** AD-21 v1–v6 specified a hand-authored OpenAPI 3.1 file validated by `redocly lint`. The spec is now generated from decorators, eliminating manual sync burden. `redocly lint` remains as the contract quality gate. [ADOPTED — amended v7]

### AD-22 — Vitest + Playwright
**Binds:** unit, integration, and E2E testing.
**Rule:** Vitest for unit/integration (uses `@nestjs/testing` for module isolation); Playwright for E2E. UJ-1–UJ-5, each in `en` + `si`, light + dark. Integration tests use a real PostgreSQL instance (Docker container or local Neon dev branch) — no in-memory database emulation. [ADOPTED]

### AD-23 — Zod Runtime Validation via ZodValidationPipe *(amended v7)*
**Binds:** all API input paths.
**Prevents:** unvalidated client input reaching business logic.
**Rule:** `ZodValidationPipe` (custom NestJS `PipeTransform`) applied per-endpoint using schemas from `packages/shared-types`. Returns `{ code: 'ERR_VALIDATION', params: [{ field, message }], requestId }` on failure.

> **Superseded decision:** AD-23 v1–v6 used a custom Express `validateRequest(schema)` middleware. `ZodValidationPipe` is the idiomatic NestJS equivalent. [ADOPTED — amended v7]

### AD-24 — Pino Structured JSON Logger
**Binds:** all backend logging.
**Prevents:** `console.log` in production; unstructured logs; PII in logs.
**Rule:** Pino implemented as a NestJS `LoggerService` (`implements LoggerService`). Request ID via `AsyncLocalStorage` injected by `RequestIdInterceptor`. Levels `error/warn/info/debug`. [ADOPTED]

### AD-25 — GitHub Actions CI/CD with i18n Gate
**Binds:** all PRs to `main`.
**Rule:** steps: TypeScript check → ESLint + Prettier → Vitest → `validate-i18n.ts` → Playwright E2E smoke → `redocly lint` (on generated spec). All must pass. [ADOPTED]

### AD-26 — Neon PostgreSQL (Singapore region) *(amended v7: replaces MongoDB Atlas M10)*
**Binds:** database hosting.
**Prevents:** self-managed databases; out-of-region latency; floating-point financial arithmetic.
**Rule:** Neon PostgreSQL serverless, Singapore region. Automated backups and PITR enabled. Financial amounts stored as `NUMERIC(12,2)` or integer minor units (paise / cents equivalent) — never as `FLOAT` or `DOUBLE`. Connection via Neon connection pooler (PgBouncer) for serverless/Vercel invocations; direct connection for Prisma migrations (`prisma migrate deploy`). Review dedicated Render/Railway PostgreSQL add-on at ~2000 MAU if Neon costs increase.

> **Superseded decision:** AD-26 v1–v6 specified MongoDB Atlas M10 Singapore. PostgreSQL is a better fit for this finance and enrollment domain. Neon provides the same Singapore region, automated backups, and PITR at lower cost for MVP scale. [ADOPTED — amended v7]

### AD-27 — Vercel Pro (Primary) + Railway/Render (Portable)
**Binds:** application hosting strategy.
**Rule:** Vercel Hobby non-commercial only; production requires Pro. Railway/Render Singapore as drop-in alternative — same domain code, different entrypoint + env. No Vercel/Railway/Render SDK in domain services. [ADOPTED]

### AD-28 — Noto Sans Sinhala (Self-Hosted Subset)
**Binds:** Sinhala typography.
**Rule:** subset to U+0D80–U+0DFF; same origin; `font-display: swap`; max ≤200 kB variable font. [ADOPTED]

### AD-29 — Helmet.js + CORS Origin Allowlist
**Binds:** HTTP security headers.
**Rule:** Helmet applied in NestJS bootstrap (`app.use(helmet())`). CORS via `app.enableCors({ origin: CORS_ORIGIN, credentials: true })`. [ADOPTED]

### AD-30 — CI i18n Key Completeness Check
**Binds:** all PRs adding English translation keys.
**Rule:** `validate-i18n.ts` diffs `en/` vs `si/` key trees per namespace; blocks PR if any `en/` key absent from `si/`. [ADOPTED]

### AD-31 — NestJS Application Bootstrap *(amended v7: replaces Express App Factory)*
**Binds:** all backend entrypoints.
**Prevents:** business logic rewrite on hosting change.
**Rule:** `src/app.module.ts` is the root module. `src/main.ts` calls `NestFactory.create(AppModule)` and `app.listen()` (persistent). `api/index.ts` initializes NestJS without `listen()` and forwards requests to the Express instance (Vercel adapter). Domain code only in `src/modules/*`. No Vercel or Railway SDK in any module.

> **Superseded decision:** AD-31 v1–v6 described the `createApp()` Express factory pattern. NestJS `AppModule` + `bootstrap()` replaces it. Portability is achieved through NestJS's own hosting-neutral architecture. [ADOPTED — amended v7]

### AD-32 — Prisma Client + Neon Connection Pooler *(amended v7: replaces MongoDB connection caching)*
**Binds:** database connection initialization.
**Prevents:** connection exhaustion on serverless cold starts.
**Rule:** `PrismaService` is a NestJS `@Injectable()` that wraps `PrismaClient`. It is provided globally via `DatabaseModule`. In the Vercel serverless entrypoint, `PrismaClient` is instantiated once at module level (outside the handler) and reused across warm invocations.

**Neon pooler connection string** (env var `DATABASE_URL`) points to the Neon connection pooler endpoint for all runtime queries. The pooler uses PgBouncer in transaction mode, which is compatible with Prisma's connection management and serverless invocations.

**Migration connection** (env var `DIRECT_DATABASE_URL`) points to the direct Neon database endpoint (bypassing the pooler). Required for `prisma migrate deploy` — PgBouncer in transaction mode does not support the advisory locks used during migrations.

```
DATABASE_URL=postgresql://user:pass@ep-xxx.pooler.neon.tech/epapere?pgbouncer=true&connection_limit=1
DIRECT_DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/epapere
```

Prisma schema:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL")
}
```

`connection_limit=1` in `DATABASE_URL` is recommended for serverless runtimes where multiple function instances may start simultaneously.

> **Superseded decision:** AD-32 v1–v6 described MongoDB module-level promise caching with `maxPoolSize`. Prisma + Neon pooler achieves the same goal with cleaner serverless semantics. [ADOPTED — amended v7]

### AD-33 — Deployment-Neutral Billing Job (Invoice Batch) *(amended v6, applies unchanged in v7)*
**Binds:** monthly invoice generation.
**Rule:**

`InvoiceJobService.run({ billingMonth?: string })` — plain `async` function, `@Injectable()` NestJS provider, NOT decorated with `@nestjs/schedule`. Called by `JobsController`.

**Vercel Cron endpoint:** `GET /api/v1/internal/jobs/invoice-batch` — `CRON_SECRET` bearer; non-cacheable; not in Swagger; not in RBAC. Schedule: `30 18 24 * *` UTC (= 00:00 Asia/Colombo on 25th).

**Daily safety catch-up:** `GET /api/v1/internal/jobs/invoice-batch-catchup` — `CRON_SECRET` bearer; schedule `5 19 * * *` UTC.

**Manual recovery:** `POST /api/v1/internal/jobs/invoice-batch` — `INTERNAL_JOB_SECRET` bearer.

**Distributed lock:** PostgreSQL advisory lock (replaces MongoDB jobLocks collection).
```sql
SELECT pg_try_advisory_lock(hashtext('invoice-batch'))
```
If lock not acquired: exit with `{ status: 'LOCK_HELD' }` HTTP 200. Release lock on completion or error.
Lock TTL not needed — PostgreSQL advisory locks are automatically released when the session ends (Vercel function timeout or crash). The catch-up job handles missed/crashed runs.

**Idempotency:** Invoice upsert uses the `UNIQUE (student_id, billing_month)` constraint — safe to call any number of times; `ON CONFLICT DO NOTHING` or Prisma `upsert`. Line-item upsert uses `UNIQUE (invoice_id, course_id)`.

**Bounded batch:** enrollments processed in pages of ≤200 using cursor pagination (`lastProcessedId`). Each page committed independently.

**Job logging:** `job_logs` table (replaces `jobLogs` collection).

[ADOPTED — amended v6; advisory lock mechanism updated v7]

### AD-34 — Upstash Redis Distributed Rate Limiting *(amended v6)*
**Binds:** `POST /api/v1/auth/login`.
**Rule:** `rate-limit-redis` store (Upstash). Keys:
- `rl:ip:{extracted_ip}` — **30 req / 15 min** (raised from 10 — AD-14 CGNAT rationale).
- `rl:sid:{epId}` — **5 req / 15 min** (unchanged).
- `rl:recovery:{studentId}` — 3 req / 24 h (AD-48, unchanged).

IP extraction: `x-real-ip` on Vercel; `X-Forwarded-For` first public hop on Railway/Render.
Configurable via env: `AUTH_RATE_LIMIT_IP` (default 30), `AUTH_RATE_LIMIT_EPI` (default 5), `AUTH_RATE_LIMIT_WINDOW_MS` (default 900000).
In-memory store forbidden in production. [ADOPTED — amended v6]

### AD-35 — Direct-to-R2 Presigned Upload *(amended v7: size enforcement clarified)*
**Binds:** all file upload paths.
**Rule:** (1) `POST /api/v1/storage/presign` → `{ uploadUrl, fileKey }`. (2) Client `PUT` directly to R2. (3) `POST /api/v1/storage/complete { fileKey }` → backend performs HEAD request to R2; if `Content-Length > 5_242_880` bytes, deletes the object and returns `ERR_FILE_TOO_LARGE`; otherwise confirms the upload and records `fileKey` as usable.

**Note:** `content-length-range` is a POST Policy condition and is not supported on presigned PUT URLs. Size enforcement is therefore two-layer: (a) client-side in `FileUploadZone` (rejects before calling `/presign`); (b) server-side at `/complete` via R2 HEAD. Both layers are required. [ADOPTED — amended v7]

### AD-36 — Vercel Project Configuration *(amended v6)*
**Binds:** Vercel deployment config.

| | e-papere-frontend | e-papere-backend |
|---|---|---|
| `rootDirectory` | `packages/frontend` | `packages/backend` |
| Framework | Vite | — |
| Build | `pnpm build` | `pnpm build` |
| Output / Entry | `dist/` | `api/index.ts` |
| Runtime | — | `nodejs24.x` |
| Install | `pnpm install --frozen-lockfile` | `pnpm install --frozen-lockfile` |

**Backend env vars:** `NODE_ENV`, `DATABASE_URL`, `DIRECT_DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `INTERNAL_JOB_SECRET`, `CRON_SECRET`, `CORS_ORIGIN`, `R2_BUCKET`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `REDIS_URL`, `AUTH_RATE_LIMIT_IP`, `AUTH_RATE_LIMIT_EPI`, `AUTH_RATE_LIMIT_WINDOW_MS`, `COOKIE_SAME_SITE`.
**Frontend env vars:** `VITE_API_BASE_URL`, `VITE_ENV`.

> **Note:** `MONGODB_URI`, `MONGODB_MAX_POOL_SIZE` are removed. `DATABASE_URL` (pooler) and `DIRECT_DATABASE_URL` (direct) replace them. [ADOPTED — amended v6/v7]

### AD-37 — Production Cost Commitment
**Binds:** all hosting decisions.
**Rule:** Vercel Pro required for production and staging. Dev/feature-preview may use Hobby. [ADOPTED]

### AD-38 — Activation Token Strategy
**Binds:** admin-assisted registration, account recovery, and activation flows.
**Rule:** `users.activation_token_hash` (bcrypt-hashed raw token), `activation_token_expires_at` (48h), `activation_token_used_at` (null until used), `activation_token_regenerated_from_id` (UUID of prior token's user record, nullable). Validation: hash match + `expires_at > now` + `used_at IS NULL`. On first use: set `used_at = now` atomically. On admin regeneration: update token fields, set previous `used_at = now` atomically within a Prisma transaction. Raw token emitted once to caller — never stored or logged. [ADOPTED]

### AD-39 — Duplicate Adjudication Table *(amended v7)*
**Binds:** student registration and bulk import.
**Rule:** `duplicate_reviews` table: `{ id UUID PK, incoming_record JSONB, existing_candidates JSONB, status (PENDING|CONFIRMED_NEW|MERGED|DEFERRED), resolved_by UUID?, resolved_at TIMESTAMPTZ?, resolution_notes TEXT? }`. Student record not committed until `CONFIRMED_NEW` or `MERGED`. Flagged bulk-import rows reference a `duplicate_review_id` FK.

> **Superseded decision:** AD-39 v1–v6 used `DuplicateReview` MongoDB collection. PostgreSQL table with JSONB columns for the embedded snapshots is equivalent. [ADOPTED — amended v7]

### AD-40 — Unmatched Payment State
**Binds:** payment submission workflow.
**Rule:** `payment_submissions.status` enum includes `'UNMATCHED'`. Columns: `unmatched_notes TEXT`, `unmatched_resolved_at TIMESTAMPTZ`, `unmatched_resolved_by UUID FK`. Finance Admin creates UNMATCHED submission, adds notes, then re-allocates or rejects. [ADOPTED]

### AD-41 — Migration Batch Data Model *(amended v7)*
**Binds:** bulk import operation.
**Rule:**
- `migration_batches` table: `{ id UUID PK, created_by UUID FK, created_at TIMESTAMPTZ, status (PENDING|PROCESSING|COMPLETED|COMPLETED_WITH_ERRORS), total_rows INT, processed INT, succeeded INT, failed INT, errors JSONB }`.
- `migration_rows` table: `{ id UUID PK, batch_id UUID FK, row_number INT, raw_data JSONB, status (QUEUED|PROCESSED|FAILED|FLAGGED), ep_id VARCHAR?, duplicate_review_id UUID FK?, error_message TEXT? }`.

> **Superseded decision:** AD-41 v1–v6 used `MigrationBatch` + `MigrationRow` MongoDB collections. [ADOPTED — amended v7]

### AD-42 — Daily Overdue-Marking Job *(amended v5: notification language at write time; amended v6: GET endpoint for Vercel Cron)*
**Binds:** invoice overdue status and overdue reminder notifications.
**Rule:** `OverdueJobService.run()` — plain `async function`, `@Injectable()` NestJS provider, NOT decorated with `@nestjs/schedule`.
**Vercel Cron endpoint:** `GET /api/v1/internal/jobs/mark-overdue` — `CRON_SECRET` bearer; non-cacheable; not in Swagger; not in RBAC. Schedule: `0 19 * * *` UTC (= 00:30 Asia/Colombo).
**Manual recovery:** `POST /api/v1/internal/jobs/mark-overdue` — `INTERNAL_JOB_SECRET` bearer.
**Distributed lock:** PostgreSQL advisory lock `pg_try_advisory_lock(hashtext('mark-overdue'))`. Auto-released on session end.
**Query:** `SELECT * FROM invoices WHERE status IN ('UNPAID','PARTIAL') AND payment_deadline < NOW() AT TIME ZONE 'Asia/Colombo'`.
**Idempotent:** skips invoices already OVERDUE; checks for existing `PAYMENT_OVERDUE` notification before writing.
**Notification language:** rendered at write time from `users.preferred_language` (AD-51). [ADOPTED — amended v5/v6]

### AD-43 — Duplicate Submission Detection
**Binds:** payment submission creation path.
**Rule:** on `PaymentService.submitPayment()`, query existing `SUBMITTED | UNDER_REVIEW` submissions for same student + billing month where `student_stated_total` is within 5% of incoming amount. If found: set `is_duplicate_flag = true` and populate `duplicate_candidate_ids UUID[]`. Finance Admin sees warning; no hard block. [ADOPTED]

### AD-44 — PaymentSubmission Additional Fields
**Binds:** excess payment recording, duplicate detection, disposition tracking.
**Rule:** columns on `payment_submissions`:
- `unallocated_excess NUMERIC(12,2)` — computed at approval.
- `excess_disposition_note TEXT` — required when `unallocated_excess > 0`.
- `is_duplicate_flag BOOLEAN DEFAULT false`.
- `duplicate_candidate_ids UUID[] DEFAULT '{}'`.
[ADOPTED]

### AD-45 — Reporting Aggregation Strategy
**Binds:** all dashboard and report queries.
**Rule:** on-demand SQL aggregate queries via Prisma `$queryRaw` or `groupBy` at MVP. Additional indexes supporting reporting defined in AD-17. All report queries paginated (AD-47). Revisit materialized views at ~10,000 MAU. Finance Admin report queries scoped to Finance Admin role only. [ADOPTED]

### AD-46 — Tailwind CSS v4 Compatibility *(amended v6)*
**Binds:** frontend build configuration for dark mode.
**Rule:** `@custom-variant dark (&:where(.dark, .dark *))` in CSS entry file. Use `@custom-variant` (not `@variant`); `:where()` (zero specificity, not `:is()`). [ADOPTED — amended v6]

### AD-47 — Pagination Enforcement
**Binds:** all list-returning controller endpoints.
**Rule:** `pagination.util.ts` exports `getPaginationParams(query): { page, pageSize, skip }` — enforces `page ≥ 1`, `pageSize` clamped to `[1, 100]`, default 20. Applied via `@Query()` parameter binding in NestJS controllers. Integration tests assert pagination on all list endpoints. [ADOPTED]

### AD-48 — Account Recovery Rate Limiting and Audit
**Binds:** account recovery initiation.
**Rule:** Rate limit: 3 recovery link generations per student per 24 h (Redis key `rl:recovery:{studentId}`). `AuditEvent` written at every recovery initiation. Admin UI must include an explicit confirmation checkbox. [ADOPTED]

### AD-49 — User Preferences API and preferredTheme Field *(new v5)*
**Binds:** theme and language persistence; `users` table.
**Rule:** `users.preferred_theme VARCHAR(5) DEFAULT 'light'` (CHECK IN ('light','dark')). Endpoint: `PATCH /api/v1/users/me/preferences` — body `{ preferredLanguage?: 'en'|'si', preferredTheme?: 'light'|'dark' }`. Any authenticated role may update their own record. Frontend `ThemeContext` writes `localStorage` immediately, fires mutation in background. [ADOPTED — new v5]

### AD-50 — TanStack Query Polling Strategy for Payment Status *(new v5)*
**Binds:** payment status page, finance queue.
**Rule:** No WebSocket or SSE in MVP. `refetchInterval: (data) => terminalStates.has(data?.status) ? false : 10_000` on payment detail page. `refetchInterval: 15_000` on finance queue. No polling on non-real-time surfaces. [ADOPTED — new v5]

### AD-51 — Notification Language: Write-Time Render Rule *(new v5)*
**Binds:** all notification writes.
**Rule:** All `notifications` rows store a rendered `body` string in the recipient's preferred language at write time. Also stores stable `type` and `params JSONB`. Backend uses i18next for server-side translation. `notification` namespace in `packages/shared-types/locales/{en,si}/notification.json`. [ADOPTED — new v5]

### AD-52 — Account State Enforcement at Session Boundary *(new v5)*
**Binds:** `AuthGuard`, all protected routes.
**Rule:** SUSPENDED or DISABLED account → HTTP 403 `{ code: 'ERR_ACCOUNT_NOT_ACCESSIBLE' }` at login (no token issued). `AuthGuard` re-checks `account_state` from DB on data-mutating and sensitive routes. Generic error code — no state discrimination. AuditEvent written on every blocked login attempt. [ADOPTED — new v5]

---

## Cost Reference (updated v7)

| Service | Dev / Staging | Production (MVP) | Notes |
|---|---|---|---|
| Vercel Frontend | Hobby ($0) | **Pro ($20/month)** | Commercial requires Pro |
| Vercel Backend | Hobby ($0, non-commercial) | **Pro (shared team)** | Same Pro team |
| Neon PostgreSQL | Free tier (0.5 GB) | **Launch ~$19/month** | Singapore; PITR; connection pooler |
| Cloudflare R2 | Free tier | Pay-as-you-go (~$0.015/GB) | Minimal at MVP |
| Upstash Redis | Free (10K/day) | ~$1–5/month | Rate limiting + recovery limits |
| GitHub Actions | Free | Free / Team | CI/CD |
| **Baseline** | **~$0** | **~$60–70 USD/month** | ~$35–50/month less than MongoDB Atlas path |

---

## Two Backend Entrypoints

**Persistent (`src/main.ts`):**
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PinoLogger } from './shared/logger/pino.logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: new PinoLogger() });
  app.setGlobalPrefix('api/v1');
  app.use(helmet());
  app.enableCors({ origin: process.env.CORS_ORIGIN, credentials: true });
  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

**Vercel (`api/index.ts`):**
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';

let app: any;

export default async function handler(req: any, res: any) {
  if (!app) {
    app = await NestFactory.create(AppModule, { logger: false });
    app.setGlobalPrefix('api/v1');
    app.use(helmet());
    app.enableCors({ origin: process.env.CORS_ORIGIN, credentials: true });
    await app.init(); // does NOT call listen()
  }
  app.getHttpAdapter().getInstance()(req, res);
}
```

Both entrypoints: infrastructure only. No domain logic, no Prisma models.

---

## Backend Module Map

```mermaid
graph TD
  subgraph "src/modules"
    AUTH[auth\nLogin · tokens · activation\nrecovery · rate limit]
    STUDENT[student\nRegistration · EP ID · account state\nduplicate detection · adjudication]
    COURSE[course\nSubject ref table · Grade ref table\nCourse CRUD · activation]
    ENROL[enrollment\nPersistent records · withdrawal\nbilling-stop]
    INVOICE[invoice\nLine item generation · batch job\noverdue job · manual trigger]
    PAYMENT[payment\nSubmission lanes · evidence append\nclaim/lock · states\nallocation · duplicate detect\nunmatched handling]
    ENTITLE[entitlement\nAccess record creation in txn\nAccess evaluation]
    RESOURCE[resource\nZoom details · materials\nRecording URL management]
    NOTIF[notification\nIn-app writes · WhatsApp templates]
    MIGRATION[migration\nBatch · row pipeline · DuplicateReview\nUnverified payment seeding]
    REPORT[report\nSQL aggregations · paginated\nRole-segmented]
    ADMIN[admin\nOperations · role assignment\nSystem config · DuplicateReview adjudicate\nTeacher account management]
    AUDIT[audit\nImmutable append-only log]
  end

  AUTH --> STUDENT
  ENROL --> INVOICE
  PAYMENT --> ENTITLE
  PAYMENT --> AUDIT
  INVOICE --> NOTIF
  PAYMENT --> NOTIF
  RESOURCE --> ENTITLE
  MIGRATION --> STUDENT
  MIGRATION --> ENROL
  MIGRATION --> AUDIT
  ADMIN --> STUDENT
```

**13 modules** (TeacherModule merged into AdminModule per Decision 3 approval; teacher role, dashboards, and workflows are fully preserved — only the administrative account management endpoints are consolidated).

**Rules:** each module owns its own Prisma model delegates (accessed only through `PrismaService`). No module imports another module's service or accesses another module's Prisma delegate directly. `audit` is write-through only.

---

## Frontend Module Map

_(Unchanged from v6)_

```mermaid
graph TD
  APP[App.tsx\nRouter · ThemeProvider · I18nProvider · AuthProvider]
  subgraph features
    F1[auth]
    F2[student-dashboard]
    F3[teacher-dashboard]
    F4[finance-dashboard]
    F5[admin-dashboard]
    F6[owner-dashboard]
  end
  subgraph shared
    UI[ui — design system]
    API[api — typed fetch]
    I18N[i18n — react-i18next]
    THEME[theme — ThemeContext]
  end
  APP --> F1 & F2 & F3 & F4 & F5 & F6
  F1 & F2 & F3 & F4 & F5 & F6 --> API
```

---

## i18n Architecture _(Unchanged from v6)_

**Library:** react-i18next v15 + i18next.
**File structure:** `src/locales/{en,si}/{ auth | payment | enrollment | course | notification | report | migration | common | errors }.json`
**Key convention:** `namespace:section.identifier`
**Language resolution order:** `user.preferred_language` (DB) → `localStorage('epapere_lang')` → system default → `en` hardcoded.
**Missing key:** `fallbackLng: 'en'`; suppress raw key in production.
**Backend i18next:** `notification` namespace in `packages/shared-types/locales/{en,si}/notification.json`.

---

## Theme Architecture _(Unchanged from v6)_

**Tailwind v4:** `@custom-variant dark (&:where(.dark, .dark *))` in CSS import.
**Tokens:** `src/styles/tokens.css` — values copied from DESIGN.md. No hex values in component code.
**Toggle:** `html.dark` class owned by `ThemeContext`.

---

## Data Model (Relational — Prisma schema seed shapes)

```mermaid
erDiagram
  users ||--o{ enrollments : ""
  users ||--o{ invoices : ""
  users ||--o{ payment_submissions : ""
  users ||--o{ access_entitlements : ""
  users ||--o{ notifications : ""
  users ||--o{ duplicate_reviews : "candidate"
  courses ||--o{ enrollments : ""
  courses ||--o{ invoice_line_items : ""
  courses ||--o{ access_entitlements : ""
  courses ||--o{ resources : ""
  subjects ||--o{ courses : ""
  grades ||--o{ courses : ""
  invoices ||--o{ invoice_line_items : ""
  invoice_line_items ||--o{ payment_allocations : ""
  payment_submissions ||--o{ payment_allocations : ""
  payment_submissions ||--o{ evidence_items : ""
  access_entitlements ||--|| payment_allocations : "activated_by"
  migration_batches ||--o{ migration_rows : ""
  migration_rows ||--o| duplicate_reviews : ""
```

**Key Prisma model shapes (seed — owned by `prisma/schema.prisma` once written):**

```prisma
model User {
  id                        String    @id @default(uuid()) @db.Uuid
  epId                      String    @unique @map("ep_id")
  role                      Role
  accountState              AccountState @map("account_state")
  passwordHash              String    @map("password_hash")
  preferredLanguage         String    @default("en") @map("preferred_language")
  preferredTheme            String    @default("light") @map("preferred_theme")
  fullName                  String    @map("full_name")
  dateOfBirth               DateTime? @map("date_of_birth") @db.Date
  grade                     Int?
  guardianName              String?   @map("guardian_name")
  guardianPhone             String?   @map("guardian_phone")
  guardianWhatsapp          String?   @map("guardian_whatsapp")
  activationTokenHash       String?   @map("activation_token_hash")
  activationTokenExpiresAt  DateTime? @map("activation_token_expires_at")
  activationTokenUsedAt     DateTime? @map("activation_token_used_at")
  createdAt                 DateTime  @default(now()) @map("created_at")
  updatedAt                 DateTime  @updatedAt @map("updated_at")
  @@map("users")
}

model Subject {
  id       String    @id @default(uuid()) @db.Uuid
  nameEn   String    @map("name_en")
  nameSi   String    @map("name_si")
  isActive Boolean   @default(true) @map("is_active")
  courses  Course[]
  @@map("subjects")
}

model Grade {
  id       String    @id @default(uuid()) @db.Uuid
  level    Int       @unique
  isActive Boolean   @default(true) @map("is_active")
  courses  Course[]
  @@map("grades")
}

model Course {
  id         String   @id @default(uuid()) @db.Uuid
  subjectId  String   @map("subject_id") @db.Uuid
  gradeId    String   @map("grade_id") @db.Uuid
  teacherId  String   @map("teacher_id") @db.Uuid
  category   String
  titleEn    String   @map("title_en")
  titleSi    String?  @map("title_si")
  fee        Decimal  @db.Decimal(12, 2)
  schedule   String?
  isActive   Boolean  @default(true) @map("is_active")
  subject    Subject  @relation(fields: [subjectId], references: [id])
  grade      Grade    @relation(fields: [gradeId], references: [id])
  @@map("courses")
}

model Enrollment {
  id                     String    @id @default(uuid()) @db.Uuid
  studentId              String    @map("student_id") @db.Uuid
  courseId               String    @map("course_id") @db.Uuid
  startBillingMonth      String    @map("start_billing_month")   // YYYY-MM
  withdrawalEffectiveMonth String? @map("withdrawal_effective_month") // YYYY-MM
  status                 EnrollmentStatus @default(ACTIVE)
  createdAt              DateTime  @default(now()) @map("created_at")
  @@unique([studentId, courseId, startBillingMonth])
  @@map("enrollments")
}

model Invoice {
  id              String        @id @default(uuid()) @db.Uuid
  studentId       String        @map("student_id") @db.Uuid
  billingMonth    String        @map("billing_month")  // YYYY-MM
  generationDate  DateTime      @map("generation_date")
  paymentDeadline DateTime      @map("payment_deadline")
  status          InvoiceStatus @default(UNPAID)
  createdAt       DateTime      @default(now()) @map("created_at")
  lineItems       InvoiceLineItem[]
  @@unique([studentId, billingMonth])
  @@map("invoices")
}

model InvoiceLineItem {
  id            String            @id @default(uuid()) @db.Uuid
  invoiceId     String            @map("invoice_id") @db.Uuid
  courseId      String            @map("course_id") @db.Uuid
  fee           Decimal           @db.Decimal(12, 2)
  paymentStatus LineItemPaymentStatus @default(UNPAID) @map("payment_status")
  invoice       Invoice           @relation(fields: [invoiceId], references: [id])
  @@unique([invoiceId, courseId])
  @@map("invoice_line_items")
}

model PaymentSubmission {
  id                    String                @id @default(uuid()) @db.Uuid
  studentId             String                @map("student_id") @db.Uuid
  submittedById         String                @map("submitted_by_id") @db.Uuid
  slipFileKey           String                @map("slip_file_key")
  studentStatedTotal    Decimal               @map("student_stated_total") @db.Decimal(12, 2)
  verifiedAmount        Decimal?              @map("verified_amount") @db.Decimal(12, 2)
  unallocatedExcess     Decimal               @default(0) @map("unallocated_excess") @db.Decimal(12, 2)
  excessDispositionNote String?               @map("excess_disposition_note")
  isDuplicateFlag       Boolean               @default(false) @map("is_duplicate_flag")
  duplicateCandidateIds String[]              @map("duplicate_candidate_ids") @db.Uuid
  unmatchedNotes        String?               @map("unmatched_notes")
  unmatchedResolvedAt   DateTime?             @map("unmatched_resolved_at")
  unmatchedResolvedById String?               @map("unmatched_resolved_by_id") @db.Uuid
  status                PaymentSubmissionStatus @default(SUBMITTED)
  claimedById           String?               @map("claimed_by_id") @db.Uuid
  claimedAt             DateTime?             @map("claimed_at")
  auditTrail            Json                  @default("[]")  // JSONB array, bounded
  evidenceItems         EvidenceItem[]
  allocations           PaymentAllocation[]
  createdAt             DateTime              @default(now()) @map("created_at")
  @@map("payment_submissions")
}

model EvidenceItem {
  id           String   @id @default(uuid()) @db.Uuid
  submissionId String   @map("submission_id") @db.Uuid
  fileKey      String   @map("file_key")
  uploadedAt   DateTime @map("uploaded_at")
  uploadedById String   @map("uploaded_by_id") @db.Uuid
  submission   PaymentSubmission @relation(fields: [submissionId], references: [id])
  @@map("evidence_items")
}

model PaymentAllocation {
  id           String           @id @default(uuid()) @db.Uuid
  submissionId String           @map("submission_id") @db.Uuid
  lineItemId   String           @map("line_item_id") @db.Uuid
  allocatedAmount Decimal       @map("allocated_amount") @db.Decimal(12, 2)
  status       AllocationStatus @default(PENDING)
  submission   PaymentSubmission @relation(fields: [submissionId], references: [id])
  @@map("payment_allocations")
}

model AccessEntitlement {
  id            String   @id @default(uuid()) @db.Uuid
  studentId     String   @map("student_id") @db.Uuid
  courseId      String   @map("course_id") @db.Uuid
  billingPeriod String   @map("billing_period")  // YYYY-MM
  activatedAt   DateTime @map("activated_at")
  activatedById String   @map("activated_by_id") @db.Uuid  // FK → payment_allocations
  @@unique([studentId, courseId, billingPeriod])
  @@map("access_entitlements")
}

model Resource {
  id            String   @id @default(uuid()) @db.Uuid
  courseId      String   @map("course_id") @db.Uuid
  billingPeriod String   @map("billing_period")
  type          ResourceType
  titleEn       String   @map("title_en")
  titleSi       String?  @map("title_si")
  // ZOOM_SESSION fields
  meetingId     String?  @map("meeting_id")
  password      String?
  link          String?
  schedule      String?
  // STUDY_MATERIAL fields
  fileKey       String?  @map("file_key")
  filename      String?
  // RECORDING fields
  url           String?
  isPublished   Boolean? @map("is_published")
  lastConfirmedAvailableAt DateTime? @map("last_confirmed_available_at")
  createdAt     DateTime @default(now()) @map("created_at")
  @@map("resources")
}

model DuplicateReview {
  id                 String              @id @default(uuid()) @db.Uuid
  incomingRecord     Json                @map("incoming_record")
  existingCandidates Json                @map("existing_candidates")
  status             DuplicateReviewStatus @default(PENDING)
  resolvedById       String?             @map("resolved_by_id") @db.Uuid
  resolvedAt         DateTime?           @map("resolved_at")
  resolutionNotes    String?             @map("resolution_notes")
  createdAt          DateTime            @default(now()) @map("created_at")
  @@map("duplicate_reviews")
}

model MigrationBatch {
  id         String              @id @default(uuid()) @db.Uuid
  createdById String             @map("created_by_id") @db.Uuid
  createdAt  DateTime            @default(now()) @map("created_at")
  status     MigrationBatchStatus @default(PENDING)
  totalRows  Int                 @default(0) @map("total_rows")
  processed  Int                 @default(0)
  succeeded  Int                 @default(0)
  failed     Int                 @default(0)
  errors     Json                @default("[]")
  rows       MigrationRow[]
  @@map("migration_batches")
}

model MigrationRow {
  id                String           @id @default(uuid()) @db.Uuid
  batchId           String           @map("batch_id") @db.Uuid
  rowNumber         Int              @map("row_number")
  rawData           Json             @map("raw_data")
  status            MigrationRowStatus @default(QUEUED)
  epId              String?          @map("ep_id")
  duplicateReviewId String?          @map("duplicate_review_id") @db.Uuid
  errorMessage      String?          @map("error_message")
  batch             MigrationBatch   @relation(fields: [batchId], references: [id])
  @@map("migration_rows")
}

model Notification {
  id          String   @id @default(uuid()) @db.Uuid
  recipientId String   @map("recipient_id") @db.Uuid
  type        String
  params      Json
  body        String   // rendered at write time in recipient's language
  read        Boolean  @default(false)
  createdAt   DateTime @default(now()) @map("created_at")
  @@map("notifications")
}

model AuditEvent {
  id         String   @id @default(uuid()) @db.Uuid
  actorId    String?  @map("actor_id") @db.Uuid
  action     String
  targetType String?  @map("target_type")
  targetId   String?  @map("target_id")
  changes    Json     @default("{}")
  createdAt  DateTime @default(now()) @map("created_at")
  // No update or delete — append-only enforced at service layer
  @@map("audit_events")
}

model SystemSetting {
  key       String @id
  value     Json
  updatedAt DateTime @updatedAt @map("updated_at")
  @@map("system_settings")
}

model JobLock {
  id         String   @id  // e.g. 'invoice-batch', 'mark-overdue'
  lockedUntil DateTime @map("locked_until")
  // Advisory locks (pg_try_advisory_lock) are preferred; this table
  // serves as a fallback observable lock log.
  @@map("job_locks")
}

model JobLog {
  id             String   @id @default(uuid()) @db.Uuid
  jobName        String   @map("job_name")
  startedAt      DateTime @map("started_at")
  completedAt    DateTime? @map("completed_at")
  billingMonth   String?  @map("billing_month")
  itemsProcessed Int      @default(0) @map("items_processed")
  errors         Json     @default("[]")
  @@map("job_logs")
}
```

**Enums (defined in `schema.prisma`):**
`Role`: STUDENT | TEACHER | FINANCE_ADMIN | ADMINISTRATOR | SUPER_ADMIN
`AccountState`: PENDING_ACTIVATION | ACTIVE | SUSPENDED | DISABLED
`EnrollmentStatus`: ACTIVE | WITHDRAWN
`InvoiceStatus`: UNPAID | PARTIAL | PAID | OVERDUE
`LineItemPaymentStatus`: UNPAID | PARTIAL | PAID
`PaymentSubmissionStatus`: SUBMITTED | UNDER_REVIEW | APPROVED | REQUIRES_CLARIFICATION | REJECTED | UNMATCHED
`AllocationStatus`: PENDING | APPROVED | REJECTED
`ResourceType`: ZOOM_SESSION | STUDY_MATERIAL | RECORDING
`DuplicateReviewStatus`: PENDING | CONFIRMED_NEW | MERGED | DEFERRED
`MigrationBatchStatus`: PENDING | PROCESSING | COMPLETED | COMPLETED_WITH_ERRORS
`MigrationRowStatus`: QUEUED | PROCESSED | FAILED | FLAGGED

**Design decisions:**
- `audit_trail` and `evidence_items` on `PaymentSubmission`: `auditTrail` kept as JSONB column (bounded size, always read together). `evidence_items` promoted to a separate table for cleaner querying (each item has its own presigned URL generation).
- `duplicate_reviews.incomingRecord` and `existingCandidates`: JSONB; natural for snapshots that vary by context.
- `migration_batches.errors` and `job_logs.errors`: JSONB arrays (bounded, structured error objects).
- All money columns: `Decimal @db.Decimal(12,2)`. Never `Float`. This maps to PostgreSQL `NUMERIC(12,2)` — exact arithmetic, no floating-point rounding errors.
- All IDs: UUID v4 (`@default(uuid())`). Portable across database backends. Never sequential integers (avoids enumeration attacks on resource IDs).
- `billing_period` and `billing_month` stored as `VARCHAR YYYY-MM` string — timezone-independent, queryable as string, sortable lexicographically.

---

## Security and Threat Model _(Updated for NestJS/PostgreSQL)_

| Threat | Control |
|---|---|
| Credential brute-force | AD-14: Redis dual-key rate limit — 30/IP/15 min, 5/epId/15 min |
| Session hijack | AD-3: HTTP-only Secure cookie; 15-min access token; refresh rotation |
| Cross-origin cookie | AD-3 note: `SameSite` from env; JWT in Authorization header for all API calls |
| Social-engineering recovery | AD-48: recovery rate limit 3/24h; admin confirmation checkbox; AuditEvent |
| Activation token replay | AD-38: bcrypt-hashed; single-use with `used_at`; 48h expiry |
| Internal job endpoint abuse | AD-33/42: `CRON_SECRET` (GET) / `INTERNAL_JOB_SECRET` (POST); not in RBAC or Swagger |
| IDOR | All queries scoped to `req.user.id`; ownership validated in guard/service before query |
| Payment slip manipulation | Finance Admin verifies against bank independently; client amounts rejected |
| Duplicate financial approval | `UNIQUE (student_id, course_id, billing_period)` + Prisma transaction (AD-11) |
| Unauthorized file access | Presigned GET after entitlement check; no raw R2 URL (AD-35) |
| Unmatched payment abuse | AD-40: `UNMATCHED` status; Finance Admin adjudication required |
| XSS | Helmet CSP; React escapes output |
| CSRF | `SameSite` + JWT in Authorization header (cookie only for refresh) |
| SQL injection | Prisma parameterized queries + Zod validation before every DB op (AD-23) |
| Privilege escalation | Role re-validated from DB on sensitive operations; no client-supplied role accepted |
| Secret exposure | Vercel/Railway env vars; `.env` gitignored |
| Malicious file upload | MIME validation + `/complete` size check (AD-35) |
| ToS violation | AD-37: Vercel Pro required for production |

---

## API Conventions _(Unchanged from v6)_

- Base: `/api/v1/`
- Auth: `Authorization: Bearer <access_token>` on all protected routes
- Refresh: `POST /api/v1/auth/refresh` — reads HTTP-only cookie
- Pagination: `?page=1&pageSize=20` → `{ data, total, page, pageSize }`
- Error: `{ code, params?, requestId }`
- File upload: presigned PUT via AD-35
- Internal jobs (Vercel Cron): `GET /api/v1/internal/jobs/*` — `Bearer $CRON_SECRET`; non-cacheable; not in Swagger
- Internal jobs (manual recovery): `POST /api/v1/internal/jobs/*` — `Bearer $INTERNAL_JOB_SECRET`; not in Swagger

---

## Capacity Model _(Updated)_

| Tier | MAU | Peak logins (5 min) | Backend |
|---|---|---|---|
| Small | 200 | ~30 | Vercel serverless or Railway Starter |
| Medium | 2,000 | ~200 | Vercel Pro or Railway Pro |
| Large | 10,000 | ~800 | Vercel Pro + Neon scale tier or Railway scaled |

**Neon connection pooler:** Neon's built-in PgBouncer handles serverless connection bursts. At MVP scale (~200 MAU), connection pressure is negligible. At 2,000 MAU, `connection_limit=5` per serverless instance is safe.

**bcrypt cost 12:** ~8–12 hashes/sec/core. 0.67 logins/sec at MVP peak — well within capacity.

**Provisional SLAs:** Login P95 ≤ 1000 ms; Dashboard P95 ≤ 800 ms; Invoice batch (~200 students) < 30 s.

---

## Testing Strategy _(Updated for NestJS/PostgreSQL)_

| Layer | Tool | Scope |
|---|---|---|
| Unit | Vitest + `@nestjs/testing` | Services: invoice dedup, allocation math, access evaluation, ID gen, error codes, activation token logic, overdue computation. Mock `PrismaService` for unit isolation. |
| Integration | Vitest + real PostgreSQL (Docker / Neon dev branch) | Routes, auth guards, payment transaction, entitlement creation, role guards, job lock, duplicate detection, migration row pipeline. Use `PrismaClient` against a test database seeded with `prisma migrate reset`. |
| E2E | Playwright | UJ-1–UJ-5; each in `en` + `si`; light + dark |
| i18n gate | `validate-i18n.ts` (CI) | Key completeness per namespace |
| Load | k6 (staging) | 100 concurrent logins/60s; NFR-PERF-004 |
| Accessibility | axe-core (Playwright) | WCAG 2.1 AA on critical pages |
| Job services | Vitest | InvoiceJobService: idempotency (ON CONFLICT), advisory lock, catch-up no-op, missed-month recovery. OverdueJobService: idempotency, timezone correctness, notification dedup. |
| Pagination | Integration | Assert pagination params on all list endpoints |

**Note on integration test database:** Use a local PostgreSQL container via Docker Compose, or a dedicated Neon dev branch. Run `prisma migrate reset` before each test suite. No `pg-mem` or in-memory database — test against the real engine.

---

## CI/CD and Deployment _(Updated)_

```mermaid
graph LR
  DEV[Branch] -->|PR| CI[GitHub Actions — full gate]
  CI -->|Pass| MAIN[main]
  MAIN -->|Auto| VFE[Vercel Frontend]
  MAIN -->|Auto| VBE[Vercel Backend]
  MAIN -->|Optional| RBE[Railway / Render]
```

**CI gate:** TypeScript check → ESLint + Prettier → Prisma schema validate → Vitest → `validate-i18n.ts` → Playwright E2E smoke → `redocly lint` (on generated spec).

**Prisma migrations:** `prisma migrate deploy` runs in the CI/CD deploy step using `DIRECT_DATABASE_URL` (bypassing pooler). Never run against the pooler connection string.

**Railway/Render:** build `pnpm install --frozen-lockfile && pnpm build && npx prisma migrate deploy`; start `node dist/main.js`; health `GET /api/v1/health`.

**Rollback:** Vercel instant rollback (code); Neon PITR for data.

---

## Monitoring and Operations _(Unchanged from v6)_

- **Logs:** Pino JSON → Vercel log drain → Logtail or Axiom
- **Errors:** Sentry (backend + frontend)
- **Uptime:** Better Uptime or UptimeRobot
- **DB:** Neon dashboard; slow-query alerts from pg_stat_statements
- **Health:** `GET /api/v1/health` → `{ status:'ok', db:'connected', version }`
- **Jobs:** `job_logs` table; alert on `errors` array length > 0

---

## Architecture Risks _(Updated v7)_

| Risk | Likelihood | Severity | Mitigation |
|---|---|---|---|
| Vercel cold-start P99 at class-start burst | Low | Medium | Fluid Compute (Pro) keeps instance warm; Neon pooler absorbs connection bursts |
| Prisma schema migration conflict in CI | Low | Medium | Neon dev branches allow branch-per-PR migration testing; `prisma migrate deploy` in CI |
| Neon connection pooler in transaction mode incompatible with Prisma interactive transactions | Low | High | Neon pooler in transaction mode IS compatible with Prisma interactive transactions (unlike session mode); verify with an integration test |
| Double invoice if advisory lock not acquired | Low | High | AD-33: `pg_try_advisory_lock` is atomic; idempotent upsert (`ON CONFLICT`) as secondary guard; daily catch-up as recovery net |
| Sinhala translation quality | Medium | High | AD-30 CI gate prevents missing keys |
| OD-LEGAL-* not cleared before launch | Unknown | Critical | Hard production gate (Story 9.6) |
| Migration data quality | High | Medium | Row-level failure isolation; DuplicateReview queue; UNVERIFIED import status |
| `NUMERIC` precision edge case in cumulative allocation | Low | High | Integration tests for partial payment math; never use JavaScript `number` for money — always `Decimal.js` or string-based arithmetic |

---

## Open Questions _(Updated v7)_

| # | Question | Status |
|---|---|---|
| OQ-1 | Which contact field (email or phone) is promoted for future self-service account recovery? | Open |
| OQ-2 | Neon production cost at 2,000 MAU acceptable? Fallback: Render or Railway PostgreSQL add-on. | Confirm before production |
| OQ-3 | Vercel Pro ($20/month) accepted for commercial production? | Required before production deployment |
| OQ-4 | Vercel cold-start P99 acceptable? (confirmed by staging load test) | No build blocker |
| OQ-5 | OD-LEGAL-01–04 legal gates. | Hard production gate — Story 9.6 |
| OQ-6 (new v7) | AD-3 SameSite policy: confirm deployment domain arrangement before production. `COOKIE_SAME_SITE` env var allows configuration without redeploy. | Confirm before production |

---

## Deferred _(Unchanged from v6, updated references)_

- Self-service account recovery (email/phone field decision unresolved — admin-initiated reset is MVP floor)
- Data residency legal detail (Singapore provisionally satisfies; OD-LEGAL-04 is production gate)
- Numerical SLAs confirmed by staging load test before production release
- Dual-approval payment verification (excluded from MVP per BR-PAY-02)
- Payment gateway integration (OD-FUTURE-03)
- Guardian account implementation (data model has FK slot; no MVP code)
- Actual Sinhala translation content (architecture-managed structure; content is institute deliverable)
- Virus scanning on uploaded files (R2 policy enforces MIME and size at MVP)
- WebSocket / SSE for real-time notifications (polling strategy AD-50 is MVP)
- Materialized views for reporting (revisit at ~10,000 MAU; AD-45)
- WCAG 2.2 AA gap items (no blocking gaps per EXPERIENCE.md; deferred gaps recorded)
- Sinhala-aware full-text search (substring match acceptable at MVP)
- Vercel cold-start optimization (revisit if staging load test shows unacceptable P99)

---

## Sign-Off Attestation _(v7 — 2026-10-24)_

| Condition | Status |
|---|---|
| Decision 1: Neon PostgreSQL + Prisma approved | ✅ Applied — all MongoDB/Mongoose references replaced |
| Decision 2: Subject/Grade merged into CourseModule | ✅ Applied — no standalone SubjectModule or GradeModule |
| Decision 3: Teacher admin merged into AdminModule | ✅ Applied — 14 modules → 13; Teacher role/dashboards preserved |
| Decision 4: @nestjs/swagger decorator-driven OpenAPI | ✅ Applied — AD-21 amended |
| NestJS 11 + Express adapter specified | ✅ AD-2 amended |
| PostgreSQL advisory locks replace MongoDB distributed locks | ✅ AD-33/42 updated |
| Money stored as NUMERIC(12,2) — no floats | ✅ Prisma model seed |
| UUID v4 identifiers throughout | ✅ Prisma model seed |
| Neon pooler + direct connection documented | ✅ AD-32 amended |
| Frontend stack unchanged | ✅ Verified |
| All 52 ADs preserved (with amendments noted) | ✅ Verified |
| All financial invariants and security controls preserved | ✅ Verified |

**Architecture Spine status: `final` (v7).**
