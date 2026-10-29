import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Button } from '../../../components/ui';
import { SectionHeader } from './SectionHeader';
import { EmptyState } from './EmptyState';
import type { ResourceItem } from '../mock-data';

/**
 * Learning resources (EXPERIENCE.md student dashboard priorities #4/#5: study
 * materials + recordings). A list of the most recent resources across subjects,
 * each tagged by kind (recording / material) with a relative "added" label and
 * an Open action (demo).
 */
export interface ResourcesSectionProps {
  resources: ResourceItem[];
  onOpen: (title: string) => void;
}

const kindIcon: Record<ResourceItem['kind'], string> = {
  recording: '▶',
  material: '📄',
};

export function ResourcesSection({ resources, onOpen }: ResourcesSectionProps): React.JSX.Element {
  const { t } = useTranslation('dashboard');
  const titleId = 'resources-heading';

  return (
    <section aria-labelledby={titleId}>
      <SectionHeader
        titleId={titleId}
        title={t('resources.title')}
        action={{ label: t('resources.viewAll'), onClick: () => onOpen(t('resources.title')) }}
      />
      {resources.length === 0 ? (
        <EmptyState icon="🎓" title={t('resources.empty.title')} body={t('resources.empty.body')} />
      ) : (
        <Card>
          <ul className="divide-y divide-border">
            {resources.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-subtle text-base text-brand"
                >
                  {kindIcon[item.kind]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold text-text">{t(item.titleKey)}</p>
                  <p className="text-xs text-text-muted">
                    {t(item.subjectKey)} · {t(`resources.kind.${item.kind}`)} ·{' '}
                    {item.addedDaysAgo === 0
                      ? t('resources.addedToday')
                      : t('resources.addedDaysAgo', { count: item.addedDaysAgo })}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onOpen(t(item.titleKey))}>
                  {t('resources.open')}
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </section>
  );
}
