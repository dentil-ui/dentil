'use client';

import { CircleDot, Hash, Mail, PoundSterling, User } from 'lucide-react';

import { DataTable } from '@/components/data-table/data-table';
import { createColumnConfigHelper } from '@/components/data-table/filter';
import { DataTableFilters } from '@/components/data-table/filters';
import { useTableQueryState } from '@/components/data-table/use-table-query-state';
import { invoiceColumns } from '@/lib/demo/columns';
import { type Invoice, getCustomerName, searchCustomers, useInvoices } from '@/lib/demo/invoices';

const dtf = createColumnConfigHelper<Invoice>();

const filterColumns = [
  dtf
    .option()
    .id('status')
    .accessor((row) => row.status)
    .displayName('Status')
    .icon(CircleDot)
    .options([
      { label: 'Draft', value: 'draft' },
      { label: 'Open', value: 'open' },
      { label: 'Paid', value: 'paid' },
      { label: 'Void', value: 'void' },
    ])
    .allowMultiple()
    .build(),
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
    // The UI works in pounds; the API expects pence.
    .scale(100)
    .build(),
  dtf
    .text()
    .id('email')
    .accessor((row) => row.customer.email)
    .displayName('Email')
    .icon(Mail)
    .build(),
  dtf
    .text()
    .id('number')
    .accessor((row) => row.number)
    .displayName('Number')
    .icon(Hash)
    .build(),
] as const;

export function FiltersDemo() {
  // Filters, sort and page are mirrored to `?inv.status=…` so reloads and shared links keep them.
  const [query, setQuery] = useTableQueryState({}, { urlState: { prefix: 'inv.' } });
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
      sortableColumns={{ created: 'created', amount: 'amount' }}
      toolbar={<DataTableFilters data={data ?? []} filterColumns={filterColumns} query={query} setQuery={setQuery} />}
      noResultsText="No invoices match these filters"
    />
  );
}
