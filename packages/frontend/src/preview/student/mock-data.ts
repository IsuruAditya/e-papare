import type { StatusKey } from '../../components/ui/status-labels';

/**
 * Student Dashboard Preview — strongly-typed fictional demo data.
 *
 * ── Scope & isolation ──────────────────────────────────────────────────────
 * This module is DEV-ONLY mock data for the UI/UX preview at `/preview/student`
 * (see `StudentDashboardPreview.tsx`). It is deliberately NOT connected to any
 * backend, TanStack Query, or shared-types API contract — the eventual Story 5.3
 * dashboard will fetch real data. Keeping the mock shapes here (separate from the
 * presentation components) means the section components stay pure/presentational
 * and the real data layer can replace this file wholesale later.
 *
 * All names, EP IDs, fees, Zoom links, and timestamps are fictional. Fee values
 * are plain display strings here (NOT money arithmetic — AGENTS.md money rules
 * apply to the real backend, not to a static preview label).
 */

/** i18n keys resolved at render time from the `dashboard` namespace. */
export type I18nKey = string;

export interface StudentProfile {
  /** Fictional display name (Latin + Sinhala variants resolved via i18n). */
  nameKey: I18nKey;
  /** EP Student ID — rendered with the monospace brand affordance. */
  epId: string;
  /** Grade number (1–11 for this institute; demo uses 9). */
  grade: number;
  /** Current enrollment billing month, `YYYY-MM` (Asia/Colombo), AD-33. */
  billingMonth: string;
  /** Account state pill. */
  accountStatus: Extract<StatusKey, 'ACTIVE' | 'PENDING_ACTIVATION' | 'SUSPENDED'>;
  /** Overall access state pill. */
  accessStatus: Extract<StatusKey, 'ACCESS_ACTIVE' | 'ACCESS_LOCKED'>;
}

export interface TodaysClass {
  /** i18n key for the subject name. */
  subjectKey: I18nKey;
  /** i18n key for the teacher's display name. */
  teacherKey: I18nKey;
  /** Local start time, pre-formatted for display (e.g. "4:00 PM"). */
  startTime: string;
  /** Grade label suffix for the aria-label, e.g. "Grade 9". */
  grade: number;
  /** Whether the join window is currently open (enables the Join action). */
  joinable: boolean;
}

/** A subject card on the dashboard. `accessStatus` drives the pill + locked state. */
export interface SubjectCard {
  id: string;
  subjectKey: I18nKey;
  teacherKey: I18nKey;
  /** One icon glyph (kept consistent with the nav glyph vocabulary). */
  icon: string;
  accessStatus: Extract<
    StatusKey,
    'ACCESS_ACTIVE' | 'SUBMITTED' | 'UNDER_REVIEW' | 'OVERDUE' | 'PENDING_ACTIVATION'
  >;
  /** Next session label, pre-formatted (e.g. "Mon 4:00 PM"). */
  nextSessionKey: I18nKey | null;
}

export interface ScheduleEntry {
  id: string;
  subjectKey: I18nKey;
  /** Weekday i18n key, e.g. `schedule.days.mon`. */
  dayKey: I18nKey;
  /** Pre-formatted date, e.g. "28 Oct". */
  date: string;
  /** Pre-formatted time range, e.g. "4:00–5:30 PM". */
  time: string;
  /** Highlight state for the row. */
  marker: 'today' | 'upcoming' | 'none';
}

export interface ResourceItem {
  id: string;
  titleKey: I18nKey;
  subjectKey: I18nKey;
  /** Resource kind — drives the icon + kind label. */
  kind: 'recording' | 'material';
  /** Pre-formatted "added" label, e.g. "2 days ago" resolved via i18n count. */
  addedDaysAgo: number;
}

export interface PaymentSummary {
  /** Invoice display number (fictional). */
  invoiceNo: string;
  /** Billing month `YYYY-MM`. */
  billingMonth: string;
  /** Pre-formatted amount string incl. currency, e.g. "LKR 4,500". */
  amount: string;
  /** Pre-formatted due date, e.g. "5 Nov". */
  dueDate: string;
  /** Payment state pill (student-facing subset). */
  status: Extract<
    StatusKey,
    'APPROVED' | 'SUBMITTED' | 'UNDER_REVIEW' | 'REQUIRES_CLARIFICATION' | 'OVERDUE'
  >;
}

export interface Announcement {
  id: string;
  titleKey: I18nKey;
  bodyKey: I18nKey;
  /** Visual emphasis mapped to an AnnouncementBanner variant. */
  tone: 'info' | 'warning' | 'success' | 'neutral';
  /** Pre-formatted relative time, e.g. "Today". */
  whenKey: I18nKey;
}

/** The complete dashboard payload the preview renders in its "loaded" state. */
export interface StudentDashboardData {
  profile: StudentProfile;
  todaysClass: TodaysClass | null;
  subjects: SubjectCard[];
  schedule: ScheduleEntry[];
  resources: ResourceItem[];
  payments: PaymentSummary[];
  announcements: Announcement[];
}

