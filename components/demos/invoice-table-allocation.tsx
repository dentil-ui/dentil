'use client';

import { useState } from 'react';

import { type InvoiceLine, InvoiceTable, formatInvoiceAmount } from '@/components/invoice-table/invoice-table';

type CreditableLine = InvoiceLine & { credited: number };

const lines: CreditableLine[] = [
  {
    id: 'plan',
    description: 'Team plan',
    period: { start: '2026-12-01', end: '2026-12-31' },
    tax: 10000,
    amount: 100000,
    credited: 0,
  },
  { id: 'support', description: 'Priority support', tax: 2000, amount: 20000, credited: 22000 },
  { id: 'storage', description: 'Additional storage (500 GB)', tax: 900, amount: 9000, credited: 4000 },
];

const cap = 15000;

export function InvoiceTableAllocationDemo() {
  const [values, setValues] = useState<Record<string, number | undefined>>({ plan: 10000 });
  const allocated = Object.values(values).reduce<number>((sum, value) => sum + (value ?? 0), 0);

  return (
    <div className="flex w-full flex-col gap-4">
      <InvoiceTable
        currency="USD"
        lines={lines}
        verticalAlign="middle"
        allocation={{
          label: 'Credit',
          values,
          onChange: setValues,
          max: (line) => line.amount + (line.tax ?? 0) - line.credited,
          invalid: allocated > cap,
        }}
        totals={[{ label: 'Credit note total', amount: allocated, variant: 'strong' }]}
      />
      <span className="text-muted-foreground text-sm">
        Result: <code className="text-foreground">{JSON.stringify(values)}</code> (max {formatInvoiceAmount(cap, 'USD')}{' '}
        in total)
      </span>
    </div>
  );
}
