'use client';

import NextLink from 'next/link';

import { JsonViewer } from '@/components/dentil/json-viewer/json-viewer';

const event = {
  id: 'evt_1QxP4nLk9mT8pR7s',
  object: 'event',
  type: 'invoice.paid',
  created: 1_794_042_840,
  livemode: false,
  data: {
    object: {
      id: 'inv_000123',
      object: 'invoice',
      number: 'INV-0123',
      customer: 'cus_004',
      status: 'paid',
      amount_due: 12_500,
      amount_paid: 12_500,
      currency: 'usd',
      due_date: 1_795_252_440,
      paid_at: '2026-11-07T09:14:00Z',
      lines: [
        {
          description: 'Pro plan',
          quantity: 1,
          unit_amount: 12_500,
          period: { start: 1_794_042_840, end: 1_796_634_840 },
        },
      ],
      discount: null,
      metadata: {},
    },
  },
};

/** IDs with a page in your app. Unknown prefixes stay plain text. */
const routes: Record<string, string> = {
  cus_: '/customers',
  inv_: '/invoices',
};

function getHref(value: string) {
  const prefix = Object.keys(routes).find((candidate) => value.startsWith(candidate));
  // In your app, return `${routes[prefix]}/${value}`.
  return prefix ? '/docs/json-viewer#links' : undefined;
}

export function JsonViewerOverviewDemo() {
  return (
    <JsonViewer data={event} getHref={getHref} linkComponent={NextLink} timezone="Europe/London" className="w-full" />
  );
}
