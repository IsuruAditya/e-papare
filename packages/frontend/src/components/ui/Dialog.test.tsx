import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Dialog } from './Dialog';

describe('Dialog', () => {
  it('renders nothing when closed', () => {
    render(
      <Dialog open={false} onClose={() => undefined} title="Hidden">
        body
      </Dialog>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('exposes role=dialog, aria-modal, and is labelled by the title', () => {
    render(
      <Dialog open onClose={() => undefined} title="Confirm delete">
        Are you sure?
      </Dialog>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleName('Confirm delete');
  });

  it('moves focus into the dialog when it opens', () => {
    render(
      <Dialog open onClose={() => undefined} title="T" footer={<button>OK</button>}>
        body
      </Dialog>,
    );
    // First focusable element (the footer button) receives focus.
    expect(screen.getByRole('button', { name: 'OK' })).toHaveFocus();
  });

  it('closes on ESC and restores focus to the opener', async () => {
    function Harness(): React.JSX.Element {
      const [open, setOpen] = React.useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)}>Open</button>
          <Dialog open={open} onClose={() => setOpen(false)} title="T">
            <button>Inside</button>
          </Dialog>
        </>
      );
    }
    render(<Harness />);
    const opener = screen.getByRole('button', { name: 'Open' });
    await userEvent.click(opener);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    // Focus returns to the element that opened the dialog.
    expect(opener).toHaveFocus();
  });

  // The focus trap is exercised with explicit keydown dispatch on the panel:
  // userEvent.tab() runs its own focus simulation that races the dialog's
  // onKeyDown handler in jsdom, so fireEvent.keyDown deterministically asserts
  // the wrap logic (the behavior a keyboard user actually experiences).
  function TrapHarness(): React.JSX.Element {
    return (
      <Dialog
        open
        onClose={() => undefined}
        title="T"
        footer={
          <>
            <button>First</button>
            <button>Last</button>
          </>
        }
      >
        body
      </Dialog>
    );
  }

  it('traps Tab at the last focusable, wrapping to the first', () => {
    render(<TrapHarness />);
    const dialog = screen.getByRole('dialog');
    const first = screen.getByRole('button', { name: 'First' });
    const last = screen.getByRole('button', { name: 'Last' });
    // Initial focus lands on the first focusable.
    expect(first).toHaveFocus();
    last.focus();
    // Tab from the last element wraps back to the first (trap holds).
    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(first).toHaveFocus();
  });

  it('traps Shift+Tab at the first focusable, wrapping to the last', () => {
    render(<TrapHarness />);
    const dialog = screen.getByRole('dialog');
    const first = screen.getByRole('button', { name: 'First' });
    const last = screen.getByRole('button', { name: 'Last' });
    expect(first).toHaveFocus();
    // Shift+Tab from the first element wraps to the last.
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });
    expect(last).toHaveFocus();
  });

  it('closes when the overlay backdrop is clicked (non-destructive default)', async () => {
    const onClose = vi.fn();
    render(
      <Dialog open onClose={onClose} title="T">
        body
      </Dialog>,
    );
    const dialog = screen.getByRole('dialog');
    const overlay = dialog.parentElement as HTMLElement;
    await userEvent.click(overlay);
    expect(onClose).toHaveBeenCalled();
  });
});