/**
 * The canonical demo payload — Kavya Amarasinghe, Grade 9 (EXPERIENCE.md Flow 1
 * protagonist). Mathematics + Science are paid/active, Sinhala is under review,
 * ICT is overdue — exercising every subject access state and payment pill.
 */
export const studentDashboardMock: StudentDashboardData = {
  profile: {
    nameKey: 'student.name',
    epId: 'EP-000147',
    grade: 9,
    billingMonth: '2026-10',
    accountStatus: 'ACTIVE',
    accessStatus: 'ACCESS_ACTIVE',
  },
  todaysClass: {
    subjectKey: 'subjects.mathematics',
    teacherKey: 'teachers.perera',
    startTime: '4:00 PM',
    grade: 9,
    joinable: true,
  },
  subjects: [
    {
      id: 'math',
      subjectKey: 'subjects.mathematics',
      teacherKey: 'teachers.perera',
      icon: '∑',
      accessStatus: 'ACCESS_ACTIVE',
      nextSessionKey: 'subjectCards.next.monAfternoon',
    },
    {
      id: 'science',
      subjectKey: 'subjects.science',
      teacherKey: 'teachers.fernando',
      icon: '⚛',
      accessStatus: 'ACCESS_ACTIVE',
      nextSessionKey: 'subjectCards.next.wedAfternoon',
    },
    {
      id: 'sinhala',
      subjectKey: 'subjects.sinhala',
      teacherKey: 'teachers.silva',
      icon: 'අ',
      accessStatus: 'UNDER_REVIEW',
      nextSessionKey: 'subjectCards.next.thuEvening',
    },
    {
      id: 'ict',
      subjectKey: 'subjects.ict',
      teacherKey: 'teachers.jayawardena',
      icon: '⌨',
      accessStatus: 'OVERDUE',
      nextSessionKey: null,
    },
  ],
  schedule: [
    {
      id: 's1',
      subjectKey: 'subjects.mathematics',
      dayKey: 'schedule.days.mon',
      date: '28 Oct',
      time: '4:00–5:30 PM',
      marker: 'today',
    },
    {
      id: 's2',
      subjectKey: 'subjects.science',
      dayKey: 'schedule.days.wed',
      date: '30 Oct',
      time: '4:00–5:30 PM',
      marker: 'upcoming',
    },
    {
      id: 's3',
      subjectKey: 'subjects.sinhala',
      dayKey: 'schedule.days.thu',
      date: '31 Oct',
      time: '6:00–7:30 PM',
      marker: 'upcoming',
    },
    {
      id: 's4',
      subjectKey: 'subjects.mathematics',
      dayKey: 'schedule.days.fri',
      date: '1 Nov',
      time: '4:00–5:30 PM',
      marker: 'none',
    },
  ],
  resources: [
    {
      id: 'r1',
      titleKey: 'resources.items.mathRecording',
      subjectKey: 'subjects.mathematics',
      kind: 'recording',
      addedDaysAgo: 1,
    },
    {
      id: 'r2',
      titleKey: 'resources.items.scienceNotes',
      subjectKey: 'subjects.science',
      kind: 'material',
      addedDaysAgo: 2,
    },
    {
      id: 'r3',
      titleKey: 'resources.items.mathWorksheet',
      subjectKey: 'subjects.mathematics',
      kind: 'material',
      addedDaysAgo: 4,
    },
    {
      id: 'r4',
      titleKey: 'resources.items.scienceRecording',
      subjectKey: 'subjects.science',
      kind: 'recording',
      addedDaysAgo: 6,
    },
  ],
  payments: [
    {
      invoiceNo: 'INV-2026-1047',
      billingMonth: '2026-10',
      amount: 'LKR 4,500',
      dueDate: '5 Oct',
      status: 'APPROVED',
    },
    {
      invoiceNo: 'INV-2026-1189',
      billingMonth: '2026-11',
      amount: 'LKR 4,500',
      dueDate: '5 Nov',
      status: 'SUBMITTED',
    },
    {
      invoiceNo: 'INV-2026-1190',
      billingMonth: '2026-11',
      amount: 'LKR 1,500',
      dueDate: '5 Nov',
      status: 'OVERDUE',
    },
  ],
  announcements: [
    {
      id: 'a1',
      titleKey: 'announcements.items.holidayTitle',
      bodyKey: 'announcements.items.holidayBody',
      tone: 'info',
      whenKey: 'announcements.when.today',
    },
    {
      id: 'a2',
      titleKey: 'announcements.items.examTitle',
      bodyKey: 'announcements.items.examBody',
      tone: 'warning',
      whenKey: 'announcements.when.yesterday',
    },
    {
      id: 'a3',
      titleKey: 'announcements.items.resourceTitle',
      bodyKey: 'announcements.items.resourceBody',
      tone: 'success',
      whenKey: 'announcements.when.daysAgo',
    },
  ],
};

/** Preview render states the demo lets you toggle (loading / empty / error). */
export type PreviewState = 'loaded' | 'loading' | 'empty' | 'error';

/** Empty payload — exercises every section's empty state. */
export const emptyDashboardMock: StudentDashboardData = {
  profile: studentDashboardMock.profile,
  todaysClass: null,
  subjects: [],
  schedule: [],
  resources: [],
  payments: [],
  announcements: [],
};
