'use client';

import { Descriptions } from '@/components/dentil/description-list/description-list';

const customer = {
  id: 'cus_R8fK2mQ7xLp4Vn',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  phone: '+44 7700 900123',
  created: '7 Nov 2026, 09:14',
  currency: 'GBP',
  balance: '£0.00',
  invoice: 'INV-1042',
  website: 'https://example.com',
  taxId: 'GB123456789',
  locale: 'en-GB',
  vatExempt: false,
};

export function DescriptionListOverviewDemo() {
  return (
    <Descriptions
      className="w-full max-w-3xl"
      columns={[
        [
          { term: 'Name', detail: customer.name },
          { term: 'Email', detail: customer.email, copy: customer.email },
          { term: 'Phone', detail: customer.phone },
          {
            term: 'Customer ID',
            detail: <span className="font-mono text-xs">{customer.id}</span>,
            copy: customer.id,
          },
        ],
        [
          { term: 'Created', detail: customer.created },
          { term: 'Currency', detail: customer.currency },
          { term: 'Balance', detail: customer.balance },
          { term: 'Latest invoice', detail: customer.invoice, href: `#${customer.invoice}` },
        ],
      ]}
      more={[
        { term: 'Website', detail: 'example.com', href: customer.website, external: true },
        { term: 'Tax ID', detail: customer.taxId, copy: customer.taxId },
        { term: 'Locale', detail: customer.locale },
        customer.vatExempt && { term: 'VAT', detail: 'Exempt' },
      ]}
    />
  );
}
