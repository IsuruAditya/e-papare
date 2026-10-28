import type { Role } from '../auth/AuthContext';

/**
 * Role-scoped navigation configuration — the SINGLE source of truth for which
 * nav items each role sees (DESIGN.md / EXPERIENCE.md: "No role sees another
 * role's nav items"). The Sidebar, Drawer, and BottomNav all read from here, so
 * a role can never leak another role's surfaces.
 *
 * `labelKey` is a `common:nav.*` i18n key (resolved at render time, never a raw
 * string). Paths mirror the EXPERIENCE.md Surface Map. Only the shell-level
 * entries exist in Story 1.7; deeper feature routes are added by their epics.
 */

export interface NavItem {
  /** `common` namespace key, e.g. `nav.home`. */
  labelKey: string;
  path: string;
  /** Short icon glyph token (kept simple; an icon set is a later concern). */
  icon: string;
  /** `true` → active only on an exact path match (role roots). */
  end?: boolean;
}

/** The landing route each role returns to ("your dashboard"). */
export const roleHomePath: Record<Role, string> = {
  STUDENT: '/student',
  TEACHER: '/teacher',
  FINANCE_ADMIN: '/finance',
  ADMINISTRATOR: '/admin',
  SUPER_ADMINISTRATOR: '/owner',
};

export const navConfig: Record<Role, NavItem[]> = {
  STUDENT: [
    { labelKey: 'nav.dashboard', path: '/student', icon: '⌂', end: true },
    { labelKey: 'nav.myCourses', path: '/student/courses', icon: '▤' },
    { labelKey: 'nav.browse', path: '/student/browse', icon: '⌕' },
    { labelKey: 'nav.schedule', path: '/student/schedule', icon: '▦' },
    { labelKey: 'nav.payments', path: '/student/payments', icon: '₨' },
    { labelKey: 'nav.notifications', path: '/student/notifications', icon: '◔' },
    { labelKey: 'nav.profile', path: '/student/profile', icon: '◉' },
    { labelKey: 'nav.help', path: '/student/help', icon: '?' },
  ],
  TEACHER: [
    { labelKey: 'nav.dashboard', path: '/teacher', icon: '⌂', end: true },
    { labelKey: 'nav.myCourses', path: '/teacher/courses', icon: '▤' },
    { labelKey: 'nav.notifications', path: '/teacher/notifications', icon: '◔' },
    { labelKey: 'nav.profile', path: '/teacher/profile', icon: '◉' },
  ],
  FINANCE_ADMIN: [
    { labelKey: 'nav.dashboard', path: '/finance', icon: '⌂', end: true },
    { labelKey: 'nav.queue', path: '/finance/queue', icon: '▤' },
    { labelKey: 'nav.approved', path: '/finance/approved', icon: '✓' },
    { labelKey: 'nav.clarification', path: '/finance/clarification', icon: '◑' },
    { labelKey: 'nav.rejected', path: '/finance/rejected', icon: '✕' },
    { labelKey: 'nav.unmatched', path: '/finance/unmatched', icon: '◇' },
    { labelKey: 'nav.audit', path: '/finance/audit', icon: '▦' },
    { labelKey: 'nav.summaries', path: '/finance/summaries', icon: '∑' },
    { labelKey: 'nav.notifications', path: '/finance/notifications', icon: '◔' },
    { labelKey: 'nav.profile', path: '/finance/profile', icon: '◉' },
  ],
  ADMINISTRATOR: [
    { labelKey: 'nav.dashboard', path: '/admin', icon: '⌂', end: true },
    { labelKey: 'nav.students', path: '/admin/students', icon: '◉' },
    { labelKey: 'nav.enrollments', path: '/admin/enrollments', icon: '▤' },
    { labelKey: 'nav.invoices', path: '/admin/invoices', icon: '₨' },
    { labelKey: 'nav.courses', path: '/admin/courses', icon: '▦' },
    { labelKey: 'nav.teachers', path: '/admin/teachers', icon: '◎' },
    { labelKey: 'nav.migration', path: '/admin/migration', icon: '⇪' },
    { labelKey: 'nav.templates', path: '/admin/templates', icon: '▢' },
    { labelKey: 'nav.notifications', path: '/admin/notifications', icon: '◔' },
    { labelKey: 'nav.profile', path: '/admin/profile', icon: '◉' },
  ],
  SUPER_ADMINISTRATOR: [
    { labelKey: 'nav.dashboard', path: '/owner', icon: '⌂', end: true },
    { labelKey: 'nav.config', path: '/owner/config', icon: '⚙' },
    { labelKey: 'nav.accessPolicy', path: '/owner/config/access', icon: '▣' },
    { labelKey: 'nav.notifications', path: '/owner/notifications', icon: '◔' },
    { labelKey: 'nav.profile', path: '/owner/profile', icon: '◉' },
  ],
};

/** Student mobile bottom nav — exactly 5 items (DESIGN.md / EXPERIENCE.md). */
export const studentBottomNav: NavItem[] = [
  { labelKey: 'nav.home', path: '/student', icon: '⌂', end: true },
  { labelKey: 'nav.courses', path: '/student/courses', icon: '▤' },
  { labelKey: 'nav.payments', path: '/student/payments', icon: '₨' },
  { labelKey: 'nav.notifications', path: '/student/notifications', icon: '◔' },
  { labelKey: 'nav.account', path: '/student/profile', icon: '◉' },
];
