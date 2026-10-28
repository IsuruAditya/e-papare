import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '../i18n/I18nProvider';
import i18n, { initI18n } from '../i18n/i18n';
import { ThemeProvider } from '../theme/ThemeContext';
import { Topbar } from './Topbar';

initI18n();

function renderTopbar() {
  return render(
    <ThemeProvider initialTheme="light">
      <I18nProvider>
        <MemoryRouter>
          <Topbar showMenuButton onOpenMenu={() => undefined} />
        </MemoryRouter>
      </I18nProvider>
    </ThemeProvider>,
  );
}

describe('Topbar', () => {
  beforeEach(async () => {
    localStorage.clear();
    await i18n.changeLanguage('en');
  });

  it('carries the desktop-hidden class on the hamburger (sidebar owns desktop nav)', () => {
    renderTopbar();
    const hamburger = screen.getByRole('button', { name: 'Open navigation menu' });
    // The hamburger is a tablet/mobile affordance; it must not show at ≥1024px
    // where the persistent sidebar is used (EXPERIENCE.md).
    expect(hamburger.className).toContain('lg:hidden');
  });

  it('renders the notification bell and account avatar as disabled placeholders', () => {
    renderTopbar();
    expect(screen.getByRole('button', { name: 'Notifications' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Account menu' })).toBeDisabled();
  });
});
