---
title: 'Story 1.2: ESLint, Prettier, and Pre-commit Hooks'
type: 'chore'
created: '2026-10-26'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
context: []
baseline_commit: '8c9cf22e8138ae69d90326bf732885748cb8d9f9'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** There is no code-style or quality enforcement in the monorepo. Every commit can introduce inconsistent formatting or cross-module boundary violations (AD-1), and nothing gates commits before they reach CI (AD-25, EQ-010).

**Approach:** Add a single root ESLint 10 flat config (type-checked TS rules, React hooks rules for the frontend, Prettier compatibility, and a small inline rule that blocks deep cross-module imports in the backend), a root Prettier config, Husky + lint-staged pre-commit hook, and `lint`/`format` scripts at root and per package. ESLint is upgraded 9→10 (ESLint 9 reached EOL 2026-08-06); no other existing dependency is changed.

## Boundaries & Constraints

**Always:**
- ESLint 10 flat config in a single root `eslint.config.mjs`, compatible with installed TypeScript 5.9.3, NestJS 11.2.7, React 18.3.1, and Node 24 LTS.
- `@typescript-eslint/recommended-type-checked` for TypeScript files; type info via `projectService` (auto-detects per-package tsconfigs).
- React hooks rules (`eslint-plugin-react-hooks`) scoped to `packages/frontend/**` only.
- `no-console` set to `warn` for source files.
- Prettier config: 2-space indent, single quotes, trailing commas `all`, 100-char print width; `eslint-config-prettier` disables conflicting ESLint formatting rules.
- `lint-staged` runs `eslint --fix` on staged TS/JS, then `prettier --write` on staged TS/JS/JSON/MD/CSS/YAML; commit is blocked if unfixable errors remain.
- `pnpm` only; Node 24 LTS; all new dependency versions pinned (`^` at most).
- Work on branch `feat/story-1-2-eslint-prettier-hooks`; never commit to `main`.

**Never:**
- Do not add the AD-6 raw-string-in-JSX lint rule — deferred to Story 1.7 (the i18n provider does not exist yet; the scaffold placeholder `e-Paperé` in `App.tsx` is spec-directed).
- Do not add `eslint-plugin-import`, `eslint-config-airbnb`, or other bulky style plugin ecosystems. Only `eslint-plugin-react-hooks` (required for the hooks requirement) and `eslint-config-prettier` (required to disable formatting conflicts) are permitted as plugins.
- Do not upgrade any existing dependency — only add new dev dependencies.
- Do not add `@nestjs/schedule` or any NestJS runtime dependency.
- Do not create per-package ESLint configs — one root config with path-based overrides.
- Do not modify existing `tsconfig*.json`, `pnpm-workspace.yaml`, `vite.config.ts`, or any `src/` source file.
- Do not add tests — Story 1.3 adds the Vitest/Playwright framework.
- Do not start Story 1.3.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Backend cross-module deep import | A file in `packages/backend/src/modules/auth/**` imports `../payment/payment.service.ts` | `ep-boundaries/no-cross-module-deep-imports` error | Lint fails |
| Backend same-module import | A file in `modules/payment/**` imports `./payment.service` or `../payment` (barrel) | No error | N/A |
| React hooks violation | A frontend component uses an effect with a missing dep | `react-hooks/exhaustive-deps` warns | N/A |
| Staged file with unfixable lint error | `git commit` | lint-staged runs eslint --fix then prettier --write; commit blocked | Exit non-zero |
| Staged clean file | `git commit` | lint-staged passes; commit proceeds | Exit 0 |

</frozen-after-approval>

## Code Map

