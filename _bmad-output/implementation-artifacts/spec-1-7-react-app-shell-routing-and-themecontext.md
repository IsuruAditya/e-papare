---
title: 'Story 1.7: React App Shell, Routing, and ThemeContext'
type: 'feature'
created: '2026-10-28'
status: 'done'
route: 'dispatch'
review_loop_iteration: 1
baseline_commit: 'd80d5f3e14df11cfea355da4d8290bbf256f7155'
context:
  - '{project-root}/AGENTS.md'
  - '{project-root}/.kiro/steering/engineering-quality-standards.md'
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/_bmad-output/implementation-artifacts/deferred-work.md'
  - '{project-root}/_bmad-output/ux/ux-epapere-2026-10-16/DESIGN.md'
  - '{project-root}/_bmad-output/ux/ux-epapere-2026-10-16/EXPERIENCE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Stories 1.5–1.6 shipped the token system and the presentational component library, but there is no application shell: `App.tsx` is a one-line placeholder, there is no router, no theme/language/auth global state, no role-scoped navigation, and no centralized i18n runtime. Every subsequent role-dashboard epic would otherwise re-establish layout, theming, routing, and translation plumbing. This story builds that authenticated shell once so feature epics mount into it.

**Approach:** Build `App.tsx` composing three UI-state React contexts — `ThemeContext` (toggles `html.dark`, persists `localStorage('epapere_theme')`), `I18nProvider` (react-i18next init over the nine locale namespaces, keeps `html lang` in sync, persists `localStorage('epapere_lang')`), and a minimal `AuthProvider` stub (holds `{ token, role }` as UI state per AD-18, real login deferred to Epic 2) — wrapped in `QueryClientProvider` and React Router v7. Add the shell chrome (Topbar with language switcher + theme toggle, role-scoped Desktop Sidebar, Tablet/other-role hamburger drawer, Student Mobile Bottom Navigation) and a `<ProtectedRoute role={...}>` that redirects unauthenticated users to `/` preserving `returnUrl`. Migrate `StatusPill` off its Story-1.6 stopgap label map onto the new `status` i18n namespace (deferred-work item). All shell strings go through `t()`; locale JSON files ship with en/si key parity.

**Resolved decisions (approved 2026-10-28):**
- **AuthProvider stub shape (Option A — dev/test seam, no login UI):** `AuthProvider` exposes `{ token: string | null, role: Role | null, isAuthenticated: boolean, setSession(session), clearSession() }` via `useAuth()`. It initializes to unauthenticated (`token: null`). It reads NO token from storage and ships NO login form — real JWT issuance, refresh, and persistence are Epic 2. Tests and future login code set state through `setSession`. This satisfies the "visit `/student` without a valid JWT → redirect" AC with a real, type-safe seam rather than a throwaway mock.
- **StatusPill i18n migration (Option A — preserve public API):** fold the label lookup into i18n and keep backward-compatible exports. `StatusPill` drops its `lang` prop default-coupling and resolves its label via `t('status:<STATUS_KEY>')` from the app language context; when an explicit `lang` prop is passed it still renders that language (compat). The 14 status strings move into `locales/{en,si}/status.json` verbatim from EXPERIENCE.md. `status-labels.ts` keeps `StatusKey`, `StatusLang`, `StatusTokenName`, `statusToken`, and `isStatusKey` (still barrel-exported). `statusLabels` is retained as a thin re-export sourced from the i18n resources so no existing import breaks, and is marked deprecated. This honors "preserve public API compatibility" from the deferred-work note.
- **Role enum source:** the five roles are `STUDENT | TEACHER | FINANCE_ADMIN | ADMINISTRATOR | SUPER_ADMINISTRATOR`, defined as a local frontend `Role` union in this story (the Prisma/shared-types enum arrives in Story 2.1); Story 2.1 reconciles the shared contract.
- **Route placeholders:** each role root route (`/student`, `/teacher`, `/finance`, `/admin`, `/owner`) renders a minimal placeholder page (role name heading via `t()`) inside the shell. Full dashboards are Epics 5/7 — this story ships only the shell and the route skeleton.

## Boundaries & Constraints

