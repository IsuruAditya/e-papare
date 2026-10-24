# Epic 1 Context: Monorepo Foundation, Design System, and CI Pipeline

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Establish the complete development foundation so every subsequent epic can build on a verified scaffold. This epic delivers: pnpm monorepo with three packages, TypeScript strict mode, ESLint/Prettier, Vitest + `@nestjs/testing` + Playwright, GitHub Actions CI with i18n and type gates, the semantic design token system (light + dark), Noto Sans Sinhala, react-i18next bilingual skeleton, all shared Zod schemas, NestJS bootstrap with Prisma + Neon PostgreSQL, and a passing CI pipeline.

## Stories

- Story 1.1: pnpm Monorepo Scaffold with Three Packages
- Story 1.2: ESLint, Prettier, and Pre-commit Hooks
- Story 1.3: Vitest and Playwright Test Framework Setup
- Story 1.4: GitHub Actions CI Pipeline with i18n and Type Gates
- Story 1.5: Semantic Design Token System and Typography
- Story 1.6: Core UI Component Library
- Story 1.7: React App Shell, Routing, and ThemeContext
- Story 1.8: NestJS Bootstrap, Prisma, Pino Logger, and Shared Zod Schemas

## Requirements & Constraints

- Three packages: `packages/frontend` (React + Vite + TypeScript + Tailwind CSS v4), `packages/backend` (NestJS 11 + TypeScript + Prisma), `packages/shared-types` (Zod schemas + TS types only — no React, NestJS, Prisma, or DB deps).
- Node.js 24 LTS across all environments; pinned in `.nvmrc` and CI matrix.
- TypeScript strict mode everywhere: `"strict": true`, `"noUncheckedIndexedAccess": true`, `"exactOptionalPropertyTypes": true`.
- Single root `pnpm-workspace.yaml`; single lockfile.
- `packages/shared-types` may only depend on `zod` at runtime. Prisma-generated types are backend-only.
- All monetary values use `NUMERIC(12,2)` / Prisma `@db.Decimal(12,2)`; never JS `number` for LKR amounts.
- Every user-facing string must go through `t()` or `<Trans>`; no raw literals in JSX.
- `validate-i18n.ts` CI gate: diffs `en/` vs `si/` per namespace; blocks PR on missing keys.
- `docker-compose.yml` provides `postgres:16` for local dev and integration tests.
- Migrations are version-controlled (`prisma/migrations/` is NOT in `.gitignore`).

## Technical Decisions

- **NestJS 11** with Express platform adapter. Vercel entrypoint: `packages/backend/api/index.ts` (thin adapter, `app.init()` not `app.listen()`). Persistent entrypoint: `src/main.ts`.
- **Prisma** with Neon PostgreSQL. `DATABASE_URL` → Neon pooler (runtime). `DIRECT_DATABASE_URL` → direct (migrations only). Never run `prisma migrate` through the pooler.
- **`@nestjs/schedule` is NOT used.** Background jobs are plain `@Injectable()` providers called by `JobsController` via GET/POST internal endpoints.
- Global providers via `APP_GUARD`, `APP_FILTER`, `APP_PIPE`, `APP_INTERCEPTOR` tokens in `AppModule` — not re-applied per controller.
- Error responses: `{ code: "ERR_*", params?, requestId }` via global `ExceptionFilter`; no English prose from backend.
- Tailwind CSS v4 dark mode: `@custom-variant dark (&:where(.dark, .dark *))` in CSS import — NOT via `tailwind.config.js darkMode` key.
- TanStack Query v5 for all frontend server state; React context for UI state only (theme, language, auth token).
- All list endpoints use `getPaginationParams(query)` from `src/shared/pagination/pagination.util.ts`; default 20, max 100.
- Rate limiting: Upstash Redis via `rate-limit-redis`; 30 req/15 min per IP, 5 req/15 min per Student ID; IP from `x-real-ip` on Vercel.
- OpenAPI: `@nestjs/swagger` decorator-driven; Swagger UI at `/api/docs` non-production only; internal `JobsController` excluded with `@ApiExcludeController()`.

## UX & Interaction Patterns

- Design tokens are authoritative in `DESIGN.md`; values copied to `src/styles/tokens.css`, never edited in isolation.
- Sinhala text containers: `min-height` not fixed `height`; `line-height: 1.75` minimum; no `text-transform: uppercase` or `letter-spacing` on Sinhala text.
- Noto Sans Sinhala self-hosted; ≤200 kB; `font-display: swap`.
- `html.dark` class toggle owned by `ThemeContext`.

## Cross-Story Dependencies

- Story 1.1 (scaffold) is a prerequisite for every other story in this and all subsequent epics.
- Story 1.2 (linting) gates the pre-commit hook on 1.1's package structure.
- Story 1.8 (NestJS bootstrap + Prisma) depends on 1.1's backend package being in place.
- Stories 1.5–1.7 (frontend design system + shell) depend on 1.1's frontend package.
- CI pipeline (1.4) depends on all preceding stories producing passing typecheck, lint, and test outputs.
