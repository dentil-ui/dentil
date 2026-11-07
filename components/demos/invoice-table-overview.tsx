'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { type InvoiceLine, InvoiceTable, formatInvoiceAmount } from '@/components/dentil/invoice-table/invoice-table';

const lines: InvoiceLine[] = [
  {
    id: 'seats',
    description: 'Pro plan',
    period: { start: '2026-12-01', end: '2026-12-31' },
    quantity: 12,
    unitAmount: 2000,
    taxRate: 10,
    amount: 24000,
  },
  {
    id: 'seat-added',
    description: 'Pro plan, added seat',
    meta: <span className="text-muted-foreground text-xs">Prorated</span>,
    period: { start: '2026-12-15', end: '2026-12-31' },
    quantity: 1,
    unitAmount: 2000,
    taxRate: 10,
    amount: 1100,
    originalAmount: 2000,
  },
  {
    id: 'api',
    description: 'API requests',
    period: { start: '2026-11-15', end: '2026-12-14' },
    quantity: 1200000,
    unitAmount: '0.05',
    taxRate: 10,
    amount: 60000,
  },
  {
    id: 'onboarding',
    description: 'Onboarding session',
    quantity: 1,
    unitAmount: 50000,
    taxRate: 0,
    amount: 50000,
  },
];

const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);
const taxable = lines.filter((line) => line.taxRate === 10).reduce((sum, line) => sum + line.amount, 0);
const tax = Math.round(taxable * 0.1);

export function InvoiceTableOverviewDemo() {
  const [loading, setLoading] = useState(false);

  const reload = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoading(false);
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <InvoiceTable
        currency="USD"
        lines={lines}
        loading={loading}
        totals={[
          { label: 'Subtotal', amount: subtotal },
          { label: `Tax (10% on ${formatInvoiceAmount(taxable, 'USD')})`, amount: tax },
          { label: 'Total', amount: subtotal + tax },
          { label: 'Amount due', amount: subtotal + tax, variant: 'strong' },
        ]}
      />
      <Button variant="outline" size="sm" className="self-start" onClick={reload} disabled={loading}>
        Reload
      </Button>
    </div>
  );
}
