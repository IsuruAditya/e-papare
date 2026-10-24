---
title: "e-Paperé SMS — Experience"
status: final
created: 2026-10-16
updated: 2026-10-17
sources:
  - _bmad-output/planning-artifacts/prd-e-papere-2026-10-16/prd.md
  - _bmad-output/planning-artifacts/prd-e-papere-2026-10-16/addendum.md
  - docs/project/master-requirements.md
  - _bmad-output/planning-artifacts/arch-e-papere-2026-10-16/ARCHITECTURE-SPINE.md
  - _bmad-output/ux/ux-epapere-2026-10-16/.memlog.md
  - _bmad-output/ux/ux-epapere-2026-10-16/DESIGN.md
---

# e-Paperé SMS — Experience

> **Status:** final — UX–Architecture integration review complete (2026-10-17).
> DESIGN.md is the visual identity reference for all token names used here (`{colors.brand}`, `{typography.font-sans-si}`, etc.).
> Spines win on conflict with any mock, wireframe, or import.

---

## Foundation

**Form factor:** Mobile-first responsive web application. Primary student access: phone browser (Android, low-to-mid range). Administration access: desktop browser. No native apps in MVP.

**UI system:** None — custom design system built on Tailwind CSS v4 with CSS custom property semantic tokens (DESIGN.md). Architecture AD-9, AD-10, AD-46.

**Visual identity reference:** DESIGN.md.

**Technology context (UX-binding decisions):**
- React + TypeScript + Vite + Tailwind CSS (frontend, non-negotiable)
- react-i18next v15 for all translations (AD-6). Every string through `t()` or `<Trans>`.
- ThemeContext toggles `html.classList` between light/dark (AD-9). No page reload.
- CSS custom properties as semantic design tokens in `src/styles/tokens.css` (AD-10).
- TanStack Query v5 for server state — skeleton states driven by `isLoading` (AD-18).
- React Hook Form + Zod shared schemas — form state unaffected by language/theme switch (AD-19).
- Noto Sans Sinhala self-hosted subset, `font-display: swap` (AD-28).
- Presigned R2 upload — upload progress tracked client-side against direct R2 PUT (AD-35).
- Backend error codes are stable machine-readable strings, never English prose (AD-8). Frontend maps to translated messages.

**Supported languages:** English (en) and Sinhala (si-LK). Both mandatory across all five roles and all journeys. No feature gaps between languages.

**Supported themes:** Light (default) and Dark. Semantic tokens ensure identical component architecture in both.

**Five user roles:** Student · Teacher · Finance Administrator · Administrator · Super Administrator (Owner). Each role has a scoped navigation set. No role sees another role's nav items.

---

## Information Architecture

### Surface Map

Every confirmed product need maps to a named surface. IA closes when all needs have a surface and every surface has at least one journey.

#### Pre-authentication Surfaces

| Surface | Path | Access |
|---|---|---|
| Landing / Login | `/` | Public |
| Register | `/register` | Public |
| Activate Account | `/activate/:token` | One-time link (no account required) |
| Account Recovery | `/recover` | Admin-initiated link only |

#### Student Surfaces

| Surface | Path | Notes |
|---|---|---|
| Student Dashboard | `/student` | Today's Class + quick cards + course list |
| My Courses | `/student/courses` | All enrolled courses, per-course status |
| Course Detail | `/student/courses/:courseId` | Zoom link, materials, recordings, schedule |
| Study Materials | `/student/courses/:courseId/materials` | Material list for a course |
| Recordings | `/student/courses/:courseId/recordings` | Recording entries, entitlement-gated links |
| Course Browser | `/student/browse` | Available courses to enroll in |
| Schedule | `/student/schedule` | Upcoming sessions across all enrolled courses |
| Payments | `/student/payments` | Invoice list, per-invoice detail, upload slip |
| Payment Detail | `/student/payments/:invoiceId` | Line items, submission status, evidence history |
| Notifications | `/student/notifications` | All in-app notifications, mark as read |
| Profile | `/student/profile` | EP ID, name, grade, language/theme preferences |
| Help | `/student/help` | FAQ, contact admin |

#### Teacher Surfaces

| Surface | Path | Notes |
|---|---|---|
| Teacher Dashboard | `/teacher` | Course list, access status summary |
| My Courses | `/teacher/courses` | Assigned courses |
| Course Detail | `/teacher/courses/:courseId` | Roster, enrollment count, access status |
| Zoom Session Entry | `/teacher/courses/:courseId/sessions` | Add/edit Zoom details per billing period |
| Study Materials | `/teacher/courses/:courseId/materials` | Upload, manage materials |
| Recordings | `/teacher/courses/:courseId/recordings` | Add/edit/publish/unpublish recording URLs |
| Notifications | `/teacher/notifications` | |
| Profile | `/teacher/profile` | |

#### Finance Administrator Surfaces

| Surface | Path | Notes |
|---|---|---|
| Finance Dashboard | `/finance` | Queue stats, quick filters |
| Verification Queue | `/finance/queue` | Unclaimed + claimed submissions |
| Submission Detail | `/finance/queue/:submissionId` | Full evidence, allocations, audit trail |
| Approved | `/finance/approved` | Approved submissions, filterable |
| Clarification | `/finance/clarification` | Submissions in REQUIRES_CLARIFICATION |
| Rejected | `/finance/rejected` | Rejected submissions |
| Unmatched | `/finance/unmatched` | Unmatched payment records |
| Audit Trail | `/finance/audit` | Full immutable audit log |
| Payment Summaries | `/finance/summaries` | Totals by billing period |
| Notifications | `/finance/notifications` | |
| Profile | `/finance/profile` | |

#### Administrator Surfaces

| Surface | Path | Notes |
|---|---|---|
| Admin Dashboard | `/admin` | Student stats, recent registrations |
| Students | `/admin/students` | Full student list, search, filter |
| Student Detail | `/admin/students/:studentId` | Profile, enrollments, account state actions |
| Register Student | `/admin/students/register` | Admin-assisted registration form |
| Enrollments | `/admin/enrollments` | All enrollments, enrollment-on-behalf |
| Invoices | `/admin/invoices` | Invoice list, manual generation |
| Courses | `/admin/courses` | Course CRUD |
| Teachers | `/admin/teachers` | Teacher account management |
| Migration | `/admin/migration` | Bulk import, import status, duplicate review |
| WhatsApp Templates | `/admin/templates` | Copyable message templates |
| Notifications | `/admin/notifications` | |
| Profile | `/admin/profile` | |

