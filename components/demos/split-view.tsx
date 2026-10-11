'use client';

import { useState } from 'react';

import { DataTable } from '@/components/data-table/data-table';
import { DateCell } from '@/components/data-table/date-cell';
import type { TableQuery } from '@/components/data-table/types';
import { StatusBadge, invoiceColumns } from '@/lib/demo/columns';
import { type Invoice, formatAmount, useInvoices } from '@/lib/demo/invoices';

// Narrow tables read better beside a panel: keep amount, status, customer and created.
const columns = invoiceColumns.filter((c) => ['amount', 'status', 'customer', 'created'].includes(c.id ?? ''));

function InvoiceDetail({ invoice }: { invoice: Invoice }) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <span className="text-muted-foreground font-mono text-xs">{invoice.number}</span>
        <span className="text-2xl font-semibold tabular-nums">{formatAmount(invoice.amount)}</span>
        <StatusBadge status={invoice.status} />
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
        <dt className="text-muted-foreground">Customer</dt>
        <dd>{invoice.customer.name}</dd>
        <dt className="text-muted-foreground">Email</dt>
        <dd>{invoice.customer.email}</dd>
        <dt className="text-muted-foreground">Created</dt>
        <dd>
          <DateCell date={invoice.created} />
        </dd>
        <dt className="text-muted-foreground">Due</dt>
        <dd>
          <DateCell date={invoice.due} showTime={false} />
        </dd>
      </dl>
    </div>
  );
}

export function SplitViewDemo() {
  const [query, setQuery] = useState<TableQuery>({});
  const { data, hasMore, loading, fetching } = useInvoices(query);

  return (
    <div className="flex h-[560px] flex-col">
      <DataTable
        columns={columns}
        data={data ?? []}
        loading={loading}
        fetching={fetching}
        hasMore={hasMore}
        query={query}
        setQuery={setQuery}
        showPagination
        splitView={{ component: (invoice) => (invoice ? <InvoiceDetail invoice={invoice} /> : null) }}
      />
    </div>
  );
}
