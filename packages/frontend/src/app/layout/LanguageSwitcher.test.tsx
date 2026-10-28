import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageSwitcher } from './LanguageSwitcher';
import { I18nProvider } from '../i18n/I18nProvider';
import i18n from '../i18n/i18n';
import { renderWithI18n } from '../../test-utils';

describe('LanguageSwitcher', () => {
  beforeEach(async () => {
    localStorage.clear();
    document.documentElement.removeAttribute('lang');
    await i18n.changeLanguage('en');
  });

  it('has an aria-label announcing the switch target', () => {
    renderWithI18n(
      <I18nProvider>
        <LanguageSwitcher />
      </I18nProvider>,
    );
    // In English, the switch target is Sinhala.
    expect(screen.getByRole('button', { name: 'සිංහලට මාරු වන්න' })).toBeInTheDocument();
  });

  it('is keyboard operable and toggles the app language + html lang', async () => {
    const user = userEvent.setup();
    renderWithI18n(
      <I18nProvider>
        <LanguageSwitcher />
      </I18nProvider>,
    );
    const button = screen.getByRole('button');
    button.focus();
    expect(button).toHaveFocus();

    await user.keyboard('{Enter}');

    expect(document.documentElement.getAttribute('lang')).toBe('si');
    // After switching to Sinhala the label now offers switching back to English.
    expect(screen.getByRole('button', { name: 'Switch to English' })).toBeInTheDocument();
  });
});
