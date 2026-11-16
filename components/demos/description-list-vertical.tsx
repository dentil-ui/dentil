'use client';

import { Descriptions } from '@/components/dentil/description-list/description-list';

export function DescriptionListVerticalDemo() {
  return (
    <aside className="w-full max-w-64 rounded-lg border p-4">
      <h3 className="mb-2 text-sm font-medium">Payment</h3>
      <Descriptions
        orientation="vertical"
        items={[
          { term: 'Amount', detail: '£1,250.00' },
          { term: 'Customer', detail: 'Ada Lovelace', href: '#cus_R8fK2mQ7xLp4Vn' },
          {
            term: 'Payment ID',
            detail: <span className="font-mono text-xs">pay_3Qm9sT1vKx</span>,
            copy: 'pay_3Qm9sT1vKx',
          },
          { term: 'Paid', detail: '7 Nov 2026, 09:16' },
        ]}
      />
    </aside>
  );
}
