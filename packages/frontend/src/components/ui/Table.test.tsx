import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Table, type TableColumn } from './Table';

interface Student {
  epId: string;
  name: string;
}

const rows: Student[] = [
  { epId: 'EP0001', name: 'Nimal' },
  { epId: 'EP0002', name: 'Kamala' },
];

const columns: TableColumn<Student>[] = [
  { key: 'epId', header: 'EP ID', cell: (r) => r.epId, mono: true },
  { key: 'name', header: 'Name', cell: (r) => r.name },
];

describe('Table', () => {
  it('renders semantic column headers with scope="col"', () => {
    render(<Table columns={columns} rows={rows} rowKey={(r) => r.epId} caption="Students" />);
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(2);
    headers.forEach((h) => expect(h).toHaveAttribute('scope', 'col'));
  });

  it('applies English uppercase/tracking but strips both for Sinhala (si: variant)', () => {
    render(<Table columns={columns} rows={rows} rowKey={(r) => r.epId} />);
    const header = screen.getAllByRole('columnheader')[0] as HTMLElement;
    // English treatment per DESIGN.md Tables.
    expect(header.className).toContain('uppercase');
    expect(header.className).toContain('tracking-[0.06em]');
    // Sinhala-scoped reset so Sinhala glyph joining is not degraded
    // (DESIGN.md Sinhala rules / AGENTS.md §10). The `si:` variant is scoped to
    // html[lang='si'] in index.css.
    expect(header.className).toContain('si:normal-case');
    expect(header.className).toContain('si:tracking-normal');
  });

  it('renders a row per datum and applies the mono affordance to EP-ID cells', () => {
    render(<Table columns={columns} rows={rows} rowKey={(r) => r.epId} />);
    expect(screen.getByText('EP0001')).toBeInTheDocument();
    expect(screen.getByText('Nimal')).toBeInTheDocument();
    const epCell = screen.getByText('EP0001');
    expect(epCell.className).toContain('font-mono');
    expect(epCell.className).toContain('text-brand');
  });

  it('wires pagination: disables Prev on the first page, fires onNext', async () => {
    const onNext = vi.fn();
    const onPrev = vi.fn();
    render(
      <Table
        columns={columns}
        rows={rows}
        rowKey={(r) => r.epId}
        pagination={{
          page: 1,
          pageSize: 20,
          total: 134,
          onPrev,
          onNext,
          prevLabel: 'Previous',
          nextLabel: 'Next',
          countLabel: '1–20 of 134',
        }}
      />,
    );
    expect(screen.getByText('1–20 of 134')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('disables Next on the last page', () => {
    render(
      <Table
        columns={columns}
        rows={rows}
        rowKey={(r) => r.epId}
        pagination={{
          page: 7,
          pageSize: 20,
          total: 134,
          onPrev: () => undefined,
          onNext: () => undefined,
          prevLabel: 'Previous',
          nextLabel: 'Next',
          countLabel: '121–134 of 134',
        }}
      />,
    );
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });
});
