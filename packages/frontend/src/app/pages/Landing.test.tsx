import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { Landing } from './Landing';
import i18n from '../i18n/i18n';
import { renderWithProviders } from '../../test-utils';

/**
 * Covers Story 1.7 AC-1's "readable by the landing page" half: the real Landing
 * (not the ProtectedRoute test's stub) must display the attempted path a
 * redirect preserved in `?returnUrl`. ProtectedRoute.test proves the param is
 * EMITTED; this proves Landing READS and renders it.
 */
describe('Landing', () => {
  beforeEach(async () => {
    localStorage.clear();
    await i18n.changeLanguage('en');
  });

  it('renders the brand title and skip link', () => {
    renderWithProviders(<Landing />, { route: '/' });
    expect(screen.getByRole('heading', { name: 'e-Paperé Online Institute' })).toBeInTheDocument();
    const skip = screen.getByRole('link', { name: 'Skip to main content' });
    expect(skip).toHaveAttribute('href', '#main-content');
  });

  it('shows no return notice when returnUrl is absent', () => {
    renderWithProviders(<Landing />, { route: '/' });
    expect(screen.queryByTestId('return-notice')).not.toBeInTheDocument();
  });

  it('displays the decoded returnUrl path when redirected', () => {
    renderWithProviders(<Landing />, { route: '/?returnUrl=%2Fstudent' });
    const notice = screen.getByTestId('return-notice');
    expect(notice).toBeInTheDocument();
    // The interpolated message carries the decoded attempted path.
    expect(notice).toHaveTextContent('/student');
    expect(notice).toHaveAttribute('data-return-url', '/student');
  });
});
