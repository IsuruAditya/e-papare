---
inclusion: always
---

# e-Paperé — Engineering & UI/UX Quality Standards

Permanent, project-wide quality bar for every implementation, review, and refactor in
e-Paperé. These standards apply to all stories, modules, pages, components, and roles —
not just the current task.

## Authority & precedence

These are quality principles, **not** permission to change approved architecture or scope.
When any conflict arises, the authoritative source wins in this order, and you MUST report
the conflict rather than silently overriding:

1. `AGENTS.md` — policies, conventions, known pitfalls (binding)
2. `_bmad-output/planning-artifacts/arch-e-papere-2026-10-16/ARCHITECTURE-SPINE.md` — AD-1–AD-52 (v7)
3. `_bmad-output/planning-artifacts/prd-e-papere-2026-10-16/prd.md` (+ `addendum.md`) — product scope & FRs
4. `_bmad-output/ux/ux-epapere-2026-10-16/DESIGN.md` — authoritative design tokens
5. `_bmad-output/ux/ux-epapere-2026-10-16/EXPERIENCE.md` — IA, journeys, interaction model
6. This document — complements the above; never duplicates or overrides them

This file deliberately does **not** restate business rules, token values, or ADs. It tells
you *how* to build to a professional standard within the already-frozen stack
(pnpm monorepo · React + Vite + Tailwind v4 · NestJS 11 + Prisma · Neon PostgreSQL · shared
Zod types). Do **not** introduce a different stack, a competing design system, new business
rules, microservices, CQRS/event-sourcing, or new UI/component dependencies without an
approved architecture decision.

The overarching principle: deliver **professional, consistent, secure, maintainable,
testable, and appropriately scalable** software — not merely functional software.

---

## 1. Product quality & professional expectations

- The product MUST read as a modern education-SaaS portal (register: trustworthy, calm,
  capable, accessible, professional — per DESIGN.md), comparable to Google Classroom or
  Notion — never a childish or toy-like app.
- Every screen MUST be polished and consistent with the rest of the product: same spacing
  scale, same component variants, same interaction states. Inconsistent variants across
  screens are a defect.
- Honor DESIGN.md anti-patterns: no cartoon illustration, excessive shadows, content-area
  gradients, decorative/entrance animations, or ad-hoc accent colors.
- Student experience SHOULD stay reassuringly simple; admin/finance surfaces MAY be
  information-dense but still ordered and scannable.
- "Done" means production-quality for the whole flow — including loading, empty, error,
  and success states, both languages, and both themes.

## 2. Software architecture & maintainability

- Preserve the **modular monolith**: thirteen backend modules with clear boundaries.
  Cross-module access is through exported Service functions only — never another module's
  Prisma delegate or repository (AD-1).
- Keep layer responsibilities clean: controllers = transport/validation; services = business
  rules and transactions; repositories/Prisma = persistence. Business logic MUST NOT live in
  controllers or repositories.
- Apply dependency inversion at meaningful boundaries using NestJS DI; use `APP_GUARD`,
  `APP_FILTER`, `APP_PIPE`, `APP_INTERCEPTOR` for global providers rather than re-declaring
  them per controller.
- Services SHOULD be stateless; no request state in module-level globals.
- Add abstractions (interface, adapter, factory) only when a second real implementation or a
  genuine boundary exists. Speculative layering is a defect, not an improvement.

## 3. Core engineering principles (pragmatic)

Apply these thoughtfully — never add structure merely to claim compliance:

- **SOLID** — SRP, OCP, LSP, ISP, DIP at real boundaries.
- **DRY / Single Source of Truth** — no duplicated knowledge; shared contracts live in
  `packages/shared-types`. But prefer a little duplication over the wrong abstraction.
- **KISS / YAGNI** — simplest maintainable solution that meets the requirement; build what the
  story needs, not what it might need.
- **Separation of Concerns**, **high cohesion / low coupling**, **composition over
  inheritance**, **encapsulation / information hiding**.
- **Law of Demeter**, **least astonishment**, **least privilege**, **explicit over implicit**,
  **fail fast** on invariant violations.
