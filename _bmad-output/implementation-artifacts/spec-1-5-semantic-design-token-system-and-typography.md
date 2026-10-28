---
title: 'Story 1.5: Semantic Design Token System and Typography'
type: 'feature'
created: '2026-10-27'
status: 'done'
route: 'dispatch'
review_loop_iteration: 1
baseline_commit: '3b6e0b3609ddcfe97668f0a176e5d941e165a3cf'
context:
  - '{project-root}/AGENTS.md'
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/_bmad-output/ux/ux-epapere-2026-10-16/DESIGN.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The frontend package has Tailwind CSS v4 installed but no CSS entry file, no design tokens, no fonts, and no dark-mode wiring. Nothing is imported into the app. Every subsequent frontend story (1.6 components, 1.7 shell, all role dashboards) needs a token-based styling foundation so components never hardcode hex values or font families. Story 1.5 establishes that foundation exactly as specified in the authoritative `DESIGN.md`.

**Approach:** Create a Tailwind v4 CSS entry (`src/styles/index.css`) that imports Tailwind, declares the dark-mode custom variant, imports a self-hosted font `@font-face` sheet, and imports `src/styles/tokens.css`. `tokens.css` holds all 28 semantic color tokens under `:root` (Light Mode) and `.dark` (Dark Mode), plus typography, spacing, radius, and component-dimension tokens — values copied verbatim from `DESIGN.md`. A Tailwind `@theme` block maps semantic utility classes (`bg-surface`, `text-brand`, `border-border`, `font-sans`, `font-sinhala`, radius/spacing scale) to the CSS variables. Inter and Noto Sans Sinhala are self-hosted under `public/fonts/` with `font-display: swap`; the Sinhala file is the Sinhala-subset woff2 (U+0D80–U+0DFF) kept ≤200 kB. The CSS entry is imported once from `main.tsx`.

## Boundaries & Constraints

**Always:**
- `DESIGN.md` is the single authoritative source for every token name and hex value. Copy values verbatim; never invent, round, or re-derive a color (AD-10). Brand `#3E3A98` and white `#FFFFFF` are locked.
- All 28 semantic color tokens appear under both `:root` (Light) and `.dark` (Dark) with the exact DESIGN.md hex values for each mode.
- Dark mode uses Tailwind v4 `@custom-variant dark (&:where(.dark, .dark *))` in the CSS entry — never a `tailwind.config.js darkMode` key, never `@variant`, and `:where()` not `:is()` (AD-46).
- Noto Sans Sinhala is self-hosted, same-origin, subset to U+0D80–U+0DFF, `font-display: swap`, payload ≤200 kB (AD-28). Inter is self-hosted with `font-display: swap`.
- Sinhala typographic rules encoded in CSS: `html[lang="si"]` root family = Sinhala stack; Sinhala body `line-height: 1.75`; no `letter-spacing` / `text-transform: uppercase` applied to Sinhala text (DESIGN.md).
- Semantic utilities resolve to `var(--color-*)` via `@theme` so components reference token names only.
- TypeScript strict and existing lint/format rules continue to pass; the `App.smoke` test (expects visible text `e-Paperé`) keeps passing.

**Never:**
- Do not build the ThemeContext / theme toggle React logic (Story 1.7, AD-9) — this story provides only the CSS `.dark` foundation and the token system the context will later toggle.
- Do not build any UI component (Button, Card, Status Pill, etc. — Story 1.6) or app shell / routing (Story 1.7).
- Do not add i18n translation files or locale namespaces (Story 1.7). Do not introduce raw user-facing strings in JSX beyond the existing placeholder.
- Do not load fonts from a runtime CDN (Google Fonts network request) in production CSS — must be same-origin self-hosted (AD-28). A vendored file sourced from a CDN at build-prep time is fine; a live `@import url(https://fonts.googleapis…)` is not.
- Do not touch backend, shared-types, Prisma, auth, payments, or CI gate logic.
- Do not put hex values anywhere except `tokens.css` (and the one gradient/`#ef4444` literals DESIGN.md defines for banner/danger-button, which are component concerns deferred to 1.6 — not in scope here).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Light mode render | `html` has no `.dark` class | `getComputedStyle` of `--color-brand` resolves to `#3E3A98`; `--color-surface` to `#ffffff` | N/A |
| Dark mode render | `html.dark` applied | `--color-brand` resolves to `#6562e8`; `--color-surface` to `#171630` | N/A |
| Semantic utility | element with `class="bg-surface text-brand border-border"` | background = `var(--color-surface)`, color = `var(--color-brand)`, border-color = `var(--color-border)` | N/A |
| Sinhala root | `html[lang="si"]` | root `font-family` = Noto Sans Sinhala stack; body line-height ≥1.75 | N/A |
| Font load | browser requests Sinhala font | one same-origin woff2 ≤200 kB; `font-display: swap` in its `@font-face` | fallback to Noto Sans → system-ui until loaded |
| Font budget | Sinhala subset woff2 on disk | file size ≤200 kB, verified by an automated size test | test fails build if exceeded |

