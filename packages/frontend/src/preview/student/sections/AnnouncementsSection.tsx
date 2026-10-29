import React from 'react';
import { useTranslation } from 'react-i18next';
import { AnnouncementBanner, type BannerVariant } from '../../../components/ui';
import { SectionHeader } from './SectionHeader';
import { EmptyState } from './EmptyState';
import type { Announcement } from '../mock-data';

/**
 * Announcements (EXPERIENCE.md student dashboard priority #7). Recent institute
 * notices and class updates rendered as inline state banners (DESIGN.md
 * "Announcement / State Banners"), each with a relative-time label.
 */
export interface AnnouncementsSectionProps {
  announcements: Announcement[];
  onViewAll: () => void;
}

const toneIcon: Record<Announcement['tone'], string> = {
  info: 'ℹ️',
  warning: '⚠️',
  success: '✅',
  neutral: '📣',
};

export function AnnouncementsSection({
  announcements,
  onViewAll,
}: AnnouncementsSectionProps): React.JSX.Element {
  const { t } = useTranslation('dashboard');
  const titleId = 'announcements-heading';

  return (
    <section aria-labelledby={titleId}>
      <SectionHeader
        titleId={titleId}
        title={t('announcements.title')}
        action={{ label: t('announcements.viewAll'), onClick: onViewAll }}
      />
      {announcements.length === 0 ? (
        <EmptyState
          icon="📣"
          title={t('announcements.empty.title')}
          body={t('announcements.empty.body')}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {announcements.map((item) => (
            <li key={item.id}>
              <AnnouncementBanner
                variant={item.tone as BannerVariant}
                icon={toneIcon[item.tone]}
                title={t(item.titleKey)}
              >
                <p>{t(item.bodyKey)}</p>
                <p className="mt-1 text-xs font-medium opacity-80">{t(item.whenKey)}</p>
              </AnnouncementBanner>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