- **Design by Contract** at module service boundaries: validate inputs, honor documented
  pre/postconditions.

Patterns (Repository, Adapter, Strategy, Factory, Facade, Observer, …) are used **only where
they solve a genuine problem**. Do not force GoF patterns into the codebase.

## 4. Clean code, TypeScript & module boundaries

- TypeScript `strict` everywhere. `any`, unchecked casts (`as`), and non-null assertions
  (`!`) are forbidden except with a short justifying comment. Prefer precise types, unions,
  and generics.
- Names MUST be meaningful and consistent with existing conventions. Functions SHOULD be
  small and single-purpose; prefer guard clauses and early returns over deep nesting.
- No magic numbers/strings — name them or source them from tokens/config. No dead code,
  commented-out blocks, or speculative generality.
- Comments explain **why**, not restate the obvious **what**.
- `packages/shared-types` exports Zod schemas + inferred TS types only — no React, NestJS,
  Prisma/`@prisma/client`, DB, secrets, or infra deps (AD-20).
- Follow existing project conventions before inventing new ones. Code MUST pass
  `pnpm -r lint` (ESLint + Prettier) and the `ep-boundaries` lint rule with zero warnings.

## 5. Backend & API engineering

- Validate every request at the boundary with `ZodValidationPipe` using shared-types schemas
  (AD-19, AD-23). Never trust client input; never accept fee/payment amounts from the client —
  compute server-side from configured pricing.
- Authentication and authorization at trusted boundaries only. `AuthGuard` checks
  `account_state` (not just token validity); `RolesGuard` enforces RBAC. Least privilege by
  default. Never weaken auth/authz/financial safeguards for convenience.
- Error responses use the stable `{ code: "ERR_*", params?, requestId }` contract via the
  global `ExceptionFilter` — no English prose from the backend (AD-8).
- Money is always `Decimal` (`@db.Decimal(12,2)`); never JavaScript `number` arithmetic for
  LKR. EP Student IDs come from the PostgreSQL sequence (AD-5).
- Every list endpoint MUST use `getPaginationParams` (default 20, max 100); unbounded queries
  are prohibited (AD-47). Avoid N+1 — use Prisma `include`/`select` deliberately.
- Multi-step writes with invariants (payment approval → entitlement) MUST run inside a Prisma
  interactive transaction (AD-11). Make job/batch operations idempotent (e.g. `upsert` with
  `update: {}`). Use advisory locks only within a single short transaction (Neon pooler).
- Every `/api/v1` route carries `@nestjs/swagger` decorators; the internal `JobsController`
  is `@ApiExcludeController()` and absent from RBAC (AD-21, AD-33/42/36).
- Migrations run via `prisma migrate` on `DIRECT_DATABASE_URL`; runtime uses the pooler
  (AD-32). Secrets come from environment/secret stores — never committed.

## 6. Data integrity, security & reliability

- Security posture is **secure-by-default + defense-in-depth + privacy-by-design**. Use OWASP
  Top 10 / API Security Top 10 / ASVS / Cheat Sheets as working guidance. Do **not** claim
  certified compliance without actual verification.
- Input validation and output encoding at every boundary; parameterized queries (Prisma) —
  never string-built SQL. Guard against injection and broken-authorization classes.
- Never store/log/return raw passwords (bcrypt cost 12) or raw activation tokens (store only
  the hashed verifier; emit raw once via the approved channel) (AD-4, AD-38).
- Sensitive operations MUST be auditable via the append-only `audit` module; never update or
  delete audit records or write the table directly.
- Enforce invariants at the database layer where possible (unique constraints, FKs, NOT NULL)
  in addition to application checks. Treat partial writes as data-integrity failures.
- Keep dependencies trusted and pinned; flag unusual/typosquat-looking packages. Do not add
  dependencies the task does not need.

## 7. TypeScript / React / frontend standards

- Composition-first, reusable components with clear responsibility boundaries and accessible
  APIs. Use semantic HTML.
- Server state is TanStack Query v5 only; React context is for UI state (theme, language, auth
  token) only (AD-18). No server data in context.
- Derive, don't duplicate, state. Avoid unnecessary `useEffect`; clean up every side effect
  (subscriptions, timers, listeners). Memoize only on demonstrated need.
