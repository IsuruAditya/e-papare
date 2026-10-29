import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui';

/**
 * Error state (EXPERIENCE.md "Error State"): icon + human-readable translated
 * message + "Try Again", with the stable error code shown in small monospace
 * for support reference (never surfaced as the primary message). `onRetry` here
 * returns the preview to the loaded state.
 */
export function DashboardError({ onRetry }: { onRetry: () => void }): React.JSX.Element {
  const { t } = useTranslation('dashboard');

  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-lg border border-danger-border bg-danger-bg px-6 py-12 text-center"
    >
      <span aria-hidden="true" className="text-5xl">
        ⚠️
      </span>
      <p className="text-lg font-bold text-danger">{t('errorState.title')}</p>
      <p className="max-w-md text-sm text-danger">{t('errorState.body')}</p>
      <Button variant="primary" className="mt-1" onClick={onRetry}>
        {t('errorState.retry')}
      </Button>
      <p className="font-mono text-xs text-text-muted">{t('errorState.code')}</p>
    </div>
  );
}
