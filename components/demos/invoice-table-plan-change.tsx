'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  type InvoiceLine,
  type InvoiceLineGroup,
  type InvoiceTotal,
  InvoiceTable,
} from '@/components/dentil/invoice-table/invoice-table';

const changePeriod = { start: '2026-12-15', end: '2026-12-31' };
const days = { used: 17, total: 31 };

const invoices: Record<'upgrade' | 'downgrade', { lines: (InvoiceLine | InvoiceLineGroup)[]; totals: InvoiceTotal[] }> =
  {
    upgrade: {
      lines: [
        {
          id: 'change',
          description: 'Pro → Business',
          detail: 'Upgraded Dec 15, 2026',
          amount: 1645,
          lines: [
            {
              id: 'unused-pro',
              description: 'Unused time on Pro',
              period: changePeriod,
              proration: { fullAmount: 2000, days },
              quantity: 1,
              unitAmount: 2000,
              amount: -1097,
            },
            {
              id: 'remaining-business',
              description: 'Remaining time on Business',
              period: changePeriod,
              proration: { fullAmount: 5000, days },
              quantity: 1,
              unitAmount: 5000,
              amount: 2742,
            },
          ],
        },
        {
          id: 'business',
          description: 'Business plan',
          period: { start: '2027-01-01', end: '2027-01-31' },
          quantity: 1,
          unitAmount: 5000,
          amount: 5000,
        },
      ],
      totals: [
        { label: 'Subtotal', amount: 6645 },
        { label: 'Amount due', amount: 6645, variant: 'strong' },
      ],
    },
    downgrade: {
      lines: [
        {
          id: 'change',
          description: 'Business → Pro',
          detail: 'Downgraded Dec 15, 2026',
          amount: -1645,
          lines: [
            {
              id: 'unused-business',
              description: 'Unused time on Business',
              period: changePeriod,
              proration: { fullAmount: 5000, days },
              quantity: 1,
              unitAmount: 5000,
              amount: -2742,
            },
            {
              id: 'remaining-pro',
              description: 'Remaining time on Pro',
              period: changePeriod,
              proration: { fullAmount: 2000, days },
              quantity: 1,
              unitAmount: 2000,
              amount: 1097,
            },
          ],
        },
      ],
      totals: [
        { label: 'Subtotal', amount: -1645 },
        { label: 'Credit to balance', amount: 1645 },
        { label: 'Amount due', amount: 0, variant: 'strong' },
      ],
    },
  };

export function InvoiceTablePlanChangeDemo() {
  const [change, setChange] = useState<keyof typeof invoices>('upgrade');

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex gap-2">
        {(['upgrade', 'downgrade'] as const).map((value) => (
          <Button
            key={value}
            variant="outline"
            size="sm"
            className="aria-pressed:bg-accent aria-pressed:text-accent-foreground dark:aria-pressed:bg-accent capitalize"
            aria-pressed={change === value}
            onClick={() => setChange(value)}>
            {value}
          </Button>
        ))}
      </div>
      <InvoiceTable currency="USD" lines={invoices[change].lines} totals={invoices[change].totals} />
    </div>
  );
}