</frozen-after-approval>

## Code Map

- `packages/frontend/src/styles/tokens.css` -- NEW. All 28 color tokens under `:root` + `.dark`; typography scale (sizes/weights/line-heights), spacing (4px grid), radius, and component-dimension custom properties. Values copied verbatim from DESIGN.md frontmatter + token tables.
- `packages/frontend/src/styles/fonts.css` -- NEW. `@font-face` declarations for Inter (latin) and Noto Sans Sinhala (sinhala subset), all `font-display: swap`, `src: url('/fonts/...woff2')` same-origin. Defines `--font-sans-en` / `--font-sans-si` usage via the stacks in tokens.css.
- `packages/frontend/src/styles/index.css` -- NEW. CSS entry: `@import 'tailwindcss';` → `@custom-variant dark (&:where(.dark, .dark *));` → `@import './fonts.css';` → `@import './tokens.css';` → `@theme { ... }` mapping semantic utilities to `var(--color-*)` and font/radius/spacing tokens → base layer defaults (`body` background/text/font, `html[lang="si"]` family, Sinhala line-height + no-uppercase rules).
- `packages/frontend/public/fonts/` -- NEW. Self-hosted woff2 files: `inter-latin-400/500/600/700-normal.woff2` (or a single variable file) and `noto-sans-sinhala-sinhala-variable.woff2` (U+0D80–U+0DFF subset, ≤200 kB).
- `packages/frontend/src/main.tsx` -- EDIT. Add `import './styles/index.css';` as the first import so Vite processes the token/Tailwind entry. No other change.
- `packages/frontend/index.html` -- EDIT (optional, minimal). Add `<link rel="preload">` for the two primary font files to reduce FOUT; keep `lang="en"` (runtime lang switch is Story 1.7, already deferred).
- `packages/frontend/src/App.tsx` -- READ ONLY. Must keep rendering `e-Paperé` so `App.smoke` passes; may receive token-based classes only if it stays a single placeholder div (prefer leaving untouched).
- `packages/frontend/src/__tests__/tokens.test.ts` -- NEW. jsdom test asserting token resolution (light defaults present on `:root`, `.dark` overrides differ) by parsing the CSS, plus a Node `fs.statSync` test asserting the Sinhala font woff2 is ≤200 kB.
- `packages/frontend/vite.config.ts` / `vitest.config.ts` -- READ ONLY. Tailwind plugin already wired; jsdom + setup already configured.
- `packages/frontend/package.json` -- READ ONLY unless a font-subsetting devDependency proves necessary (prefer vendoring prebuilt subset files to avoid lockfile churn).

## Tasks & Acceptance

