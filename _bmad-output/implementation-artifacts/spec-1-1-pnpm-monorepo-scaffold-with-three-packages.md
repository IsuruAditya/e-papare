---
title: 'Story 1.1: pnpm Monorepo Scaffold with Three Packages'
type: 'chore'
created: '2026-10-24'
status: 'in-progress'
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
- [ ] Create implementation branch `feat/story-1-1-monorepo-scaffold`
- [ ] `pnpm-workspace.yaml` (root) — create with `packages: ['packages/*']`
- [ ] `tsconfig.base.json` (root) — create with strict settings: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `skipLibCheck: true`, `esModuleInterop: true`
- [ ] `.nvmrc` (root) — create with value `24` (or exact LTS patch version)
- [ ] `.gitignore` (root) — create covering `node_modules`, `dist`, `.env*`, `*.local`, `.DS_Store`; explicitly allow `prisma/migrations/`
- [ ] `docker-compose.yml` (root) — create with `postgres:16` service; env vars `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`; port `5432:5432`; named volume
- [ ] `packages/shared-types/package.json` — create with `name: "@e-papere/shared-types"`, `private: true`, `main: "./src/index.ts"`, deps: `{ "zod": "^3.23.8" }`, scripts: `typecheck`, `build`
- [ ] `packages/shared-types/tsconfig.json` — extends `../../tsconfig.base.json`; `moduleResolution: "bundler"`; `outDir: "./dist"`
- [ ] `packages/shared-types/src/index.ts` — create as empty barrel (`export {};`)
- [ ] `packages/backend/package.json` — create with `name: "@e-papere/backend"`, `private: true`; runtime deps: `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`, `@nestjs/config`, `@nestjs/jwt`, `@nestjs/swagger`, `@prisma/client`, `pino`, `pino-http`, `express-rate-limit`, `rate-limit-redis`, `helmet`, `bcrypt`, `uuid`, `reflect-metadata`, `rxjs`; devDeps: `prisma`, `@nestjs/testing`, `@types/bcrypt`, `@types/uuid`, `@types/node`, `typescript`, `ts-node`; scripts: `build`, `start`, `typecheck`
- [ ] `packages/backend/tsconfig.json` — extends root base; add `"emitDecoratorMetadata": true`, `"experimentalDecorators": true`; `"module": "commonjs"`, `"target": "ES2022"`, `"outDir": "./dist"`
- [ ] `packages/backend/src/main.ts` — create minimal placeholder (comment only, no real NestJS bootstrap yet — that is Story 1.8)
- [ ] `packages/frontend/package.json` — create with `name: "@e-papere/frontend"`, `private: true`; deps: `react`, `react-dom`, `react-router-dom` (v7), `@tanstack/react-query` (v5), `react-hook-form`, `react-i18next`, `i18next`; devDeps: `vite`, `@vitejs/plugin-react`, `typescript`, `tailwindcss` (v4), `@tailwindcss/vite`, `@types/react`, `@types/react-dom`; scripts: `dev`, `build`, `typecheck`
- [ ] `packages/frontend/tsconfig.json` — extends root base; `"jsx": "react-jsx"`, `"moduleResolution": "bundler"`, `"target": "ES2022"`, `"lib": ["ES2022", "DOM", "DOM.Iterable"]`
- [ ] `packages/frontend/vite.config.ts` — `@vitejs/plugin-react` + `@tailwindcss/vite`; no other plugins
- [ ] `packages/frontend/index.html` — standard Vite HTML entry referencing `src/main.tsx`
- [ ] `packages/frontend/src/main.tsx` — minimal `ReactDOM.createRoot` render of `<App />`
- [ ] `packages/frontend/src/App.tsx` — minimal functional component returning `<div>e-Paperé</div>`
- [ ] Run `pnpm install` from root and verify it exits 0
- [ ] Run `pnpm -r typecheck` and verify it exits 0
- [ ] Update sprint-status.yaml: `epic-1` → `in-progress`; `1-1-pnpm-monorepo-scaffold-with-three-packages` → `done`

**Acceptance Criteria:**
- Given a clean checkout, when `pnpm install` is run from the root, then all three packages install without errors and a single `pnpm-lock.yaml` is created at the root.
- Given `packages/shared-types/package.json`, when its `dependencies` key is inspected, then `zod` is the only entry; `@prisma/client`, any NestJS package, and any React package are absent.
- Given any TypeScript file in any package, when a type error is introduced, then `pnpm -r typecheck` exits non-zero and reports the file and line.
- Given `docker-compose.yml` at root, when `docker compose up -d postgres` is run, then a `postgres:16` container starts and is accessible at `localhost:5432`.
- Given `.gitignore` at root, when inspected, then `packages/backend/prisma/migrations/` is NOT excluded (migrations are version-controlled).

## Implementation Notes

## Spec Change Log

## Review Triage Log

## Verification

**Commands:**
- `pnpm install` from root — expected: exits 0, `pnpm-lock.yaml` created
- `pnpm -r typecheck` — expected: exits 0 across all three packages
- `docker compose up -d postgres` — expected: container starts, port 5432 accessible
- Inspect `packages/shared-types/package.json` — expected: only `zod` in `dependencies`
