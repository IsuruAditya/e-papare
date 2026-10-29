import React from 'react';
import { useTranslation } from 'react-i18next';
import { Table, cx, type TableColumn } from '../../../components/ui';
import { SectionHeader } from './SectionHeader';
import { EmptyState } from './EmptyState';
import type { ScheduleEntry } from '../mock-data';

/**
 * Upcoming schedule (EXPERIENCE.md student dashboard priority #3). A compact
 * weekly table of upcoming sessions across enrolled subjects, with a clear
 * "Today" / "Upcoming" marker tag on the relevant rows. Reuses the shared Table
 * primitive (DESIGN.md Tables); markers are token-colored chips, not raw hex.
 */
export interface ScheduleSectionProps {
  schedule: ScheduleEntry[];
  onViewAll: () => void;
}

export function ScheduleSection({ schedule, onViewAll }: ScheduleSectionProps): React.JSX.Element {
  const { t } = useTranslation('dashboard');
  const titleId = 'schedule-heading';

  const columns: TableColumn<ScheduleEntry>[] = [
    {
      key: 'subject',
      header: t('schedule.columns.subject'),
      cell: (row) => (
        <span className="flex items-center gap-2 font-semibold text-text">
          {t(row.subjectKey)}
          <MarkerTag marker={row.marker} />
        </span>
      ),
    },
    { key: 'day', header: t('schedule.columns.day'), cell: (row) => t(row.dayKey) },
    { key: 'date', header: t('schedule.columns.date'), cell: (row) => row.date },
    { key: 'time', header: t('schedule.columns.time'), cell: (row) => row.time },
  ];

  return (
    <section aria-labelledby={titleId}>
      <SectionHeader
        titleId={titleId}
        title={t('schedule.title')}
        action={{ label: t('schedule.viewAll'), onClick: onViewAll }}
      />
      {schedule.length === 0 ? (
        <EmptyState icon="🗓️" title={t('schedule.empty.title')} body={t('schedule.empty.body')} />
      ) : (
        <Table
          columns={columns}
          rows={schedule}
          rowKey={(row) => row.id}
          caption={t('schedule.title')}
        />
      )}
    </section>
  );
}

function MarkerTag({ marker }: { marker: ScheduleEntry['marker'] }): React.JSX.Element | null {
  const { t } = useTranslation('dashboard');
  if (marker === 'none') return null;

  const isToday = marker === 'today';
  return (
    <span
      className={cx(
        'rounded-full border px-2 py-0.5 text-xs font-semibold',
        isToday
          ? 'border-success-border bg-success-bg text-success'
          : 'border-info-border bg-info-bg text-info',
      )}
    >
      {isToday ? t('schedule.todayTag') : t('schedule.upcomingTag')}
    </span>
  );
}