**Execution:**
- [ ] `packages/frontend/public/fonts/` -- Vendor self-hosted woff2 files: Inter latin (weights 400/500/600/700, or one variable woff2) and Noto Sans Sinhala **sinhala-subset** variable woff2 (U+0D80–U+0DFF only). Confirm the Sinhala file is ≤200 kB on disk. -- Satisfies AD-28 self-hosted same-origin subset; keeps payload within budget.
- [ ] `packages/frontend/src/styles/fonts.css` -- Declare `@font-face` for each vendored file with `font-display: swap`, correct `font-weight` ranges, and `unicode-range: U+0D80-0DFF` on the Sinhala face. -- Registers fonts same-origin with swap behavior.
- [ ] `packages/frontend/src/styles/tokens.css` -- Define all 28 color tokens under `:root` (Light values) and `.dark` (Dark values) exactly per DESIGN.md; add typography (`--font-sans-en`, `--font-sans-si`, `--text-*`, `--weight-*`, `--leading-*`), spacing (`--space-1..12`), radius (`--radius-sm..full`), and component dimension tokens (`--topbar-height`, `--sidebar-width`, etc.). -- The authoritative token contract (AD-10).
- [ ] `packages/frontend/src/styles/index.css` -- Tailwind entry with import order: `tailwindcss` → `@custom-variant dark (&:where(.dark, .dark *))` → fonts → tokens → `@theme` mapping (`--color-brand: var(--color-brand)` etc. so `bg-brand`/`text-brand`/`border-border`/`bg-surface` work; `--font-sans`, `--font-sinhala`; radius + spacing scale) → base layer (`body { background: var(--color-bg); color: var(--color-text); font-family: var(--font-sans-en); }`, `html[lang="si"] { font-family: var(--font-sans-si); }`, Sinhala `line-height: 1.75` + `text-transform: none` + `letter-spacing: normal`). -- Wires tokens to utilities and dark mode per AD-46.
- [ ] `packages/frontend/src/main.tsx` -- Add `import './styles/index.css';` as first import. -- Loads the foundation into the app.
- [ ] `packages/frontend/index.html` -- Add `<link rel="preload" as="font" type="font/woff2" crossorigin>` for the primary Inter + Sinhala files. -- Reduces FOUT; optional, non-functional-breaking.
- [ ] `packages/frontend/src/__tests__/tokens.test.ts` -- Unit-test the I/O matrix edge cases: (a) read `tokens.css`, assert all 28 `--color-*` names exist under both `:root` and `.dark` and that brand/surface differ between modes with the exact DESIGN.md hex; (b) `fs.statSync` the Sinhala woff2 and assert `size <= 200*1024`; (c) assert `index.css` contains the exact `@custom-variant dark (&:where(.dark, .dark *))` line and `font-display: swap` appears in `fonts.css`. -- Durable regression protection for the token contract + font budget.

**Acceptance Criteria:**
- Given an element with `class="bg-surface text-brand border-border"`, when rendered in Light Mode, then its resolved background/color/border map to the DESIGN.md Light token hexes (`#ffffff` / `#3E3A98` / `#e8e6ff`).
- Given `html.dark` is present, when the same element renders, then the resolved values map to the DESIGN.md Dark token hexes (`#171630` / `#6562e8` / `#252347`).
- Given the Noto Sans Sinhala font file, when its on-disk size is measured, then it is ≤200 kB and its `@font-face` declares `font-display: swap` and the Sinhala unicode-range.
- Given `pnpm --filter @e-papere/frontend build`, when it runs, then Vite produces a production bundle that includes the compiled token CSS and emits the font assets, with no Tailwind/PostCSS errors.
- Given `pnpm -r typecheck`, `pnpm lint`, `pnpm -r test`, and `pnpm validate-i18n`, when run, then all pass (App.smoke still green; new tokens test green; no new locale keys added).

## Implementation Notes

