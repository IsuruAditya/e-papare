import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('is aria-hidden and carries the shimmer utility', () => {
    const { container } = render(<Skeleton />);
    const el = container.firstElementChild as HTMLElement;
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(el.className).toContain('ep-skeleton');
  });

  it('honors passed dimensions so it matches content (no layout shift)', () => {
    const { container } = render(<Skeleton width={120} height="2rem" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.width).toBe('120px');
    expect(el.style.height).toBe('2rem');
  });

  it('applies the requested radius utility', () => {
    const { container } = render(<Skeleton radius="full" />);
    expect((container.firstElementChild as HTMLElement).className).toContain('rounded-full');
  });
});
