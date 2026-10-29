import React from 'react';
import { Button } from '../../../components/ui';

/**
 * Shared section header for dashboard sections — a title plus an optional
 * low-emphasis "view all" ghost action. Keeps the heading hierarchy (h2) and
 * spacing identical across every section (DRY; DESIGN.md typography scale).
 *
 * `action.onClick` is preview-only (demo), so sections pass a no-op or a toast
 * trigger; this component stays presentational.
 */
export interface SectionHeaderProps {
  title: string;
  action?: { label: string; onClick: () => void };
  /** Optional id so the section's region can be `aria-labelledby` this heading. */
  titleId?: string;
}

export function SectionHeader({ title, action, titleId }: SectionHeaderProps): React.JSX.Element {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 id={titleId} className="text-lg font-bold text-text">
        {title}
      </h2>
      {action && (
        <Button variant="ghost" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
