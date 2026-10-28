import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { I18nProvider } from '../i18n/I18nProvider';
import { ThemeProvider } from '../theme/ThemeContext';
import { AuthProvider, type Session } from '../auth/AuthContext';
import i18n, { initI18n } from '../i18n/i18n';
import { routes } from './routes';

initI18n();

function renderAt(route: string, session: Session | null) {
  const router = createMemoryRouter(routes, { initialEntries: [route] });
  return render(
    <ThemeProvider initialTheme="light">
      <I18nProvider>
        <AuthProvider initialSession={session}>
          <RouterProvider router={router} />
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>,
  );
}

describe('routes', () => {
  beforeEach(async () => {
    localStorage.clear();
    await i18n.changeLanguage('en');
  });

  it('renders the role placeholder at the role root', () => {
    renderAt('/student', { token: 't', role: 'STUDENT' });
    expect(screen.getByRole('heading', { name: 'Student dashboard' })).toBeInTheDocument();
  });

  it('resolves an in-role sub-path to the placeholder INSIDE the shell (not a bare 404)', () => {
    // nav-config advertises deeper links (e.g. /student/courses) whose real
    // feature routes arrive with later epics. Until then they must land on the
    // shell placeholder, not the top-level NotFound.
    renderAt('/student/courses', { token: 't', role: 'STUDENT' });
    expect(screen.getByRole('heading', { name: 'Student dashboard' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Page not found' })).not.toBeInTheDocument();
    // The shell chrome (skip link) confirms we are inside AppLayout.
    expect(screen.getByRole('link', { name: 'Skip to main content' })).toBeInTheDocument();
  });

  it('renders NotFound for an unknown top-level path', () => {
    renderAt('/does-not-exist', null);
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  });
});
