import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('associates its label and uses min-height (not fixed height) for Sinhala growth', () => {
    render(<Textarea label="Notes" />);
    const area = screen.getByLabelText('Notes');
    expect(area.tagName).toBe('TEXTAREA');
    expect(area.className).toContain('min-h-[80px]');
    expect(area.className).toContain('resize-y');
  });

  it('wires required + error ARIA', () => {
    render(<Textarea label="Notes" required error="Required" />);
    const area = screen.getByLabelText(/Notes/);
    expect(area).toHaveAttribute('aria-required', 'true');
    expect(area).toHaveAttribute('aria-invalid', 'true');
    const msg = document.getElementById(area.getAttribute('aria-describedby')!);
    expect(msg).toHaveTextContent('Required');
  });

  it('applies disabled token styling', () => {
    render(<Textarea label="Notes" disabled />);
    const area = screen.getByLabelText('Notes');
    expect(area).toBeDisabled();
    expect(area.className).toContain('disabled:bg-disabled-bg');
  });
});
