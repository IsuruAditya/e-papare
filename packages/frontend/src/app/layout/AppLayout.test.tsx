import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { initI18n } from '../i18n/i18n';
import { ThemeProvider } from '../theme/ThemeContext';
import { I18nProvider } from '../i18n/I18nProvider';
import { AuthProvider, type Session } from '../auth/AuthContext';
import { AppLayout } from './AppLayout';
import { RolePlaceholder } from '../pages/RolePlaceholder';
import type { Role } from '../auth/AuthContext';

initI18n();

function renderShell(role: Role, session: Session) {
  return render(
    <ThemeProvider initialTheme="light">
      <I18nProvider>
        <AuthProvider initialSession={session}>
          <MemoryRouter initialEntries={['/home']}>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/home" element={<RolePlaceholder role={role} />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>,
  );
}

describe('AppLayout', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('renders the skip link targeting #main-content and the main landmark', () => {
    renderShell('STUDENT', { token: 't', role: 'STUDENT' });
    const skip = screen.getByRole('link', { name: 'Skip to main content' });
    expect(skip).toHaveAttribute('href', '#main-content');
    expect(document.getElementById('main-content')).toBeInTheDocument();
  });

  it('shows only the authenticated role nav in the desktop sidebar (five-role scoping)', () => {
    renderShell('STUDENT', { token: 't', role: 'STUDENT' });
    // The desktop sidebar is one of the navigation landmarks.
    const navs = screen.getAllByRole('navigation', { name: 'Main navigation' });
    const sidebar = navs[0]!;
    expect(within(sidebar).getByText('My Courses')).toBeInTheDocument();
    expect(within(sidebar).queryByText('Teachers')).not.toBeInTheDocument();
    expect(within(sidebar).queryByText('Verification Queue')).not.toBeInTheDocument();
  });

  it('renders the Student bottom nav with exactly 5 items', () => {
    renderShell('STUDENT', { token: 't', role: 'STUDENT' });
    const navs = screen.getAllByRole('navigation', { name: 'Main navigation' });
    // Sidebar + BottomNav both carry the label; the bottom nav has 5 links.
    const bottom = navs.find((n) => within(n).queryAllByRole('link').length === 5);
    expect(bottom).toBeTruthy();
    const links = within(bottom as HTMLElement).getAllByRole('link');
    expect(links).toHaveLength(5);
    expect(within(bottom as HTMLElement).getByText('Home')).toBeInTheDocument();
    expect(within(bottom as HTMLElement).getByText('Account')).toBeInTheDocument();
  });

  it('does NOT render the Student bottom nav for a non-student role', () => {
    renderShell('ADMINISTRATOR', { token: 't', role: 'ADMINISTRATOR' });
    const navs = screen.getAllByRole('navigation', { name: 'Main navigation' });
    const bottom = navs.find((n) => within(n).queryAllByRole('link').length === 5);
    expect(bottom).toBeUndefined();
  });
});
