import React from 'react';
import { Button } from '../../../components/ui';

/**
 * Shared empty-state block (EXPERIENCE.md "Empty State"): centered emoji icon,
 * heading, descriptive body, and an optional primary CTA. Used by every section
 * so the zero-item experience is consistent and fully translated.
 */
export interface EmptyStateProps {
  /** Decorative emoji glyph (48px per EXPERIENCE.md). */
  icon: string;
  title: string;
  body: string;
  cta?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, body, cta }: EmptyStateProps): React.JSX.Element {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border-strong bg-surface px-6 py-10 text-center">
      <span aria-hidden="true" className="text-5xl">
        {icon}
      </span>
      <p className="text-base font-bold text-text">{title}</p>
      <p className="max-w-md text-sm text-text-muted">{body}</p>
      {cta && (
        <Button variant="primary" size="sm" className="mt-2" onClick={cta.onClick}>
          {cta.label}
        </Button>
      )}
    </div>
  );
}
