import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
  it('associates the label with the input via htmlFor/id', () => {
    render(<Input label="Email" />);
    const input = screen.getByLabelText('Email');
    expect(input).toBeInTheDocument();
    expect(input.id).toBeTruthy();
  });

  it('marks required fields with aria-required and a danger asterisk', () => {
    render(<Input label="Email" required />);
    const input = screen.getByLabelText(/Email/);
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).toBeRequired();
    // The asterisk is rendered (aria-hidden) next to the label text.
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('wires error state: aria-invalid + aria-describedby -> message element', () => {
    render(<Input label="Email" error="Email is required" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    const describedById = input.getAttribute('aria-describedby');
    expect(describedById).toBeTruthy();
    const message = document.getElementById(describedById!);
    expect(message).toHaveTextContent('Email is required');
    expect(message?.className).toContain('text-danger');
  });

  it('applies the error ring token class in the error state', () => {
    render(<Input label="Email" error="bad" />);
    const input = screen.getByLabelText('Email');
    expect(input.className).toContain('shadow-[var(--ring-error)]');
  });

  it('shows helper text (not an error) and links it via aria-describedby', () => {
    render(<Input label="Email" helperText="We never share it" />);
    const input = screen.getByLabelText('Email');
    expect(input).not.toHaveAttribute('aria-invalid');
    const message = document.getElementById(input.getAttribute('aria-describedby')!);
    expect(message).toHaveTextContent('We never share it');
  });

  it('applies disabled token styling when disabled', () => {
    render(<Input label="Email" disabled />);
    const input = screen.getByLabelText('Email');
    expect(input).toBeDisabled();
    expect(input.className).toContain('disabled:bg-disabled-bg');
  });
});