#### Super Administrator / Owner Surfaces

| Surface | Path | Notes |
|---|---|---|
| Owner Dashboard | `/owner` | Enrollment totals, revenue, outstanding invoices |
| All Admin surfaces | (inherits `/admin/*`) | Full access |
| All Finance surfaces | (inherits `/finance/*`) | Full access |
| System Configuration | `/owner/config` | Billing dates, deadlines, access policy, default language, fee structures |
| Access Policy | `/owner/config/access` | Historical access configuration |
| Notifications | `/owner/notifications` | |
| Profile | `/owner/profile` | |

### Navigation Structure

**Desktop:** Persistent left sidebar per role (210px). Topbar with logo, language switcher, theme toggle, notification bell, avatar. Active page indicated by left border + background.

**Tablet (768–1023px):** Topbar persists. Sidebar is hidden by default; a hamburger menu button in the topbar (left of logo) opens a slide-in drawer sidebar (full width on narrow tablet, 280px on wider tablet). The drawer overlays the content area with a semi-transparent backdrop (`rgba(0,0,0,.4)`). Tapping the backdrop or pressing ESC closes the drawer. **Hamburger pattern confirmed** (OI-01 resolved): icon-only collapse is not used in MVP — the hamburger drawer is the single implementation. This minimises implementation complexity while maintaining full navigation access on tablet.

**Mobile (<768px):** Topbar (52px) + fixed bottom navigation (60px, 5 items for Student role). Other roles on mobile use the topbar hamburger → slide-in drawer sidebar (same pattern as tablet).

**Student mobile bottom nav (5 items, no overflow):**
- Home (Dashboard)
- Courses (My Courses)
- Payments
- Notifications
- Account (Profile)

Study Materials and Recordings accessible from Dashboard quick-card grid (1 tap) and from Courses → Course Detail (2 taps). No More/overflow in MVP. **Approved mobile bottom navigation is preserved unchanged.**

---

## Voice and Tone

*Brand voice lives in DESIGN.md Brand & Style. This section covers microcopy behavior.*

**General principles:**
- Use plain language accessible to a Grade 6 student.
- Never use technical error codes or system jargon in student-facing copy.
- State what happened, what it means for the student, and what to do next.
- Keep action labels short and verb-first: "Join Now", "Upload Slip", "View Invoice".
- Avoid negative framing where possible: prefer "Payment pending" over "Payment not received".

**Sinhala copy:**
- All system interface strings translated — labels, buttons, validation messages, notifications, status labels, error messages, confirmation dialogs.
- User-generated free text (clarification notes, investigative notes) displayed as entered, not translated.
- Institute-configured content (course names, announcements) shown in selected language if both provided; if only one language available, show available version with "(Translation not available)" indicator in the other language.
- WhatsApp templates provided in both languages; administrator selects which to copy.

**Status language (consistent across all surfaces):**

| State | English label | Sinhala label |
|---|---|---|
| PENDING_ACTIVATION | Pending Activation | සක්‍රිය කිරීම් අපේක්ෂිත |
| ACTIVE | Active | සක්‍රිය |
| SUSPENDED | Suspended | අත්හිටුවා |
| DISABLED | Disabled | අක්‍රිය |
| SUBMITTED | Submitted | ඉදිරිපත් කරන ලදී |
| UNDER_REVIEW | Under Review | සමාලෝචනය යටතේ |
| APPROVED | Approved | අනුමත |
| REQUIRES_CLARIFICATION | Needs Clarification | පැහැදිලිකිරීමක් අවශ්‍යයි |
| REJECTED | Rejected | ප්‍රතික්ෂේප |
| OVERDUE | Overdue | කාලය ඉකුත් |
| PARTIAL | Partial Payment | අර්ධ ගෙවීමක් |
| UNMATCHED | Unmatched | නොගැළපෙන |
| Access Active | Access Active | ප්‍රවේශය සක්‍රිය |
| Access Locked | Access Locked | ප්‍රවේශය අවහිර |

---

## Component Patterns

*Visual specifications live in DESIGN.md Components. This section covers behavioral specifications only.*

### Language Switcher

- Available on all screens including pre-login and registration (FR-I18N-002, FR-I18N-003).
- Switching language: immediate re-render of all interface strings via react-i18next. No page reload. No form data loss.
- Language preference stored: `user.preferredLanguage` (DB, for authenticated users) → `localStorage('epapere_lang')` → system default (configurable by Super Admin) → `en`.
- `html lang` attribute updated on switch. Screen readers announce content in the correct language.
- Fallback: if a translation key is missing in `si-LK`, fall back to `en`. Never display raw key or empty string.

### Theme Toggle

- Available on all screens.
- Switching theme: ThemeContext sets `html.classList.add/remove('dark')`. Tailwind applies `.dark` token values. No page reload. No form data loss.
- Preference stored: `localStorage('epapere_theme')`. Authenticated users: also synced to `user.preferredTheme`.
- Initial default: system `prefers-color-scheme` → stored preference → Light.
- `aria-label` updates with new action: "Switch to dark mode" / "Switch to light mode".

### Form Controls

- All forms use React Hook Form with Zod resolver (AD-19). Schema shared with backend.
- Language switch re-renders labels and placeholders. Entered values unaffected.
- Theme switch re-renders styles. Entered values unaffected.
- Required field asterisk always visible. Never rely on placeholder as label.
- All validation errors display in selected language below the relevant field.
- Submit disabled while validation errors exist. Submit button shows loading indicator during API call.
- After successful submit: brief success state, then navigate or clear as appropriate.
- Error codes from API (stable machine-readable strings per AD-8) mapped to translated messages via `t('errors:CODE')`.

### File Upload (Payment Slip)

Uses presigned R2 upload flow (AD-35). The upload has three distinct backend phases; all three must be represented in the progress UI:

**Phase 1 — Preparing (presign request):**
- UI shows an indeterminate spinner and the label "Preparing upload…". Progress bar not yet shown.
- Duration: typically < 500 ms. If it exceeds 2 s the UI shows "Still preparing — please wait."

**Phase 2 — Uploading (direct PUT to R2):**
- UI shows a determinate progress bar, file name, and percentage ("47%"). Driven by `XMLHttpRequest.upload.onprogress`.
- Label: "Uploading — do not close this page."
- Progress bar fills from left to right using `{colors.brand}` fill on `{colors.surface-elevated}` track.

**Phase 3 — Confirming (completion callback to backend):**
- Progress bar stays at 100% (filled). Spinner overlaid on the bar. Label changes to "Confirming…".
- Duration: typically < 1 s. Prevents the user from navigating away before the file is registered in the database.

**Success state:**
- Green border on upload zone. Filename, file size, and upload timestamp displayed.
- "View" link opens the file in a new tab via presigned GET URL.
- "Remove and re-upload" link available if the student changes their mind before submitting.
- `aria-live="polite"` announces "Upload complete — [filename]" to screen readers.

**Interrupted / network-failure state:**
- Red border and background on upload zone.
- Message: "Upload failed. Check your connection and try again."
- "Try Again" button retriggers from Phase 1 (new presigned URL). All form data — checkboxes, amounts, any previously entered values — is preserved.
- `aria-live="assertive"` announces the error immediately.

**File rejected before upload (client-side validation):**
- Triggered if file type is not `image/jpeg`, `image/png`, or `application/pdf`, or if file size exceeds 5 MB.
- Upload zone returns to idle state. Validation message below zone in `{colors.danger}`: "Please upload a JPG, PNG, or PDF under 5 MB."
- `aria-live="polite"` announces the rejection reason.

**Additional rules:**
- Camera capture supported on mobile via `accept="image/*" capture="environment"`.
- Upload zone keyboard accessible: `tabindex="0"`, Enter/Space triggers file dialog.
- Drag-and-drop supported on desktop: border becomes solid `{colors.brand}` on drag-over; `aria-dropeffect="copy"`.
- Only one file per submission. A second file selection replaces the first (if upload has not yet completed).

### Payment Allocation UI

For multi-course payment (UJ-3 / Flow 3):
1. Student sees invoice with all line items for the billing month. Each line item shows: course name, configured fee, current payment status.
2. Student selects which line items this payment covers using checkboxes.
3. For each **checked** line item, a required amount field appears. The student must enter the amount they are allocating to that course. A blank or zero amount on a checked line item is a validation error: "Please enter the amount for [Course Name]." The form cannot be submitted until all checked line items have a positive amount.
4. A running "Total stated: LKR X,XXX" updates as amounts are entered or checkboxes are toggled.
5. Bank slip upload attached to this submission.
6. On submit: the system records the student's stated allocation amounts against each selected line item and the total stated amount. These are the student's stated values — they are **not** authoritative. The finance administrator independently verifies the actual bank deposit and may adjust allocations before approving.
7. Finance Admin sees: each selected line item with the student's stated amount, a "Verified bank deposit amount" field (populated by the admin from bank records), per-item coverage indicators ("Fully covered ✓ / Partial ⚠ / Uncovered"), and the ability to adjust individual allocated amounts before approving. Adjusted amounts replace the student-stated amounts in the allocation record; the original student-stated amounts are preserved in the audit trail.
8. If the verified amount is less than the total fees of all allocated line items, the Finance Admin must explicitly decide per item; no line item receives an entitlement without full coverage of its fee.
9. If the verified amount exceeds all allocations, the unallocated excess is shown and the Finance Admin must enter a disposition note before approval is permitted.

### Notification Panel

- Bell icon with unread badge. Click opens slide-in panel (mobile) or dropdown (desktop).
- List: most recent first. Unread items have left accent bar in `--color-brand`.
- Each notification: icon (semantic by type) + title + body + timestamp + "Mark as read".
- "Mark all as read" button at top.
- Notifications in recipient's selected language at time of delivery (FR-I18N-009).
- ARIA: `role="dialog"` on panel. Notifications: `role="listitem"`.

### Confirmation Dialogs

- Any irreversible action (suspend account, reject payment, delete) requires a modal confirmation.
- Title states the action clearly. Body explains the consequence.
- Primary button is the destructive action (danger style). Cancel on left.
- Focus traps inside dialog. ESC closes and cancels.
- No double-click required — single deliberate confirmation click is sufficient for non-destructive confirmations. Account disable by Super Admin requires explicit acknowledgment checkbox.

### Recording Entry States *(OI-05 resolved)*

Recording entries appear on the student's Course Detail page (`/student/courses/:courseId/recordings`) and in the teacher's recording management surface. Three states must be represented:

**Available:** Title, billing period label, "Watch" button that opens the external URL via presigned-gated redirect (FR-LEARN-005). The URL itself is never shown directly in the UI.

**Unavailable — external content removed or expired (broken link):**
- The "Watch" button is replaced by a "Recording no longer available" label in `{colors.text-muted}`, with a small warning icon.
- Below the label: the timestamp of when the link was last known to be accessible (if the platform has detected the issue) — "Last available: 15 Oct 2026". This helps the institute investigate which Zoom cloud or Drive recordings need to be updated.
- No error code or raw URL is shown to the student.
- An administrator sees the same "Recording no longer available" indicator on the teacher management view, plus an "Update URL" action to replace the broken link.

**Unpublished (teacher has not yet published):**
- Does not appear in the student's recording list at all. Unpublished recordings are invisible to students (FR-LEARN-004).
- On the teacher dashboard, unpublished recordings show a "Draft" grey pill and a "Publish" action.

### Super Administrator Access Policy Configuration UI *(OI-06 resolved)*

Surface: `/owner/config/access` (within the Owner System Configuration surface).

The page provides a form section titled "Content Access Policy" with the following controls:

