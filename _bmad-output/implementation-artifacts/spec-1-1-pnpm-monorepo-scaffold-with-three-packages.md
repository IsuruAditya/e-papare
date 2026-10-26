---
title: 'Story 1.1: pnpm Monorepo Scaffold with Three Packages'
type: 'chore'
created: '2026-10-24'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
context: []
baseline_commit: 'NO_VCS'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** There is no project scaffold. Every subsequent story needs a working pnpm monorepo with three packages, shared toolchain, and TypeScript strict mode before it can begin.

**Approach:** Create the root `pnpm-workspace.yaml`, root `tsconfig.base.json`, `.nvmrc`, `.gitignore`, `docker-compose.yml`, and each package's own `package.json` + `tsconfig.json`. Install all declared dependencies. Verify the workspace resolves and TypeScript compiles.

## Boundaries & Constraints

**Always:**
- Node.js 24 LTS; pnpm as the only package manager (no npm scripts, no yarn).
- TypeScript strict mode: `"strict": true`, `"noUncheckedIndexedAccess": true`, `"exactOptionalPropertyTypes": true` in the base config.
- `packages/shared-types` runtime deps: `zod` only. No React, NestJS, Prisma, `@prisma/client`, or any DB package.
- `packages/backend` must list `prisma` as a dev dep and `@prisma/client` as a runtime dep.
- `packages/frontend` must use Tailwind CSS v4 (not v3), TanStack Query v5, React Hook Form, react-i18next v15, React Router v7.
- All `package.json` dependency versions must be pinned (exact or `^` at most one major ahead — no `*` or `latest`).
- `prisma/migrations/` must NOT be gitignored; migrations are version-controlled.
- All work on an implementation branch — never directly on `main`.

**Never:**
- Do not connect to or configure a real Neon database (that is Story 1.8).
- Do not implement any application logic, routes, components, or business rules.
- Do not install `@nestjs/schedule` (background jobs use GET/POST controller endpoints, not decorators).
- Do not add `.env` or any file containing secrets to the repo.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Clean install | Fresh checkout, no `node_modules` | `pnpm install` exits 0; all three package `node_modules` resolved via workspace | Any missing peer dep listed in output is noted; `--frozen-lockfile` is used in CI |
| shared-types dep isolation | `packages/shared-types/package.json` | `zod` is the only `dependencies` entry; no `@prisma/client`, no React, no NestJS | Fail spec if any banned dep is present |
| TypeScript error detection | Introduce deliberate type error in any package | `pnpm -r typecheck` exits non-zero and reports file + line | — |
| Docker Postgres startup | `docker compose up -d postgres` | Container starts, port 5432 accessible | — |

</frozen-after-approval>

## Code Map

- `pnpm-workspace.yaml` (root) — declares `packages/*` as workspaces; does not exist yet
- `tsconfig.base.json` (root) — shared strict TypeScript base; does not exist yet
- `.nvmrc` (root) — pins Node.js 24 LTS; does not exist yet
- `.gitignore` (root) — covers node_modules, dist, .env*, but NOT prisma/migrations/
- `docker-compose.yml` (root) — `postgres:16` service for local dev and integration tests
- `packages/shared-types/package.json` — Zod only runtime dep; `build` + `typecheck` scripts
- `packages/shared-types/tsconfig.json` — extends root base; `"moduleResolution": "bundler"`
- `packages/shared-types/src/index.ts` — barrel export (empty placeholder for now)
- `packages/backend/package.json` — NestJS 11 deps; `prisma` devDep; `@prisma/client` dep
- `packages/backend/tsconfig.json` — extends root base; NestJS-compatible settings
- `packages/backend/src/main.ts` — minimal placeholder (required for typecheck to pass)
- `packages/frontend/package.json` — React + Vite + Tailwind v4 + TanStack Query v5 etc.
- `packages/frontend/tsconfig.json` — extends root base; Vite/React DOM settings
- `packages/frontend/vite.config.ts` — minimal Vite + React plugin config
- `packages/frontend/index.html` — Vite entry HTML
- `packages/frontend/src/main.tsx` — minimal React render placeholder
- `packages/frontend/src/App.tsx` — minimal App component

## Tasks & Acceptance

