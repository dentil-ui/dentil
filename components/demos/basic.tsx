'use client';

import { useState } from 'react';

import { DataTable } from '@/components/data-table/data-table';
import type { TableQuery } from '@/components/data-table/types';
import { invoiceColumns } from '@/lib/demo/columns';
import { useInvoices } from '@/lib/demo/invoices';

export function BasicDemo() {
  const [query, setQuery] = useState<TableQuery>({});
  const { data, hasMore, loading, fetching } = useInvoices(query);

  return (
    <DataTable
      columns={invoiceColumns}
      data={data ?? []}
      loading={loading}
      fetching={fetching}
      hasMore={hasMore}
      query={query}
      setQuery={setQuery}
      showPagination
      sortableColumns={{ created: 'created', due: 'due' }}
      url={(invoice) => `#${invoice.id}`}
    />
  );
}
