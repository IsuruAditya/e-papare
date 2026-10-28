import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renders header and body slots', () => {
    render(<Card header={<span>Course</span>}>Details</Card>);
    expect(screen.getByText('Course')).toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();
  });

  it('carries surface + border elevation (no shadow by default)', () => {
    const { container } = render(<Card>body</Card>);
    const card = container.firstElementChild as HTMLElement;
    expect(card.className).toContain('bg-surface');
    expect(card.className).toContain('border-border');
    expect(card.className).not.toContain('shadow-card-hover');
  });

  it('adds the hover affordance only when interactive', () => {
    const { container } = render(<Card interactive>body</Card>);
    const card = container.firstElementChild as HTMLElement;
    expect(card.className).toContain('hover:border-border-strong');
    expect(card.className).toContain('hover:shadow-card-hover');
  });

  it('grows with long Sinhala content without a fixed height (no height utility)', () => {
    const sinhala =
      'ප්‍රවේශය සක්‍රිය — ඔබගේ ගෙවීම අනුමත කර ඇති අතර පාඩම් වෙත ප්‍රවේශය සක්‍රිය කර ඇත.';
    const { container } = render(<Card>{sinhala}</Card>);
    const card = container.firstElementChild as HTMLElement;
    expect(card).toHaveTextContent(sinhala);
    // No fixed-height utility (h-NN / h-[NNpx]) — the card flows to fit content.
    expect(card.className).not.toMatch(/\bh-\[/);
  });
});
