---
title: 'Story 1.6: Core UI Component Library'
type: 'feature'
created: '2026-10-28'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: 'bcfb669c74028035147d7a8e972451cb5a116c7b'
context:
  - '{project-root}/AGENTS.md'
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/_bmad-output/ux/ux-epapere-2026-10-16/DESIGN.md'
  - '{project-root}/_bmad-output/ux/ux-epapere-2026-10-16/EXPERIENCE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Story 1.5 shipped the semantic token foundation (`tokens.css`, fonts, Tailwind v4 dark variant) but no components. Every subsequent epic — registration, payments, dashboards — needs a consistent, accessible, bilingual-ready set of presentational primitives so features never re-implement a button or re-invent a status pill. Story 1.6 builds that reusable component library against the authoritative DESIGN.md and EXPERIENCE.md specs, and resolves the four Story-1.5 design-system gaps those components depend on (dark-mode status borders, focus-ring token, elevation/box-shadow tokens, Sinhala heading line-height).

**Approach:** Build presentational React components under `packages/frontend/src/components/ui/`, each styled only through Story 1.5 semantic tokens (never raw hex, except the two DESIGN.md-sanctioned literals: danger button `#ef4444`/`#dc2626` and the focus/error ring rgba glows DESIGN.md defines). Components are label-agnostic: they accept their text as props/children and carry no hardcoded user-facing English, so Story 1.7's i18n provider can supply translated strings later without touching component internals. The one exception is `StatusPill`, whose 14 states map to a shared label dictionary; it ships a self-contained bilingual label map keyed by `status` + `lang` (sourced verbatim from EXPERIENCE.md's status table) so the Story 1.6 AC ("status=APPROVED, lang=si -> approved-in-sinhala") is satisfiable now, with a documented migration path to `t('status:*')` namespaces in Story 1.7. Add the missing design tokens to `tokens.css` and expose the focus-ring / elevation / line-height utilities the components consume; update `tokens.test.ts` to lock the new values.

**Resolved decision (i18n strategy, approved 2026-10-28 — Option A):** (1) Components are label-agnostic — all user-facing labels, placeholders, descriptions, and accessible names arrive via props/children. (2) `StatusPill` alone carries a small, strongly-typed, self-contained bilingual (`en`/`si`) status-label map using the exact EXPERIENCE.md labels. (3) `StatusPill` takes an explicit `lang` prop, defaulting to `'en'` until Story 1.7 supplies app-wide language context. (4) `<StatusPill status="APPROVED" lang="si" />` renders the EXPERIENCE.md Sinhala "Approved" label. (5) The status->label map stays isolated in one file so Story 1.7 can replace it with the centralized `t('status:*')` system by editing one module. (6) This story introduces NO `react-i18next`, `I18nProvider`, app-wide language state, or locale JSON files. (7) The migration to centralized i18n is recorded as a Story 1.7 follow-up in `deferred-work.md` so two translation systems do not persist. These points are locked intent, not implementation detail.

## Boundaries & Constraints

