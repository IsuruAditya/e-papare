import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Select } from './Select';

describe('Select', () => {
  it('associates its label and renders option children', () => {
    render(
      <Select label="Grade">
        <option value="6">Grade 6</option>
        <option value="7">Grade 7</option>
      </Select>,
    );
    const select = screen.getByLabelText('Grade');
    expect(select.tagName).toBe('SELECT');
    expect(screen.getByRole('option', { name: 'Grade 6' })).toBeInTheDocument();
  });

  it('wires required + error ARIA like Input', () => {
    render(
      <Select label="Grade" required error="Please pick a grade">
        <option value="">—</option>
      </Select>,
    );
    const select = screen.getByLabelText(/Grade/);
    expect(select).toHaveAttribute('aria-required', 'true');
    expect(select).toHaveAttribute('aria-invalid', 'true');
    const msg = document.getElementById(select.getAttribute('aria-describedby')!);
    expect(msg).toHaveTextContent('Please pick a grade');
  });

  it('strips native chrome with appearance-none for the custom arrow', () => {
    render(
      <Select label="Grade">
        <option value="6">Grade 6</option>
      </Select>,
    );
    expect(screen.getByLabelText('Grade').className).toContain('appearance-none');
  });

  it('draws the chevron via the token-tinted (theme-aware) arrow wrapper', () => {
    render(
      <Select label="Grade">
        <option value="6">Grade 6</option>
      </Select>,
    );
    // The chevron color comes from the `.ep-select-arrow::after` mask tinted by
    // `--color-text-muted` (retints in dark mode) — not a hardcoded SVG hex.
    const wrapper = screen.getByLabelText('Grade').parentElement as HTMLElement;
    expect(wrapper.className).toContain('ep-select-arrow');
  });

  it('applies disabled token styling', () => {
    render(
      <Select label="Grade" disabled>
        <option value="6">Grade 6</option>
      </Select>,
    );
    const select = screen.getByLabelText('Grade');
    expect(select).toBeDisabled();
    expect(select.className).toContain('disabled:bg-disabled-bg');
  });
});
