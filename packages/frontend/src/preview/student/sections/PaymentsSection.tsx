import React from 'react';
import { useTranslation } from 'react-i18next';
import { Table, StatusPill, AnnouncementBanner, type TableColumn } from '../../../components/ui';
import { SectionHeader } from './SectionHeader';
import { EmptyState } from './EmptyState';
import type { PaymentSummary } from '../mock-data';

/**
 * Payments & course access (EXPERIENCE.md student dashboard priority #6 +
 * "Payment States"). Shows the monthly invoice list with the student-facing
 * payment pill, plus a contextual note banner summarising the most actionable
 * state (overdue > pending > approved). Entitlement/access meaning is conveyed
 * through the pill + note, never a raw backend code.
 */
export interface PaymentsSectionProps {
  payments: PaymentSummary[];
  onViewAll: () => void;
}

/** Pick the banner note reflecting the most actionable state present. */
function noteKey(payments: PaymentSummary[]): 'overdue' | 'pending' | 'approved' | null {
  if (payments.some((p) => p.status === 'OVERDUE')) return 'overdue';
  if (payments.some((p) => p.status === 'SUBMITTED' || p.status === 'UNDER_REVIEW')) {
    return 'pending';
  }
  if (payments.some((p) => p.status === 'APPROVED')) return 'approved';
  return null;
}

const noteVariant: Record<'overdue' | 'pending' | 'approved', 'danger' | 'warning' | 'success'> = {
  overdue: 'danger',
  pending: 'warning',
  approved: 'success',
};

export function PaymentsSection({ payments, onViewAll }: PaymentsSectionProps): React.JSX.Element {
  const { t } = useTranslation('dashboard');
  const titleId = 'payments-heading';
  const note = noteKey(payments);

  const columns: TableColumn<PaymentSummary>[] = [
    { key: 'invoice', header: t('payments.columns.invoice'), cell: (r) => r.invoiceNo, mono: true },
    { key: 'month', header: t('payments.columns.month'), cell: (r) => r.billingMonth },
    {
      key: 'amount',
      header: t('payments.columns.amount'),
      cell: (r) => <span className="font-semibold text-text">{r.amount}</span>,
    },
    {
      key: 'due',
      header: t('payments.columns.due'),
      cell: (r) => <span className="text-text-muted">{r.dueDate}</span>,
    },
    {
      key: 'status',
      header: t('payments.columns.status'),
      cell: (r) => <StatusPill status={r.status} />,
    },
  ];

  return (
    <section aria-labelledby={titleId}>
      <SectionHeader
        titleId={titleId}
        title={t('payments.title')}
        action={{ label: t('payments.viewAll'), onClick: onViewAll }}
      />
      {payments.length === 0 ? (
        <EmptyState icon="🧾" title={t('payments.empty.title')} body={t('payments.empty.body')} />
      ) : (
        <div className="flex flex-col gap-3">
          {note !== null && (
            <AnnouncementBanner variant={noteVariant[note]}>
              {t(`payments.note.${note}`)}
            </AnnouncementBanner>
          )}
          <Table
            columns={columns}
            rows={payments}
            rowKey={(row) => row.invoiceNo}
            caption={t('payments.title')}
          />
        </div>
      )}
    </section>
  );
}
