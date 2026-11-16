'use client';

import NextLink from 'next/link';

import { Link } from '@/components/dentil/link/link';

export function LinkOverviewDemo() {
  return (
    <dl className="grid w-full max-w-sm grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-3 text-sm">
      <dt className="text-muted-foreground">Customer</dt>
      <dd className="min-w-0">
        <Link href="/docs/link#usage" linkComponent={NextLink}>
          Ada Lovelace
        </Link>
      </dd>
      <dt className="text-muted-foreground">Invoice</dt>
      <dd className="min-w-0">
        <Link href="/docs/link#usage" linkComponent={NextLink} className="max-w-48" labelClassName="font-mono">
          in_1QX4b2Lk9mT8pR7sVw3yZcDe
        </Link>
      </dd>
      <dt className="text-muted-foreground">Subscription</dt>
      <dd className="min-w-0">
        <Link href="/docs/link#usage" linkComponent={NextLink} arrow={false}>
          Pro, monthly
        </Link>
      </dd>
      <dt className="text-muted-foreground">Receipt</dt>
      <dd className="min-w-0">
        <Link href="https://ui.shadcn.com" external>
          View on shadcn/ui
        </Link>
      </dd>
    </dl>
  );
}
