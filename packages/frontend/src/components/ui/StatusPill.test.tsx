import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { StatusPill } from './StatusPill';
import { statusLabels, statusToken, type StatusKey } from './status-labels';
import { renderWithI18n, setTestLanguage } from '../../test-utils';

const ALL_STATUSES = Object.keys(statusLabels) as StatusKey[];

describe('StatusPill', () => {
  beforeEach(async () => {
    // Reset to the default language so app-language tests are deterministic.
    await setTestLanguage('en');
  });

  it('renders the Sinhala "Approved" label for status=APPROVED lang="si" (compat API)', () => {
    renderWithI18n(<StatusPill status="APPROVED" lang="si" />);
    expect(screen.getByText(statusLabels.APPROVED.si)).toBeInTheDocument();
  });

  it('follows the app language when no lang prop is given', async () => {
    await setTestLanguage('si');
    renderWithI18n(<StatusPill status="APPROVED" />);
    expect(screen.getByText(statusLabels.APPROVED.si)).toBeInTheDocument();
  });

  it('maps APPROVED to the success token pair (bg success-bg / text success)', () => {
    const { container } = renderWithI18n(<StatusPill status="APPROVED" lang="si" />);
    const pill = container.firstElementChild as HTMLElement;
    expect(pill.className).toContain('bg-success-bg');
    expect(pill.className).toContain('text-success');
    expect(pill.className).toContain('border-success-border');
  });

  it('uses a fully-rounded pill radius (DESIGN.md 9999px)', () => {
    const { container } = renderWithI18n(<StatusPill status="APPROVED" />);
    const pill = container.firstElementChild as HTMLElement;
    expect(pill.className).toContain('rounded-full');
    expect(pill.className).not.toContain('rounded-sm');
  });

  it('defaults to English when no lang prop is given and app language is en', () => {
    renderWithI18n(<StatusPill status="APPROVED" />);
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  it('renders every one of the 14 states in both en and si with the correct token', () => {
    for (const status of ALL_STATUSES) {
      for (const lang of ['en', 'si'] as const) {
        const { container, unmount } = renderWithI18n(<StatusPill status={status} lang={lang} />);
        const pill = container.firstElementChild as HTMLElement;
        expect(pill, `${status}/${lang} rendered`).toBeTruthy();
        expect(pill).toHaveTextContent(statusLabels[status][lang]);
        const token = statusToken[status];
        expect(pill.className, `${status}/${lang} bg`).toContain(`bg-${token}-bg`);
        expect(pill.className, `${status}/${lang} text`).toContain(`text-${token}`);
        unmount();
      }
    }
  });

  it('covers all 14 EXPERIENCE.md status states', () => {
    expect(ALL_STATUSES).toHaveLength(14);
  });

  it('renders nothing and warns in dev for an unknown status', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    // @ts-expect-error — deliberately passing an invalid status.
    const { container } = renderWithI18n(<StatusPill status="NOPE" />);
    expect(container.firstChild).toBeNull();
    warn.mockRestore();
  });
});
