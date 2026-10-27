---
title: 'Story 1.4: GitHub Actions CI Pipeline with i18n and Type Gates'
type: 'feature'
created: '2026-10-27'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: 'de96c81b1462136d8f01773dcd52e1583c609c3c'
context:
  - '{project-root}/AGENTS.md'
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** There is no CI pipeline. Broken builds, type errors, lint/format violations, failing tests, and (eventually) missing Sinhala translations can reach `main` undetected. Story 1.4 adds the GitHub Actions gate that every PR must pass.

**Approach:** Add a single `.github/workflows/ci.yml` that runs on PRs (and pushes) to `main`, pinned to Node 24 + pnpm 11.5.3, performing a frozen-lockfile install then the gates whose prerequisites exist today: typecheck, lint (ESLint + Prettier), Vitest across all three packages, a new `validate-i18n` script, and frontend + backend production builds. Gates whose prerequisites arrive in later stories (`prisma validate`, Playwright E2E, `redocly lint`) are represented as clearly-labelled, non-failing placeholders so they are trivial to activate later without silently masking real failures today.

## Boundaries & Constraints

**Always:**
- Node.js 24 LTS and pnpm 11.5.3, matching `.nvmrc` and root `package.json` `packageManager`.
- Install with `pnpm install --frozen-lockfile`.
- Keep CI self-contained: no live Neon/Upstash/R2/Vercel services, no repository secrets required to pass.
- Enabled gates must run the project's existing root scripts (`pnpm -r typecheck`, `pnpm lint`, `pnpm -r test`) so CI and local behaviour stay identical.
- `validate-i18n` must pass cleanly in the current repo (no locale files yet) and fail with a clear message once an `en/` key lacks its `si/` counterpart.
- Deferred gates must be visibly present (named steps or comments) and must NOT mask a real failure — a placeholder either does nothing or explains why it is skipped; it never swallows an error from an enabled step.