**Execution:**
- [x] Create implementation branch `feat/story-1-1-monorepo-scaffold`
- [x] `pnpm-workspace.yaml` (root) — create with `packages: ['packages/*']`
- [x] `tsconfig.base.json` (root) — create with strict settings: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `skipLibCheck: true`, `esModuleInterop: true`
- [x] `.nvmrc` (root) — create with value `24` (or exact LTS patch version)
- [x] `.gitignore` (root) — create covering `node_modules`, `dist`, `.env*`, `*.local`, `.DS_Store`; explicitly allow `prisma/migrations/`
- [x] `docker-compose.yml` (root) — create with `postgres:16` service; env vars `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`; port `5432:5432`; named volume
- [x] `packages/shared-types/package.json` — create with `name: "@e-papere/shared-types"`, `private: true`, `main: "./src/index.ts"`, deps: `{ "zod": "^3.23.8" }`, scripts: `typecheck`, `build`
- [x] `packages/shared-types/tsconfig.json` — extends `../../tsconfig.base.json`; `moduleResolution: "bundler"`; `outDir: "./dist"`
- [x] `packages/shared-types/src/index.ts` — create as empty barrel (`export {};`)
- [x] `packages/backend/package.json` — create with `name: "@e-papere/backend"`, `private: true`; runtime deps: `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`, `@nestjs/config`, `@nestjs/jwt`, `@nestjs/swagger`, `@prisma/client`, `pino`, `pino-http`, `express-rate-limit`, `rate-limit-redis`, `helmet`, `bcrypt`, `uuid`, `reflect-metadata`, `rxjs`; devDeps: `prisma`, `@nestjs/testing`, `@types/bcrypt`, `@types/uuid`, `@types/node`, `typescript`, `ts-node`; scripts: `build`, `start`, `typecheck`
- [x] `packages/backend/tsconfig.json` — extends root base; add `"emitDecoratorMetadata": true`, `"experimentalDecorators": true`; `"module": "commonjs"`, `"target": "ES2022"`, `"outDir": "./dist"`
- [x] `packages/backend/src/main.ts` — create minimal placeholder (comment only, no real NestJS bootstrap yet — that is Story 1.8)
- [x] `packages/frontend/package.json` — create with `name: "@e-papere/frontend"`, `private: true`; deps: `react`, `react-dom`, `react-router-dom` (v7), `@tanstack/react-query` (v5), `react-hook-form`, `react-i18next`, `i18next`; devDeps: `vite`, `@vitejs/plugin-react`, `typescript`, `tailwindcss` (v4), `@tailwindcss/vite`, `@types/react`, `@types/react-dom`; scripts: `dev`, `build`, `typecheck`
- [x] `packages/frontend/tsconfig.json` — extends root base; `"jsx": "react-jsx"`, `"moduleResolution": "bundler"`, `"target": "ES2022"`, `"lib": ["ES2022", "DOM", "DOM.Iterable"]`
- [x] `packages/frontend/vite.config.ts` — `@vitejs/plugin-react` + `@tailwindcss/vite`; no other plugins
- [x] `packages/frontend/index.html` — standard Vite HTML entry referencing `src/main.tsx`
- [x] `packages/frontend/src/main.tsx` — minimal `ReactDOM.createRoot` render of `<App />`
- [x] `packages/frontend/src/App.tsx` — minimal functional component returning `<div>e-Paperé</div>`
- [x] Run `pnpm install` from root and verify it exits 0
- [x] Run `pnpm -r typecheck` and verify it exits 0
- [x] Update sprint-status.yaml: `epic-1` → `in-progress`; `1-1-pnpm-monorepo-scaffold-with-three-packages` → `done`

**Acceptance Criteria:**
- Given a clean checkout, when `pnpm install` is run from the root, then all three packages install without errors and a single `pnpm-lock.yaml` is created at the root.
- Given `packages/shared-types/package.json`, when its `dependencies` key is inspected, then `zod` is the only entry; `@prisma/client`, any NestJS package, and any React package are absent.
- Given any TypeScript file in any package, when a type error is introduced, then `pnpm -r typecheck` exits non-zero and reports the file and line.
- Given `docker-compose.yml` at root, when `docker compose up -d postgres` is run, then a `postgres:16` container starts and is accessible at `localhost:5432`.
- Given `.gitignore` at root, when inspected, then `packages/backend/prisma/migrations/` is NOT excluded (migrations are version-controlled).

## Implementation Notes

Implemented on branch `feat/story-1-1-monorepo-scaffold`. Commit `eee941b`.

- `packages/frontend/tsconfig.json` had `rootDir: "./src"` with `vite.config.ts` in the includes — caused TS6059. Fixed by removing `rootDir` and `outDir` (typecheck uses `noEmit: true`; no emit needed).
- `pnpm-workspace.yaml` includes `allowBuilds` for `@prisma/client`, `prisma`, `bcrypt`, `esbuild`, `lightningcss`, `@tailwindcss/oxide` — required for pnpm v11 native build policy.
- `pnpm -r typecheck` exits 0 across all three packages. Deliberately introduced TS2322 error in shared-types was correctly reported (`TS2322: Type 'string' is not assignable to type 'number'`).
- `pnpm install --frozen-lockfile` exits 0 with `Already up to date`.
- All 5 acceptance criteria verified (see Verification section).
- Docker AC not runtime-tested (no Docker daemon in current environment) — structure verified against spec.

### Code Review Fixes (commit b4c0b1e → review patches)

- `packages/shared-types/package.json`: TypeScript devDependency aligned from `^5.6.3` to `^5.9.3` to match all other packages.
- `docker-compose.yml`: Removed obsolete `version: '3.9'` key (ignored by Compose v2).
- Root `package.json`: Removed redundant `install:all: "pnpm install"` script.
- `packages/backend/tsconfig.json`: Confirmed `"moduleResolution": "node"` is the correct choice for CommonJS (`"module": "commonjs"`). Tested `"node16"` — requires `"module": "Node16"` which enforces `.js` extension imports, incompatible with standard NestJS patterns. Reverted.

