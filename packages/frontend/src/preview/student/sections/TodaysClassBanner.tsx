import React from 'react';
import { useTranslation } from 'react-i18next';
import type { TodaysClass } from '../mock-data';

/**
 * Today's Class banner (DESIGN.md "Today's Class Banner") — the single most
 * prominent action on the student dashboard. Brand gradient card with the
 * subject, teacher, and start time, plus a high-emphasis Join action. When there
 * is no class today, a neutral `brand-subtle` panel of the same footprint is
 * shown instead (no layout jump).
 *
 * The gradient literals here are the DESIGN.md-sanctioned banner gradients (the
 * one place raw brand hex is allowed for this surface); every other color is a
 * semantic token. Join is a DEMO action — it calls `onJoin` which opens the
 * preview's demo dialog; no real Zoom link is involved.
 */
export interface TodaysClassBannerProps {
  todaysClass: TodaysClass | null;
  onJoin: (subject: string) => void;
}

export function TodaysClassBanner({
  todaysClass,
  onJoin,
}: TodaysClassBannerProps): React.JSX.Element {
  const { t } = useTranslation('dashboard');

  if (todaysClass === null) {
    return (
      <section
        aria-label={t('todaysClass.eyebrow')}
        className="rounded-xl border border-border bg-brand-subtle px-6 py-5"
      >
        <p className="text-xs font-bold tracking-[0.08em] text-text-muted uppercase si:tracking-normal si:normal-case">
          {t('todaysClass.eyebrow')}
        </p>
        <p className="mt-2 text-lg font-bold text-text">{t('todaysClass.none.title')}</p>
        <p className="mt-1 text-sm text-text-muted">{t('todaysClass.none.body')}</p>
      </section>
    );
  }

  const subject = t(todaysClass.subjectKey);
  const teacher = t(todaysClass.teacherKey);
  const joinAria = t('todaysClass.joinAria', {
    subject,
    grade: todaysClass.grade,
    time: todaysClass.startTime,
  });

  return (
    <section
      aria-label={t('todaysClass.eyebrow')}
      className="ep-todays-class rounded-xl px-6 py-5 text-white"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold tracking-[0.08em] text-white/75 uppercase si:tracking-normal si:normal-case">
            {t('todaysClass.eyebrow')}
          </p>
          <p className="mt-1.5 text-xl font-bold">{subject}</p>
          <p className="mt-1 text-sm text-white/85">
            {todaysClass.startTime} · {t('todaysClass.teacherWith', { teacher })}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-1.5 sm:items-end">
          {todaysClass.joinable ? (
            <button
              type="button"
              onClick={() => onJoin(subject)}
              aria-label={joinAria}
              className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-white px-[18px] py-2 text-md font-bold text-brand transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:[outline:3px_solid_#ffffff] focus-visible:[outline-offset:2px]"
            >
              {t('todaysClass.join')}
            </button>
          ) : (
            <span className="rounded-md bg-white/15 px-3 py-2 text-sm font-semibold text-white">
              {t('todaysClass.soonLabel', { time: todaysClass.startTime })}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