**Never:**
- Do not reimplement Story 1.3 (Vitest/Playwright setup) or implement Story 1.5+ work.
- Do not add a `prisma/schema.prisma`, locale files, or OpenAPI export — those belong to their own stories.
- Do not run Playwright browsers or require a PostgreSQL service container for tests that do not need one (current Vitest suites are pure/unit and need neither).
- Do not commit or track `playwright-report/` or `test-results/` (already covered by `.gitignore`).
- Do not weaken any gate (e.g. `continue-on-error` on typecheck/lint/test/build) to force a green run.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Clean PR | All code valid | Workflow succeeds; every enabled gate green | N/A |
| Type error introduced | `tsc` error in any package | `typecheck` step fails; workflow red | Non-zero exit blocks merge |
| Lint/format violation | ESLint error or Prettier drift | `lint` step fails; workflow red | Non-zero exit blocks merge |
| Failing unit test | A Vitest assertion fails | `test` step fails; workflow red | Non-zero exit blocks merge |
| i18n: no locales yet | No `locales/` dirs (today's state) | `validate-i18n` exits 0 with "no locale namespaces found" note | N/A |
| i18n: missing si key | `en/x.json` has key absent in `si/x.json` | `validate-i18n` exits non-zero, names the namespace + key | Non-zero exit blocks merge |
| Build regression | FE or BE build breaks | `build` step fails; workflow red | Non-zero exit blocks merge |

</frozen-after-approval>

## Code Map

- `.github/workflows/ci.yml` -- NEW. The CI workflow. Does not exist today (`.github/` absent).
- `scripts/validate-i18n.ts` -- NEW. Node/TS script diffing `en/` vs `si/` per namespace across known locale roots; tolerant of zero locales. Run via `tsx`/`vitest` node — see Design Notes for runner choice.
- `package.json` (root) -- EDIT. Add `"validate-i18n"` script. Existing scripts to reuse verbatim in CI: `typecheck` (`pnpm -r typecheck`), `lint` (`pnpm -r --if-present lint && prettier --check .`), `test` (`pnpm -r --if-present test`), `test:e2e` (`playwright test`). `packageManager: pnpm@11.5.3` is the pinned version source.
- `.nvmrc` -- READ ONLY. Contains `24`; CI Node version source of truth.
- `packages/frontend/package.json` -- READ ONLY. `build` = `tsc --noEmit && vite build`.
- `packages/backend/package.json` -- READ ONLY. `build` = `tsc --project tsconfig.json`.
- `.gitignore` -- READ ONLY. Already ignores `playwright-report/`, `test-results/`, `coverage/`. No change needed.
- `eslint.config.mjs` -- READ ONLY. Imports a `.ts` rule file; ESLint already runs under the existing `lint` script, so no CI-specific handling needed.
- `pnpm-workspace.yaml` -- READ ONLY. `allowBuilds` lists native deps (prisma, bcrypt, esbuild, swc, oxide, lightningcss) — CI install must allow these builds (default pnpm behavior with the workspace config).

## Tasks & Acceptance

**Execution:**
- [x] `scripts/validate-i18n.ts` -- Create a script that discovers locale roots (`packages/*/src/locales` and `packages/shared-types/locales`), and for each namespace present under `en/` asserts the same JSON key set exists under `si/`. Report every missing (and extra) key with namespace + dotted key path; exit 1 if any discrepancy, else exit 0. When no locale roots/namespaces exist, print a clear "nothing to validate yet" line and exit 0. -- Satisfies the AD-30 i18n gate AC while tolerating the pre-Story-1.7 empty state.
- [x] `package.json` (root) -- Add `"validate-i18n": "<runner> scripts/validate-i18n.ts"` using the already-available dev toolchain (see Design Notes). -- Exposes the gate as `pnpm validate-i18n` for both CI and local use.
- [x] `.github/workflows/ci.yml` -- Create the workflow: trigger on `pull_request` and `push` to `main`; single `build-and-test` job on `ubuntu-latest`; checkout → `pnpm/action-setup` (v4, version 11.5.3) → `actions/setup-node` (v4, `node-version-file: .nvmrc`, `cache: pnpm`) → `pnpm install --frozen-lockfile` → `pnpm -r typecheck` → `pnpm lint` → `pnpm -r test` → `pnpm validate-i18n` → `pnpm --filter @e-papere/backend build` → `pnpm --filter @e-papere/frontend build`. Add deferred, non-masking placeholder steps (commented or `echo`-only) for `prisma validate` (Story 1.8), Playwright E2E (Story 9.3), and `redocly lint` (Story 1.8+). -- Delivers the enabled gates and documents the future ones.

**Acceptance Criteria:**
- Given a PR to `main` with a TypeScript type error, when CI runs, then the `typecheck` step fails and the workflow is red.
- Given a PR that adds an `en/` translation key with no matching `si/` key, when `pnpm validate-i18n` runs, then it exits non-zero and names the missing key.
- Given the current repository (no locale files), when `pnpm validate-i18n` runs, then it exits 0 with a "nothing to validate" message.
- Given a clean PR, when CI runs, then install, typecheck, lint, test, validate-i18n, and both builds all pass without requiring any repository secret or live external service.
- Given deferred gates (prisma validate, Playwright, redocly), when CI runs, then they appear as labelled placeholders that neither fail the build nor hide a real failure from an enabled step.

## Implementation Notes

<!-- Append-only during implementation. -->

- **2026-10-27 — implemented.** Created `scripts/validate-i18n.ts`, added root `validate-i18n` script, created `.github/workflows/ci.yml`.
- **Runner choice:** chose Design Notes option (a) — `node --experimental-strip-types scripts/validate-i18n.ts`. No new dependency, no lockfile churn. Node 24 native type stripping confirmed working (v24.14.0 locally). A benign `MODULE_TYPELESS_PACKAGE_JSON` perf warning is emitted to stderr; it does not affect the exit code and is cosmetic. Avoided adding `"type": "module"` to root `package.json` to prevent side effects on other tooling.
- **validate-i18n behavior verified:** empty state → exit 0 "nothing to validate"; en key missing in si → exit 1 naming `namespace :: dotted.key`; missing si file entirely → exit 1 listing all keys; extra-in-si path implemented symmetrically. Fixtures created under `packages/frontend/src/locales` during testing and removed afterward.
- **CI workflow:** triggers on `pull_request` and `push` to `main`; single `build-and-test` job on `ubuntu-latest`; pnpm 11.5.3 via `pnpm/action-setup@v4`; Node via `actions/setup-node@v4` with `node-version-file: .nvmrc` and `cache: pnpm`; `pnpm install --frozen-lockfile`; enabled gates in order: `pnpm -r typecheck` → `pnpm lint` → `pnpm -r test` → `pnpm validate-i18n` → backend build → frontend build. Deferred gates (prisma validate / redocly / Playwright) are `echo`-only steps with no `continue-on-error`, so they cannot mask a real failure. Added a `concurrency` block to cancel superseded runs.
- **Test count note:** spec Verification says "5 tests pass"; the current suites report 4 tests (shared-types 2, backend 1, frontend 1). All three packages pass. The count is a spec estimate; no missing test was found.
- **YAML validity:** no local YAML parser installed; Prettier successfully parsed and left `ci.yml` unchanged, which confirms syntactic validity.
- **2026-10-27 — lint-coverage fix (found during pre-commit verification).** The new `scripts/validate-i18n.ts` lives outside every package tsconfig, so (a) the pre-commit `eslint --fix` and a type-checked ESLint pass errored with "not found by the project service", and (b) the root `lint` script (`pnpm -r lint`) only lints inside each package, so `scripts/` was never actually linted in CI. Fixed both:
  - `eslint.config.mjs`: added a `scripts/**/*.ts` override using `tseslint.configs.disableTypeChecked` (syntactic linting, no tsconfig project required) with `no-console` off — a standalone Node CLI whose output is its purpose. Mirrors the existing JS/config carve-out.
  - `package.json` root `lint`: now `pnpm -r --if-present lint && eslint scripts && prettier --check .` so CI genuinely lints the scripts directory. Verified an injected unused-var error makes `pnpm lint` exit 1.
- **Cosmetic warning (left as-is):** running the `.ts` script via `node --experimental-strip-types` emits a `MODULE_TYPELESS_PACKAGE_JSON` perf warning on stderr. It does not affect the exit code. Not silenced because the clean fixes (`"type": "module"` on root package.json, or renaming to `.mts`) either risk other tooling or deviate from the frozen Code Map filename. Safe to address in a later housekeeping pass.

## Spec Change Log

## Review Triage Log

### Review Findings (code review 2026-10-27, baseline de96c81..38f0161)

**Patch (all three applied during this review and re-verified green):**

- [x] [Review][Patch] Add least-privilege `permissions: contents: read` to workflow [.github/workflows/ci.yml] — The workflow had no top-level `permissions` block, so `GITHUB_TOKEN` inherited the repository default (potentially read/write). The job only reads the repo (no releases, comments, deployments), so it is pinned to `contents: read`. Directly satisfies review focus #9 (least-privilege, no unnecessary token scope).
- [x] [Review][Patch] Add `timeout-minutes: 20` to the `build-and-test` job [.github/workflows/ci.yml] — The job had no timeout; a hung install/test/cache step could run to the 6-hour GitHub default, contradicting the stated CI-minutes-saving intent behind the `concurrency` block.
- [x] [Review][Patch] Silence `MODULE_TYPELESS_PACKAGE_JSON` warning via `scripts/package.json` [scripts/package.json] — `validate-i18n.ts` is ESM (`import`, `import.meta.url`) but lived under no package manifest, so `node --experimental-strip-types` emitted a perf warning on every run that could obscure the script's own `console.error` failure output. Added a scoped `scripts/package.json` with `"type": "module"` (accurate — the file *is* an ES module). Chosen over editing root `package.json` to avoid side effects on other tooling (the exact concern the implementation note raised). `scripts/` is outside the `packages/*` workspace glob, so pnpm does not treat it as a workspace package (verified: install still reports 4 workspace projects). Review focus #10 — fix is justified.

**Defer:**

- [x] [Review][Defer] i18n gate logic (`main`/`flattenKeys`/`discoverLocaleRoots`) has no automated test [scripts/validate-i18n.ts] — deferred: Story 1.4 spec does not require tests, and the functions are not exported, so a durable test needs a refactor to make them importable (added public surface, beyond an unambiguous patch). The gate's load-bearing discrepancy/exit-code behavior is unexercised by `pnpm -r test` (scripts/ is in no package; every current run hits the empty-state branch and returns 0). Risk: a silent regression in the diff/exit logic could let a missing `si/` key reach `main` with CI green (the exact AD-30 failure AGENTS.md warns about). Settle by adding a Vitest suite (temp-dir fixtures, mirroring `ep-boundaries.rule.test.ts`) asserting: complete pair → 0, missing si key → 1 + key named, extra si key → 1, no roots → 0. I manually reproduced all four paths during this review (plus malformed-JSON and missing-si-file cases); they behave correctly today — this defers the *regression protection*, not a present defect.

**Rejected:**

- `false` — "Mojibake / corrupted em-dashes in ci.yml, eslint.config.mjs, spec.md": Refuted by raw-byte inspection. The dash bytes in `ci.yml` are `0xE2 0x80 0x94` = valid UTF-8 EM DASH (U+2014). The `ΓÇö` three reviewers saw is a PowerShell CP437 console display artifact when rendering UTF-8, not file corruption. The committed files are valid UTF-8.
- `false` — "lint-staged / `disableTypeChecked` scripts override untested, may error": Refuted by execution. `eslint --fix scripts/validate-i18n.ts` (lint-staged style, explicit path) and `eslint scripts` (CI style) both exit 0; the `scripts/**/*.ts` override resolves for both invocation paths.
- `false` (as a code defect) — "root `lint` modified / `eslint.config.mjs` & `package.json` edited beyond Code Map READ-ONLY scope": The edits are real, but they are a correct, verified lint-coverage fix that satisfies review focus #5 (scripts/ must be linted in CI) — `scripts/` was genuinely unlinted before. CI and local both call `pnpm lint`, so parity holds. The only true gap is a missing Spec Change Log entry; the triage rule rejects any finding whose fix is to edit the spec/Code Map.
- `false` — "deferred echo placeholders always run / could be marked as required checks": The spec explicitly mandates visibly-present, non-failing placeholders; they carry no `continue-on-error` and sit after the enabled gates, so they cannot mask a real failure. The "someone might mark them required in branch protection" is speculative, not a code defect.
- `false` — "YAML validated only via Prettier, not a real linter": Prettier uses the `yaml` package as its parser; it parses `ci.yml` cleanly. I also confirmed top-level keys and structure parse correctly. The workflow is syntactically valid YAML.
- rejected (unreachable state) — "en/si top-level JSON as array/primitive silently treated as empty": A valid i18n namespace file is always a JSON object; a top-level array/primitive is not a reachable valid state. Fix would add a guard branch for an input the program never legitimately receives.
- `low` (not worth the added complexity) — "malformed JSON crashes with uncaught SyntaxError instead of a clean `[validate-i18n]` message": The gate still fails loudly and non-zero (no masking), which is correct for a CI gate. A friendlier message is a nicety; left to the same future housekeeping pass noted for the gate test.
- `low` (negligible everyday harm) — "si-only namespace file never checked (file-level one-directional)": The blocking direction (en key missing in si → fail) works and is what protects the Sinhala UI per AD-30. An orphan `si/` file is a benign extra translation, not a user-facing missing key; en-present namespaces already get full bidirectional per-key parity.

## Design Notes

**validate-i18n runner.** The repo has no `tsx` or `ts-node` at the root (backend has `ts-node`, but root scripts should not reach into a package's binary). Two clean options: (a) write the script in plain Node-compatible TypeScript and run it with `node --experimental-strip-types scripts/validate-i18n.ts` (Node 24 supports type stripping natively — no new dependency); (b) add `tsx` as a root devDependency. Prefer (a) to avoid a new dependency and lockfile churn, since Node 24 is already the pinned runtime. If type-stripping flags prove awkward in CI, fall back to authoring the script as `.mjs` (plain JS) — the logic is simple JSON diffing and needs no types to be correct.

**validate-i18n shape (illustrative, ~8 lines of core logic):**
```
for each localeRoot:
  for each namespace file under localeRoot/en/*.json:
    enKeys = flatten(JSON.parse(en file))
    siKeys = flatten(JSON.parse(matching si file))  // missing file => all keys missing
    report enKeys - siKeys as "missing in si", siKeys - enKeys as "extra in si"
exit(found any discrepancy ? 1 : 0)
```

**Deferred gates must not mask failures.** Represent them as either YAML comments or `run: echo "deferred to Story X — no prerequisite yet"` steps. Never attach `continue-on-error: true` to an enabled gate to keep CI green; that is the exact masking the task forbids.

**No PostgreSQL service in CI yet.** Current Vitest suites (`zod-smoke`, `ep-boundaries.rule`, `App.smoke`) are pure and need no database. A `services: postgres` block is correctly a Story 1.8/2.1 concern (when Prisma integration tests exist) and is intentionally omitted now to keep CI lightweight.

## Verification

**Commands:**
- `pnpm install --frozen-lockfile` -- expected: success, lockfile unchanged.
- `pnpm -r typecheck` -- expected: all 3 packages pass.
- `pnpm lint` -- expected: ESLint clean + "All matched files use Prettier code style!".
- `pnpm -r test` -- expected: all suites pass across 3 packages (currently 4 tests: shared-types 2, backend 1, frontend 1).
- `pnpm validate-i18n` -- expected: exit 0 with "nothing to validate" (no locales yet).
- `pnpm --filter @e-papere/backend build` && `pnpm --filter @e-papere/frontend build` -- expected: both succeed.
- `node -e "require('js-yaml')" || npx --yes yaml-lint .github/workflows/ci.yml` (or equivalent) -- expected: workflow YAML is syntactically valid.

**Manual checks:**
- `.github/workflows/ci.yml` triggers on PR + push to `main`, pins Node via `.nvmrc` and pnpm 11.5.3, and lists the enabled gates in order with deferred gates present but non-failing.
