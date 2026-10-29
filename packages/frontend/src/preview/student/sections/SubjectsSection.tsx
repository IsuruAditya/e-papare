import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, StatusPill, cx } from '../../../components/ui';
import { SectionHeader } from './SectionHeader';
import { EmptyState } from './EmptyState';
import type { SubjectCard } from '../mock-data';

/**
 * My Subjects (EXPERIENCE.md student dashboard priority #2). A responsive grid
 * of subject cards, each showing the subject, teacher, access-state pill, next
 * session, and a context action (open when accessible, upload-slip when locked).
 *
 * Interactive preview: a small filter toggle (All / Active / Locked) operates on
 * the local mock list only. Locked subjects (anything other than ACCESS_ACTIVE)
 * dim their content and swap the action, matching the EXPERIENCE.md access-state
 * table.
 */
type Filter = 'all' | 'active' | 'locked';

export interface SubjectsSectionProps {
  subjects: SubjectCard[];
  onOpen: (subject: string) => void;
}

const isActive = (s: SubjectCard): boolean => s.accessStatus === 'ACCESS_ACTIVE';

export function SubjectsSection({ subjects, onOpen }: SubjectsSectionProps): React.JSX.Element {
  const { t } = useTranslation('dashboard');
  const [filter, setFilter] = useState<Filter>('all');
  const titleId = 'subjects-heading';

  const visible = useMemo(() => {
    if (filter === 'active') return subjects.filter(isActive);
    if (filter === 'locked') return subjects.filter((s) => !isActive(s));
    return subjects;
  }, [subjects, filter]);

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: t('subjectCards.filters.all') },
    { key: 'active', label: t('subjectCards.filters.active') },
    { key: 'locked', label: t('subjectCards.filters.locked') },
  ];

  return (
    <section aria-labelledby={titleId}>
      <SectionHeader
        titleId={titleId}
        title={t('subjectCards.title')}
        action={{
          label: t('subjectCards.viewAll'),
          onClick: () => onOpen(t('subjectCards.title')),
        }}
      />

      {subjects.length > 0 && (
        // A filter is a set of toggle buttons, NOT an ARIA tabs widget (there is
        // no tabpanel and no roving arrow-key navigation). Modelled as a labelled
        // group of `aria-pressed` toggles — the same pattern as the render-state
        // control — which is the correct, fully-keyboard-operable semantics.
        <div
          role="group"
          aria-label={t('subjectCards.filters.label')}
          className="mb-3 flex flex-wrap gap-1.5"
        >
          {filters.map(({ key, label }) => {
            const selected = filter === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={selected}
                onClick={() => setFilter(key)}
                className={cx(
                  'min-h-[36px] rounded-full border px-3.5 text-sm font-semibold transition-colors',
                  'focus-visible:outline-none focus-visible:[outline:3px_solid_var(--color-brand)] focus-visible:[outline-offset:2px]',
                  selected
                    ? 'border-brand bg-brand text-white'
                    : 'border-border-strong bg-surface text-text-muted hover:bg-brand-subtle hover:text-brand',
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {visible.length === 0 ? (
        subjects.length === 0 ? (
          // No enrolled subjects at all — invite the student to browse.
          <EmptyState
            icon="📚"
            title={t('subjectCards.empty.title')}
            body={t('subjectCards.empty.body')}
            cta={{
              label: t('subjectCards.empty.cta'),
              onClick: () => onOpen(t('subjectCards.title')),
            }}
          />
        ) : (
          // The student HAS subjects, but the active filter hides them all — say
          // so, rather than the misleading "no subjects yet / browse" copy.
          <EmptyState
            icon="🔍"
            title={t('subjectCards.filteredEmpty.title')}
            body={t('subjectCards.filteredEmpty.body')}
          />
        )
      ) : (
        // EXPERIENCE.md Breakpoints: mobile (<768px) shows a 2-col card grid —
        // the 2×2 quick-card grid must be visible without scrolling at ≥375px.
        // So the base is 2 columns (not 1); desktop (xl) widens to 4.
        <ul className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {visible.map((subject) => (
            <li key={subject.id}>
              <SubjectCardView subject={subject} onOpen={onOpen} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function SubjectCardView({
  subject,
  onOpen,
}: {
  subject: SubjectCard;
  onOpen: (subject: string) => void;
}): React.JSX.Element {
  const { t } = useTranslation('dashboard');
  const name = t(subject.subjectKey);
  const active = isActive(subject);
  // EXPERIENCE.md Access-States: only Overdue (and Payment Pending) offer the
  // "Upload Slip" CTA. Under Review / Submitted are locked with a WAITING
  // message and NO slip action (the student has already paid — nothing to do).
  const needsSlip = subject.accessStatus === 'OVERDUE';

  return (
    <Card interactive className="flex h-full flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-subtle text-xl text-brand"
        >
          {subject.icon}
        </span>
        <StatusPill status={subject.accessStatus} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-base font-bold text-text">{name}</p>
        <p className="mt-0.5 text-sm text-text-muted">{t(subject.teacherKey)}</p>
        {active && subject.nextSessionKey !== null ? (
          <p className="mt-2 text-xs text-text-muted">
            {t('subjectCards.nextLabel')}: {t(subject.nextSessionKey)}
          </p>
        ) : (
          <p className="mt-2 text-xs font-medium text-text-muted">
            {needsSlip ? t('subjectCards.locked') : t('subjectCards.waiting')}
          </p>
        )}
      </div>
      {active ? (
        <Button variant="secondary" size="sm" className="w-full" onClick={() => onOpen(name)}>
          {t('subjectCards.open')}
        </Button>
      ) : needsSlip ? (
        <Button variant="primary" size="sm" className="w-full" onClick={() => onOpen(name)}>
          {t('subjectCards.uploadSlip')}
        </Button>
      ) : null}
    </Card>
  );
}