- Extract a custom hook when logic is genuinely reused or clarifies a component; avoid prop
  drilling where a justified shared-state mechanism already exists; avoid unnecessary global
  state.
- Forms use React Hook Form + `zodResolver` with shared-types schemas (AD-19). Form state must
  survive language/theme switches.
- Styling uses semantic design tokens from `tokens.css` (values copied from DESIGN.md, never
  edited in isolation — AD-10). No hardcoded hex/px outside the token scale.
- No new UI framework or component library without an approved AD.

## 8. Design-system & component consistency

- Reuse shared UI components (`src/components/ui/*`) before creating new ones; a new component
  is justified only when no existing one fits.
- Interaction states (default, hover, active, focus, disabled, loading, error) MUST be
  defined and visually consistent across the app, using token values.
- Typography, spacing, radius, and component sizing come from DESIGN.md tokens
  (e.g. button/input heights, card/table padding, touch target ≥ 44px). Do not invent sizes.
- Respect the five-role scoped navigation: no role sees another role's nav or surfaces.

## 9. Responsive & mobile-first

- Design mobile-first: the primary student device is a low-to-mid-range Android phone browser.
  Layouts MUST be usable and uncluttered at small widths before scaling up.
- Admin/finance desktop surfaces MAY be denser but MUST remain functional on smaller screens
  (no horizontal overflow traps; tables degrade gracefully).
- Interactive targets MUST meet the 44px minimum touch target. Avoid hover-only affordances
  for actions needed on touch devices.

## 10. Sinhala / English bilingual UX

- Every user-facing string goes through `t()` or `<Trans>`; raw literals in JSX are a lint
  error (AD-6). `en/` and `si/` keys MUST stay at parity — `pnpm validate-i18n` gates this.
- No feature gaps between languages; both are first-class across all roles and journeys.
- Sinhala layout rules: `min-height` not fixed `height`; body `line-height ≥ 1.75`; never apply
  `text-transform: uppercase` or `letter-spacing` to Sinhala text (DESIGN.md).
- Background-job notifications render the translated string at **write time** from the
  recipient's `preferred_language` (AD-51) — translation is never deferred to display.

## 11. Accessibility, usability & WCAG 2.2 AA

- Target **WCAG 2.2 AA** and apply WAI-ARIA Authoring Practices for interactive widgets.
  Full conformance requires manual assistive-technology testing and expert review — state this
  rather than claiming unverified conformance.
- Keyboard operability for all interactive elements; visible focus ring (token `focus-ring`);
  logical tab order; no keyboard traps.
- Provide labels/`aria-*` and roles via semantic HTML first, ARIA only to fill gaps. Images
  need alt text; form fields need associated labels and error messaging tied via `aria-describedby`.
- Meet AA contrast using semantic tokens in both light and dark themes.
- Apply Nielsen's heuristics: visible system status, user control, error prevention, and clear
  recovery.

## 12. Error handling, loading & empty states

- Every data-driven view MUST handle four states explicitly: **loading** (skeletons driven by
  TanStack `isLoading`), **empty** (helpful, actionable), **error** (translated, recoverable),
  **success**.
- Frontend maps backend `ERR_*` codes to translated messages via `t('errors:CODE')`; never
  surface raw codes or backend prose to users.
- Fail fast internally, degrade gracefully externally. Never swallow errors silently; log with
  `requestId` for traceability.

## 13. Performance & scalability

- Choose appropriate algorithmic complexity and efficient DB access; avoid N+1 and unbounded
  result sets. Paginate and index intentionally.
- Frontend: avoid unnecessary re-renders, apply route-level code splitting / lazy loading for
  heavy surfaces, and serve efficient assets (self-hosted font subset, `font-display: swap`).
- Measure before optimizing. Premature optimization that harms readability is a defect; so is
  shipping an obvious O(n²)-on-large-input hot path.

## 14. Testing & quality assurance

