'use client';

import { useState } from 'react';
import { Banknote, CreditCard, Mail, RotateCcw } from 'lucide-react';

import { ObjectTimeline } from '@/components/dentil/object-timeline/object-timeline';

export function ObjectTimelineOverviewDemo() {
  const [opened, setOpened] = useState<string>();

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <ObjectTimeline
        items={[
          {
            id: 'created',
            icon: CreditCard,
            title: 'Payment created from invoice INV-1042',
            date: '7 Nov 2026, 09:14',
          },
          {
            id: 'sent',
            icon: Mail,
            iconClassName: 'text-primary',
            title: 'Receipt sent to ada@example.com',
            description: 'Delivered',
            date: '7 Nov 2026, 09:15',
            onClick: () => setOpened('Receipt'),
          },
          {
            id: 'paid',
            icon: Banknote,
            title: 'Payment succeeded',
            date: '7 Nov 2026, 09:16',
          },
          {
            id: 'refund',
            icon: RotateCcw,
            iconClassName: 'text-destructive',
            title: '£25.00 refunded to the customer',
            description: 'Requested by the customer',
            date: '7 Nov 2026, 11:02',
          },
        ]}
      />
      <span className="text-muted-foreground text-sm">
        Result: <code className="text-foreground">{opened ?? '—'}</code>
      </span>
    </div>
  );
}
