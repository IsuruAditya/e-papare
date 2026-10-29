import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, StatusPill } from '../../../components/ui';
import type { StudentProfile } from '../mock-data';
import { greetingKeyForHour } from '../use-greeting';

/**
 * Welcome + account overview (EXPERIENCE.md: "Greeting, EP ID label, course
 * status, access status"). Personalised greeting, prominent EP Student ID, grade
 * + enrollment month, and the two account/access status pills.
 *
 * The greeting time-of-day is derived from the local clock via the pure
 * `greetingKeyForHour` helper (unit-tested across all hour boundaries). The
 * greeting therefore varies by wall-clock hour, which is fine for a greeting —
 * tests assert the section/EP ID, not the specific time-of-day phrase.
 */
export function WelcomeOverview({ profile }: { profile: StudentProfile }): React.JSX.Element {
  const { t } = useTranslation('dashboard');
  const name = t(profile.nameKey);
  const greeting = t(greetingKeyForHour(new Date().getHours()), { name });

  return (
    <Card className="bg-brand-subtle">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 tabIndex={-1} className="text-2xl font-extrabold text-text outline-none">
            {greeting}
          </h1>
          <p className="mt-1 text-md text-text-muted">{t('welcome.subtitle')}</p>
        </div>
        <dl className="grid shrink-0 grid-cols-2 gap-x-6 gap-y-3 sm:text-right">
          <Field label={t('welcome.epIdLabel')}>
            <span className="font-mono text-base font-semibold text-brand">{profile.epId}</span>
          </Field>
          <Field label={t('welcome.gradeLabel')}>
            <span className="text-base font-semibold text-text">
              {t('welcome.gradeValue', { grade: profile.grade })}
            </span>
          </Field>
          <Field label={t('welcome.accountLabel')}>
            <StatusPill status={profile.accountStatus} />
          </Field>
          <Field label={t('welcome.accessLabel')}>
            <StatusPill status={profile.accessStatus} />
          </Field>
        </dl>
      </div>
    </Card>
  );
}

/** A labelled value cell inside the overview definition list. */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="flex flex-col gap-1 sm:items-end">
      <dt className="text-xs font-medium tracking-wide text-text-muted uppercase si:tracking-normal si:normal-case">
        {label}
      </dt>
      <dd className="flex items-center">{children}</dd>
    </div>
  );
}