**Always:**
- Every color/spacing/radius/type value resolves to a Story 1.5 semantic token (`var(--color-*)`, Tailwind token utility, or a new token added to `tokens.css`). The ONLY raw hex permitted in component code are the DESIGN.md-sanctioned literals: Danger button `#ef4444` / hover `#dc2626`, input/file error ring `rgba(239,68,68,.15)`, focus glow `rgba(62,58,152,.15)`, elevation shadow `rgba(62,58,152,.10)` / dark `rgba(0,0,0,.3)`, modal overlay `rgba(0,0,0,.5)`. Any new reusable value is added to DESIGN.md's component spec it already defines and mirrored as a token — never invented.
- New tokens added to `tokens.css` come verbatim from DESIGN.md's existing component/elevation specs (focus-ring, elevation shadows, Sinhala heading line-height `1.4`). Do not derive new colors (AD-10).
- Resolve the four deferred Story-1.5 gaps before consuming them: (a) dark-mode status `-border` tokens — keep the documented Light-value gap-fill already in `.dark` and note it is intentional pending DESIGN.md authoritative dark values; (b) add a token-based focus utility; (c) add elevation + focus-glow + error-glow shadow tokens; (d) add `--leading-heading-sinhala: 1.4` and an `html[lang='si']` heading line-height rule.
- Every interactive element has a visible focus ring: `outline: 3px solid var(--color-brand); outline-offset: 2px` (white ring on the Today's-Class banner). Focus must never rely on color alone and must be visible in both themes.
- Full keyboard operability: buttons/links reachable and activatable (Enter/Space), file-upload zone `tabindex=0` + Enter/Space opens dialog, dialog traps focus + ESC closes + restores focus to the opener, toasts announced via `role=alert`/`aria-live`.
- Accessible labelling: icon-only buttons require `aria-label`; inputs associate `<label>` via `htmlFor`/`id`; error text associated via `aria-describedby` + `aria-invalid`; required fields mark `aria-required` and show the DESIGN.md danger asterisk.
- Bilingual-ready: components never hardcode user-facing English inside the component; text arrives via props/children. `StatusPill` labels come from the shared status dictionary. Sinhala text uses `min-height` not fixed `height`, no `letter-spacing`/`uppercase`, and body line-height >=1.75 / heading >=1.4 inherited from base-layer rules.
- Light + Dark parity through tokens only — no per-theme component variants (DESIGN.md "Don't create separate variants").
- Touch targets >=44x44px on mobile-targeted interactive elements; primary button >=40px tall on mobile.
- TypeScript strict passes (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`); ESLint + Prettier clean; existing `App.smoke` and `tokens` tests stay green.

**Never:**
- Do not build `App.tsx` shell, routing, `ThemeContext`, `I18nProvider`, `AuthProvider`, Topbar, Sidebar, or Mobile Bottom Nav — those are Story 1.7. (The Topbar/Sidebar/BottomNav *compositions* are shell; this story ships only the reusable primitives they will consume.)
- Do not wire `react-i18next` / create `locales/{en,si}/*.json` namespaces or the `t()`-based translation runtime — Story 1.7. `StatusPill`'s bilingual map is a self-contained stopgap, not the i18n system.
- Do not implement the real presigned R2 network flow, auth, payments, enrollment, or any business logic. `FileUploadZone` renders the three visual phases (idle/preparing/uploading/confirming/complete/error) driven by props only — no actual `fetch`/`XMLHttpRequest` to R2.
- Do not add heavyweight dependencies (no component library, no CVA/clsx unless a tiny local helper suffices). Prefer a small local `cx` utility over a new package.
- Do not touch backend, shared-types, Prisma, CI gate logic, or DESIGN.md hex values.
- Do not add `box-shadow` as the primary elevation mechanism — borders carry elevation; shadows are reserved for Elevated/Focus levels per DESIGN.md.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Button primary focus | `<Button variant="primary">` focused via keyboard | `outline: 3px solid var(--color-brand)`, `outline-offset: 2px` visible | N/A |
| Button disabled | `<Button disabled>` | `aria-disabled`/`disabled`, disabled tokens, no hover, `cursor: not-allowed`; click handler not fired | N/A |
| Button loading | `<Button loading>` | spinner shown, `aria-busy="true"`, interaction suppressed | N/A |
| Input error | `<Input error="msg" />` | danger border + error ring, message below in `--color-danger`, `aria-invalid="true"`, `aria-describedby` -> message id | message rendered from prop (already translated) |
| Input required + label | `<Input label="Email" required />` | `<label htmlFor>` bound to input `id`; danger asterisk; `aria-required="true"` | N/A |
| StatusPill APPROVED / si | `<StatusPill status="APPROVED" lang="si" />` | EXPERIENCE.md Sinhala "Approved" label; bg `--color-success-bg`, text `--color-success`, 6px dot | unknown status -> render nothing + dev warning |
| StatusPill all 14 states | each `status` value | correct semantic token pair + en/si label from EXPERIENCE.md table | N/A |
| Dialog open | `<Dialog open>` | focus moves to dialog, `role="dialog" aria-modal="true"`, ESC closes, focus restored to opener | N/A |
| Toast error | `<Toast variant="error">` | `role="alert" aria-live="assertive"`, persistent (no auto-dismiss) | N/A |
| FileUploadZone uploading | `phase="uploading" progress={47}` | determinate `role="progressbar" aria-valuenow="47"`, "47%" label | phase="error" -> red border, assertive alert, Try Again |
| Dark mode render | `.dark` ancestor present | all components repaint via token reassignment; no per-variant code | N/A |
| Sinhala card | long Sinhala text in `<Card>` | container grows via `min-height`/flow; no clip; line-height >=1.75 | N/A |

</frozen-after-approval>

## Code Map

- `packages/frontend/src/styles/tokens.css` -- EDIT. Add component tokens verbatim from DESIGN.md: `--shadow-elevated` (`0 4px 20px rgba(62,58,152,.10)` light / `0 4px 20px rgba(0,0,0,.3)` dark), `--shadow-card-hover` (`0 2px 8px rgba(62,58,152,.08)`), `--ring-focus` (`0 0 0 3px rgba(62,58,152,.15)`), `--ring-error` (`0 0 0 3px rgba(239,68,68,.15)`), `--focus-outline-width: 3px`, `--leading-heading-sinhala: 1.4`. Keep the `.dark` status-`-border` gap-fill (documented). Dark `--shadow-*` override under `.dark`.
- `packages/frontend/src/styles/index.css` -- EDIT. Map new shadow utilities into `@theme` (`--shadow-elevated`, `--shadow-card-hover`) so `shadow-elevated` utility generates; add base-layer `html[lang='si'] :is(h1,h2,h3,h4,h5,h6) { line-height: var(--leading-heading-sinhala); }` heading rule (resolves deferred gap).
- `packages/frontend/src/components/ui/` -- NEW directory. One file per component (+ co-located `*.test.tsx`): `Button.tsx`, `Input.tsx`, `Select.tsx`, `Textarea.tsx`, `FileUploadZone.tsx`, `Card.tsx`, `StatusPill.tsx`, `Table.tsx`, `Dialog.tsx`, `Toast.tsx`, `Skeleton.tsx`, `AnnouncementBanner.tsx`, `SkipLink.tsx`.
- `packages/frontend/src/components/ui/status-labels.ts` -- NEW. `StatusKey` union (14 states) + `statusLabels: Record<StatusKey, { en: string; si: string }>` + `statusToken: Record<StatusKey, 'success'|'warning'|'danger'|'info'>`. Labels copied verbatim from EXPERIENCE.md "Status language" table.
- `packages/frontend/src/components/ui/cx.ts` -- NEW. Tiny `cx(...classes)` className joiner (falsy-filtering); avoids a `clsx` dependency.
- `packages/frontend/src/components/ui/index.ts` -- NEW. Barrel re-export of all components + `status-labels` types.
- `packages/frontend/src/components/ui/*.test.tsx` -- NEW (co-located). RTL + user-event + jest-dom tests for variants, a11y states, interactions (see Tasks).
- `packages/frontend/src/__tests__/tokens.test.ts` -- EDIT. Add assertions locking the new shadow/ring/focus/Sinhala-heading tokens and the `html[lang='si']` heading line-height rule.
- `packages/frontend/vitest.config.ts` / `src/test-setup.ts` -- READ ONLY. jsdom + jest-dom already configured; `@testing-library/user-event` present.
- `packages/frontend/package.json` -- READ ONLY. All test deps present; no new runtime deps expected.
- `packages/frontend/src/App.tsx` -- READ ONLY. Leave untouched so `App.smoke` passes; do NOT mount components here (that is shell/Story 1.7).

## Tasks & Acceptance

**Execution:**
- [x] `packages/frontend/src/styles/tokens.css` -- Add the elevation/ring/focus/Sinhala-heading tokens verbatim from DESIGN.md (`--shadow-elevated`, `--shadow-card-hover`, `--ring-focus`, `--ring-error`, `--focus-outline-width`, `--leading-heading-sinhala`) under `:root`, with dark `--shadow-*` under `.dark`; retain documented status-`-border` gap-fill. -- Resolves the deferred Story-1.5 token gaps components consume (AD-10: copied, not invented).
- [x] `packages/frontend/src/styles/index.css` -- Map `--shadow-elevated`/`--shadow-card-hover` into `@theme`; add `html[lang='si']` heading line-height (`var(--leading-heading-sinhala)`) base rule. -- Exposes shadow utilities + closes the Sinhala-heading gap.
- [x] `packages/frontend/src/components/ui/cx.ts` -- Local className joiner. -- Avoids a dependency; keeps components maintainable.
- [x] `packages/frontend/src/components/ui/status-labels.ts` -- 14-state `StatusKey` union, bilingual `statusLabels`, `statusToken` map from EXPERIENCE.md. -- Single source for pill labels + semantic token mapping.
- [x] `packages/frontend/src/components/ui/Button.tsx` -- Variants primary/secondary/danger/ghost/icon, sizes md/sm, `loading`/`disabled` states, token-based focus ring, `aria-busy`/`aria-disabled`, icon-button `aria-label` requirement typed. -- DESIGN.md Buttons spec.
- [x] `packages/frontend/src/components/ui/Input.tsx`, `Select.tsx`, `Textarea.tsx` -- 38px height, label+`htmlFor`, required asterisk + `aria-required`, helper text, error state (danger border + `--ring-error`, `aria-invalid`, `aria-describedby`), disabled tokens; `Select` custom arrow `appearance:none`. -- DESIGN.md Form Controls + EXPERIENCE.md form behavior.
- [x] `packages/frontend/src/components/ui/FileUploadZone.tsx` -- Prop-driven phases idle/dragging/preparing/uploading(+`progress`)/confirming/complete/error with the exact ARIA per EXPERIENCE.md Upload States table; `tabindex=0`, Enter/Space opens dialog; drag-over styling; NO real network. -- Presentational three-phase upload per AD-35 UX (logic deferred to Epic 4).
- [x] `packages/frontend/src/components/ui/Card.tsx` -- Surface bg + border + `--radius-lg`, header/body slots, optional interactive hover (`--color-border-strong` + `--shadow-card-hover`), `min-height` friendly. -- DESIGN.md Cards.
- [x] `packages/frontend/src/components/ui/StatusPill.tsx` -- `status` (14 states) + `lang` props (default `'en'`); text from `statusLabels`, colors from `statusToken`, 6px dot, pill radius; unknown status -> render null + dev warn. -- DESIGN.md Status Pills + EXPERIENCE.md labels; satisfies the si-label AC.
- [x] `packages/frontend/src/components/ui/Table.tsx` -- Semantic `<table>`, elevated header row, hover rows, EP-ID mono cell affordance, pagination row (Prev/Next + count) as presentational props (page/pageSize/total), `scope="col"`. -- DESIGN.md Tables + AD-47 pagination affordance (no data fetching).
- [x] `packages/frontend/src/components/ui/Dialog.tsx` -- `role="dialog" aria-modal`, `aria-labelledby`, overlay, focus trap + initial focus, ESC closes, focus restore to opener, footer action slot. -- DESIGN.md Dialogs + EXPERIENCE.md confirmation behavior.
- [x] `packages/frontend/src/components/ui/Toast.tsx` -- Variants success/warning/error/info, `role="alert"`, `aria-live` polite (assertive for error), optional auto-dismiss timer (persistent for error), left accent border. -- DESIGN.md Toast.
- [x] `packages/frontend/src/components/ui/Skeleton.tsx` -- Shimmer block honoring passed dimensions, `aria-hidden`, token-based shimmer colors (light/dark). -- DESIGN.md/EXPERIENCE.md Loading State.
- [x] `packages/frontend/src/components/ui/AnnouncementBanner.tsx` -- Inline banner variants success/warning/danger/info/neutral, icon + title + body, `--radius-lg`. -- DESIGN.md Announcement/State Banners.
- [x] `packages/frontend/src/components/ui/SkipLink.tsx` -- Visually-hidden-until-focused "skip to main content" link targeting `#main`, token focus ring. -- Keyboard a11y primitive (scope list).
- [x] `packages/frontend/src/components/ui/index.ts` -- Barrel export. -- Single import surface for feature epics.
- [x] `packages/frontend/src/components/ui/*.test.tsx` -- RTL/user-event tests per component covering the I/O matrix: Button focus-ring class + disabled/loading no-fire; Input error ARIA wiring + label association; StatusPill all 14 states en+si (incl. APPROVED/si Sinhala label) + token class; Dialog focus-trap/ESC/restore; Toast role/live; FileUploadZone phase ARIA incl. progressbar valuenow; Card Sinhala min-height; Select/Textarea error+disabled. -- Durable regression coverage for variants, a11y, interactions.
- [x] `packages/frontend/src/__tests__/tokens.test.ts` -- Lock new shadow/ring/focus tokens + `--leading-heading-sinhala` + the `html[lang='si']` heading rule. -- Extends the AD-10 contract test.

**Acceptance Criteria:**
- Given `<Button variant="primary">` rendered and focused, when the focus ring is inspected, then `outline: 3px solid var(--color-brand)` with `outline-offset: 2px` is applied (white ring on the Today's-Class banner variant).
- Given `<StatusPill status="APPROVED" lang="si" />`, when rendered, then it displays the EXPERIENCE.md Sinhala "Approved" label and its background resolves to `--color-success-bg` with text `--color-success`.
- Given any of the 14 status values with `lang="en"` and `lang="si"`, when rendered, then the label matches the EXPERIENCE.md status table and the color pair matches the semantic token for that state.
- Given a disabled or loading `<Button>`, when clicked, then the click handler does not fire and `aria-disabled`/`aria-busy` is set appropriately.
- Given `<Input error="..." required label="..." />`, when rendered, then the label is programmatically associated, `aria-invalid="true"`, `aria-required="true"`, and `aria-describedby` points to the error message element.
- Given an open `<Dialog>`, when it mounts, then focus moves into the dialog; pressing ESC closes it and returns focus to the element that opened it.
- Given a `<Toast variant="error">`, when rendered, then it has `role="alert"` with `aria-live="assertive"` and does not auto-dismiss.
- Given `pnpm -r typecheck`, `pnpm lint`, `pnpm -r test`, `pnpm validate-i18n`, and `pnpm --filter @e-papere/frontend build`, when run, then all pass (existing App.smoke + tokens tests stay green; no new locale keys introduced that break the i18n gate).

## Implementation Notes

- **2026-10-28 — implemented.** Built the 13-component library under `packages/frontend/src/components/ui/` plus `cx.ts`, `status-labels.ts`, and the `index.ts` barrel. Added the deferred Story-1.5 tokens to `tokens.css` (`--shadow-elevated`, `--shadow-card-hover`, `--ring-focus`, `--ring-error`, `--focus-outline-width`, `--leading-heading-sinhala`), mapped the two shadow tokens into `@theme`, and added the `html[lang='si']` heading line-height base rule + the `.ep-skeleton` shimmer utility (with `prefers-reduced-motion` guard) in `index.css`. Co-located a `*.test.tsx` per component and extended `tokens.test.ts`. 94 frontend tests total.
- **Partial-dispatch recovery.** The step-03 implementation subagent dispatch failed mid-run on a network error after creating the token edits, `tokens.test.ts`, and 13 of the component source files (no `FileUploadZone.tsx`, no `index.ts`, no component tests). Implementation continued directly from the spec: authored the missing `FileUploadZone.tsx`, the barrel, and all component tests, then reviewed every subagent-authored file against the spec before accepting it.
- **Strict-mode fixes applied during verification.** (a) `FieldLabel`/`FieldMessage` helper prop types widened to `?: T | undefined` so `exactOptionalPropertyTypes` accepts the forwarded optional props. (b) `AnnouncementBannerProps` now `Omit<HTMLAttributes, 'title'>` because `title?: ReactNode` conflicts with the DOM `title?: string`. (c) Added `src/vite-env.d.ts` (`/// <reference types="vite/client" />`) so `import.meta.env.DEV` is typed for StatusPill's dev-warning guard — the standard Vite convention, no tsconfig change.
- **RTL cleanup.** Vitest is not configured with `globals: true`, so React Testing Library's automatic post-test cleanup did not run and repeated renders leaked into the DOM (role/text queries matched multiple elements). Registered an explicit `afterEach(cleanup)` in the shared `src/test-setup.ts`. This is a test-infra fix that benefits every future component suite.
- **Sanctioned raw literals used.** Danger button `#ef4444`/`#dc2626` (Button, FileUploadZone error border), modal overlay `rgba(0,0,0,.5)` (Dialog). The focus/error/elevation rgba glows live ONLY in `tokens.css` as `--ring-*`/`--shadow-*`; components reference the tokens. One further literal: the Select custom-arrow inline SVG embeds `%236b6b8a` (the `--color-text-muted` light hex) as the stroke color inside a `data:` URL — a data-URI SVG cannot read a CSS var; flagged for review as a minor token-purity exception (it does not retint in dark mode, but the arrow on a surface-colored control stays legible in both themes).
- **i18n (Option A, approved).** No `react-i18next`/provider/locale files added; `validate-i18n` stays at "nothing to validate". `StatusPill` carries the only hardcoded labels, isolated in `status-labels.ts` with the 14 EXPERIENCE.md states verbatim (en+si) and a `lang` prop defaulting to `'en'`. Migration to centralized i18n recorded in `deferred-work.md`.
- **Scope held.** No `App.tsx`/shell/routing/ThemeContext/providers (Story 1.7); `App.tsx` untouched so `App.smoke` stays green. No real upload network, auth, payments, or business logic. No new runtime dependencies (lockfile unchanged).
- **Verification results (all green).** `pnpm -r typecheck` (3/3) · `pnpm lint` (ESLint clean + Prettier "All matched files use Prettier code style!") · `pnpm -r test` (shared-types 2, backend 1, frontend 94 = 97) · `pnpm validate-i18n` (exit 0) · `pnpm --filter @e-papere/frontend build` (27 modules, CSS 25.21 kB — shadow/skeleton/Sinhala-heading utilities confirmed present in compiled output) · `pnpm --filter @e-papere/backend build` (exit 0). I/O matrix: every row has a covering test that ran and passed.
- **Post-review re-verification (2026-10-28, after review patches).** `pnpm -r typecheck` (3/3) · `pnpm lint` clean · `pnpm -r test` (shared-types 2, backend 1, frontend 99 = 102) · `pnpm validate-i18n` (exit 0) · `pnpm --filter @e-papere/frontend build` (CSS 26.98 kB — `si:` variant + `.ep-select-arrow` utility confirmed in compiled output; raw `#6b6b8a` arrow hex removed from component code) · `pnpm --filter @e-papere/backend build` (exit 0).

## Spec Change Log

- **2026-10-28 — independent code review.** Applied 7 in-scope patch fixes (Table Sinhala header casing via a new `si:` variant; theme-aware Select arrow; Dialog focus-trap `offsetParent` bug + focus-restore guard; Toast undismissable-error guard; AnnouncementBanner contrast; SkipLink `#main-content` default). Added 4 behavior tests (Dialog Tab/Shift+Tab, Select arrow wrapper, Table Sinhala header, Toast close-label guard). Frontend tests 94 → 99. Recorded 3 deferred items + 1 decision-needed (StatusPill radius — DESIGN.md self-conflict). Re-verified all gates green. Intent / frozen sections unchanged.
- **2026-10-28 — StatusPill radius decision resolved (Option 2, approved by Aditya).** Status pills are fully rounded: `StatusPill.tsx` → `rounded-full` (`--radius-full`, 9999px) with a radius-asserting test (frontend tests 99 → 100). DESIGN.md updated to remove the Shapes-table vs component-spec contradiction (status pills 9999px; non-status compact badges/chips 4px) with an explicit resolution note. Semantic tokens, spacing, colors, and status→token mappings unchanged. No remaining review blockers.

## Review Triage Log

### Review Findings (independent BMAD code review — 2026-10-28)

FULL-mode review (blind-hunter · edge-case-hunter · verification-gap · acceptance-auditor) against the uncommitted Story 1.6 change set (base `bcfb669`). All four layers completed; none failed. Verdicts rendered after per-finding verification at the cited code.

**Decision-needed (1) — RESOLVED 2026-10-28**

- [x] [Review][Decision] StatusPill border-radius — **RESOLVED (Option 2, approved by Aditya 2026-10-28): status pills are fully rounded.** DESIGN.md was internally contradictory (Shapes table said pills/badges = `4px (--radius-sm)`; the "Status Pills / Badges" component spec said `border-radius: 9999px`). Decision: status pills use `9999px` (`--radius-full`); the 4px radius applies to non-status compact badges/chips only. Applied: `StatusPill.tsx` now uses `rounded-full` (+ test asserting it); DESIGN.md Shapes table split into "Status pills (9999px)" vs "Compact badges, inline chips (4px)" and the Status Pills component spec carries an explicit resolution note — no remaining contradiction. All semantic tokens, spacing, colors, and the 14-state status→token mappings are unchanged. [StatusPill.tsx:72, DESIGN.md Shapes + Status Pills]

**Patch — fixed in this review (7)**

- [x] [Review][Patch] Table column headers forced `uppercase` + `0.06em` letter-spacing on ALL languages incl. Sinhala — violated DESIGN.md Sinhala rules + AGENTS.md §10 (DESIGN.md scopes uppercase/tracking to *English* headers). Added a token-scoped `si:` Tailwind variant (`html[lang='si']`) and `si:normal-case si:tracking-normal` on `<th>`; added a covering test. [Table.tsx:76, index.css]
- [x] [Review][Patch] Select custom arrow hardcoded raw hex `%236b6b8a` in a data-URI SVG that never retinted in dark mode (and a comment falsely claiming "no raw hex / currentColor"). Replaced with a token-tinted `.ep-select-arrow::after` mask coloured by `var(--color-text-muted)` (retints via `.dark`); added a test. [Select.tsx:40, index.css]
- [x] [Review][Patch] Dialog focus trap filtered focusables by `offsetParent !== null`, which is null for the `position: fixed` dialog subtree in real browsers (and always in jsdom) — collapsing the set to one element and letting Tab escape the trap. Removed the unreliable filter; added Tab + Shift+Tab wrap tests. [Dialog.tsx:84]
- [x] [Review][Patch] Persistent error Toast could be undismissable (close button gated on `onDismiss && closeLabel`; an error toast with `onDismiss` but no `closeLabel` had no dismissal path). Added a dev-time `console.error` guard + a covering test; documented the `closeLabel` requirement. [Toast.tsx]
- [x] [Review][Patch] Dialog restored focus to the opener without checking it is still connected — if the opener was removed while the dialog was open, focus silently fell to `<body>`. Added an `isConnected` guard. [Dialog.tsx:62]
- [x] [Review][Patch] AnnouncementBanner body used `text-current/90`, eroding the AA contrast margin of status foreground tokens on their tinted backgrounds. Dropped the opacity reduction. [AnnouncementBanner.tsx:63]
- [x] [Review][Patch] SkipLink defaulted its target to `#main` while EXPERIENCE.md's Accessibility Floor mandates `#main-content` for the `<main>` landmark and skip-link target. Aligned the default (still overridable via `targetId`); updated the test. [SkipLink.tsx]

**Deferred (3)** — see `deferred-work.md`

- [x] [Review][Defer] FileUploadZone performs no client-side 5 MB / MIME validation before `onFileSelected` (AD-35 two-layer guard). Deferred: the spec scopes real upload logic — including the AD-35 client guard — to Epic 4 (Story 4.3); Story 1.6 is presentational only.
- [x] [Review][Defer] FileUploadZone drop/native-change `onFileSelected` path has no test. Deferred: acceptable until Epic 4 consumes the component with real selection logic; the keyboard/phase-ARIA paths are covered now.
- [x] [Review][Defer] `deferred-work.md`'s Story-1.7 note says "delete `status-labels.ts`" but `index.ts` publicly re-exports `statusLabels`/`statusToken`/`isStatusKey` + types — the breaking surface is the public barrel API, not one file. Deferred: the fix edits an agent-context planning doc (`deferred-work.md`), done below rather than in code.

**Rejected (11)**

- `false` — Button `type` + `{...rest}` ordering "defaults to submit": when the caller omits `type`, `rest` has no `type` key, so the explicit `type={rest.type ?? 'button'}` stands; the "defaults to type=button" test passes. No bug.
- `false` — Toast `role="alert"` + `aria-live="polite"` "contradiction": this is DESIGN.md's verbatim spec ("`role="alert" aria-live="polite"` (assertive for errors only)"). Following authority, not a defect.
- `false` — `aria-dropeffect` "deprecated": EXPERIENCE.md's Upload States table explicitly specifies `aria-dropeffect="copy"` for the dragging state. Matches authority.
- `false` — StatusPill `import.meta.env.DEV` "coupling": standard Vite dev-warning idiom; the unknown-status branch is only reachable by defeating the `StatusKey` type. `vite-env.d.ts` types it correctly.
- `false` — StatusPill `lang` "unguarded → undefined label": `lang` is typed `StatusLang` (`'en' | 'si'`); only reachable by a JS caller defeating types. Not a runtime path in a strict-TS codebase.
- `low` (rejected) — FileUploadZone nests `role="progressbar"` inside `role="button"`: negligible in everyday AT use; fix would restructure the element tree for no demonstrated harm.
- `low` (rejected) — Table has no empty-state affordance + missing `total===0`/single-page pagination tests: Table is presentational and renders an empty `<tbody>` correctly; empty-state belongs to the data-driven consuming view (standards §12), not the primitive.
- `low` (rejected) — Dialog empty/whitespace `title` → no accessible name: `title` is a required prop; the unlabelled-dialog case needs a caller to pass an empty node. Fix adds a guard/branch for an unlikely path.
- `low` (rejected) — Dialog single-focusable-element trap edge: the length-0 path already focuses the panel; the single-element case is handled by the wrap logic. Negligible.
- `low` (rejected) — Toast auto-dismiss timer resets if `onDismiss` identity changes each render: a real React footgun but low-impact; the fix (latest-ref indirection) adds complexity for an unlikely frequent-re-render caller.
- `low` (rejected) — status-labels.test.ts checks the map against a hand-copied fixture rather than EXPERIENCE.md: inherent to static fixtures; a coordinated edit to both would evade any in-repo test. Negligible given the "verbatim" comment and the fixture's own drift-guard intent.



**Token-driven theming (no per-theme variants).** Components reference token utilities / `var(--color-*)` only; `.dark` reassigns the underlying variables so one class set themes both modes. New shadow/ring values are added as tokens so components never inline the rgba literals twice.

**Sanctioned raw hex.** DESIGN.md itself hardcodes a handful of literals that are NOT in the 28-token map: Danger button `#ef4444`/`#dc2626`, and the rgba glows for focus/error/elevation/overlay. These are allowed in component code because they come verbatim from DESIGN.md's component spec; everything else must be a token. The glows are centralized as `--ring-*`/`--shadow-*` tokens so only `tokens.css` holds them.

**StatusPill label dictionary (golden shape).**
```ts
// labels copied verbatim from EXPERIENCE.md "Status language" table
export const statusLabels = {
  APPROVED: { en: 'Approved', si: '<sinhala approved>' },
  // ...14 entries
} as const;
export const statusToken = { APPROVED: 'success', OVERDUE: 'danger', /* ... */ } as const;
```
Pill renders `bg-{token}-bg text-{token} border-{token}-border` from `statusToken[status]`. Story 1.7 later replaces `statusLabels[status][lang]` with `t('status:'+status)` — isolated to this one file.

**Focus ring via outline (not box-shadow).** DESIGN.md specifies `outline: 3px solid var(--color-brand); outline-offset: 2px` for focusable controls (distinct from the input focus *glow* `--ring-focus`). Use a shared focus utility/class so every interactive primitive is consistent and testable.

## Verification

**Commands:**
- `pnpm install --frozen-lockfile` -- expected: success, lockfile unchanged (no new deps).
- `pnpm -r typecheck` -- expected: all 3 packages pass under strict + `exactOptionalPropertyTypes`.
- `pnpm lint` -- expected: ESLint clean + Prettier "All matched files use Prettier code style!".
- `pnpm -r test` -- expected: all suites pass incl. new component tests; App.smoke + tokens green.
- `pnpm validate-i18n` -- expected: exit 0 (no locale namespace files added by this story).
- `pnpm --filter @e-papere/frontend build` -- expected: Vite production build succeeds; new shadow/ring utilities compile; no Tailwind/PostCSS errors.

**Manual checks:**
- Render each component in a scratch harness in both `.dark` and light, and `lang="si"`/`lang="en"`; confirm token repaint, visible focus ring on keyboard tab, Sinhala text wraps without clipping and headings use >=1.4 line-height.
