# Deferred Work

## Deferred from: code review of spec-1-1-pnpm-monorepo-scaffold-with-three-packages (2026-10-26)

- App.tsx raw string `e-Paperé` not wrapped in `t()` — AD-6 lint enforcement and i18n infrastructure are Story 1.2 (ESLint) / 1.7 (i18n). The scaffold placeholder is spec-directed; the lint rule does not exist yet.
- Missing test/lint/validate-i18n scripts in all three packages — Story 1.2 adds ESLint + `lint` scripts; Story 1.3 adds Vitest + `test` scripts; Story 1.4 adds `validate-i18n` + CI gate. Root `--if-present` flag prevents false failures until scripts exist.
- `decimal.js` missing from backend/frontend dependencies — AGENTS.md mandates Decimal.js for LKR arithmetic, but no money code exists in Story 1.1. First story implementing payment/invoice logic (Story 4.x) should add `decimal.js` as a direct dependency.
- No `.env.example` file — `.gitignore` whitelists `!.env.example` but the file is absent. Story 1.8 (NestJS bootstrap + config validation) should create it documenting all required env vars (`DATABASE_URL`, `DIRECT_DATABASE_URL`, `JWT_SECRET`, etc.).
- `index.html` `lang="en"` hardcoded with no runtime update mechanism — Story 1.7 (React App Shell + i18n) should call `document.documentElement.setAttribute('lang', locale)` on language change for screen reader / SEO correctness.
- `docker-compose.yml` missing init SQL for `ep_student_id_seq` and `restart` policy — `ep_student_id_seq` is created by Prisma migrations (Story 2.1), not by docker init scripts. `restart: unless-stopped` is a local-dev convenience, not required by spec.
- `main.tsx` throw branch (`if (!root) throw`) untested — Story 1.3 adds Vitest + `@testing-library/react` + jsdom; a smoke render test for the bootstrap path should be added at that point.

## Deferred from: code review of spec-1-2-eslint-prettier-and-pre-commit-hooks (2026-10-26)

- `ep-boundaries` rule has no durable test — Story 1.3 installs Vitest; add a `RuleTester`-based unit test covering the four AC cases (blocked service import, blocked repository import, allowed barrel import, allowed same-module import) in e.g. `packages/backend/src/__tests__/ep-boundaries.rule.test.ts` at that point.
- `lint-staged` concurrent vs serial task order for overlapping globs not definitively verified — practically safe today given `eslint-config-prettier` disables ESLint formatting rules; revisit if lint-staged v18+ changes task-ordering semantics for overlapping glob keys.

## Deferred from: code review of spec-1-4-github-actions-ci-pipeline-with-i18n-and-type-gates (2026-10-27)

- `scripts/validate-i18n.ts` has no automated test — the gate's discrepancy-detection and exit-code logic (`main`, `flattenKeys`, `discoverLocaleRoots`) is not exercised by `pnpm -r test` (the `scripts/` dir belongs to no package, and every current run hits the empty-state branch returning 0). A silent regression could let a missing Sinhala key reach `main` with CI green — the exact AD-30 failure AGENTS.md warns about. Add a Vitest suite (temp-dir fixtures, mirroring `ep-boundaries.rule.test.ts`) once the script's functions are exported/importable: assert complete en/si pair → exit 0, en key missing in si → exit 1 + key named, extra si key → exit 1, no locale roots → exit 0. Spec 1.4 did not require tests and the fix needs a refactor to export the functions, so it was out of scope for the story patch set. All four paths were manually verified correct during the review; this defers the regression protection, not a present defect.
