import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnnouncementBanner } from './AnnouncementBanner';

describe('AnnouncementBanner', () => {
  it('renders title and body text from props (label-agnostic)', () => {
    render(
      <AnnouncementBanner variant="info" title="Complete activation">
        Finish setup to enroll.
      </AnnouncementBanner>,
    );
    expect(screen.getByText('Complete activation')).toBeInTheDocument();
    expect(screen.getByText('Finish setup to enroll.')).toBeInTheDocument();
  });

  it('maps each variant to its semantic token family', () => {
    const cases = [
      ['success', 'bg-success-bg'],
      ['warning', 'bg-warning-bg'],
      ['danger', 'bg-danger-bg'],
      ['info', 'bg-info-bg'],
      ['neutral', 'bg-brand-subtle'],
    ] as const;
    for (const [variant, cls] of cases) {
      const { container, unmount } = render(
        <AnnouncementBanner variant={variant}>body</AnnouncementBanner>,
      );
      expect((container.firstElementChild as HTMLElement).className).toContain(cls);
      unmount();
    }
  });

  it('renders an icon slot as decorative (aria-hidden)', () => {
    const { container } = render(
      <AnnouncementBanner variant="info" icon={<span>ℹ</span>}>
        body
      </AnnouncementBanner>,
    );
    const icon = container.querySelector('[aria-hidden="true"]');
    expect(icon).not.toBeNull();
  });
});