**Historical access duration:**
- Label: "Students retain access to past materials and recordings for…"
- Control: a select/dropdown with options: "Indefinite (all paid periods)", "Last 12 months", "Last 6 months", "Last 3 months", "Current period only".
- Default: "Indefinite (all paid periods)" (per OD-ACC-01 approved decision in PRD).
- Help text below: "This applies to study materials and recording links. Live Zoom access is always restricted to the current paid period regardless of this setting."

**Live Zoom access restriction:**
- Read-only indicator: "Live Zoom meeting links are always restricted to the current paid billing period. This cannot be configured." This makes the non-configurable rule visible to the Owner without creating false expectation that it can be changed.

**Save behavior:** Changes are saved via a "Save Changes" button. A success toast confirms. The setting takes effect immediately for all new access evaluations; existing entitlements are not revoked retroactively.

**Accessibility:** All controls are keyboard-accessible. The select has a visible label. The help text is associated via `aria-describedby`. Both English and Sinhala label variants are provided in the translation files.

### WhatsApp Templates

Admin-facing only. Finance Administrators and Administrators can access from `/admin/templates`.

**Layout:** Each template is displayed as a card with two columns — English version on the left, Sinhala version on the right. Each column has a "Copy" button labeled in its own language: the English column button reads "Copy English"; the Sinhala column button reads "ලෙස පිටපත් කරන්න" (Copy Sinhala). **These labels are always displayed in their respective language regardless of the interface language** — the administrator must be able to identify and copy either version without the labels changing.

