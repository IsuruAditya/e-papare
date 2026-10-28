import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n, { initI18n } from '../i18n/i18n';
import { Drawer } from './Drawer';
import type { Role } from '../auth/AuthContext';

initI18n();

function DrawerHarness({ role = 'STUDENT' }: { role?: Role }): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  return (
    <I18nextProvider i18n={i18n}>
      <MemoryRouter>
        <button type="button" onClick={() => setOpen(true)}>
          open
        </button>
        <Drawer open={open} onClose={() => setOpen(false)} role={role} />
      </MemoryRouter>
    </I18nextProvider>
  );
}

describe('Drawer', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('is a labelled modal dialog when open', async () => {
    const user = userEvent.setup();
    render(<DrawerHarness />);
    await user.click(screen.getByRole('button', { name: 'open' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleName('Main navigation');
  });

  it('moves focus into the drawer on open and restores to the opener on ESC', async () => {
    const user = userEvent.setup();
    render(<DrawerHarness />);
    const opener = screen.getByRole('button', { name: 'open' });
    opener.focus();
    await user.click(opener);

    const dialog = screen.getByRole('dialog');
    expect(dialog.contains(document.activeElement)).toBe(true);

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it('closes when the backdrop is clicked', async () => {
    const user = userEvent.setup();
    render(<DrawerHarness />);
    await user.click(screen.getByRole('button', { name: 'open' }));
    const dialog = screen.getByRole('dialog');
    const backdrop = dialog.parentElement as HTMLElement;
    await user.click(backdrop);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders only the given role nav items (five-role scoping)', async () => {
    const user = userEvent.setup();
    render(<DrawerHarness role="STUDENT" />);
    await user.click(screen.getByRole('button', { name: 'open' }));
    const nav = within(screen.getByRole('dialog')).getByRole('navigation');
    expect(within(nav).getByText('My Courses')).toBeInTheDocument();
    expect(within(nav).queryByText('Teachers')).not.toBeInTheDocument();
  });
});