- Follow the testing pyramid pragmatically and test **observable behavior**, not internal
  implementation detail:
  - **Unit** — isolated business logic (services, pure functions, money math).
  - **Integration** — module + persistence boundaries (Prisma against a real/test PostgreSQL).
  - **Component** — UI behavior and accessibility (Vitest + Testing Library).
  - **E2E** — critical journeys UJ-1–UJ-5 in en/si and light/dark (Playwright, AD-22).
  - **Regression** — a failing test reproducing any fixed defect.
- Cover negative paths, boundary values, and authorization/invariant failures — not only happy
  paths. Use deterministic fixtures.
- Do not add tests speculatively for unrequested behavior, but any new feature or bug fix MUST
  ship with the tests that prove it.
- Never weaken, skip, or delete a test to make a gate pass. All gates MUST pass honestly.

## 15. Git, CI/CD & code review

- Never push to `main`; PRs only. Stage specific files; keep commits scoped. Do not amend
  pushed commits or skip hooks. Flag any file that may contain secrets before committing.
- A PR is mergeable only when the full CI gate passes: `pnpm -r typecheck`, `pnpm lint`
  (ESLint + Prettier), `pnpm -r test`, `pnpm validate-i18n`, backend build, frontend build,
  and (where present) `redocly lint`. Run typecheck and tests separately — tests don't cover
  typecheck.
- Do not merge or push automatically on the user's behalf unless explicitly asked.

### Review quality gates (every BMAD independent review MUST assess)

SOLID & separation of concerns · KISS/DRY/YAGNI · architecture & AD compliance · coupling and
cohesion · component/API design · type safety · error handling · security & authorization ·
data integrity & concurrency · performance risks · accessibility & UI/UX consistency · test
quality and coverage of important behavior · maintainability & unnecessary complexity.

Treat genuine correctness, security, data-integrity, and acceptance-criteria failures as
**blocking**. Do **not** block on speculative abstractions or purely stylistic refactors with
no demonstrated value.

## 16. Documentation & decision traceability

- Keep code self-documenting; reserve prose comments for non-obvious rationale.
- Public module service functions and DTOs carry accurate types and Swagger decorators that
  serve as the API contract.
- When a decision meaningfully deviates from or extends an AD, record it through the approved
  BMAD/architecture process and reference the AD — do not bury architecture changes in code.
- Update the relevant planning/implementation artifact when behavior changes; do not let docs
  and code drift.

## 17. BMAD workflow discipline

- Respect the spec → design → tasks → build → review flow. The spec is the source of truth for
  an implementation task; load its declared context before coding.
- Keep sprint status and story state accurate; don't mark work done before its Definition of
  Done is met.
- These standards are available to BMAD review and build subagents through always-on steering;
  reviewers MUST apply the §15 review gates.

## 18. Engineering decision checklist

Before implementing or approving, confirm:

1. Satisfies the stated requirements / acceptance criteria.
2. Follows the approved architecture and ADs.
3. Consistent with existing conventions.
4. Simplest maintainable solution (KISS/YAGNI).
5. Preserves security, authorization, and data integrity.
6. Accessible (WCAG 2.2 AA) and usable in both languages and themes.
7. Testable — and tested for the behavior it adds.
8. Extensible without unnecessary abstraction.
9. Handles error conditions, edge cases, and all four UI states.
10. Understandable and maintainable by the next developer.

When several valid solutions exist, prefer the proven, consistent, understandable one over the
novel or trend-driven one. Where principles conflict, make an explicit, justified trade-off
rather than mechanically enforcing every rule.

## Definition of Done

A unit of work is Done only when **all** hold:

- Meets its acceptance criteria and preserves all relevant ADs and business invariants.
- `typecheck`, `lint`, `test`, `validate-i18n`, and both builds pass locally and in CI.
- New/changed behavior is covered by appropriate tests, including a negative path.
- Fully bilingual (en/si at key parity) and correct in light and dark themes.
- Loading, empty, error, and success states are implemented for data-driven views.
- Meets WCAG 2.2 AA for the changed surfaces (keyboard, focus, contrast, labels).
- No secrets committed; no weakened auth/authz/financial safeguards; money uses `Decimal`.
- Consistent with the design system and existing components; no orphaned/dead code.
- Documentation/artifacts updated where behavior or contracts changed.