**Variable substitution:** Template placeholders (e.g., `[student name]`, `[course]`, `[month]`, `[amount]`) are auto-filled from context when available (e.g., when accessed from a specific student's payment record). Auto-filled values appear in the template text; unfilled placeholders remain in `[bracket]` format to be completed manually.

**Course name substitution:** When a template references a course name, the substituted value uses the **language-matched version** of the institute-configured course name. If the administrator is on an English interface and the template is the English column, the English course name is substituted. If the Sinhala template column is being populated, the Sinhala course name is substituted (if available); if only one language version of the course name exists, the available name is substituted with no further indicator.

**Interaction:**
- "Copy" (either column) copies the full template text (with substituted values) to the clipboard. A brief "Copied!" confirmation replaces the button label for 2 seconds, then reverts.
- Copying does not navigate away or reset the page.
- Both Copy buttons have distinct `aria-label` values: `"Copy English WhatsApp template for [template name]"` and `"Copy Sinhala WhatsApp template for [template name]"`.

**Available templates (per PRD FR-NOTIF-002):** Enrollment confirmed · Payment received · Payment approved · Clarification needed · Payment rejected · Overdue reminder.

---

## State Patterns

### Loading State

- TanStack Query `isLoading = true` → render skeleton components.
- Skeleton: `shimmer` CSS animation (1.4s infinite). Same layout dimensions as loaded content (no layout shift).
- Skeleton colors: `{colors.brand-subtle}` → `{colors.brand-tint}` light; `{colors.surface-elevated}` → `{colors.border}` dark.
- Topbar and sidebar render immediately (not skeletonized). Content area skeletonizes.
- Loading state: no interaction possible with skeleton elements.

### Empty State

- When a list/collection has zero items: centered illustration (emoji icon, 48px) + heading + descriptive body + primary CTA.
- Student no courses: "Browse Courses →" CTA.
- Finance queue empty: "No submissions pending" — positive state, no CTA needed.
- Migration no imports: "Import Students" CTA.
- Empty states fully translated in both languages.

### Error State

- API error (network/server): error banner with icon, human-readable message (from `t('errors:CODE')`), "Try Again" button, optional "Contact Support" link.
- 401 Unauthorized: redirect to login with `returnUrl` preserved. Session expired message on login screen.
- 403 Forbidden: "Access restricted" page with "Go to Dashboard" button. Never shows raw HTTP status.
- 404: "Page not found" with role-appropriate "Go to Dashboard" button.
- Form validation error: inline below the field. No banner required for single-field errors.
- All error messages in selected language. Error code shown in small monospace text for admin/support reference.

### Payment States (Student-facing)

| Payment State | Student sees | Available actions |
|---|---|---|
| Invoice generated, no submission | "Invoice ready — LKR X,XXX due by [date]" + progress indicator | Upload payment slip |
| SUBMITTED | "Payment submitted — awaiting verification" | View submission, add evidence |
| UNDER_REVIEW | "Under review by finance team" | View submission |
| REQUIRES_CLARIFICATION | Warning banner with reason + evidence history | Upload additional evidence |
| APPROVED | Success banner "Payment approved — access activated" | View course content |
| REJECTED | Danger banner with reason | Submit new payment |
| OVERDUE | Danger banner "Payment overdue — access locked" | Upload payment slip |
| PARTIAL | Warning "Partial payment — some courses locked" | View allocation, upload more |

### Access States (Student-facing)

| Access State | Student sees on course card |
|---|---|
| Access Active (paid) | Green "Access Active" pill. Zoom link, materials, recordings visible. |
| Payment Pending | Amber "Payment Pending" pill. Content locked. "Upload Slip" CTA. |
| Payment Overdue | Red "Overdue" pill. Content locked. "Upload Slip" CTA with urgency. |
| Under Review | Purple "Under Review" pill. Content locked. Waiting message. |
| Historical (paid, older period) | Green "Paid — [Month]" pill. Materials and recordings accessible. Zoom link not shown (past period). |
| PENDING_ACTIVATION | Info banner: "Complete account activation to enroll". Browse-only. |
| SUSPENDED | Danger banner: "Account suspended. Contact administrator." All content locked. |

### PENDING_ACTIVATION Course Browse Behavior (MIN-06)

A student in PENDING_ACTIVATION state (admin-assisted registration, activation not yet completed) **can access the course browser** at `/student/browse`. This is confirmed in PRD FR-REG-011 and UJ-5.

- The course list loads and displays normally: course name, teacher, grade, category, schedule, fee.
- All enrollment CTAs ("Enroll", "Request Enrollment") are replaced by a persistent info banner at the top of the page: "Your account is not yet fully activated. Complete your account setup to enroll in courses." The banner includes a link to the activation instructions page.
- No paid content (Zoom links, materials, recordings) is accessible.
- The student profile page (`/student/profile`) shows their EP ID and a prominent "Complete Activation" prompt.
- The Architecture middleware must permit `GET /api/v1/courses` (public course listing) for PENDING_ACTIVATION users and must block `POST /api/v1/enrollments` and all paid-content routes.

### SUSPENDED and DISABLED Account Experience (MIN-07 / AD-52)

**At login time:**
- A student with a SUSPENDED or DISABLED account receives a single generic error at the login screen: "Your account is not currently accessible. Please contact your administrator for assistance." (FR-NOTIF translation key: `auth:login.accountNotAccessible`)
- No JWT is issued (AD-52). The login form remains in the idle state; the student can attempt login again (useful if the suspension was lifted between sessions).
- The error copy is deliberately ambiguous — it does not state "suspended" or "disabled" to prevent account-state enumeration by third parties.
- The same error code (`ERR_ACCOUNT_NOT_ACCESSIBLE`) is used for both SUSPENDED and DISABLED — no distinction is exposed to the login UI.

**Mid-session suspension (account suspended while logged in):**
- The next protected API request returns `403 ERR_ACCOUNT_NOT_ACCESSIBLE`.
- The frontend catches this at the global error boundary and renders a full-page message: "Your account is not currently accessible. Please contact your administrator for assistance." with a "Return to Login" button.
- The local session tokens are cleared on this event. The student must log in again (which will also be blocked until the account is reinstated).

**Administrator view of suspended accounts:**
- The Student Detail page in `/admin/students/:studentId` shows the precise state (SUSPENDED / DISABLED) and the full account history.
- The "Reinstate" action (SUSPENDED → ACTIVE) is available to Administrators and Super Administrators.
- The "Reactivate" action (DISABLED → ACTIVE) is available to Super Administrators only.
- All enrollment, payment, and access history is preserved and visible regardless of account state.

### Upload States

| State | Visual | ARIA |
|---|---|---|
| Idle | Dashed border upload zone, tap/click or drag to upload | `aria-label="Upload payment slip. Accepted: JPG, PNG, PDF up to 5 MB"` |
| Dragging over | Border becomes solid `{colors.brand}`, background `{colors.brand-subtle}` | `aria-dropeffect="copy"` |
| Preparing (Phase 1 — presign) | Indeterminate spinner; label "Preparing upload…" | `aria-busy="true"` on zone; `aria-live="polite"` "Preparing…" |
| Uploading (Phase 2 — PUT to R2) | Determinate progress bar with percentage; label "Uploading — do not close this page" | `role="progressbar" aria-valuenow="{percent}" aria-valuemin="0" aria-valuemax="100"` |
| Confirming (Phase 3 — completion callback) | Progress bar full; spinner overlay; label "Confirming…" | `aria-busy="true"` on zone |
| Complete | Green border, filename, size, timestamp, "View" link | `aria-live="polite"` "Upload complete — [filename]" |
| Interrupted / network failure | Red border/bg, "Upload failed — Try Again" button | `aria-live="assertive"` error announcement |
| File rejected (type/size) | Error message below zone; zone returns to idle | `aria-live="polite"` rejection reason |

### Account States (Admin-facing)

| State | Admin can do |
|---|---|
| PENDING_ACTIVATION | View profile, resend activation link, enroll on behalf (blocked until ACTIVE) |
| ACTIVE | View, suspend, enroll, manage |
| SUSPENDED | View, reinstate |
| DISABLED | View only (Super Admin can reactivate) |

---

### Duplicate Detection State (Self-Registration)

When the system detects a potential duplicate account during a student's self-registration (FR-REG-002), the registration cannot complete automatically. The student-facing experience is:

**Student sees:**
- Registration is paused before the EP ID is generated.
- A neutral info banner replaces the success state: "An account with a similar name and grade may already exist. Please contact your administrator or try logging in with your existing Student ID."
- No technical detail about the duplicate candidate is shown to the student (no EP ID, no existing account data — account enumeration is prevented).
- The student's entered form data is preserved so they can correct a typo if that was the cause.
- A "Contact Administrator" link opens a pre-filled WhatsApp message template to the institute's support number.

**Behind the scenes:**
- A `DuplicateReview` document is created (AD-39) with the incoming registration data.
- The student account is not created until an administrator resolves the review.
- The administrator sees the pending review in the Students section under a "Duplicate Reviews" queue (surface: `/admin/students/duplicate-review`).

**Administrator duplicate review UI:**
- Table row in `/admin/students/duplicate-review` shows: incoming record (name, grade, DOB) alongside the matched existing candidate record(s) with a match-score indicator.
- Three action buttons per row: **Confirm as New** (records are different students — proceed with registration), **Merge** (incoming is the same student — map incoming data to the existing EP ID, do not create a new account), **Defer** (hold for later; incoming record remains uncommitted).
- Auto-merge on name-only match is prohibited (AD-39). All three actions require a deliberate administrator click.
- After "Confirm as New": the student account is created in ACTIVE state (self-registration path) and the student can log in. If the student has since abandoned the session, an administrator can complete the registration manually.
- After "Merge": the incoming registration data is discarded except for any new contact information that is merged to the existing record. The administrator is shown what will be merged before confirming.

**Bulk import duplicate flow:** Flagged rows surface in the post-batch review queue at `/admin/migration` (same DuplicateReview adjudication UI); the batch continues on unflagged rows and does not wait for resolution of flagged rows (AD-41).

---

## Interaction Primitives

### Tap / Click targets

- Minimum touch target: 44×44px for all interactive elements (WCAG 2.5.5 AAA target; AA requires 24px, we exceed).
- Mobile bottom nav items: tap target spans full nav bar height (60px) regardless of icon/label size.
- Quick-action cards on student dashboard: entire card is the tap target.
- Table row actions: inline buttons, min 28px height desktop, 44px mobile.

### Focus Management

- Focus ring: `outline: 3px solid {colors.brand}; outline-offset: 2px` on all interactive elements.
- Exception: Today's Class Join button — `outline: 3px solid #ffffff` (white ring on dark banner).
- Focus ring never hidden for keyboard users (`outline: none` is prohibited without a custom focus style).
- Focus trap: all modals and dialogs. Focus returns to trigger element on close.
- Skip link: `<a href="#main-content" class="sr-only focus:not-sr-only">Skip to main content</a>` at top of document.
- Page navigation: focus moves to page heading on route change (React Router focus management).
- Loading state: focus not stolen during skeleton render. Loading indicator announced via `aria-live`.

### Keyboard Navigation

- All interactive elements reachable by Tab.
- Sidebar nav: Tab through items, Enter/Space activates.
- Table rows: Tab to action buttons. Arrow keys do not navigate rows (not a data grid pattern).
- Modals: Tab cycles within modal. Shift+Tab reverses. ESC closes.
- Dropdowns/select: native browser keyboard support.
- Language switcher: Tab to focus, Enter/Space to toggle.
- Theme toggle: Tab to focus, Enter/Space to toggle.
- File upload zone: Tab to focus, Enter/Space opens file dialog.
- Today's Class "Join Now": Tab to focus, Enter activates.

### Scroll Behavior

- Page scroll: `scroll-behavior: smooth` for anchor navigation only.
- Infinite scroll: not used. Pagination used for all lists (AD-47).
- Mobile: `overflow-y: auto` on main content area. Topbar and bottom nav fixed.
- Horizontal scroll: never on content. Tables on very narrow viewports: horizontal scroll within the table container only (`overflow-x: auto` on `.tbl-wrap`).

### Transitions

- Theme toggle: no transition on color change (instant is less jarring for accessibility).
- Hover states: `transition: background-color 0.15s, border-color 0.15s` only. No layout transitions.
- Modal open: `opacity 0→1` over 150ms. No slide animations.
- Notification panel: `transform: translateX` over 200ms on mobile slide-in only.
- Skeleton shimmer: functional animation (communicates loading, prevents layout shift).
- No entrance animations, no scroll-triggered animations, no lottie/animation libraries.
- `prefers-reduced-motion`: all transitions disabled when set. Skeletons remain visible but shimmer stops.

---

## Accessibility Floor

*Behavioral requirements only. Visual contrast specifications live in DESIGN.md Colors.*

**Target standard:** WCAG 2.1 AA. Known gaps versus WCAG 2.2 AA documented in Open Items below.

### Mandatory behaviors

- All images and icons: `alt` text or `aria-label`. Decorative icons: `aria-hidden="true"`.
- Form fields: every field has a visible `<label>` or `aria-label`. Placeholder is never the only label.
- Error messages: associated with their field via `aria-describedby`. `role="alert"` for toast errors.
- Live regions: `aria-live="polite"` on notification panel, upload completion, success toasts. `aria-live="assertive"` for critical errors (upload failure, session expiry).
- Status changes: all payment status changes announced via `aria-live` region.
- Navigation landmark: `<nav role="navigation" aria-label="Main navigation">` on sidebar and bottom nav.
- Page landmark: `<main id="main-content">`. Skip link targets `#main-content`.
- Modal: `role="dialog" aria-modal="true" aria-labelledby`. Focus trap + ESC to close.
- Tables: `<caption>` or `aria-label` on all tables. Column headers via `<th scope="col">`.
- Loading: `aria-busy="true"` on content area during skeleton state. Remove on load complete.
- `html lang` attribute: `"en"` or `"si"` updated on language switch. Inline `lang` spans on mixed-language content.
- Color is never the only indicator of state (status pills have text + dot, not color alone).
- Focus ring never removed without an equivalent visible replacement.

### WCAG 2.2 gap items (deferred — require explicit record)

| Gap | WCAG 2.2 criterion | Decision |
|---|---|---|
| Target size 24×24px minimum for all interactive elements | 2.5.8 AA | We exceed at 44px — no gap |
| Redundant entry prevention across multi-step forms | 3.3.7 A | Low risk — registration is single-step |
| Accessible authentication — no cognitive function tests | 3.3.8 AA | Student ID + password only. No CAPTCHA, no image puzzles. Compliant. |
| Consistent help mechanism | 3.2.6 A | Help & Support nav item in every role. Compliant. |
| Dragging alternative | 2.5.7 AA | No drag interactions in MVP. Compliant. |
| Focus appearance (2px minimum perimeter) | 2.4.11 AA | 3px outline exceeds minimum. Compliant. |

Full WCAG 2.1 AA → 2.2 AA gap analysis: no blocking gaps identified for MVP. All new 2.2 AA criteria met by current design or not applicable.

---

## Key Flows

Named-protagonist journeys. Steps are numbered. Each journey has a climax beat.

### Flow 1: Kavya self-registers and joins her first class

**Protagonist:** Kavya Amarasinghe, Grade 9, first-time web portal user. Her mother sits with her. Phone browser, Sinhala language, Light Mode.

1. Kavya opens the portal. She sees the landing page with the language selector. Her mother taps "සිංහල". Interface switches instantly — form stays empty, language preference saved.
2. She taps "ලියාපදිංචි වන්න" (Register). Registration form loads in Sinhala.
3. She enters her full name (සිංහල script), selects Grade 9, enters her date of birth. Mother's WhatsApp entered optionally.
4. System checks for duplicates — none found. Form validates inline as she types. No red errors.
5. Kavya creates a password. Password strength indicator shows. Confirm password matches.
6. She taps "ගිණුම සාදන්න" — account creates, transitions directly to ACTIVE. **No separate email confirmation step.**
7. System generates EP-000147. Dashboard loads. Sinhala interface shows her EP ID prominently.
8. She browses "පාඨමාලා" — sees Mathematics Grade 9 Theory listed with teacher name, schedule, and monthly fee.
9. She taps "ලියාපදිංචි වන්න" on the course. Invoice generates immediately. **Climax beat:** "ඔබේ ඉල්ලීම ලැබුණු. ඉන්වොයිසිය සූදානම්." banner appears. EP ID and invoice number shown.
10. She taps "ගෙවීම් රිසිත් ඉදිරිපත් කරන්න". Upload zone appears. Mother photographs the bank slip and uploads.
11. Finance admin Priya claims and approves. Push notification arrives: "ගෙවීම අනුමත — ගණිතය ප්‍රවේශය සක්‍රිය".
12. Kavya's dashboard now shows the Zoom link, study materials, and class schedule — all in Sinhala. **No WhatsApp group needed.**

**Acceptance criteria (UX):**
- Sinhala available before registration begins, without an account.
- Language switch during registration preserves all entered field values.
- EP ID displayed prominently on first dashboard load.
- Invoice generated and shown in the same session as enrollment.
- Payment upload accessible from dashboard without re-login.
- Access activated without any administrator manual step.
- All strings in Sinhala — no untranslated raw keys visible at any step.

---

### Flow 2: Amal resolves a payment clarification

**Protagonist:** Amal Wickramasinghe, Grade 11, English language, Dark Mode. Accidentally uploaded October's bank slip against November's invoice.

1. Amal gets an in-app notification: "Payment Needs Clarification — check your Payments page."
2. He opens Payments. November invoice shows "Needs Clarification" amber pill. He taps it.
3. Payment detail page shows: evidence history with his original slip (timestamped), and a Finance Admin note: "Slip date is October 15. Please upload the correct November slip."
4. Evidence history is collapsible. He can view his original slip in a new tab via presigned URL.
5. He taps "+ Add Evidence". Upload zone appears below the evidence history (not a new page).
6. He photographs his November slip and uploads. Progress bar fills. **Climax beat:** "Additional evidence uploaded — submission returned to review queue."
7. Status changes to "Under Review" purple pill in real time (TanStack Query refetch).
8. Priya re-claims, sees full evidence history (both slips, individual timestamps), approves.
9. Amal's dashboard shows November access activated. Mathematics, Science, Sinhala — all green.

**Acceptance criteria (UX):**
- Clarification reason clearly visible on payment detail — not buried in a modal.
- Evidence history shows all items with individual timestamps.
- Upload additional evidence without creating a new submission.
- Original slip preserved and viewable.
- Status updates in near-real-time (TanStack Query polling or push).
- Duplicate entitlement prevention — no double-access activation.

---

### Flow 3: Dilshan pays for three courses in one transfer

**Protagonist:** Dilshan Jayawardena, Grade 10, English, Light Mode, desktop browser.

1. Dilshan opens his November invoice on the Payments page. Three line items: Mathematics LKR 1,500 · Science LKR 1,500 · Sinhala LKR 1,500. Total: LKR 4,500.
2. He taps "Upload Payment Slip". The allocation UI appears: three checkboxes for the line items, each with an amount field.
3. He selects all three checkboxes. For each selected line item he **enters the amount he is allocating** — LKR 1,500 for Mathematics, LKR 1,500 for Science, LKR 1,500 for Sinhala. Amount fields are required when the corresponding checkbox is checked; the form cannot be submitted with a checked line item and a blank amount. A running total ("Total stated: LKR 4,500") updates as he types. The total must be greater than zero before the form can be submitted.
4. He uploads his bank slip. Submission created with three allocations totalling LKR 4,500 and his stated amounts recorded against each line item.
5. Finance Admin Priya claims the submission. She sees: the three line items with Dilshan's stated allocation (LKR 1,500 each), a "Verified bank deposit amount" field she must populate from her bank records, and per-item coverage indicators that update as she enters the verified amount.
6. She enters LKR 4,500 (matches total). All three line items show "Fully covered ✓". She taps Approve.
7. **Climax beat:** System atomically activates access for all three courses. One notification: "Payment approved — Mathematics, Science, Sinhala access activated for November."
8. Dilshan's dashboard: all three course cards show green "Access Active". Three Zoom links visible.

**Acceptance criteria (UX):**
- Single submission supports multiple line-item allocations.
- Amount field is required when the corresponding line-item checkbox is checked. Submitting with a checked line item and a blank or zero amount is blocked with a clear validation message: "Please enter the amount for each selected course."
- The running stated total is displayed and updates in real time as amounts are entered or checkboxes toggled.
- Finance Admin sees the verified amount field, individual allocation status, and "Fully covered" / "Partial" / "Uncovered" per-item indicator.
- Partial payment: if verified amount < total, finance admin sees per-item coverage and must explicitly select which items to approve; no entitlement is created for partially covered items.
- Excess payment: if verified amount > total allocated, the unallocated excess is flagged and finance admin must record the disposition note before approval.
- All payment statuses and notifications correct in both English and Sinhala.

---

### Flow 4: Administrator onboards Tharushi (admin-assisted registration)

**Protagonist:** Administrator Ravi Nirmala, desktop, English, Light Mode. Tharushi's parent called in.

1. Ravi opens Students → Register Student. Admin-assisted registration form.
2. Enters Tharushi's full name, Grade 6, date of birth. Optional: guardian WhatsApp.
3. System checks for duplicates — no match. Form submits. **EP-000203 generated. Account in PENDING_ACTIVATION.**
4. System generates a one-time activation link (48-hour expiry). Link displayed with a "Copy Link" button.
5. Ravi also sees the "Copy WhatsApp Message" template pre-filled: "Hi [guardian name], Tharushi's e-Paperé account is ready. Please use this link to set her password: [link]. Valid for 48 hours."
6. Ravi sends the WhatsApp message manually. He never sees what password Tharushi sets.
7. Tharushi's parent opens the link on her phone. Sets Tharushi's password. Account → ACTIVE.
8. Link is single-use — visiting it again shows "This link has been used."
9. If 48 hours pass unused, Ravi can tap "Regenerate Link" on Tharushi's student profile.

**Acceptance criteria (UX):**
- Admin never sees resulting password — activation link flow only.
- EP ID generated immediately and shown to admin.
- Copy link + copy WhatsApp template — single click each.
- Link expiry shown clearly. Regenerate link available when expired.
- PENDING_ACTIVATION student: browse courses visible, enrollment blocked, with clear explanation.

---

### Flow 5: Finance Admin processes the verification queue efficiently

**Protagonist:** Finance Admin Priya Fernando, desktop, Sinhala, Dark Mode. Monday morning — 18 submissions pending.

1. Priya opens Finance Dashboard. Queue tab shows: "18 pending · 3 clarification · 0 unmatched". Stat cards load instantly (skeleton → data).
2. She filters by "Submitted" status. Table shows 15 items sorted by oldest first.
3. She scans for flags: one item shows "Multi-course" blue badge, one shows "Possible duplicate" pink badge. She clicks the duplicate first.
4. **Climax beat:** Submission detail shows: side-by-side flag comparison — original submission from 3 days ago and this new submission. Same student, same month, same amount. She marks this one "Rejected — duplicate submission" and the reason is recorded. Original preserved.
5. She claims the multi-course submission. Sees: three line items, student's stated total LKR 4,500.
6. She opens her bank system separately, confirms the deposit: LKR 4,500. Enters verified amount. All three items "Fully covered". Approves.
7. Three entitlements created atomically. Queue count drops to 16.
8. She works through the remaining 15 submissions. Queue shows real-time updates as colleagues (if any) claim items — a claimed item shows "🔒 Claimed: [name]" and her Claim button is disabled.
9. End of session: 0 pending. Finance Dashboard shows "All clear."

**Acceptance criteria (UX):**
- Queue renders within 1.5s for up to 100 submissions (pagination, AD-47).
- Flags (duplicate, multi-course, partial, excess, unmatched) visible in table row — no click-through required to see flag type.
- Claim button becomes "Locked" for items claimed by another reviewer.
- Evidence history shows all items chronologically in submission detail.
- Verified amount and allocation UI clear and unambiguous.
- Approve / Clarification / Reject — three distinct button styles. Approve is primary, Clarify is secondary, Reject is danger.
- All labels and statuses in Sinhala at Priya's preference.

---

## Bilingual and i18n Patterns

### Translation scope (full list)

Per PRD Addendum H.3. Modules requiring translation:

| Module | Key areas |
|---|---|
| Pre-auth | Landing, language selector, registration form, login, activation instructions, recovery |
| Student dashboard | Greeting, EP ID label, course status, invoice summary, payment status, access status, Zoom labels, materials labels, recordings labels, schedule, announcements |
| Enrollment | Course browser, enrollment request flow, withdrawal confirmation |
| Invoice + payment | Invoice headings, line items, fee display, deadline, overdue, submission form, upload instructions, allocation UI, all 7+ payment statuses |
| Notifications | All 13 notification types (FR-NOTIF-001), WhatsApp templates (both languages) |
| Admin dashboard | Student list, account status labels, enrollment actions, migration status, duplicate review |
| Finance dashboard | Queue headings, claim/lock, outcome buttons, clarification reason, audit trail columns, flags |
| Teacher dashboard | Roster headings, access status, Zoom entry, material upload, recording entry |
| Owner dashboard | Metric labels, filter labels, revenue headings |
| Validation + errors | All form validation, all API error code translations, access restriction messages, dialogs |
| Account management | Account state labels, activation link, recovery, role labels |

User-generated free text: not translated. Displayed as entered.

### Sinhala layout rules

- All containers holding Sinhala text: `min-height` not fixed height.
- Sinhala nav labels at 320px: verified at 8–9px font-size, no clipping, ≥44px tap target.
- Sinhala course names may be longer than English — course card titles: `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` on single-line displays; `line-clamp: 2` on card previews.
- Date/currency: DD/MM/YYYY format, LKR prefix, in both languages.

### Language switching without data loss

Contract: `useForm()` state is in React component memory. Language switch triggers react-i18next re-render of labels only. No form reset. No navigation. Tested in E2E suite per AD-22.

---

## Responsive and Platform

### Breakpoints

| Name | Width | Layout |
|---|---|---|
| Mobile | <768px | Bottom nav, stacked cards 2-col, topbar |
| Tablet | 768–1023px | Icon sidebar or hamburger, stacked cards 2–3 col |
| Desktop | ≥1024px | Full sidebar 210px, 4-col cards, full tables |

### Mobile-specific behaviors

- Today's Class banner: full-width, stacked layout (vertical flex), Join button full-width below content.
- Quick-action cards: 2×2 grid (4 cards). Dashboard must not require scroll to see all 4 on any phone ≥375px tall.
- Study Materials and Recordings: visible in 2×2 grid without scrolling at 375px height. If viewport is shorter (320×568), a minimal scroll of ≤1 swipe is acceptable.
- Payment card: shows "!" badge on bottom nav Payments icon when invoice overdue or pending.
- Tables on mobile: full-width, horizontal scroll within container. No column hiding — all columns visible via scroll.
- Upload on mobile: `capture="environment"` enables camera. Upload zone occupies full screen width.

### Touch interaction

- Bottom nav items: 44px minimum height for tap target. Label + icon centered.
- Cards: tap entire card (not just text). `cursor: pointer` on card hover (desktop).
- No hover-only interactions. All hover effects have an equivalent tap/focus state.

---

## Open Items

All open items resolved during the UX–Architecture integration correction pass (2026-10-17). No blocking items remain.

| # | Item | Resolution |
|---|---|---|
| OI-01 | Tablet sidebar pattern | **Resolved:** Hamburger drawer confirmed. See Navigation Structure. |
| OI-02 | Super Admin system config UI — billing date/deadline pickers, access policy toggles | **Resolved:** Access policy config UI specified above (Recording Entry States / Super Admin Access Policy section). Billing date/deadline pickers are part of `/owner/config` — layout follows the standard form pattern (label + date-picker input + save). Detailed mockup deferred to key-screen pass. |
| OI-03 | Sinhala translations — actual string content | **Unchanged:** Institute deliverable, not UX scope. Architecture manages key structure (AD-7, AD-30). |
| OI-04 | `prefers-reduced-motion` — confirm shimmer animation stops correctly | **Unchanged:** Implementation-level. Verified in QA per AD-22. |
| OI-05 | Recording URL broken-link indicator | **Resolved:** "Recording no longer available" label with last-known-availability timestamp. See Recording Entry States section above. |
| OI-06 | Historical access period length configurable by Super Admin — UI for that config | **Resolved:** Super Administrator Access Policy Configuration UI specified above. |
| OI-07 | WCAG 2.2 AA full validation | **Unchanged:** Manual testing with assistive technologies required before production launch. No blocking gaps identified in spec review. Gap analysis in Accessibility Floor section confirmed no new WCAG 2.2 AA issues. |
