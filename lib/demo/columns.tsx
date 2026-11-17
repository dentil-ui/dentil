'use client';

import { createColumnHelper } from '@tanstack/react-table';

import { Badge, type BadgeVariant } from '@/components/dentil/badge/badge';
import { ActionsButton } from '@/components/dentil/data-table/actions-button';
import { DateCell } from '@/components/dentil/data-table/date-cell';

import { type Invoice, type InvoiceStatus, formatAmount } from './invoices';

const STATUS_VARIANT: Record<InvoiceStatus, NonNullable<BadgeVariant>> = {
  draft: 'zinc',
  open: 'blue',
  paid: 'green',
  void: 'zinc',
};

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status]} size="sm" className={status === 'void' ? 'line-through' : undefined}>
      {status}
    </Badge>
  );
}

const col = createColumnHelper<Invoice>();

export const invoiceColumns = [
  col.accessor('amount', {
    id: 'amount',
    header: 'Amount',
    enableHiding: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="font-medium tabular-nums">{formatAmount(row.original.amount)}</span>
      </div>
    ),
    meta: { minimize: true },
  }),
  col.accessor('status', {
    id: 'status',
    header: 'Status',
    cell: ({ getValue }) => <StatusBadge status={getValue()} />,
    meta: { minimize: true },
  }),
  col.accessor('number', {
    id: 'number',
    header: 'Number',
    cell: ({ getValue }) => <span className="font-mono text-xs leading-6.5">{getValue()}</span>,
  }),
  col.accessor((row) => row.customer.name, { id: 'customer', header: 'Customer' }),
  col.accessor((row) => row.customer.email, {
    id: 'email',
    header: 'Email',
    cell: ({ getValue }) => <span className="text-muted-foreground">{getValue()}</span>,
  }),
  col.accessor('due', {
    id: 'due',
    header: 'Due',
    cell: ({ getValue }) => <DateCell date={getValue()} showTime={false} />,
    meta: { minimize: true },
  }),
  col.accessor('created', {
    id: 'created',
    header: 'Created',
    cell: ({ getValue }) => <DateCell date={getValue()} align="right" />,
    meta: { align: 'right', minimize: true },
  }),
  col.display({
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => (
      <ActionsButton
        actions={[
          { name: 'Copy number', onClick: () => navigator.clipboard.writeText(row.original.number) },
          { name: 'Void invoice', variant: 'destructive', onClick: () => {}, disabled: row.original.status === 'void' },
        ]}
      />
    ),
    meta: { minimize: true },
  }),
];
