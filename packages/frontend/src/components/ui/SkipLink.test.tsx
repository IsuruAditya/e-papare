import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkipLink } from './SkipLink';

describe('SkipLink', () => {
  it('links to #main-content by default (EXPERIENCE.md landmark id)', () => {
    render(<SkipLink>Skip to main content</SkipLink>);
    const link = screen.getByRole('link', { name: 'Skip to main content' });
    expect(link).toHaveAttribute('href', '#main-content');
  });

  it('respects a custom target id', () => {
    render(<SkipLink targetId="content">Skip</SkipLink>);
    expect(screen.getByRole('link', { name: 'Skip' })).toHaveAttribute('href', '#content');
  });

  it('is visually hidden until focused (sr-only + focus:not-sr-only)', () => {
    render(<SkipLink>Skip</SkipLink>);
    const link = screen.getByRole('link', { name: 'Skip' });
    expect(link.className).toContain('sr-only');
    expect(link.className).toContain('focus:not-sr-only');
  });
});
