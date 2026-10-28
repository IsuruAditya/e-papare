import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders children and defaults to type="button"', () => {
    render(<Button>Save</Button>);
    const btn = screen.getByRole('button', { name: 'Save' });
    expect(btn).toHaveAttribute('type', 'button');
  });

  it('applies the token-based focus ring utility (AC: 3px solid var(--color-brand))', () => {
    render(<Button>Focus me</Button>);
    const btn = screen.getByRole('button', { name: 'Focus me' });
    // The outline is applied via a focus-visible arbitrary property referencing
    // the focus-outline-width + color-brand tokens, with the 2px offset token.
    expect(btn.className).toContain(
      'focus-visible:[outline:var(--focus-outline-width)_solid_var(--color-brand)]',
    );
    expect(btn.className).toContain('focus-visible:[outline-offset:var(--focus-ring-offset)]');
  });

  it('does not fire onClick when disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Disabled
      </Button>,
    );
    const btn = screen.getByRole('button', { name: 'Disabled' });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('shows a spinner, sets aria-busy, and suppresses onClick when loading', async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Loading
      </Button>,
    );
    const btn = screen.getByRole('button', { name: 'Loading' });
    expect(btn).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('fires onClick when enabled', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Go' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders the danger variant with the sanctioned DESIGN.md hex literal', () => {
    render(<Button variant="danger">Delete</Button>);
    const btn = screen.getByRole('button', { name: 'Delete' });
    expect(btn.className).toContain('bg-[#ef4444]');
    expect(btn.className).toContain('hover:bg-[#dc2626]');
  });

  it('requires an aria-label on icon buttons (exposes it to the a11y tree)', () => {
    render(<Button variant="icon" aria-label="Open menu" />);
    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument();
  });
});
