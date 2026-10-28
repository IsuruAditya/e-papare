import React from 'react';
import { cx } from './cx';
import { Button } from './Button';

/**
 * Table — semantic data table (DESIGN.md "Tables" + AD-47 pagination affordance).
 *
 * Presentational only: no data fetching, no sorting logic. The pagination row
 * is driven by `page`/`pageSize`/`total` props and emits `onPrev`/`onNext`
 * callbacks. All visible text (column headers, Prev/Next labels, count label)
 * is supplied by the caller (label-agnostic).
 */

export interface TableColumn<Row> {
  /** Stable key for the column. */
  key: string;
  /** Already-translated column header text. */
  header: React.ReactNode;
  /** Cell renderer for this column. */
  cell: (row: Row) => React.ReactNode;
  /** Render this column's cells with the EP-ID monospace affordance. */
  mono?: boolean;
}

export interface TablePagination {
  page: number;
  pageSize: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  /** Already-translated labels — label-agnostic (Story 1.7 supplies translations). */
  prevLabel: string;
  nextLabel: string;
  /** Already-translated, pre-formatted count label, e.g. "1–20 of 134". */
  countLabel: React.ReactNode;
}

export interface TableProps<Row> {
  columns: TableColumn<Row>[];
  rows: Row[];
  /** Extracts a stable React key for each row. */
  rowKey: (row: Row, index: number) => React.Key;
  /** Optional toolbar slot rendered above the table (title, search, filters). */
  toolbar?: React.ReactNode;
  pagination?: TablePagination;
  /** Accessible table caption / summary (visually hidden). */
  caption?: string;
  className?: string;
}

export function Table<Row>({
  columns,
  rows,
  rowKey,
  toolbar,
  pagination,
  caption,
  className,
}: TableProps<Row>): React.JSX.Element {
  return (
    <div className={cx('overflow-hidden rounded-lg border border-border bg-surface', className)}>
      {toolbar != null && (
        <div className="flex flex-wrap items-center gap-3 px-[18px] py-3">{toolbar}</div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="bg-surface-elevated">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  // Uppercase + 0.06em tracking apply to ENGLISH headers only
                  // (DESIGN.md Tables). The `si:` variant (scoped to html[lang='si'])
                  // strips both, because uppercase/letter-spacing degrade Sinhala
                  // glyph joining (DESIGN.md Sinhala rules / AGENTS.md AD-6 §10).
                  className="px-4 py-[9px] text-xs font-semibold tracking-[0.06em] text-text-muted uppercase si:tracking-normal si:normal-case"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={rowKey(row, index)}
                className="border-b border-surface-elevated hover:bg-surface-elevated"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cx(
                      'px-4 py-[10px] align-middle text-base text-text',
                      col.mono && 'font-mono text-xs text-brand',
                    )}
                  >
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between gap-3 border-t border-border px-[18px] py-[10px]">
          <span className="text-xs text-text-muted">{pagination.countLabel}</span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={pagination.onPrev}
              disabled={pagination.page <= 1}
            >
              {pagination.prevLabel}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={pagination.onNext}
              disabled={pagination.page * pagination.pageSize >= pagination.total}
            >
              {pagination.nextLabel}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
