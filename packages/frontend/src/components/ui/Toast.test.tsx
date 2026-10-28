import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Toast } from './Toast';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('error variant is assertive and does NOT auto-dismiss', () => {
    const onDismiss = vi.fn();
    render(
      <Toast variant="error" onDismiss={onDismiss} closeLabel="Dismiss" title="Failed">
        Something broke
      </Toast>,
    );
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
    vi.advanceTimersByTime(60_000);
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('warns in dev when a dismissible error toast omits closeLabel (no-trap guard)', () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <Toast variant="error" onDismiss={vi.fn()} title="Failed">
        Something broke
      </Toast>,
    );
    expect(err).toHaveBeenCalledWith(expect.stringContaining('closeLabel'));
    err.mockRestore();
  });

  it('success variant is polite and auto-dismisses after the default delay', () => {
    const onDismiss = vi.fn();
    render(
      <Toast variant="success" onDismiss={onDismiss} title="Saved">
        All good
      </Toast>,
    );
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite');
    expect(onDismiss).not.toHaveBeenCalled();
    vi.advanceTimersByTime(5000);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders a labelled close button that dismisses on click', () => {
    const onDismiss = vi.fn();
    render(
      <Toast variant="info" onDismiss={onDismiss} closeLabel="Dismiss notification">
        Heads up
      </Toast>,
    );
    // Use a plain DOM click here: userEvent's internal delays interact poorly
    // with fake timers plus the auto-dismiss timeout. We only need to assert the
    // button is labelled and wired to onDismiss.
    const close = screen.getByRole('button', { name: 'Dismiss notification' });
    close.click();
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('carries the variant accent border class', () => {
    render(
      <Toast variant="warning" title="Careful">
        body
      </Toast>,
    );
    expect(screen.getByRole('alert').className).toContain('border-l-warning');
  });
});