- **2026-10-27 — implemented.** Created `src/styles/{index,tokens,fonts}.css`, vendored two self-hosted woff2 fonts under `public/fonts/` with an OFL `LICENSE.md`, wired `import './styles/index.css'` as the first import in `main.tsx`, added two `<link rel="preload">` font hints to `index.html`, and added `src/__tests__/tokens.test.ts`.
- **Fonts (self-hosted, AD-28).** Vendored prebuilt variable woff2 subsets from the Fontsource CDN (jsDelivr) at build-prep time — no npm dependency, lockfile unchanged (`--frozen-lockfile` stays clean). Measured sizes: Inter latin = **47.1 kB**; Noto Sans Sinhala sinhala-subset = **126.9 kB** (well under the 200 kB budget). Both declared `font-display: swap`; Sinhala `@font-face` scoped with `unicode-range: U+0D80-0DFF`. Build confirmed both assets copied to `dist/fonts/` and preload links present in the emitted HTML. `format('woff2-variations')` used because both files carry a weight axis (`font-weight: 100 900`).
- **Tailwind v4 wiring (AD-46).** `index.css` order: `@import 'tailwindcss'` → `@custom-variant dark (&:where(.dark, .dark *))` → fonts → tokens → `@theme` → base layer. Utilities resolve to `var(--color-*)`; because `.dark` reassigns those variables, a single class set themes in both modes. Confirmed no `:is(.dark` and no `@variant` usage (asserted by test).
- **Dark-mode status-border gap-fill (worth noting).** DESIGN.md's Dark Mode token table omits explicit dark values for `--color-success-border`, `--color-warning-border`, `--color-danger-border`, and `--color-info-border` (it lists the text + `-bg` rows but not the `-border` rows). Since the Light table defines them and future components reference them, `.dark` keeps the Light `-border` hexes as a safe fallback rather than inventing new dark values. This is a defensible gap-fill a user would not visually notice at this foundation stage (no component consumes these borders until Story 1.6). Flag for DESIGN.md to add authoritative dark `-border` values before Story 1.6 if different hues are wanted.
- **ThemeContext is NOT in scope.** This story ships only the CSS `.dark` foundation and token system; the React `ThemeContext`/`html.dark` toggle and `localStorage` persistence are Story 1.7 (AD-9), left untouched.
- **Token regression test.** `tokens.test.ts` parses the raw CSS (jsdom cannot compute Tailwind `@theme` output) and asserts: all 28 color tokens exist under both `:root` and `.dark`; key light/dark hexes match DESIGN.md exactly; dark overrides (not inverts) brand/surface; the exact `@custom-variant dark` line; `font-display: swap` on every face; same-origin `/fonts/` URLs only; and the Sinhala woff2 is ≤200 kB on disk. 12 assertions, all green. Addresses the "load-bearing foundation lacks a test" pattern flagged in the Story 1.4 review.
- **Verification results (all green).** `pnpm install --frozen-lockfile` (lockfile unchanged) · `pnpm -r typecheck` (3/3) · `pnpm lint` (ESLint clean + Prettier clean after formatting `fonts.css`) · `pnpm -r test` (shared-types 2, backend 1, frontend 13 — incl. 12 new token tests + App.smoke) · `pnpm validate-i18n` (exit 0, nothing to validate) · `pnpm --filter @e-papere/frontend build` (CSS 9.25 kB, fonts emitted) · `pnpm --filter @e-papere/backend build` (exit 0).
- **App.tsx left untouched** so the `App.smoke` test (`e-Paperé` placeholder) keeps passing; no raw-string/i18n scope was added (that is Story 1.7).

## Spec Change Log

## Review Triage Log

**2026-10-28 — Independent BMAD code review (FULL mode). Verdict: MERGE READY.**

Four review layers ran (Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor) against the uncommitted working-tree diff vs base `3b6e0b3`. All verification gates re-run and pass: `pnpm -r typecheck` (3/3), `pnpm lint` (ESLint + whole-repo Prettier clean), `pnpm -r test` (shared-types 2, backend 1, frontend 22), `pnpm validate-i18n` (exit 0), `pnpm --filter @e-papere/frontend build` (fonts emitted to `dist/fonts/`, preload links present). Font sizes on disk: Inter 47.1 kB, Noto Sans Sinhala 126.9 kB (≤200 kB). All 28 color tokens verified verbatim against DESIGN.md for both modes.

Decisive empirical check: built the frontend with a temporary probe and inspected the compiled CSS. The self-referential `@theme` pattern (`--color-brand: var(--color-brand)`) resolves correctly because `tokens.css` redeclares concrete values after `@theme` in the cascade and `.dark` reassigns them; utilities generate as `.bg-surface{background-color:var(--color-surface)}`, `.text-brand{color:var(--color-brand)}`, `.border-border{border-color:var(--color-border)}`. Acceptance Criteria #1 and #2 pass. Probe removed after verification.

**Fixes applied (in-scope, patch bucket):**
- Strengthened `tokens.test.ts` from 12 → 21 tests: all 28 Light values + all authoritative Dark values asserted verbatim against DESIGN.md (was ~6 spot-checks); pinned the four `.dark` status-border gap-fill values; added type-size / weight / line-height / spacing-grid / radius scale assertions (the "typography" half of the story was previously untested); added `html[lang='si']` base-layer rule assertions (root family, 1.75 line-height, no letter-spacing/uppercase); added an Inter payload bound (≤150 kB) alongside the existing Sinhala ≤200 kB check; added a preload-href ↔ `fonts.css` ↔ on-disk consistency check so a font rename can't leave a dangling 404 preload.

