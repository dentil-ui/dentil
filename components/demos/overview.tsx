'use client';

import { Archive, Mail, PoundSterling, User } from 'lucide-react';
import { useState } from 'react';

import { createCommonActions } from '@/components/data-table/context-menu';
import { DataTable } from '@/components/data-table/data-table';
import { createColumnConfigHelper } from '@/components/data-table/filter';
import { DataTableFilters } from '@/components/data-table/filters';
import type { TableQuery } from '@/components/data-table/types';
import { invoiceColumns } from '@/lib/demo/columns';
import { InvoiceDetails } from '@/lib/demo/invoice-details';
import { type Invoice, getCustomerName, searchCustomers, useInvoices } from '@/lib/demo/invoices';

const dtf = createColumnConfigHelper<Invoice>();

// Status is driven by the tabs, so the filter bar covers everything else.
const filterColumns = [
  dtf
    .option()
    .id('customer')
    .accessor((row) => row.customer.id)
    .displayName('Customer')
    .icon(User)
    .asyncOptions({ fetchOptions: searchCustomers, resolveLabel: getCustomerName })
    .build(),
  dtf
    .number()
    .id('amount')
    .accessor((row) => row.amount / 100)
    .displayName('Amount')
    .icon(PoundSterling)
    .min(0)
    .max(2500)
    .scale(100)
    .build(),
  dtf
    .text()
    .id('email')
    .accessor((row) => row.customer.email)
    .displayName('Email')
    .icon(Mail)
    .build(),
] as const;

// Email and due date move into the expanded panel.
const columns = invoiceColumns.filter((column) => column.id !== 'email' && column.id !== 'due');

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function OverviewDemo() {
  const [query, setQuery] = useState<TableQuery>({});
  const [selected, setSelected] = useState<Invoice[]>([]);
  const [log, setLog] = useState<string | null>(null);
  const { data, hasMore, loading, fetching } = useInvoices(query);

  return (
    <>
      <DataTable
        columns={columns}
        data={data ?? []}
        loading={loading}
        fetching={fetching}
        hasMore={hasMore}
        query={query}
        setQuery={setQuery}
        url={(invoice) => `#${invoice.id}`}
        showPagination
        showDisplay
        sortableColumns={{ created: 'created', amount: 'amount' }}
        toolbar={<DataTableFilters data={data ?? []} filterColumns={filterColumns} query={query} setQuery={setQuery} />}
        tabs={[
          { label: 'Open', query: { status: 'open' } },
          { label: 'Paid', query: { status: 'paid' } },
          { label: 'Draft', query: { status: 'draft' } },
        ]}
        tabsOptions={{ allPosition: 'start' }}
        expandable={{ component: (invoice) => <InvoiceDetails invoice={invoice} /> }}
        enableSelection
        selectedRows={selected}
        onSelectionChange={setSelected}
        selectionActions={[
          {
            label: 'Archive',
            icon: Archive,
            clearOnSuccess: true,
            onClick: async (rows) => {
              await wait(800);
              setLog(`Archived ${rows.map((row) => row.number).join(', ')}`);
            },
          },
        ]}
        contextMenuActions={(invoice) =>
          createCommonActions(invoice, { baseUrl: '/invoices', onCopyId: (id) => setLog(`Copied ${id}`) })
        }
        noResultsText="No invoices match these filters"
      />
      {log && <p className="text-muted-foreground px-5 py-3 font-mono text-xs">{log}</p>}
    </>
  );
}
