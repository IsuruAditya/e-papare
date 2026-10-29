import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnnouncementBanner, Button, Dialog, cx } from '../../components/ui';
import {
  studentDashboardMock,
  emptyDashboardMock,
  type PreviewState,
  type StudentDashboardData,
} from './mock-data';
import { WelcomeOverview } from './sections/WelcomeOverview';
import { TodaysClassBanner } from './sections/TodaysClassBanner';
import { SubjectsSection } from './sections/SubjectsSection';
import { ScheduleSection } from './sections/ScheduleSection';
import { ResourcesSection } from './sections/ResourcesSection';
import { PaymentsSection } from './sections/PaymentsSection';
import { AnnouncementsSection } from './sections/AnnouncementsSection';
import { DashboardSkeleton } from './sections/DashboardSkeleton';
import { DashboardError } from './sections/DashboardError';

/**
 * Student Dashboard — DEV-ONLY UI/UX preview (content region).
 *
 * This renders INSIDE the real `AppLayout` shell (topbar + student nav), so it
 * exercises the production chrome without touching the real `/student` route or
 * `ProtectedRoute`. It is the visual rehearsal for the eventual Story 5.3
 * dashboard: section composition + states are built here against typed mock data
 * so the real data layer can slot in later without reworking presentation.
 *
 * Interactivity (local mock only): a render-state switcher (loaded / loading /
 * empty / error) and a demo "Join class" dialog. No backend, no real Zoom link,
 * no real payment action.
 */
export function StudentDashboardPreview(): React.JSX.Element {
  const { t } = useTranslation('dashboard');
  const [state, setState] = useState<PreviewState>('loaded');
  const [joinSubject, setJoinSubject] = useState<string | null>(null);

  const data: StudentDashboardData = state === 'empty' ? emptyDashboardMock : studentDashboardMock;

  return (
    <div className="flex flex-col gap-6">
      <PreviewBanner />
      <PreviewControls state={state} onChange={setState} />

      {state === 'loading' ? (
        <DashboardSkeleton />
      ) : state === 'error' ? (
        <DashboardError onRetry={() => setState('loaded')} />
      ) : (
        <DashboardContent data={data} onJoin={setJoinSubject} />
      )}

      <Dialog
        open={joinSubject !== null}
        onClose={() => setJoinSubject(null)}
        title={t('demoDialog.title')}
        footer={
          <Button variant="primary" onClick={() => setJoinSubject(null)}>
            {t('demoDialog.ok')}
          </Button>
        }
      >
        <p>{t('demoDialog.body', { subject: joinSubject ?? '' })}</p>
      </Dialog>
    </div>
  );
}

/** The loaded dashboard body — section composition in UX priority order. */
function DashboardContent({
  data,
  onJoin,
}: {
  data: StudentDashboardData;
  onJoin: (subject: string) => void;
}): React.JSX.Element {
  // Section-level "view all" / "open" actions are demo no-ops in the preview;
  // a single handler keeps the wiring honest without faking navigation.
  const demoAction = (): void => undefined;

  return (
    <div className="flex flex-col gap-6">
      <WelcomeOverview profile={data.profile} />
      <TodaysClassBanner todaysClass={data.todaysClass} onJoin={onJoin} />
      <SubjectsSection subjects={data.subjects} onOpen={onJoin} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ScheduleSection schedule={data.schedule} onViewAll={demoAction} />
        <ResourcesSection resources={data.resources} onOpen={onJoin} />
      </div>

      <PaymentsSection payments={data.payments} onViewAll={demoAction} />
      <AnnouncementsSection announcements={data.announcements} onViewAll={demoAction} />
    </div>
  );
}

/** Persistent demo-data banner so the preview is never mistaken for real data. */
function PreviewBanner(): React.JSX.Element {
  const { t } = useTranslation('dashboard');
  return (
    <AnnouncementBanner variant="info" icon="🧪" title={t('preview.banner.title')}>
      {t('preview.banner.body')}
    </AnnouncementBanner>
  );
}

/** Render-state switcher — lets the reviewer inspect every section state. */
function PreviewControls({
  state,
  onChange,
}: {
  state: PreviewState;
  onChange: (s: PreviewState) => void;
}): React.JSX.Element {
  const { t } = useTranslation('dashboard');
  const states: PreviewState[] = ['loaded', 'loading', 'empty', 'error'];

  return (
    <fieldset className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface-elevated px-4 py-3">
      <legend className="px-1 text-xs font-semibold tracking-wide text-text-muted uppercase si:tracking-normal si:normal-case">
        {t('preview.controls.state')}
      </legend>
      {states.map((s) => {
        const selected = state === s;
        return (
          <button
            key={s}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(s)}
            className={cx(
              'min-h-[36px] rounded-md border px-3 text-sm font-semibold transition-colors',
              'focus-visible:outline-none focus-visible:[outline:3px_solid_var(--color-brand)] focus-visible:[outline-offset:2px]',
              selected
                ? 'border-brand bg-brand text-white'
                : 'border-border-strong bg-surface text-text-muted hover:bg-brand-subtle hover:text-brand',
            )}
          >
            {t(`preview.controls.states.${s}`)}
          </button>
        );
      })}
    </fieldset>
  );
}