**Rejected / false findings:**
- Self-referential `@theme` "risks shadowing `:root`" — refuted by compiled-CSS inspection (cascade resolves correctly).
- "12 assertions vs 13 tests" contradiction — false; 12 `it()` in tokens.test.ts + 1 App.smoke = 13 frontend tests, consistent.
- fonts.css "no CDN" vs LICENSE.md "from CDN at build-prep" — both consistent (vendored at build time, served same-origin).
- Brand hex lowercase `#3e3a98` vs DESIGN.md `#3E3A98` — cosmetic; lowercase is the consistent project convention across all 27 other tokens; normalizing one value would introduce casing inconsistency. Value is CSS-identical. Not changed.
- Unconditional Sinhala font preload — fixing contradicts the spec task ("preload the primary Inter + Sinhala files").

**Deferred (see deferred-work.md 2026-10-28):** DESIGN.md dark `-border` values before 1.6; computed-style/Sinhala-render E2E to Story 9.3; line-height/dimension utility exposure to 1.6; focus-ring/elevation tokens to 1.6; Sinhala heading line-height to 1.6.

## Design Notes

**Token mapping in Tailwind v4.** v4 reads `@theme` to generate utilities. Define theme vars that *reference* the semantic custom properties so dark mode works through the `.dark` override of the underlying `--color-*`, e.g.:
```css
@import 'tailwindcss';
@custom-variant dark (&:where(.dark, .dark *));
@import './fonts.css';
@import './tokens.css';
@theme {
  --color-brand: var(--color-brand);
  --color-surface: var(--color-surface);
  --color-border: var(--color-border);
  --font-sans: var(--font-sans-en);
  --font-sinhala: var(--font-sans-si);
}
```
Because utilities resolve to `var(--color-brand)` and `.dark` reassigns `--color-brand`, a single class set themes correctly in both modes — no per-theme variants in components (DESIGN.md "Don't create separate component variants for light and dark").

**Font sourcing decision (resolved, no Open Question).** DESIGN.md states fonts load from `packages/frontend/public/fonts/` and AD-28 mandates self-hosted same-origin subset. Chosen: vendor prebuilt woff2 subset files directly into `public/fonts/` rather than adding an `@fontsource` npm dependency. Rationale: avoids `pnpm-lock.yaml` churn (the `--frozen-lockfile` verification stays clean), gives exact control over the Sinhala subset + file size, and matches the DESIGN.md path. The Sinhala file is the fontsource `sinhala` subset variable woff2 (SIL OFL, redistributable); Inter is the latin subset (SIL OFL). Licenses are OFL — redistribution with the files is permitted; include the OFL license text alongside the fonts.

**Why a tokens unit test.** The prior-story review for 1.4 flagged missing regression tests for load-bearing foundations. The token contract (28×2 hexes) and the 200 kB font budget are exactly the kind of silent-drift risks AGENTS.md warns about (AD-10 authoritative values, AD-28 budget), so a cheap fs/string-assert test is included even though the story AC does not strictly demand it.

## Verification

**Commands:**
- `pnpm install --frozen-lockfile` -- expected: success, lockfile unchanged (no new deps if fonts vendored).
- `pnpm -r typecheck` -- expected: all 3 packages pass.
- `pnpm lint` -- expected: ESLint clean + Prettier "All matched files use Prettier code style!".
- `pnpm -r test` -- expected: all suites pass incl. new `tokens.test.ts`; App.smoke still green.
- `pnpm validate-i18n` -- expected: exit 0 "nothing to validate" (no locale files added).
- `pnpm --filter @e-papere/frontend build` -- expected: Vite build succeeds; CSS compiled; font assets emitted to `dist/`.

**Manual checks:**
- `tokens.css` contains all 28 `--color-*` names under both `:root` and `.dark`; spot-check `--color-brand`, `--color-surface`, `--color-text`, `--color-danger` against DESIGN.md tables for both modes.
- `index.css` first statements are `@import 'tailwindcss';` then `@custom-variant dark (&:where(.dark, .dark *));`.
- `public/fonts/` Sinhala woff2 ≤200 kB; `fonts.css` has `font-display: swap` and `unicode-range: U+0D80-0DFF`.
