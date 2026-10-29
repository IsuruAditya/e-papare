import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Skeleton } from '../../../components/ui';

/**
 * Loading-state skeleton (EXPERIENCE.md "Loading State"). Mirrors the loaded
 * dashboard's layout dimensions so switching to the loaded state causes no
 * layout shift. The topbar/sidebar are not skeletonised (owned by the shell) —
 * only the content area here. `aria-busy` + status role carry the loading
 * semantics; the shimmer blocks are `aria-hidden` (handled by Skeleton).
 */
export function DashboardSkeleton(): React.JSX.Element {
  const { t } = useTranslation('dashboard');
  return (
    <div role="status" aria-busy="true" aria-live="polite" className="flex flex-col gap-6">
      <span className="sr-only">{t('preview.loadingLabel')}</span>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton width={260} height={28} />
            <Skeleton width={200} height={14} />
          </div>
          <div className="flex gap-6">
            <Skeleton width={90} height={40} />
            <Skeleton width={90} height={40} />
          </div>
        </div>
      </Card>

      <Skeleton width="100%" height={104} radius="lg" />

      <div>
        <Skeleton width={140} height={20} className="mb-3" />
        {/* Mirror the loaded subjects grid: 2-col from mobile up (EXPERIENCE.md). */}
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} width="100%" height={168} radius="lg" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton width="100%" height={220} radius="lg" />
        <Skeleton width="100%" height={220} radius="lg" />
      </div>
    </div>
  );
}