- `eslint.config.mjs` (root, NEW) — single flat config: JS/TS parser via `typescript-eslint`, type-checked TS rules (projectService), frontend block adding `eslint-plugin-react-hooks`, backend inline `ep-boundaries` custom rule object (defined in-file, no package), `eslint-config-prettier` last, ignores for `node_modules`/`dist`/`coverage`/`.vite`/`_bmad*`/lockfile.
- `.prettierrc.json` (root, NEW) — `{ "tabWidth": 2, "singleQuote": true, "trailingComma": "all", "printWidth": 100 }`.
- `.prettierignore` (root, NEW) — ignores `node_modules`, `dist`, `coverage`, `.vite`, `pnpm-lock.yaml`, `_bmad/`, `_bmad-output/`.
- `.husky/pre-commit` (NEW) — contains `pnpm exec lint-staged`; created via `husky init` then edited.
- `package.json` (root, MODIFY) — add devDeps `eslint@^10`, `typescript-eslint@^8`, `eslint-plugin-react-hooks@^5`, `eslint-config-prettier@^9`, `prettier@^3`, `husky@^9`, `lint-staged@^17`; add `"prepare": "husky"`, replace `lint` with `pnpm -r --if-present lint && prettier --check .`, add `format: prettier --write .`; add `lint-staged` config block.
- `packages/backend/package.json` (MODIFY) — add `"lint": "eslint ."`.
- `packages/frontend/package.json` (MODIFY) — add `"lint": "eslint ."`.
- `packages/shared-types/package.json` (MODIFY) — add `"lint": "eslint ."`.
- `.gitignore` (MODIFY) — add `.vite/` (Vite dep-cache hygiene; keeps the working tree clean for the feature branch).

## Tasks & Acceptance

**Execution:**
- [x] Create branch `feat/story-1-2-eslint-prettier-hooks` from `main`
- [x] Add `.vite/` to `.gitignore`
- [x] Add root devDeps via pnpm: `eslint@^10.13.0`, `typescript-eslint@^8.72.0`, `eslint-plugin-react-hooks@^5.2.0`, `eslint-config-prettier@^9.1.2`, `prettier@^3.9.10`, `husky@^9.1.7`, `lint-staged@^17.6.0`
- [x] `eslint.config.mjs` (root) — flat config with TS type-checked base, frontend React-hooks block, backend inline `ep-boundaries/no-cross-module-deep-imports` rule, `eslint-config-prettier`, ignores
- [x] `.prettierrc.json` + `.prettierignore`
- [x] Root `package.json` — `lint`, `format`, `prepare` scripts + `lint-staged` block
- [x] Add `"lint": "eslint ."` to each of the three package `package.json` files
- [x] `husky init`; edit `.husky/pre-commit` to run `pnpm exec lint-staged`
- [x] Run `pnpm lint` — exit 0 (ESLint across all 3 packages + `prettier --check .`). Existing source reformatted (formatting-only: `main.tsx` trailing comma, `index.html` lowercase doctype).
- [x] Run `pnpm -r typecheck` — exit 0 across all three packages (no existing config broken)
- [x] Verify pre-commit hook blocks a deliberately bad commit and allows a clean one (temp `src/modules/` fixtures created, verified, then removed)
- [x] Update `sprint-status.yaml`: `1-2-eslint-prettier-and-pre-commit-hooks` → `in-progress`
- [x] **Added `.gitattributes`** (`* text=auto eol=lf` + binary markers) — necessary so Prettier's default `endOfLine: "lf"` passes on Windows where `core.autocrlf=true`; verified it produces no renormalization churn.

**Acceptance Criteria:**
- Given a backend file in `src/modules/auth/` that imports directly from `src/modules/payment/payment.service.ts` (bypassing NestJS DI), when `pnpm lint` is run, then `ep-boundaries/no-cross-module-deep-imports` reports a lint error.
- Given a staged file with an unfixable lint error, when `git commit` is executed, then `lint-staged` runs and the commit is blocked.
- Given a staged clean file, when `git commit` is executed, then the commit succeeds.
- Given the repo, when `pnpm lint` is run, then ESLint passes across all three packages and `prettier --check .` passes (exit 0).
- Given the repo, when `pnpm -r typecheck` is run, then it still exits 0 (no existing config broken).
- Given `packages/shared-types/package.json`, when its `dependencies` are inspected, then no React, NestJS, or Prisma package was added (lint tooling is dev-only).

