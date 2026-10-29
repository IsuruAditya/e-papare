import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '../../app/i18n/I18nProvider';
import { ThemeProvider } from '../../app/theme/ThemeContext';
import i18n, { initI18n } from '../../app/i18n/i18n';
import { StudentDashboardPreview } from './StudentDashboardPreview';
import { SubjectsSection } from './sections/SubjectsSection';
import type { SubjectCard } from './mock-data';

initI18n();

/** All-active subjects — used to force a zero-result "Locked" filter state. */
const allActiveSubjects: SubjectCard[] = [
  {
    id: 'math',
    subjectKey: 'subjects.mathematics',
    teacherKey: 'teachers.perera',
    icon: '∑',
    accessStatus: 'ACCESS_ACTIVE',
    nextSessionKey: 'subjectCards.next.monAfternoon',
  },
  {
    id: 'science',
    subjectKey: 'subjects.science',
    teacherKey: 'teachers.fernando',
    icon: '⚛',
    accessStatus: 'ACCESS_ACTIVE',
    nextSessionKey: 'subjectCards.next.wedAfternoon',
  },
];

function renderPreview() {
  return render(
    <ThemeProvider initialTheme="light">
      <I18nProvider>
        <MemoryRouter>
          <StudentDashboardPreview />
        </MemoryRouter>
      </I18nProvider>
    </ThemeProvider>,
  );
}

describe('StudentDashboardPreview', () => {
  beforeEach(async () => {
    localStorage.clear();
    await i18n.changeLanguage('en');
  });
  afterEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('renders the demo-data banner so the preview is never mistaken for real data', () => {
    renderPreview();
    expect(screen.getByText('UI/UX preview — demo data only')).toBeInTheDocument();
  });

  it('renders the student overview with the fictional EP ID and all priority sections', () => {
    renderPreview();
    // EP Student ID prominent (EXPERIENCE.md Flow 1 AC).
    expect(screen.getByText('EP-000147')).toBeInTheDocument();
    // Section headings in UX priority order.
    expect(screen.getByRole('heading', { name: 'My subjects' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Upcoming schedule' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Learning resources' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Payments & access' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Announcements' })).toBeInTheDocument();
  });

  it('opens the demo "Join class" dialog from the Today\'s Class banner and closes it', async () => {
    const user = userEvent.setup();
    renderPreview();

    await user.click(screen.getByRole('button', { name: /join today's class/i }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Join class (demo)')).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Got it' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('toggles to the loading state (skeleton with a status region)', async () => {
    const user = userEvent.setup();
    renderPreview();
    await user.click(screen.getByRole('button', { name: 'Loading' }));
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
  });

  it('toggles to the empty state (every section shows its empty copy)', async () => {
    const user = userEvent.setup();
    renderPreview();
    await user.click(screen.getByRole('button', { name: 'Empty' }));
    expect(screen.getByText('No subjects yet')).toBeInTheDocument();
    expect(screen.getByText('No invoices yet')).toBeInTheDocument();
  });

  it('toggles to the error state and recovers via Try Again', async () => {
    const user = userEvent.setup();
    renderPreview();
    await user.click(screen.getByRole('button', { name: 'Error' }));
    const alert = screen.getByRole('alert');
    expect(within(alert).getByText('Something went wrong')).toBeInTheDocument();
    await user.click(within(alert).getByRole('button', { name: 'Try again' }));
    // Back to loaded: the subjects section heading is present again.
    expect(screen.getByRole('heading', { name: 'My subjects' })).toBeInTheDocument();
  });

  it('filters the subjects grid by access state', async () => {
    const user = userEvent.setup();
    renderPreview();
    const group = screen.getByRole('group', { name: 'Filter subjects by access' });
    const lockedBtn = within(group).getByRole('button', { name: 'Locked' });
    await user.click(lockedBtn);
    expect(lockedBtn).toHaveAttribute('aria-pressed', 'true');
    // Locked filter excludes the active Mathematics subject card.
    const subjects = screen.getByRole('heading', { name: 'My subjects' }).closest('section');
    expect(within(subjects as HTMLElement).queryByText('Mathematics')).not.toBeInTheDocument();
    // ICT (OVERDUE) remains visible.
    expect(within(subjects as HTMLElement).getByText('ICT')).toBeInTheDocument();
  });

  it('shows a waiting message (not an upload-slip CTA) for an Under Review subject', () => {
    // EXPERIENCE.md Access-States: Under Review is "content locked + waiting
    // message" — Upload Slip is reserved for Overdue / Payment Pending. Sinhala
    // (UNDER_REVIEW in the mock) must therefore NOT offer an upload-slip button.
    renderPreview();
    const subjects = screen.getByRole('heading', { name: 'My subjects' }).closest('section');
    const scope = within(subjects as HTMLElement);
    const sinhalaCard = scope.getByText('Sinhala').closest('li');
    expect(
      within(sinhalaCard as HTMLElement).getByText('Awaiting payment verification'),
    ).toBeInTheDocument();
    expect(
      within(sinhalaCard as HTMLElement).queryByRole('button', { name: 'Upload slip' }),
    ).not.toBeInTheDocument();
    // The Overdue subject (ICT) DOES offer the upload-slip CTA.
    const ictCard = scope.getByText('ICT').closest('li');
    expect(
      within(ictCard as HTMLElement).getByRole('button', { name: 'Upload slip' }),
    ).toBeInTheDocument();
  });

  it('shows a filter-specific empty message (not the onboarding copy) when a filter hides every subject', async () => {
    // Drive SubjectsSection with subjects that are ALL active, then apply the
    // "Locked" filter so the visible set is empty while subjects still exist.
    // The onboarding "No subjects yet / Browse courses" copy would be misleading
    // here; the filter-specific message must show instead.
    const user = userEvent.setup();
    render(
      <ThemeProvider initialTheme="light">
        <I18nProvider>
          <MemoryRouter>
            <SubjectsSection subjects={allActiveSubjects} onOpen={() => undefined} />
          </MemoryRouter>
        </I18nProvider>
      </ThemeProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Locked' }));
    expect(screen.getByText('No subjects match this filter')).toBeInTheDocument();
    expect(screen.queryByText('No subjects yet')).not.toBeInTheDocument();
  });

  it('renders Sinhala strings with no raw keys when the language switches', async () => {
    renderPreview();
    await i18n.changeLanguage('si');
    // Sinhala section heading for subjects.
    expect(screen.getByRole('heading', { name: 'මගේ විෂයයන්' })).toBeInTheDocument();
    // No untranslated raw dashboard keys leak into the DOM.
    expect(document.body.textContent).not.toMatch(/subjectCards\./);
  });
});
