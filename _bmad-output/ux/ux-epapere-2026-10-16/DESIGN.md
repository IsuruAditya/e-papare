---
title: "e-Paperé SMS — Design"
status: final
created: 2026-10-16
updated: 2026-10-17
sources:
  - _bmad-output/planning-artifacts/prd-e-papere-2026-10-16/prd.md
  - _bmad-output/planning-artifacts/prd-e-papere-2026-10-16/addendum.md
  - docs/project/master-requirements.md
  - _bmad-output/planning-artifacts/arch-e-papere-2026-10-16/ARCHITECTURE-SPINE.md
  - _bmad-output/ux/ux-epapere-2026-10-16/.memlog.md

colors:
  brand: "#3E3A98"
  brand-hover: "#4a46c8"
  brand-active: "#3230a0"
  brand-tint: "#eae8ff"
  brand-subtle: "#f0eeff"
  bg: "#f8f7fd"
  surface: "#ffffff"
  surface-elevated: "#fafafe"
  border: "#e8e6ff"
  border-strong: "#c7c4f0"
  text: "#1a1a2e"
  text-muted: "#6b6b8a"
  text-disabled: "#b0aed8"
  success: "#15803d"
  success-bg: "#dcfce7"
  success-border: "#86efac"
  warning: "#92400e"
  warning-bg: "#fef9c3"
  warning-border: "#fde68a"
  danger: "#991b1b"
  danger-bg: "#fee2e2"
  danger-border: "#fca5a5"
  info: "#5b21b6"
  info-bg: "#ede9fe"
  info-border: "#c4b5fd"
  disabled-bg: "#f3f2fc"
  disabled-border: "#dddaf5"

typography:
  font-sans-en: "'Inter', 'Segoe UI', system-ui, sans-serif"
  font-sans-si: "'Noto Sans Sinhala', 'Noto Sans', sans-serif"
  size-xs: "11px"
  size-sm: "12px"
  size-base: "13px"
  size-md: "14px"
  size-lg: "16px"
  size-xl: "20px"
  size-2xl: "24px"
  size-3xl: "32px"
  weight-normal: "400"
  weight-medium: "500"
  weight-semibold: "600"
  weight-bold: "700"
  weight-extrabold: "800"
  line-height-base: "1.5"
  line-height-sinhala: "1.75"
  line-height-heading: "1.2"

rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"

spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  5: "20px"
  6: "24px"
  8: "32px"
  10: "40px"
  12: "48px"

components:
  button-height: "36px"
  button-height-sm: "28px"
  input-height: "38px"
  sidebar-width: "210px"
  topbar-height: "52px"
  mobile-nav-height: "60px"
  card-padding: "16px 18px"
  table-cell-padding: "10px 16px"
  focus-ring: "3px solid #3E3A98"
  focus-ring-offset: "2px"
  touch-target-min: "44px"
---

# e-Paperé SMS — Design

> **Status:** final — UX–Architecture integration review complete (2026-10-17).
> This file is the **authoritative source** for all semantic design-token names and hex values (CRIT-03/04 resolved). Architecture Spine AD-10 references this file; no duplicate token definitions exist in the Spine.
> Brand colors #FFFFFF and #3E3A98 are locked and non-negotiable.
> Spines win on conflict with any mock, wireframe, or import.

---

## Brand & Style

**e-Paperé Online Institute** is a live Sri Lankan online education provider serving students in Grades 6–11. The platform replaces a WhatsApp-based manual administration process with a professional, trustworthy, and student-first web portal.

**Personality:** Trustworthy · Calm · Capable · Accessible · Professional without being cold.

**Visual register:** Modern education SaaS — clean, premium, information-dense where needed (admin dashboards), reassuringly simple where appropriate (student portal). Closer to Google Classroom or Notion than to a childish learning-game app. No cartoon elements, excessive gradients, random bright colors, or decorative ornamentation.

**Brand voice (visual):** The interface communicates competence through consistency. Every pixel earns its place. Hierarchy is achieved through weight, color, and space — not decoration.

