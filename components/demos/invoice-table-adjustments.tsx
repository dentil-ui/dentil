'use client';

import { InvoiceTable } from '@/components/invoice-table/invoice-table';

export function InvoiceTableAdjustmentsDemo() {
  return (
    <InvoiceTable
      className="w-full"
      currency="USD"
      lines={[
        {
          id: 'plan',
          description: 'Team plan',
          period: { start: '2026-12-01', end: '2026-12-31' },
          taxRate: 10,
          amount: 100000,
        },
        { id: 'support', description: 'Priority support', taxRate: 10, amount: 20000 },
      ]}
      totals={[
        { label: 'Subtotal', amount: 120000 },
        { label: 'Tax (10% on $1,200.00)', amount: 12000 },
        { label: 'Total', amount: 132000 },
        {
          id: 'cn-0012',
          variant: 'entry',
          gap: true,
          label: (
            <>
              <span className="font-mono">CN-0012</span> · Service outage credit
            </>
          ),
          amount: -12000,
        },
        { label: 'Adjustment total', amount: -12000, gap: true },
        { label: 'Adjusted total', amount: 120000 },
        {
          id: 'pp-0003',
          variant: 'entry',
          gap: true,
          label: (
            <>
              <span className="font-mono">PP-0003</span> · Paid
            </>
          ),
          amount: 50000,
        },
        {
          id: 'pp-0004',
          variant: 'entry',
          label: (
            <>
              <span className="font-mono">PP-0004</span> · Void
            </>
          ),
          amount: 30000,
          className: 'line-through',
        },
        { label: 'Amount paid', amount: -50000, gap: true },
        { label: 'Amount due', amount: 70000, variant: 'strong' },
      ]}
    />
  );
}