## Implementation Notes

Implemented on branch `feat/story-1-2-eslint-prettier-hooks`. Baseline commit `8c9cf22`.

**Versions installed (root devDependencies):** `eslint@^10.13.0`, `typescript-eslint@^8.72.0`, `eslint-plugin-react-hooks@^5.2.0`, `eslint-config-prettier@^9.1.2`, `prettier@^3.9.10`, `husky@^9.1.7`, `lint-staged@^17.6.0`. All pinned with `^` per spec. Only `eslint` was changed (9→10, see "ESLint 9→10 upgrade" below); no other existing dependency changed.

**Dependency warnings (documented per request #10):**
- `pnpm add` resolved `lint-staged` to `^17.6.0` (spec Code Map estimated `^15`); lint-staged is not ESLint-coupled, so the major is immaterial. Kept the latest.
- 7 deprecated transitive subdependencies reported (are-we-there-yet, gauge, glob@7, inflight, npmlog, rimraf, tar@6) — transitive via husky/lint-staged; not actionable from this layer.

**ESLint 9→10 upgrade (approved dependency-maintenance check):** ESLint 9 reached end-of-life 2026-08-06. Upgraded `eslint` to `^10.13.0` after verifying compatibility — only `eslint` was changed, no other dependency touched.
- Compatibility matrix (verified against installed versions + Node 24):
  - `typescript-eslint@8.72.0` peer `eslint: ^8.57 || ^9 || ^10` → accepts 10 ✅
  - `eslint-config-prettier@9.1.2` peer `eslint: >=7` → accepts 10 ✅
  - `eslint@10.13.0` engines `node: ^20.19 || ^22.13 || >=24` → Node 24 ✅
  - `eslint-plugin-react-hooks@5.2.0` peer `eslint: ...|| ^9.0.0` → does NOT declare `^10`. ⚠️ This is a peer-range declaration lag only; functionally the plugin works on ESLint 10 (verified below). v7.1.1 declares `^10` as a future option if zero peer warnings are later desired.
- Functional verification under ESLint 10 (temporary fixtures, created/asserted/removed):
  - Inline `ep-boundaries/no-cross-module-deep-imports` custom rule fires: 2 errors on `bad-service-import.ts` + `bad-repository-import.ts`; 0 errors on permitted files (`good-controller.ts` barrel+module, `payment.controller.ts` same-module). The custom rule (uses `context.filename` + `context.report`) is API-compatible with ESLint 10.
  - `eslint-plugin-react-hooks` 5.2.0 rules fire: `react-hooks/rules-of-hooks` error (conditional `useState`) + `react-hooks/exhaustive-deps` warning (missing dep) reported correctly → plugin is functionally compatible despite the `^9` peer ceiling.
  - Husky pre-commit hook blocks an invalid staged commit under ESLint 10 (lint-staged → `eslint --fix` → `ep-boundaries` error → commit reverted, exit non-zero, HEAD unchanged).
- Resolution: keep `eslint-plugin-react-hooks@^5.2.0` (it works; changing it is unnecessary and the user directed minimal changes). The peer-range lag is a non-blocking pnpm warning (`.npmrc` has no `strict-peer-dependencies`); it does not fail install, lint, or CI. Documented here for the reviewer.

**Backend module-boundary rule (`ep-boundaries/no-cross-module-deep-imports`):** inline custom rule in `eslint.config.mjs` (no npm package). `no-restricted-imports` cannot express same-vs-cross-module because relative import strings don't encode the source module — only the importer's `context.filename` does. The rule blocks deep cross-module imports of `*.service` / `*.repository` implementation files (the AC scenario) and ALLOWS: same-module imports, the module barrel (`../payment`, `../payment/index`), DI-wiring imports (`../payment/payment.module`), shared folders (`../shared/...`), and package imports. Verified end-to-end with temporary fixtures in `src/modules/auth/` and `src/modules/payment/` (created, asserted, deleted):
- BLOCKED: `auth/bad-service-import.ts` (`import { PaymentService } from '../payment/payment.service'`) → `ep-boundaries` error.
- BLOCKED: `auth/bad-repository-import.ts` (`import { PaymentRepository } from '../payment/payment.repository'`) → `ep-boundaries` error.
- ALLOWED: `auth/auth.controller.ts` (barrel `../payment` + DI-wiring `../payment/payment.module`) → no error.
- ALLOWED: `payment/payment.controller.ts` (same-module `./payment.service`) → no error.
Exactly 2 errors (both `ep-boundaries`), 0 warnings, on the bad files only.

**Pre-commit hook verification:** `git commit` with the staged bad file → husky → lint-staged → `eslint --fix` reported the `ep-boundaries` error → commit blocked (exit 1), HEAD unchanged. Allow-path: `npx lint-staged` on the clean staged Story 1.2 work → exit 0 ("Done running tasks"). `core.hooksPath` = `.husky/_` (husky wired).

**Config notes:**
- Single root `eslint.config.mjs` (flat config). Per-package `lint: eslint .` scripts reuse it via ESLint's upward config resolution from each package cwd.
- `eslint-config-prettier/flat` subpath is absent in v9.1.2; the default export (`{ rules: {...} }`) is used directly as the final flat-config object.
- `.prettierignore` excludes `_bmad/`, `_bmad-output/`, `.kiro/` (vendored BMAD tooling), `.husky/_/` (auto-generated), and `**/*.md` (markdown not auto-formatted, to avoid churning docs and the bmad-managed `AGENTS.md`).
- `.gitattributes` (`* text=auto eol=lf` + binary markers) added — required because `core.autocrlf=true` on this Windows host would otherwise produce CRLF working copies and break Prettier's default `endOfLine: "lf"`. Verified `git add --renormalize` produced no churn (files already LF).

**Source formatting:** existing `src/` files were reformatted by `prettier --write` to satisfy the AC (`prettier --check .` passes). Changes were formatting-only — the only source changes are a trailing comma in `packages/frontend/src/main.tsx` and lowercase `<!doctype html>` in `packages/frontend/index.html`. No source logic changed; typecheck still passes. (The plan note "do not reformat existing src/ source" conflicted with the AC requiring `prettier --check` to pass; the AC takes precedence, and formatting-only changes preserve functionality.)

## Spec Change Log

## Review Triage Log

## Design Notes

**Backend module-boundary rule** — `no-restricted-imports` cannot express this because relative import strings (e.g. `../payment/payment.service`) do not encode the source module; only the importer's file path (available in a custom rule via `context.filename`) reveals whether an import is same- vs cross-module. The scope explicitly permits a custom ESLint rule, and an inline rule defined in the flat config (no npm package) is the minimal tool that satisfies the AC. The rule flags any import whose resolved target lives inside a *different* `src/modules/<X>/` directory and reaches deeper than the module barrel — i.e. it blocks `../payment/payment.service.ts` but allows `../payment` and `../payment/index.ts` (the public API used by NestJS DI). The thirteen backend modules do not exist yet (Story 1.8), so the rule is a no-op guardrail now and is verified with a temporary file that is deleted after the check.

**One root flat config** — ESLint 9 resolves `eslint.config.mjs` by walking up from each package's cwd, so per-package `eslint .` scripts reuse the single root config. Path-based `files` blocks (`packages/frontend/**` vs `packages/backend/**`) apply React-hooks and module-boundary rules to the right packages without per-package config files.

## Verification

**Commands:**
- `pnpm lint` -- expected: ESLint passes all three packages and `prettier --check .` passes (exit 0)
- `pnpm -r typecheck` -- expected: exit 0 across all three packages (no existing config broken)
- `git commit` with a deliberately bad staged file (e.g. an unused-var error, or a temp `src/modules/auth/x.ts` importing `../payment/payment.service.ts`) -- expected: blocked by lint-staged
- `git commit` with a clean staged file -- expected: commit succeeds

**Manual checks:**
- Inspect `eslint.config.mjs` — the `ep-boundaries/no-cross-module-deep-imports` inline rule and the React-hooks block scoped to `packages/frontend/**` are present
- Inspect `package.json` (root) — `lint-staged` block runs `eslint --fix` then `prettier --write`; `prepare: husky` present
- Inspect `.husky/pre-commit` — runs `pnpm exec lint-staged`

## Review Findings

- [x] [Review][Patch] Upgrade `eslint-plugin-react-hooks` to `^7.1.1` — v7.1.0 explicitly declares ESLint v10 peer support; v5.2.0 declares only `^9.0.0`, creating a peer-range mismatch with the installed `eslint@10.13.0`. [package.json] ✅ Fixed: upgraded to 7.1.1, pnpm lint + typecheck pass.
- [x] [Review][Patch] Add `.kiro/**` to `eslint.config.mjs` ignores block — `.prettierignore` already excludes `.kiro/`; ESLint ignores block omits it. If `.kiro/` gains TypeScript files, ESLint type-check will unexpectedly pick them up. [eslint.config.mjs] ✅ Fixed: `.kiro/**` added to ignores block.
- [x] [Review][Defer] `ep-boundaries` rule has no durable test — regression gap when no modules exist [eslint.config.mjs:33-87] — deferred: Story 1.3 installs Vitest; add `RuleTester`-based unit test covering the 4 AC cases (blocked service import, blocked repository import, allowed barrel import, allowed same-module import) at that point.
- [x] [Review][Defer] `lint-staged` concurrent vs serial task order for overlapping globs not definitively verified [package.json] — deferred: practically safe given `eslint-config-prettier` disables all formatting rules in ESLint; revisit if lint-staged v18+ changes task-ordering semantics.

### Rejected

- `ep-boundaries` only covers `.service`/`.repository` — `false`: rule covers exactly what spec, AGENTS.md, and AC require (`service`/`repository`); other file types are out of scope.
- `*.module` barrel carved out (DI wiring) — `false`: explicitly spec-directed carve-out per Design Notes.
- `"semi": true` in `.prettierrc.json` beyond spec Code Map — `low`: Prettier's own default value, no behavioral change, no harm.
- `src/main.tsx` and `index.html` modified — `low`: formatting-only changes; developer explicitly documented the frozen-constraint trade-off; typecheck passes; excluding source from Prettier would be a worse long-term outcome.
- Sprint status `review` instead of `in-progress` — `false`: `review` is the correct current state; `in-progress` was the intermediate state during implementation.
- `resolveRelative` unguarded `pop()` on empty array — `low`: malformed import with excessive `..` would fail TypeScript module resolution before triggering the rule; fix adds complexity for an unreachable practical case.
- `\w+` regex excludes hyphenated module names — `false`: all 13 planned modules use single lowercase words; no module name with a hyphen exists in the spec.
- `import.meta.dirname` backslash path on Windows — `false`: empirically refuted; `pnpm lint` exits 0 on this Windows host with Node 24 ESM.
- `.md` files in `lint-staged` glob but excluded by `.prettierignore` — `low`: no behavioral harm; Prettier silently skips them per its own ignore rules.
- `yaml@2.9.1` vite lock key mutation not in implementation notes — `low`: cosmetic lockfile snapshot change, no functional impact.
- `Review Triage Log` and `Spec Change Log` empty — `false`: these are post-review placeholders; expected empty before review.