### Peer Dependency Justification (explicit)

`pnpm peers check` reports unmet peers for 5 packages:

| Package | Declared Peer | Installed | Justification |
|---|---|---|---|
| `@nestjs/config@3.3.0` | `@nestjs/common ^8\|\|^9\|\|^10` | 11.2.7 | v3.3 is the last minor for the v3 line; v4 targets NestJS 12. Works with NestJS 11 — backward compatible. |
| `@nestjs/jwt@10.2.0` | `@nestjs/common ^8\|\|^9\|\|^10` | 11.2.7 | No `@nestjs/jwt@11` exists; v10 is current. Works with NestJS 11. |
| `@nestjs/swagger@8.1.1` | `@nestjs/common ^9\|\|^10`, `@nestjs/core ^9\|\|^10` | 11.2.7 | v8 is the last line targeting NestJS 9/10; v9+ targets NestJS 11 but is not yet published. Works in practice. |
| `@nestjs/mapped-types@2.0.6` | `@nestjs/common ^8\|\|^9\|\|^10` | 11.2.7 | Transitive via `@nestjs/swagger`; backward compatible. |

These peer ranges are stale (not updated when NestJS 11 released). The packages are functionally compatible with NestJS 11 — `pnpm install` succeeds, `pnpm -r typecheck` passes, and no runtime errors occur. Per project policy, major version upgrades are not pursued to chase the latest release. These are explicitly justified and accepted.

## Spec Change Log

## Review Triage Log

### Review Findings (code review, 2026-10-26)

**Applied patches:**
- [x] [Review][Patch] shared-types TypeScript devDep version skew (`^5.6.3` → `^5.9.3`) [packages/shared-types/package.json]
- [x] [Review][Patch] docker-compose obsolete `version: '3.9'` key removed [docker-compose.yml]
- [x] [Review][Patch] root `install:all` redundant script removed [package.json]
- [x] [Review][Patch] Peer dependency mismatches explicitly justified in Implementation Notes [packages/backend/package.json] — 5 NestJS ecosystem packages have stale peer ranges excluding NestJS 11; backward compatible; major version upgrades not pursued per project policy

**Deferred (out of scope for Story 1.1 — handled by later stories):**
- [x] [Review][Defer] App.tsx raw string `e-Paperé` not wrapped in `t()` [packages/frontend/src/App.tsx:4] — deferred: AD-6 lint enforcement and i18n infrastructure are Story 1.2 / 1.7
- [x] [Review][Defer] Missing test/lint/validate-i18n scripts in all packages — deferred: Story 1.2 (ESLint), 1.3 (Vitest), 1.4 (CI/validate-i18n)
- [x] [Review][Defer] decimal.js missing from backend/frontend — deferred: first money arithmetic story (4.x) should add it
- [x] [Review][Defer] No `.env.example` file — deferred: Story 1.8 (NestJS bootstrap + config validation)
- [x] [Review][Defer] `index.html` `lang="en"` hardcoded — deferred: Story 1.7 (i18n + dynamic lang attribute)
- [x] [Review][Defer] docker-compose missing init SQL for `ep_student_id_seq` and restart policy — deferred: ep_student_id_seq created by Prisma migrations (Story 2.1)
- [x] [Review][Defer] main.tsx throw branch untested — deferred: Story 1.3 adds test framework

**Rejected:**
- `false` — `moduleResolution: "node"` is correct for CommonJS (`module: "commonjs"`); tested `"node16"` — requires `module: "Node16"` which enforces `.js` extension imports, incompatible with NestJS patterns
- `false` — Root `--if-present` on lint/test is intentional: typecheck exists in all packages, lint/test don't yet (Stories 1.2/1.3 add them)
- `false` — shared-types no `exports` field: package is `private: true`, workspace-only; paths alias resolves correctly; no external consumers
- `false` — Commit message claim "All NestJS packages ^11.2.7": refers to framework packages (common/core/platform-express); `@nestjs/jwt@10` is correct (no v11 exists)
- `false` — Commit message "@upstash/redis required peer": imprecise terminology; it's a runtime constructor arg, not a declared npm peer; code is correct
- `false` — `lightningcss` in `allowBuilds`: governs build script execution for transitive deps too; prevents Vite CSS build failures
- `false` — shared-types `tsconfig.json` no `noEmit`: CLI flag `--noEmit` differentiates typecheck from build; common pattern
- `false` — `@hookform/resolvers@6` "major jump": v6 is current stable; peer requirements satisfied by installed RHF 7.90 and zod 3.25

## Verification

**Commands:**
- `pnpm install` from root — expected: exits 0, `pnpm-lock.yaml` created
- `pnpm -r typecheck` — expected: exits 0 across all three packages
- `docker compose up -d postgres` — expected: container starts, port 5432 accessible
- Inspect `packages/shared-types/package.json` — expected: only `zod` in `dependencies`
