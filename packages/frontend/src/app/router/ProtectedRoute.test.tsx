import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Outlet, useSearchParams } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n, { initI18n } from '../i18n/i18n';
import { AuthProvider, type Session } from '../auth/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';

initI18n();

/** Minimal landing that surfaces the returnUrl so the test can assert it. */
function TestLanding(): React.JSX.Element {
  const [params] = useSearchParams();
  return <div data-testid="landing" data-return-url={params.get('returnUrl') ?? ''} />;
}

function StudentHome(): React.JSX.Element {
  return <div data-testid="student-home">student</div>;
}

function renderAt(route: string, session: Session | null) {
  return render(
    <I18nextProvider i18n={i18n}>
      <AuthProvider initialSession={session}>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path="/" element={<TestLanding />} />
            <Route path="/student" element={<ProtectedRoute role="STUDENT" />}>
              <Route element={<Outlet />}>
                <Route index element={<StudentHome />} />
              </Route>
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </I18nextProvider>,
  );
}

describe('ProtectedRoute', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('AC-1: redirects an unauthenticated user to / preserving returnUrl', () => {
    renderAt('/student', null);
    const landing = screen.getByTestId('landing');
    expect(landing).toBeInTheDocument();
    // returnUrl is the encoded attempted path.
    expect(landing.getAttribute('data-return-url')).toBe('/student');
    expect(screen.queryByTestId('student-home')).not.toBeInTheDocument();
  });

  it('renders the protected route for the correct role', () => {
    renderAt('/student', { token: 'tkn', role: 'STUDENT' });
    expect(screen.getByTestId('student-home')).toBeInTheDocument();
  });

  it('shows Access restricted for an authenticated wrong-role user (no target surface)', () => {
    renderAt('/student', { token: 'tkn', role: 'TEACHER' });
    expect(screen.getByRole('heading', { name: 'Access restricted' })).toBeInTheDocument();
    expect(screen.queryByTestId('student-home')).not.toBeInTheDocument();
  });
});
