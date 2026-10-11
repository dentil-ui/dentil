'use client';

import { useState } from 'react';

import { DataTable } from '@/components/data-table/data-table';
import type { TableQuery } from '@/components/data-table/types';
import { invoiceColumns } from '@/lib/demo/columns';
import { InvoiceDetails } from '@/lib/demo/invoice-details';
import { useInvoices } from '@/lib/demo/invoices';

// Email and due date move into the expanded panel.
const columns = invoiceColumns.filter((column) => column.id !== 'email' && column.id !== 'due');

export function ExpandableRowDemo() {
  const [query, setQuery] = useState<TableQuery>({});
  const { data, hasMore, loading, fetching } = useInvoices(query);

  return (
    <DataTable
      columns={columns}
      data={data ?? []}
      loading={loading}
      fetching={fetching}
      hasMore={hasMore}
      query={query}
      setQuery={setQuery}
      showPagination
      // Expandable rows toggle on click instead of linking. Drafts can't expand, so they still link.
      url={(invoice) => `#${invoice.id}`}
      expandable={{
        component: (invoice) => <InvoiceDetails invoice={invoice} />,
        canExpand: (invoice) => invoice.status !== 'draft',
        trigger: 'row',
      }}
    />
  );
}
