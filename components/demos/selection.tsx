'use client';

import { Archive, Mail, UserRound } from 'lucide-react';
import { useState } from 'react';

import {
  createCommonActions,
  createCustomAction,
  createSeparator,
  createSubMenu,
} from '@/components/data-table/context-menu';
import { DataTable } from '@/components/data-table/data-table';
import type { TableQuery } from '@/components/data-table/types';
import { invoiceColumns } from '@/lib/demo/columns';
import { type Invoice, useInvoices } from '@/lib/demo/invoices';

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function SelectionDemo() {
  const [query, setQuery] = useState<TableQuery>({});
  const [selected, setSelected] = useState<Invoice[]>([]);
  const [log, setLog] = useState<string | null>(null);
  const { data, hasMore, loading, fetching } = useInvoices(query);

  return (
    <>
      <DataTable
        columns={invoiceColumns}
        data={data ?? []}
        loading={loading}
        fetching={fetching}
        hasMore={hasMore}
        query={query}
        setQuery={setQuery}
        showPagination
        enableSelection
        selectedRows={selected}
        onSelectionChange={setSelected}
        // Void invoices can't be selected.
        selectedRowFilter={(invoice) => invoice.status !== 'void'}
        customRowClassName={(invoice) => (invoice.status === 'void' ? 'opacity-50' : undefined)}
        selectionActions={[
          {
            label: 'Send reminders',
            icon: Mail,
            variant: 'outline',
            onClick: (rows) => setLog(`Would remind ${rows.length} customers`),
          },
          {
            label: 'Archive',
            icon: Archive,
            clearOnSuccess: true,
            // Returning a promise shows a spinner until it settles.
            onClick: async (rows) => {
              await wait(1000);
              setLog(`Archived ${rows.map((r) => r.number).join(', ')}`);
            },
          },
        ]}
        contextMenuActions={(invoice) => [
          createCustomAction(
            'customer',
            `View ${invoice.customer.name}`,
            () => setLog(`Open ${invoice.customer.id}`),
            <UserRound className="size-4" />
          ),
          createSubMenu('send', 'Send', [
            createCustomAction('send-email', 'By email', () => setLog(`Email ${invoice.number}`)),
            createCustomAction('send-post', 'By post', () => setLog(`Post ${invoice.number}`)),
          ]),
          createSeparator('sep'),
          ...createCommonActions(invoice, { baseUrl: '/invoices', onCopyId: (id) => setLog(`Copied ${id}`) }),
        ]}
      />
      {log && <p className="text-muted-foreground px-5 pt-3 font-mono text-xs">{log}</p>}
    </>
  );
}