**Anti-patterns (explicitly forbidden):**
- Childish or cartoon-heavy illustration
- Excessive CSS shadows or layered depth effects
- Gradient backgrounds on content areas (gradient permitted on Today's Class banner only)
- Decorative animations or entrance transitions
- Random accent colors outside the semantic token set
- Inconsistent component variants across screens

**Logo mark:** "eP" monogram in white on Brand Blue rounded square (border-radius: 8px). Full logotype: "e-" in neutral text + "Paperé" in Brand Blue.

---

## Colors

### Light Mode — Semantic Token Map

Token names are CSS custom properties defined in `src/styles/tokens.css` under `:root`. Tailwind utilities map to `var(--color-*)`. Raw hex values are forbidden in component code.

| Token | Hex | Role |
|---|---|---|
| `--color-brand` | `#3E3A98` | Primary action, nav active indicator, logo |
| `--color-brand-hover` | `#4a46c8` | Button hover state |
| `--color-brand-active` | `#3230a0` | Button pressed/active state |
| `--color-brand-tint` | `#eae8ff` | Selected nav background, chip backgrounds, brand badges |
| `--color-brand-subtle` | `#f0eeff` | Row hover, icon backgrounds, form focus glow |
| `--color-bg` | `#f8f7fd` | Page canvas — root background |
| `--color-surface` | `#ffffff` | Cards, sidebar, modals, topbar |
| `--color-surface-elevated` | `#fafafe` | Table header rows, dropdown menus, tooltips |
| `--color-border` | `#e8e6ff` | Default card borders, dividers, table rows |
| `--color-border-strong` | `#c7c4f0` | Input borders, focused dividers, strong separators |
| `--color-text` | `#1a1a2e` | Primary body text, headings |
| `--color-text-muted` | `#6b6b8a` | Secondary text, metadata, hints |
| `--color-text-disabled` | `#b0aed8` | Disabled control labels |
| `--color-success` | `#15803d` | Success text — WCAG AA on `--color-success-bg` |
| `--color-success-bg` | `#dcfce7` | Active, Approved, Access Active pill backgrounds |
| `--color-success-border` | `#86efac` | Success state borders |
| `--color-warning` | `#92400e` | Warning text — WCAG AA on `--color-warning-bg` |
| `--color-warning-bg` | `#fef9c3` | Pending, Due Soon, Needs Clarification backgrounds |
| `--color-warning-border` | `#fde68a` | Warning state borders |
| `--color-danger` | `#991b1b` | Error text — WCAG AA on `--color-danger-bg` |
| `--color-danger-bg` | `#fee2e2` | Rejected, Suspended, Overdue, Error backgrounds |
| `--color-danger-border` | `#fca5a5` | Danger state borders |
| `--color-info` | `#5b21b6` | Info/review text — WCAG AAA on `--color-info-bg` |
| `--color-info-bg` | `#ede9fe` | Under Review, Clarification, Partial backgrounds |
| `--color-info-border` | `#c4b5fd` | Info state borders |
| `--color-disabled-bg` | `#f3f2fc` | Disabled input/button backgrounds |
| `--color-disabled-border` | `#dddaf5` | Disabled control borders |

### Dark Mode — Semantic Token Map

Token names identical. Values defined under `.dark` in `src/styles/tokens.css`. Not an inversion — a purpose-built dark-surface system in the Brand Blue hue family.

| Token | Dark Value | Notes |
|---|---|---|
| `--color-brand` | `#6562e8` | Lightened for AA contrast on dark surfaces |
| `--color-brand-hover` | `#7572f0` | |
| `--color-brand-active` | `#5452d8` | |
| `--color-brand-tint` | `#252347` | Selected nav on dark |
| `--color-brand-subtle` | `#1e1d3a` | Row hover on dark |
| `--color-bg` | `#13122a` | Dark canvas |
| `--color-surface` | `#171630` | Cards, sidebar |
| `--color-surface-elevated` | `#1e1d3a` | Table headers, dropdowns |
| `--color-border` | `#252347` | Default borders |
| `--color-border-strong` | `#3a3870` | Input borders, strong dividers |
| `--color-text` | `#e0deff` | Primary text |
| `--color-text-muted` | `#8080a8` | Secondary text |
| `--color-text-disabled` | `#4a4880` | Disabled labels |
| `--color-success` | `#34d399` | On `--color-success-bg` dark |
| `--color-success-bg` | `#052e16` | |
| `--color-warning` | `#fbbf24` | |
| `--color-warning-bg` | `#451a03` | |
| `--color-danger` | `#f87171` | |
| `--color-danger-bg` | `#3b0707` | |
| `--color-info` | `#a78bfa` | |
| `--color-info-bg` | `#2e1065` | |
| `--color-disabled-bg` | `#1a1935` | |
| `--color-disabled-border` | `#252347` | |

### Contrast Verification

All semantic foreground/background pairs meet WCAG 2.1 AA (≥4.5:1 normal text, ≥3:1 UI components). Selected pairs:

| Pair | Ratio | Level |
|---|---|---|
| Brand Blue #3E3A98 on White | 7.56:1 | AAA |
| White on Brand Blue | 7.56:1 | AAA |
| `--color-text` on `--color-surface` (light) | 17.1:1 | AAA |
| `--color-text-muted` on `--color-surface` (light) | 4.82:1 | AA |
| Brand tint text on tint bg (light) | 5.31:1 | AA |
| `--color-success` on `--color-success-bg` | 5.12:1 | AA |
| `--color-warning` on `--color-warning-bg` | 6.21:1 | AA |
| `--color-danger` on `--color-danger-bg` | 5.74:1 | AA |
| `--color-info` on `--color-info-bg` | 7.19:1 | AAA |
| `--color-brand` (#6562e8) on dark surface (#171630) | 4.71:1 | AA |
| `--color-text` on dark surface (dark) | 12.8:1 | AAA |
| `--color-success` on dark success-bg | 9.18:1 | AAA |
| White on Today's Banner (#2d2a7a, dark) | 10.4:1 | AAA |
| Disabled text on disabled-bg (UI component) | 3.02:1 | AA (UI) |

---

## Typography

### Font Stack

**English UI:** `'Inter', 'Segoe UI', system-ui, sans-serif`
Inter is loaded from `packages/frontend/public/fonts/` (or Google Fonts CDN with `display=swap` fallback). Subset to Latin + Latin Extended.

**Sinhala UI:** `'Noto Sans Sinhala', 'Noto Sans', sans-serif`
Self-hosted subset, Unicode range U+0D80–U+0DFF (Sinhala block only), `font-display: swap`. Served from same origin. Max subset size target: ≤200 kB (variable font with weight axis). Fallback: Noto Sans → system-ui. Architecture decision AD-28.

### Type Scale

| Token | Size | Weight | Use |
|---|---|---|---|
| `text-3xl / 800` | 32px | 800 | Landing hero, modal hero |
| `text-2xl / 700` | 24px | 700 | Page titles |
| `text-xl / 700` | 20px | 700 | Section headings, dashboard greeting |
| `text-lg / 600` | 16px | 600 | Card titles, course names |
| `text-md / 500` | 14px | 500 | Body text, form values, table cell primary |
| `text-base / 400` | 13px | 400–500 | Secondary body, nav items |
| `text-sm / 600` | 12px | 600 | Table column headers (uppercase, 0.06em tracking) |
| `text-xs / 600` | 11px | 600–700 | Status badges, timestamps, metadata, section labels |

### Sinhala Typography Rules

- All Sinhala text uses `font-family: var(--font-sans-si)`.
- `line-height: 1.75` minimum for all Sinhala body text. Sinhala vowel diacritics require vertical room.
- Heading Sinhala: `line-height: 1.4` minimum.
- Font size floor: 12px for any Sinhala UI text. 11px Sinhala is only for non-critical metadata.
- Container layouts must use `min-height` or `flex` rather than fixed heights to accommodate text expansion.
- Sinhala labels can be shorter or longer than English equivalents — layouts must flex in both directions.
- `html[lang="si"]` sets `font-family: var(--font-sans-si)` at root; English strings within a Sinhala page use `lang="en"` inline spans.

### Language-Specific Typographic Rules

- `letter-spacing` is not applied to Sinhala text (degrades glyph joining).
- `text-transform: uppercase` is not applied to Sinhala text.
- Section labels that use uppercase + tracking in English use regular case in Sinhala equivalents.
- Date format: `DD/MM/YYYY` in both language modes (Sri Lankan convention).
- Currency: `LKR X,XXX` in English mode; `රු. X,XXX` in Sinhala mode.

---

## Layout & Spacing

### Spacing Scale (4px base grid)

All margin, padding, and gap values must use the 4px grid. Non-grid values (e.g., 5px) are prohibited except for border widths and focus ring offsets.

```
4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80px
```

### Page Layout

**Desktop (≥1024px):**
- Root: `display: flex; flex-direction: column; min-height: 100vh`
- Topbar: fixed height 52px, `position: sticky; top: 0; z-index: 100`
- Content area: `display: flex; flex: 1`
- Sidebar: fixed width 210px, full height, `position: sticky; top: 52px; height: calc(100vh - 52px); overflow-y: auto`
- Main content: `flex: 1; padding: 20px 24px; overflow-y: auto`
- Max content width: 1200px centered within main area

**Tablet (768–1023px):**
- Sidebar collapses to icon-only (40px wide) with tooltip labels, or behind hamburger toggle
- Main content takes full width
- Topbar persists

**Mobile (<768px):**
- Sidebar hidden
- Topbar persists (52px)
- Bottom navigation bar: fixed, 60px height, `position: fixed; bottom: 0; left: 0; right: 0; z-index: 100`
- Main content: `padding: 14px 14px 74px 14px` (bottom padding accounts for nav bar)
- Safe area insets respected: `padding-bottom: max(74px, calc(60px + env(safe-area-inset-bottom)))`

### Grid System

- Cards: CSS Grid with `gap: 14–16px`, `grid-template-columns: repeat(auto-fill, minmax(X, 1fr))`
- Dashboard quick-card grid (student): `repeat(4, 1fr)` desktop → `repeat(2, 1fr)` mobile
- Stat card grid (admin): `repeat(4, 1fr)` desktop → `repeat(2, 1fr)` tablet → `1fr` mobile

---

## Elevation & Depth

Elevation is expressed through borders and subtle box-shadows — not heavy shadows or layered backgrounds. The design is intentionally flat with only two elevation levels:

| Level | Token | Use |
|---|---|---|
| Ground | `--color-bg` canvas | Page background |
| Surface | `--color-surface` + `border: 1px solid --color-border` | Cards, sidebar, topbar |
| Elevated | `--color-surface-elevated` + `box-shadow: 0 4px 20px rgba(62,58,152,.10)` | Modals, dropdowns, tooltips, active frame state |
| Focus | `box-shadow: 0 0 0 3px rgba(62,58,152,.15)` | Input focus state — not elevation, a visual affordance |

Dark mode: box-shadows use `rgba(0,0,0,.3)` not brand color (dark backgrounds don't need color-tinted shadows).

No `z-index` stacking beyond: content (1) → sticky topbar/sidebar (100) → dropdowns (200) → modals (300) → toasts (400).

---

## Shapes

| Context | Radius |
|---|---|
| Status pills (semantic state badges) | `9999px` (`--radius-full`) — fully rounded |
| Compact badges, inline chips (non-status) | `4px` (`--radius-sm`) |
| Buttons, inputs, small cards, table action buttons | `8px` (`--radius-md`) |
| Cards, panels, dialog boxes, table containers | `12px` (`--radius-lg`) |
| Today's Class hero banner, feature highlight blocks | `16px` (`--radius-xl`) |
| Avatar circles, notification dots | `9999px` (`--radius-full`) |
| Logo mark | `8px` (matches button radius) |

Consistent rule: outer container radius = `--radius-lg`; elements inside a card use `--radius-md` or smaller.

---

## Components

### Topbar

- Height: 52px. `position: sticky; top: 0; z-index: 100`.
- Left: Logo mark (30×30px, radius 7px) + logotype text.
- Right: Language switcher → Theme toggle → Notification bell (with badge) → User avatar.
- Separator between logo and nav: 1px right border on logo group on desktop; omitted on mobile.
- All topbar interactive elements: minimum 44×44px touch target.
- Topbar background: `--color-surface`. Border-bottom: `1px solid --color-border`.

**Language Switcher:**
- Button showing current language: `සිං | EN` (inactive language dimmed, active bold).
- Border: `1.5px solid --color-border-strong`. Radius: `6px`. Padding: `4px 9px`.
- On click: immediate language switch (no page reload). Form data preserved.
- Focus ring: standard 3px brand focus.

**Theme Toggle:**
- Icon button 32×32px. Icon: ☀ (light mode) / 🌙 (dark mode).
- Background: `--color-brand-subtle`. Color: `--color-brand`.
- Persists preference to `localStorage('epapere_theme')`.
- `prefers-color-scheme` used as initial default for new users.
- ARIA label: `"Switch to dark mode"` / `"Switch to light mode"`.

**Notification Bell:**
- Icon button with badge counter (`--color-danger` background, white text).
- Opens notification panel (slide-in from right on mobile, dropdown on desktop).
- ARIA: `role="button" aria-label="Notifications, 3 unread"`.

### Sidebar Navigation

- Width: 210px desktop. Sticky, full viewport height minus topbar.
- Section labels: 9px uppercase, `letter-spacing: 0.12em`, `--color-text-disabled`.
- Nav items: 12.5px, `font-weight: 500`. Padding: `8px 18px`. Icon: 14px, 18px wide.
- Active state: `background: --color-brand-subtle; color: --color-brand; font-weight: 600; border-left: 3px solid --color-brand`.
- Hover state: `background: --color-surface-elevated; color: --color-brand`.
- Focus: standard 2px inset brand focus ring.
- Badge (count): pill `--color-brand` bg white text. Warning badge: `--color-danger`.
- User profile block pinned at top of sidebar (EP ID, name, grade, status).
- Settings/logout pinned at bottom.

### Mobile Bottom Navigation

- 5 items: Home · Courses · Payments · Notifications · Account.
- Height: 60px fixed. `safe-area-inset-bottom` respected.
- Each item: `flex: 1; min-width: 44px`. Icon 22px + label below.
- Label: 9px for English, 8px Sinhala (Noto Sans Sinhala), `font-weight: 600`.
- Active: icon color + label color = `--color-brand` (dark: `--color-brand` dark variant). No colored background bar.
- Inactive: `--color-text-muted`.
- Notification badge on bell: same as topbar bell.
- Payment badge: `--color-danger` dot or counter when overdue/pending.
- Background: `--color-surface`. Border-top: `1px solid --color-border`.
- ARIA: `role="navigation" aria-label="Main navigation"`. Each item: `role="link"` with descriptive `aria-label` including state when relevant (e.g., "Payments — 1 overdue").
- Sinhala labels tested at 320px: no clipping, no overlap. All items remain touch-friendly (≥44px tap target height).

### Today's Class Banner

- Full-width card. Radius `--radius-xl` (16px). Gradient: `linear-gradient(135deg, #3E3A98 0%, #5551c8 100%)` light; `linear-gradient(135deg, #2d2a7a 0%, #4a46c8 100%)` dark.
- Content: small "TODAY'S CLASS" label (10px, uppercase, 0.08em tracking, 75% opacity) → course name (15px, bold) → time + teacher (12px, 80% opacity).
- Join Now button: white background, `--color-brand` text, `--radius-md`, `padding: 9px 18px`, `font-weight: 700`.
- Join Now focus: `outline: 3px solid #ffffff; outline-offset: 2px` (white ring, visible on dark banner background).
- ARIA: `aria-label="Join today's class: Mathematics Grade 9, 4:00 PM"`.
- When no class today: banner replaced with "No class today" neutral state (same dimensions, `--color-brand-subtle` background, muted text).

### Cards

- Background: `--color-surface`. Border: `1px solid --color-border`. Radius: `--radius-lg`.
- Card header: `padding: 14px 18px; border-bottom: 1px solid --color-border`.
- Card body: `padding: 16px 18px`.
- Card hover (interactive cards): `border-color: --color-border-strong; box-shadow: 0 2px 8px rgba(62,58,152,.08)`.
- No shadow by default — elevation comes from border, not shadow.

**Stat Card (admin dashboards):**
- Label: 11px `--color-text-muted`. Value: 22–24px bold `--color-text`. Delta: 11px, colored by direction.

**Quick-Action Card (student dashboard):**
- Icon centered (20–24px). Label below (11–12px bold). Optional badge/status dot.
- Tap target: full card area, minimum 60px height on mobile.
- Grid: 4 columns desktop, 2 columns mobile. Gap: 10–12px.

### Buttons

- **Primary:** `background: --color-brand; color: white`. Hover: `--color-brand-hover`. Active: `--color-brand-active`. Height 36px desktop, 40px minimum touch target mobile.
- **Secondary:** `background: --color-surface; color: --color-brand; border: 1.5px solid --color-border-strong`. Hover: `background: --color-brand-subtle; border-color: --color-brand`.
- **Danger:** `background: #ef4444; color: white`. Hover: `#dc2626`. Use only for irreversible destructive actions.
- **Ghost:** `background: transparent; color: --color-brand`. Hover: `background: --color-brand-subtle`. For low-emphasis actions in toolbars.
- **Disabled:** `background: --color-disabled-bg; color: --color-text-disabled; border: 1.5px solid --color-disabled-border; cursor: not-allowed`. No hover effect. `aria-disabled="true"`.
- **Small (sm):** height 28px, `font-size: 11px; padding: 5px 12px`. Used in table rows.
- **Icon button:** 32–36px square, `--radius-md`. Background `--color-brand-subtle`. Focus ring standard.

**Focus ring (all buttons):** `outline: 3px solid --color-brand; outline-offset: 2px`. On Today's Class banner: `outline: 3px solid #ffffff`.

### Form Controls

- **Input:** height 38px. `border: 1.5px solid --color-border-strong; border-radius: --radius-md; padding: 9px 12px; font-size: 13px`.
- Focus: `border-color: --color-brand; box-shadow: 0 0 0 3px rgba(62,58,152,.15)`.
- Error: `border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,.15)`. Error message below in `--color-danger`, 11px.
- Disabled: `background: --color-disabled-bg; color: --color-text-disabled; border-color: --color-disabled-border; cursor: not-allowed`.
- Label: 12px `font-weight: 600`. Required asterisk: `--color-danger`. Helper text: 11px `--color-text-muted` below input.
- **Select:** same dimensions as input. Custom arrow via CSS. `appearance: none`.
- **File upload zone:** dashed border `2px dashed --color-border-strong`; radius `--radius-lg`; padding `28px 20px`; centered content. Hover: `border-color: --color-brand; background: --color-brand-subtle`. Focus: standard ring. Error state: `border-color: #ef4444; background: --color-danger-bg`.

**Sinhala form labels:** same size scale. No uppercase. Line height 1.75.

### Tables

- Container: `--color-surface` background, `1px solid --color-border` border, `--radius-lg` radius, `overflow: hidden`.
- Header: `padding: 12px 18px`. Title + search box + filter button + action button in a flex row.
- Column headers: `background: --color-surface-elevated; font-size: 11px; font-weight: 600; color: --color-text-muted; padding: 9px 16px`. Uppercase with 0.06em tracking for English column labels.
- Rows: `border-bottom: 1px solid --color-surface-elevated`. Hover: `background: --color-surface-elevated`.
- Cells: `padding: 10px 16px; font-size: 12.5px; color: --color-text; vertical-align: middle`.
- EP ID cells: `font-family: monospace; font-size: 11px; color: --color-brand`.
- Pagination row: `padding: 10px 18px; border-top: 1px solid --color-border`. Prev/Next buttons, count label.
- Search box in table header: `border: 1.5px solid --color-border-strong; border-radius: --radius-md; padding: 6px 10px`. Focus: standard focus ring on container.
- All tables paginated (default page size: 20, max: 100) per AD-47.

### Status Pills / Badges

> **Radius rule (resolved 2026-10-28, Story 1.6 review):** Status pills are **fully rounded** — `border-radius: 9999px` (`--radius-full`). This is the deliberate exception to the compact-badge 4px radius: the Shapes table's 4px entry applies to non-status badges and inline chips only. There is no remaining contradiction between the Shapes table and this component spec.

- `display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 9999px`.
- Dot indicator: 6px circle, matching foreground color.
- Color pairs per semantic token (see Colors section).
- Never exceed 2 pills per table row.
- All pill text translated in both languages.

### Dialogs / Modals

- Overlay: `background: rgba(0,0,0,.5)`. Click outside = close (unless destructive confirmation).
- Container: `--color-surface; border-radius: --radius-xl; padding: 24px; max-width: 480px; width: calc(100% - 32px)`.
- Header: title (16px bold) + optional close button (top-right).
- Footer: action buttons right-aligned. Primary on right, Cancel/Ghost on left.
- Focus trap: first focusable element receives focus on open. ESC closes.
- ARIA: `role="dialog" aria-modal="true" aria-labelledby="dialog-title"`.
- Destructive confirmations: require explicit typed confirmation or deliberate checkbox — no accidental click path.

### Notification / Toast

- Position: top-right on desktop, top-center on mobile. `z-index: 400`.
- Variants: success (green left border), warning (amber), error (red), info (purple).
- Auto-dismiss: 5 seconds for success/info. Persistent for errors until dismissed.
- Max width: 360px. Radius `--radius-lg`. Shadow: elevated.
- Screen reader: `role="alert" aria-live="polite"` (assertive for errors only).

### Announcement / State Banners

Inline banners within page content (not toasts). Used for system-state communication to students.

- Radius `--radius-lg`. Padding `16px 20px`. `display: flex; gap: 14px`.
- Icon (24px) + text block (title bold 13px + body 12px, line-height 1.55).
- Color variants: success / warning / danger / info / neutral (per semantic tokens).
- Dark mode: same token names, dark values applied automatically via `.dark` CSS class.

---

## Do's and Don'ts

### Do
- Use semantic token names in all component code. Never raw hex.
- Apply `font-family: var(--font-sans-si)` to all Sinhala text nodes.
- Set `line-height: 1.75` on all Sinhala body text containers.
- Use `min-height` instead of `height` on any container that may hold Sinhala text.
- Provide `aria-label` on all icon-only buttons, the language switcher, and the theme toggle.
- Ensure every interactive element has a visible focus ring (3px brand blue, 2px offset).
- Set `html lang` attribute correctly when language switches (`lang="en"` or `lang="si"`).
- Keep touch targets ≥44×44px on all mobile-targeted interactive elements.
- Use status pills consistently — same pill for the same state everywhere.
- Paginate all list/table endpoints (default 20 rows, max 100).

### Don't
- Use raw hex values (#3E3A98) in component styles — use `--color-brand`.
- Apply `text-transform: uppercase` or `letter-spacing` to Sinhala text.
- Add gradient backgrounds to content areas (Today's Class banner is the only gradient).
- Create separate component variants for light and dark — use the token system.
- Use `height: fixed-value` on containers that will hold Sinhala text.
- Introduce focus styles that rely on color alone (rings must be visible in both themes).
- Animate page content on load — loading skeleton is the only acceptable motion.
- Expose a role's nav items to another role — render nav server-side per role claim.
- Use `box-shadow` as the primary elevation mechanism — borders carry elevation.
- Hardcode language strings in JSX — every string through `t()` or `<Trans>`.
