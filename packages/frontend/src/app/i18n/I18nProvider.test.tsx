import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTranslation } from 'react-i18next';
import { I18nProvider, useLanguage } from './I18nProvider';
import i18n from './i18n';
import { LANGUAGE_STORAGE_KEY } from './language-storage';

/** A shell fragment with a label (translated) + an uncontrolled form input. */
function Harness(): React.JSX.Element {
  const { t } = useTranslation('common');
  const { language } = useLanguage();
  return (
    <form>
      <span data-testid="lang">{language}</span>
      <label htmlFor="name">{t('nav.profile')}</label>
      <input id="name" defaultValue="" aria-label="name-field" />
    </form>
  );
}

describe('I18nProvider', () => {
  beforeEach(async () => {
    localStorage.clear();
    document.documentElement.removeAttribute('lang');
    await i18n.changeLanguage('en');
  });

  it('sets html lang on mount from the resolved language', () => {
    render(
      <I18nProvider>
        <Harness />
      </I18nProvider>,
    );
    expect(document.documentElement.getAttribute('lang')).toBe('en');
  });

  it('AC-2: changeLanguage("si") re-renders labels, keeps form values, sets html lang=si', async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider>
        <Harness />
      </I18nProvider>,
    );

    // English label present initially.
    expect(screen.getByText('Profile')).toBeInTheDocument();

    // Type into the form.
    const input = screen.getByLabelText('name-field');
    await user.type(input, 'Kavya');
    expect(input).toHaveValue('Kavya');

    // Switch language directly via i18next (the AC trigger).
    await act(async () => {
      await i18n.changeLanguage('si');
    });

    // Label is now Sinhala, the typed value survived, and html lang flipped.
    expect(screen.getByText('පැතිකඩ')).toBeInTheDocument();
    expect(input).toHaveValue('Kavya');
    expect(document.documentElement.getAttribute('lang')).toBe('si');
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('si');
    expect(screen.getByTestId('lang')).toHaveTextContent('si');
  });
});
