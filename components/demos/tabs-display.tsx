'use client';

import { Download } from 'lucide-react';
import { useState } from 'react';

import { DataTable } from '@/components/data-table/data-table';
import type { TableQuery } from '@/components/data-table/types';
import { Button } from '@/components/ui/button';
import { invoiceColumns } from '@/lib/demo/columns';
import { useInvoices } from '@/lib/demo/invoices';

export function TabsDisplayDemo() {
  const [query, setQuery] = useState<TableQuery>({ status: 'open' });
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
      showDisplay
      tabs={[
        { label: 'Open', query: { status: 'open' } },
        { label: 'Paid', query: { status: 'paid' } },
        { label: 'Draft', query: { status: 'draft' } },
      ]}
      tabsOptions={{ allPosition: 'end' }}
      toolbarActions={
        <Button variant="secondary" size="sm" className="h-7 gap-1.5 px-2 text-xs">
          <Download className="size-3" />
          Export
        </Button>
      }
      noResultsText="No invoices"
    />
  );
}