**Always:**
- Every user-facing string renders through `t()` or `<Trans>` (AD-6). No raw English/Sinhala literals in JSX. Shell strings live in the `common` namespace; status strings in `status`.
- i18n resolution order (AD-6/AD-7): `localStorage('epapere_lang')` → hardcoded `en` default. (DB `user.preferred_language` and Super-Admin default are Epic 2+; wire the localStorage-first + `en`-fallback layers now.) `fallbackLng: 'en'`; a missing key never shows a raw key or empty string in the UI.
- Language switch sets `document.documentElement.lang` to `'en'`/`'si'` synchronously and persists `epapere_lang`; it NEVER reloads the page or resets form state (AC-2).
- `ThemeContext` toggles `html.classList` `dark`, persists `localStorage('epapere_theme')`, and initializes from stored preference → `prefers-color-scheme` → light (AD-9). Theme change applies no color transition (EXPERIENCE.md).
- All server state goes through TanStack Query (`QueryClientProvider` mounted); React context holds ONLY UI state (theme, language, auth token) (AD-18).
- `<ProtectedRoute role={...}>`: unauthenticated → `<Navigate to="/" replace>` carrying the attempted path as `returnUrl` (query param or router state). Authenticated-but-wrong-role → an access-restricted view (not another role's surface). A role never renders another role's nav (DESIGN.md / EXPERIENCE.md five-role scoping).
- Shell layout uses semantic tokens and existing dimension tokens only (`--topbar-height` 52px, `--sidebar-width` 210px, `--mobile-nav-height` 60px); no raw hex/px outside the token scale except DESIGN.md-sanctioned literals (drawer backdrop `rgba(0,0,0,.4)`). Reuse Story-1.6 `components/ui/*` (`Button`, `SkipLink`, `cx`, `focusRing`, `StatusPill`) — do not re-implement primitives.
- Accessibility: `<SkipLink>` targeting `#main-content` first in document order; `<main id="main-content">` landmark; `<nav aria-label>` on sidebar, drawer, and bottom nav; focus moves to the page heading on route change; language switcher and theme toggle are keyboard-operable with visible focus ring and `aria-label`/`aria-pressed`; touch targets ≥44px. Respect `prefers-reduced-motion` for the drawer transition.
- Responsive per DESIGN.md: desktop (≥1024px) sticky sidebar; tablet (768–1023px) + non-Student mobile use topbar hamburger → slide-in drawer with backdrop (ESC/backdrop closes, focus trapped, restored to trigger); Student mobile (<768px) uses the 5-item bottom nav (Home · Courses · Payments · Notifications · Account).
- TypeScript strict (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) passes; ESLint (incl. react-hooks) + Prettier clean; all existing tests stay green.

**Never:**
- Do not implement real authentication, login/registration/activation UI, JWT issuance, refresh, or `PATCH /users/me/preferences` sync — Epic 2 (AD-49 preference mutation is explicitly background/later). The `AuthProvider` is a UI-state stub only.
- Do not build the actual role dashboards, course/payment/finance/admin/owner feature surfaces, or their nested routes beyond the role-root placeholder — Epics 3–8.
- Do not add a new UI framework, component library, router alternative, or state manager. Use the installed `react-router-dom` v7, `react-i18next`, `i18next`, `@tanstack/react-query`.
- Do not edit DESIGN.md hex values or `tokens.css` color values; do not introduce a `tailwind.config.js darkMode` key (AD-46 variant already owns dark mode).
- Do not fetch any server data or add notification-bell/avatar-menu real behavior (render as presentational placeholders with correct a11y); no polling (AD-50 is payment-page scope).
- Do not break existing public barrel exports from `components/ui/index.ts` (StatusPill migration must stay API-compatible per the resolved decision).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Unauthenticated protected visit | `token=null`, navigate `/student` | `<Navigate to="/" replace>`; `returnUrl=/student` preserved (readable on landing) | N/A |
| Authenticated correct role | `role=STUDENT`, visit `/student` | Student shell + placeholder renders; sidebar shows ONLY student nav | N/A |
| Authenticated wrong role | `role=STUDENT`, visit `/admin` | Access-restricted view (translated) with link back to own dashboard; admin nav never rendered | N/A |
| Language switch with open form | `lang=en`, a form has typed values, call switch to `si` | All labels re-render in Sinhala; `html lang="si"`; typed field values unchanged; no reload | missing si key → en fallback, never raw key |
| Theme toggle | `theme=light`, click toggle | `html.dark` added; `localStorage('epapere_theme')='dark'`; `aria-pressed`/`aria-label` update; no color transition | N/A |
| Theme initial load (returning user) | `localStorage('epapere_theme')='dark'` | shell mounts in dark; `html.dark` present before first paint (pre-hydration guard) | corrupt value → ignored, falls back |
| Theme initial load (new user, OS dark) | no stored theme, `prefers-color-scheme: dark` | shell mounts in dark | N/A |
| Tablet / non-student drawer | viewport 800px OR role≠student on mobile, click hamburger | drawer slides in, backdrop shown, focus trapped; ESC or backdrop click closes + restores focus to hamburger | N/A |
| Student mobile bottom nav | role=STUDENT, viewport 360px | 5-item bottom nav fixed at bottom; active item = brand color; sidebar hidden; Sinhala labels at 320px do not clip | N/A |
| Route change focus | navigate between shell routes | focus moves to the new page heading; skip link still first in tab order | N/A |
| StatusPill via i18n | `<StatusPill status="APPROVED" />`, app lang=si | renders "අනුමත"; bg `--color-success-bg`, text `--color-success` | unknown status → null + dev warn (unchanged) |

</frozen-after-approval>

## Code Map

- `packages/frontend/src/App.tsx` -- EDIT (replace placeholder). Compose providers + `RouterProvider`. Currently `return <div>e-Paperé</div>` — `App.smoke` test asserts this text; update that test alongside (see Tasks).
- `packages/frontend/src/main.tsx` -- READ-ONLY reference; renders `<App/>`. Pre-hydration theme guard goes in `index.html` instead (before React mounts).
- `packages/frontend/index.html` -- EDIT. Add a tiny inline head script that reads `localStorage('epapere_theme')` (→ `prefers-color-scheme`) and sets `html.dark` before first paint (FOUC guard). Keep `lang="en"` default (runtime updates it).
- `packages/frontend/src/app/` -- NEW directory for shell-level app wiring (contexts, router, layout, nav). Keeps `components/ui/*` (reusable primitives) separate from `app/*` (shell compositions), matching the Story-1.6 "Never build the shell here" boundary.
  - `app/theme/ThemeContext.tsx` -- NEW. `ThemeProvider` + `useTheme()`; `theme: 'light'|'dark'`, `toggleTheme()`, `setTheme()`; effect toggles `html.dark`, writes `epapere_theme`.
  - `app/theme/theme-storage.ts` -- NEW. Pure helpers: `readStoredTheme()`, `resolveInitialTheme()` (stored → `prefers-color-scheme` → light), `applyThemeClass(theme)`. Unit-testable without React.
  - `app/i18n/i18n.ts` -- NEW. i18next instance init: `fallbackLng: 'en'`, namespaces [`common`,`status`], resources imported from `locales/`, `lng` from `resolveInitialLanguage()`. No Suspense (resources bundled).
  - `app/i18n/I18nProvider.tsx` -- NEW. Wraps `<I18nextProvider>`; `useLanguage()` exposing `language`, `setLanguage(lng)`; effect syncs `document.documentElement.lang` + `epapere_lang` on change; subscribes to `i18n.on('languageChanged')`.
  - `app/i18n/language-storage.ts` -- NEW. `readStoredLanguage()`, `resolveInitialLanguage()` (stored → `en`), `isSupportedLanguage()`.
  - `app/auth/AuthContext.tsx` -- NEW. `AuthProvider` + `useAuth()` stub per resolved decision; `Role` union; `Session` type.
  - `app/router/ProtectedRoute.tsx` -- NEW. `role`-gated wrapper; `useAuth()` + `useLocation()`; redirect `/` with `returnUrl`; wrong-role → `<AccessRestricted/>`.
  - `app/router/routes.tsx` -- NEW. `createBrowserRouter` route tree: public `/` (landing placeholder with language switcher + returnUrl display), role roots under `AppLayout`, `*` → NotFound.
  - `app/layout/AppLayout.tsx` -- NEW. The shell: `SkipLink`, `Topbar`, responsive `Sidebar`/`Drawer`/`BottomNav` by role+viewport, `<main id="main-content">` with `<Outlet/>` + route-change focus.
  - `app/layout/Topbar.tsx` -- NEW. 52px sticky; logo, hamburger (drawer trigger, shown <1024px), `LanguageSwitcher`, `ThemeToggle`, notification bell + avatar placeholders.
  - `app/layout/LanguageSwitcher.tsx` -- NEW. `සිං | EN` toggle; `useLanguage()`; `aria-label` via `t()`.
  - `app/layout/ThemeToggle.tsx` -- NEW. 32px icon button; `useTheme()`; `aria-pressed` + `aria-label` via `t()`.
  - `app/layout/Sidebar.tsx` -- NEW. Desktop role-scoped nav from `nav-config`; active state via `NavLink`.
  - `app/layout/Drawer.tsx` -- NEW. Tablet/non-student mobile slide-in; backdrop, focus trap, ESC/backdrop close, restore focus.
  - `app/layout/BottomNav.tsx` -- NEW. Student-only 5-item mobile nav.
  - `app/layout/nav-config.ts` -- NEW. `Record<Role, NavItem[]>` with i18n key + path + icon; single source for role-scoped nav (DRY).
  - `app/layout/useRouteFocus.ts` -- NEW. Hook: move focus to page heading on pathname change.
  - `app/pages/*` -- NEW. Minimal placeholders: `Landing.tsx`, `AccessRestricted.tsx`, `NotFound.tsx`, and one `RolePlaceholder.tsx` reused per role root.
- `packages/frontend/src/locales/en/common.json`, `locales/si/common.json` -- NEW. Shell strings (app name, nav labels, theme/lang aria, skip link, access-restricted, not-found, landing). en/si key parity (validate-i18n gate).
- `packages/frontend/src/locales/en/status.json`, `locales/si/status.json` -- NEW. The 14 status strings verbatim from EXPERIENCE.md (migrated from `status-labels.ts`).
- `packages/frontend/src/components/ui/StatusPill.tsx` -- EDIT. Resolve label via `useTranslation('status')` → `t(status)`; keep optional `lang` prop for explicit-language rendering (compat); unknown-status null+warn unchanged.
- `packages/frontend/src/components/ui/status-labels.ts` -- EDIT. Keep `StatusKey`/`StatusLang`/`StatusTokenName`/`statusToken`/`isStatusKey`; convert `statusLabels` to a deprecated re-export derived from the i18n resources (or keep verbatim + mark deprecated) so barrel API is unbroken.
- `packages/frontend/src/components/ui/StatusPill.test.tsx` -- EDIT. Wrap renders in the i18n provider/test helper; assert si label still resolves.
- `packages/frontend/src/components/ui/index.ts` -- READ-ONLY (exports must remain valid; no removals).
- `packages/frontend/src/__tests__/App.smoke.test.tsx` -- EDIT. Update to render the shell (public `/` landing) rather than the old `<div>e-Paperé</div>`; assert the app mounts and the landing heading/language switcher render.
- `packages/frontend/src/test-setup.ts` -- READ-ONLY (afterEach cleanup already present).
- `packages/frontend/src/styles/index.css` -- POSSIBLE EDIT. Add only shell-scoped utilities that cannot be expressed with existing token utilities (e.g. drawer transition honoring `prefers-reduced-motion`, `sr-only` if not already provided by Tailwind). Prefer Tailwind utilities first.
- `packages/frontend/package.json` -- READ-ONLY. All deps present (`react-router-dom` 7, `react-i18next` 15, `i18next` 24, `@tanstack/react-query` 5). No new runtime deps expected.

## Tasks & Acceptance

**Execution:**
- [x] `src/app/theme/theme-storage.ts` + `src/app/theme/ThemeContext.tsx` -- Pure storage/resolve/apply helpers + `ThemeProvider`/`useTheme`. Toggles `html.dark`, persists `epapere_theme`, initializes stored → `prefers-color-scheme` → light. -- AD-9 theme architecture; shell-wide UI state.
- [x] `index.html` -- Inline pre-paint script setting `html.dark` from stored/OS preference before React mounts. -- Prevents flash-of-wrong-theme (resolves deferred Story-1.1 `lang`/theme note partially).
- [x] `src/locales/{en,si}/common.json` + `src/locales/{en,si}/status.json` -- Shell + status strings with exact en/si parity; status strings verbatim from EXPERIENCE.md. -- AD-6/AD-7 i18n; feeds validate-i18n gate.
- [x] `src/app/i18n/language-storage.ts` + `i18n.ts` + `I18nProvider.tsx` -- i18next init (`fallbackLng:'en'`, namespaces common/status, bundled resources), `useLanguage()`, `html lang` + `epapere_lang` sync on `languageChanged`. -- AD-6/AD-7; AC-2.
- [x] `src/app/auth/AuthContext.tsx` -- `AuthProvider`/`useAuth` UI-state stub exposing `{ token, role, isAuthenticated, setSession, clearSession }`; `Role` union + `Session` type. -- AD-18 (token as UI state); seam for Epic 2.
- [x] `src/app/router/ProtectedRoute.tsx` -- Role-gated wrapper: unauth → redirect `/` with `returnUrl`; wrong role → `<AccessRestricted/>`. -- AC-1; five-role scoping.
- [x] `src/app/layout/nav-config.ts` -- `Record<Role, NavItem[]>` (i18n key, path, icon). -- Single source for role-scoped nav (DRY, no cross-role leakage).
- [x] `src/app/layout/Topbar.tsx` + `LanguageSwitcher.tsx` + `ThemeToggle.tsx` -- 52px sticky topbar; keyboard-operable switcher/toggle with `aria-label`/`aria-pressed` via `t()`. -- DESIGN.md Topbar; EXPERIENCE.md switcher/toggle behavior.
- [x] `src/app/layout/Sidebar.tsx` + `Drawer.tsx` + `BottomNav.tsx` + `useRouteFocus.ts` (+ `NavList.tsx`) -- Desktop sidebar, tablet/non-student drawer (focus trap, ESC/backdrop close, restore), student mobile bottom nav; route-change focus hook. A shared `NavList` renders sidebar + drawer items (DRY). -- DESIGN.md responsive nav; EXPERIENCE.md focus mgmt + accessibility floor.
- [x] `src/app/layout/AppLayout.tsx` + `src/app/pages/{Landing,AccessRestricted,NotFound,RolePlaceholder}.tsx` -- Shell composition with `SkipLink` + `<main id="main-content">`; minimal translated placeholders. -- Scope: shell + route skeleton only.
- [x] `src/app/router/routes.tsx` + `src/App.tsx` -- Route tree (`/`, role roots under `AppLayout`, `*`→NotFound); `App` composes `QueryClientProvider`→`ThemeProvider`→`I18nProvider`→`AuthProvider`→`RouterProvider`. -- Shell entrypoint.
- [x] `src/components/ui/StatusPill.tsx` + `status-labels.ts` -- Migrate label lookup to `t('status:*')`; keep `lang` prop (explicit override) + all other barrel exports; `statusLabels` retained as a deprecated compat export DERIVED from the i18n JSON (single source). -- Deferred-work StatusPill migration, API-compatible.
- [x] `src/components/ui/StatusPill.test.tsx` + `src/__tests__/App.smoke.test.tsx` -- Updated StatusPill tests to render under i18n (si label via explicit `lang` + app-language); rewrote smoke test for the shell landing. -- Keep suites green against new runtime.
- [x] Shell component tests (co-located `*.test.tsx`) + `src/test-utils.tsx` -- ProtectedRoute redirect+returnUrl+wrong-role; ThemeContext toggle/persist/init; I18nProvider language switch keeps form values + sets `html lang`; LanguageSwitcher/ThemeToggle a11y + keyboard; Drawer focus-trap/ESC/restore+role scoping; AppLayout skip link + sidebar role scoping + BottomNav student-only 5 items; route-change focus; theme-storage/language-storage pure-fn units. Shared `test-utils` render helpers. -- Durable regression coverage for the I/O matrix + ACs.

**Acceptance Criteria:**
- Given an unauthenticated user navigates to `/student`, when the route resolves, then they are redirected to `/` and the attempted path is preserved as `returnUrl` (readable by the landing page).
- Given a form with typed values is open and `i18n.changeLanguage('si')` is invoked, when the re-render completes, then all shell labels display Sinhala, every typed field value is unchanged, and `document.documentElement.lang === 'si'`.
- Given a user toggles the theme, when the toggle fires, then `html.dark` is added/removed, `localStorage('epapere_theme')` is updated, and the toggle's `aria-pressed`/`aria-label` reflect the new state — with no full page reload.
- Given a `STUDENT`-role user, when any shell route renders, then only Student navigation items appear and no Teacher/Finance/Admin/Owner nav is present in the DOM.
- Given `<StatusPill status="APPROVED" />` under the Sinhala app language, when rendered, then it displays "අනුමත" and the Story-1.6 public barrel exports (`statusToken`, `isStatusKey`, `StatusKey`) still import successfully.
- Given `pnpm -r typecheck`, `pnpm lint`, `pnpm -r test`, `pnpm validate-i18n`, `pnpm --filter @e-papere/frontend build`, and `pnpm --filter @e-papere/backend build`, when run, then all pass (en/si key parity holds; existing tokens tests stay green).

## Implementation Notes

- **2026-10-28 — implemented directly from spec.** The step-03 implementation subagent dispatch failed on a transient network error before doing any work (tree was clean — only the spec + sprint-status edits existed). Per the step-03 fallback ("If no subagents are available, implement directly from the spec"), implementation was done directly, loading the `context:` files first.
- **Files added (frontend only).** `app/theme/{theme-storage.ts,ThemeContext.tsx}`, `app/i18n/{language-storage.ts,i18n.ts,I18nProvider.tsx}`, `app/auth/AuthContext.tsx`, `app/router/{ProtectedRoute.tsx,routes.tsx}`, `app/layout/{AppLayout,Topbar,LanguageSwitcher,ThemeToggle,Sidebar,Drawer,BottomNav,NavList}.tsx + nav-config.ts + useRouteFocus.ts`, `app/pages/{Landing,AccessRestricted,NotFound,RolePlaceholder}.tsx`, `locales/{en,si}/{common,status}.json`, `test-utils.tsx`, and co-located tests. Edited: `App.tsx`, `index.html` (FOUC guard), `components/ui/{StatusPill.tsx,status-labels.ts,StatusPill.test.tsx}`, `__tests__/App.smoke.test.tsx`, `styles/index.css` (drawer slide-in utility, reduced-motion-aware). No backend/shared-types/DESIGN.md/token-color changes.
- **NavList extraction (not in the original Code Map).** Sidebar and Drawer rendered identical nav-item lists; extracted a shared `NavList` to keep active/hover/focus styling identical and avoid duplication (DRY). This is an added file, not a scope change.
- **StatusPill i18n migration — single source, API-compatible.** The 14 status strings now live in `locales/{en,si}/status.json`. `StatusPill` resolves via `useTranslation('status')`: app language when no `lang` prop, `i18n.getFixedT(lang,'status')` when `lang` is passed (preserves the Story-1.6 `lang="si"` call site). `status-labels.ts` keeps `StatusKey`/`StatusLang`/`StatusTokenName`/`statusToken`/`isStatusKey` and now DERIVES the deprecated `statusLabels` from the JSON resources — so the Story-1.6 barrel API and the verbatim `status-labels.test.ts` fixture both stay valid with no second translation system.
- **I18nProvider robustness fix.** The provider re-aligns the module-scoped i18next instance to the resolved initial language on mount (`if (i18n.language !== initial) changeLanguage(initial)`). This guards a stale language across re-mounts (notably test isolation) and keeps `html lang` + the rendered strings in agreement.
- **FOUC guard.** `index.html` runs a tiny pre-paint inline script mirroring `theme-storage` precedence (stored `epapere_theme` → `prefers-color-scheme` → light) so dark mode paints correctly on first load before React mounts. This also partially resolves the deferred Story-1.1 `index.html` `lang`/theme note (theme at paint time; `lang` is then kept current at runtime by `I18nProvider`).
- **Scope held.** No real auth/login/JWT/refresh, no `PATCH /users/me/preferences` sync, no real notification-bell/avatar behavior, no role dashboards beyond the role-root placeholder, no new runtime dependencies (all of `react-router-dom` 7, `react-i18next` 15, `i18next` 24, `@tanstack/react-query` 5 were already present). `AuthProvider` is a UI-state stub initialized unauthenticated with a `setSession` seam for Epic 2/tests — no fake production auth, no token persistence.
- **Sanctioned raw literals.** Drawer backdrop `rgba(0,0,0,0.4)` (EXPERIENCE.md tablet drawer). All other colors/dimensions resolve to Story-1.5 tokens; the 52px/210px/60px chrome uses `var(--topbar-height)`/`var(--sidebar-width)`/`var(--mobile-nav-height)`.
- **Verification results (all green).** `pnpm -r typecheck` (3/3) · `pnpm lint` (ESLint clean + Prettier "All matched files use Prettier code style!") · `pnpm -r test` (shared-types 2, backend 1, frontend 134 = 137) · `pnpm validate-i18n` (exit 0 — `common` + `status` en/si parity) · `pnpm --filter @e-papere/frontend build` (132 modules; CSS 29.44 kB incl. drawer/nav utilities; JS 342.71 kB) · `pnpm --filter @e-papere/backend build` (exit 0). Every I/O-matrix row has a covering test that ran and passed.

## Spec Change Log

## Design Notes

- **Provider nesting order:** `QueryClientProvider` (outermost) → `ThemeProvider` → `I18nProvider` → `AuthProvider` → `RouterProvider`. Theme/i18n are independent of auth and router; auth is read by `ProtectedRoute` inside the router, so `AuthProvider` must wrap `RouterProvider`.
- **Form-state survival on language switch (AC-2):** react-i18next re-renders via context without unmounting the tree, so uncontrolled/controlled input values persist naturally. The hazard is remounting on a `key` tied to language or routing — do NOT key the layout/outlet on `language`. A test types into an input, switches language, and asserts the value survived.
- **StatusPill compat:** signature stays `{ status, lang?, className? }`. When `lang` is omitted, label comes from the app i18n context (`t('status:STATUS')`); when `lang` is passed, render that language explicitly via `i18n.getFixedT(lang, 'status')` so the Story-1.6 `lang="si"` call site still works. `statusToken`, `isStatusKey`, and the type exports are untouched; only the label SOURCE changes.
- **returnUrl mechanism:** prefer `?returnUrl=<encoded path>` on the redirect so it is inspectable in tests and survives a future real login redirect; Landing reads it via `useSearchParams`.

## Verification

**Commands:**
- `pnpm -r typecheck` -- expected: all packages pass, no strict-mode errors.
- `pnpm lint` -- expected: ESLint clean (incl. react-hooks, no-console), Prettier reports all files formatted.
- `pnpm -r test` -- expected: shared-types + backend unchanged; frontend suite green including new shell tests and updated StatusPill/App.smoke.
- `pnpm validate-i18n` -- expected: exit 0; `common` + `status` namespaces report en/si key parity.
- `pnpm --filter @e-papere/frontend build` -- expected: `tsc --noEmit` + `vite build` succeed; router/i18n code compiles.
- `pnpm --filter @e-papere/backend build` -- expected: unaffected, exit 0.

**Manual checks:**
- Run the dev server; verify theme toggle has no FOUC on reload with dark stored, language switch keeps a typed form value and flips `html lang`, Student mobile (<768px) shows bottom nav, tablet shows hamburger→drawer with ESC/backdrop close, and visiting `/admin` as an unauth user lands on `/` with `?returnUrl=/admin`.

## Review Findings

_Code review (FULL mode) — 2026-10-28. Four layers: Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor. All in-scope patch findings were fixed in this pass; gates re-run green (typecheck 3/3, lint clean, 145 tests, i18n parity, both builds)._

### Patch (fixed this review)

- [x] [Review][Patch] Non-dashboard nav links dead-ended on the top-level 404 [packages/frontend/src/app/router/routes.tsx] — `nav-config` advertises 4–10 links per role but each role branch defined only an `index` route, so every link except the dashboard (e.g. `/student/courses`, `/admin/students`) fell through to the bare `*` NotFound outside the shell. Added a `{ path: '*' }` child under each role's `AppLayout` that renders `RolePlaceholder` inside the shell, so in-role sub-paths show a coming-soon placeholder with full chrome until their epic ships the real route. Regression test: `routes.test.tsx`.
- [x] [Review][Patch] Hamburger rendered on desktop alongside the persistent sidebar [packages/frontend/src/app/layout/Topbar.tsx] — `AppLayout` always passed `showMenuButton` and the hamburger button carried no responsive-hide class, so at ≥1024px the hamburger showed and opened a `lg:hidden` (invisible) drawer — a dead control contradicting EXPERIENCE.md (desktop = persistent sidebar, no hamburger). Added `lg:hidden` to the hamburger. Regression test: `Topbar.test.tsx`.
- [x] [Review][Patch] Real Landing `returnUrl` display was unverified [packages/frontend/src/app/pages/Landing.test.tsx] — `ProtectedRoute.test` proved the redirect EMITS `?returnUrl` against a stub landing; nothing rendered the real `Landing` to prove it READS and displays the decoded path (AC-1's "readable by the landing page" half). Added `Landing.test.tsx` using the previously-unused `renderWithProviders` harness (also resolves that dead-code note).
- [x] [Review][Patch] Notification bell + account avatar were focusable no-op controls [packages/frontend/src/app/layout/Topbar.tsx] — both rendered as enabled `<button>`s a keyboard/screen-reader user could activate to silently do nothing (least astonishment / error prevention). Marked `disabled` with `disabled:` styling until their epics (6, 2/7) wire behavior. Regression test: `Topbar.test.tsx`.
- [x] [Review][Patch] Public Landing had `#main-content` but no skip link [packages/frontend/src/app/pages/Landing.tsx] — the first surface every unauthenticated user hits lacked the skip link the a11y floor mandates for a `#main-content` landmark. Added `<SkipLink>` as the first element. Covered by `Landing.test.tsx`.
- [x] [Review][Patch] Dead/speculative translation keys shipped [packages/frontend/src/locales/{en,si}/common.json] — `app.tagline`, `nav.sessions`, `nav.registerStudent` were defined in both locales but referenced nowhere (YAGNI). Removed from both; en/si parity preserved (validate-i18n green).

### Deferred (out of scope for this story / institute deliverable / future-epic concern)

- [x] [Review][Defer] `si` label `topbar.language.switchToEnglish` is left as the English string "Switch to English" — key parity holds, but the Sinhala wording is untranslated. Deferred: exact Sinhala string content is an Institute deliverable, not UX/architecture scope (EXPERIENCE.md OI-03). Settle by having the institute supply the Sinhala text; then update the key and `LanguageSwitcher.test`.
- [x] [Review][Defer] NotFound links to public `/` ("Go to the home page") rather than a role-aware "Go to Dashboard" [packages/frontend/src/app/pages/NotFound.tsx] — EXPERIENCE.md specifies a role-appropriate dashboard button for 404. Deferred: NotFound also renders for unauthenticated users who have no role, so a role-aware destination needs the real auth/role availability that Epic 2 provides. `AccessRestricted` already routes role-aware.
- [x] [Review][Defer] `AccessRestricted` renders bare (no topbar/sidebar) and its heading does not receive route-change focus [packages/frontend/src/app/router/ProtectedRoute.tsx] — wrong-role users get a chromeless page. Deferred: low impact; the spec's I/O matrix only requires "access-restricted view with a link back, target nav never rendered," which is satisfied. Revisit when shell-nested error surfaces are standardized.
- [x] [Review][Defer] `returnUrl` has no open-redirect allow-listing — display-only today, but Epic 2's real login must validate it is a local path before `navigate(returnUrl)` (reject `//host`, absolute URLs). Deferred: no redirect consumes it in Story 1.7; flagged for Epic 2.
- [x] [Review][Defer] Nav icons are raw Unicode glyphs with no font-coverage guarantee [packages/frontend/src/app/layout/nav-config.ts] — several glyphs may render as tofu on low-end Android (the primary student device). `aria-hidden` is already applied. Deferred: an icon set is an acknowledged later concern; record it as a real icon-system task.
- [x] [Review][Defer] Theme is not reconciled across tabs or live OS-preference changes [packages/frontend/src/app/theme/ThemeContext.tsx] — no `storage` or `matchMedia` change listener. Deferred: not in Story 1.7 scope; note for a preferences-sync story (Epic 2.8).
- [x] [Review][Defer] Drawer focus trap can be bypassed and does not self-close on resize-to-desktop [packages/frontend/src/app/layout/Drawer.tsx] — the Tab handler only corrects when focus is exactly on the first/last focusable; focus landing elsewhere (or the drawer staying mounted + trapped when the viewport crosses to ≥1024px) is unhandled. Deferred: narrow edge cases for nav-only drawer content; harden when drawer content grows or add a `matchMedia` auto-close.
- [x] [Review][Defer] `statusLabels` compat shim falls back `si → en → key` silently [packages/frontend/src/components/ui/status-labels.ts] — if the validate-i18n gate were ever bypassed, a missing Sinhala status would show English with no runtime signal. Deferred: guarded by the CI parity gate today; a dev-mode warn-on-fallback would fail-fast.

### Rejected

- [Review][Rejected] (false) App.smoke removing its local `afterEach(cleanup)` is unsafe — refuted: `src/test-setup.ts` registers a global `afterEach(cleanup)` (Vitest runs without `globals: true`), so cleanup still runs for every test.
- [Review][Rejected] (false) Duplicate `id="main-content"` between Landing and AppLayout — refuted: Landing (`/`) and the shell (`/role/*`) are mutually exclusive routes; they never co-render, so no duplicate id exists in any real DOM.
- [Review][Rejected] (false) StatusPill shows a raw key when no i18n instance is initialized — refuted: this is the standard react-i18next contract (any consumer must mount a provider); the barrel, tests, and app all initialize the instance. Not a defect introduced by this change.
- [Review][Rejected] (low) `AppLayout` `role === null` branch is untested — the branch is unreachable defensive code (AppLayout only mounts under a `ProtectedRoute` that guarantees a role); testing misuse-only dead code is low value and would require contriving an invalid provider state.
- [Review][Rejected] (low) `statusLabels`/`isStatusKey` derive from two parallel `Record`s (label set vs token map) with drift risk — real but minor maintainability concern; a single `STATUS_KEYS` source would help, but the fix is a non-trivial restructure for a divergence the validate-i18n gate and co-located `status-labels.test` already guard against. Not worth the churn in this story.
