'use client';

import { useState } from 'react';

import {
  DashboardContainer,
  DashboardHeader,
  DashboardHeading,
  DashboardSection,
  DashboardSectionContent,
  DashboardSectionHeader,
  DashboardSectionTitle,
  DashboardSplit,
  DashboardSplitMain,
  DashboardSplitSidebar,
  DashboardSubheading,
  DashboardTableHeader,
} from '@/components/dentil/dashboard-layout/dashboard-layout';
import { Descriptions } from '@/components/dentil/description-list/description-list';
import { DataTable } from '@/components/dentil/data-table/data-table';
import type { TableQuery } from '@/components/dentil/data-table/types';
import { Button } from '@/components/ui/button';
import { invoiceColumns } from '@/lib/demo/columns';
import { useInvoices } from '@/lib/demo/invoices';

export function DashboardLayoutSplitDemo() {
  const [query, setQuery] = useState<TableQuery>({});
  const { data, hasMore, loading, fetching } = useInvoices(query);

  return (
    <DashboardContainer>
      <DashboardHeader>
        <DashboardHeading>Ada Lovelace</DashboardHeading>
        <Button size="sm" variant="secondary">
          Edit customer
        </Button>
      </DashboardHeader>

      <DashboardSplit className="border-t">
        <DashboardSplitMain>
          <DashboardTableHeader>
            <DashboardSubheading>Invoices</DashboardSubheading>
          </DashboardTableHeader>
          <DataTable
            columns={invoiceColumns}
            data={data ?? []}
            loading={loading}
            fetching={fetching}
            hasMore={hasMore}
            query={query}
            setQuery={setQuery}
            showPagination
            url={(invoice) => `#${invoice.id}`}
          />
        </DashboardSplitMain>

        <DashboardSplitSidebar>
          <DashboardSection>
            <DashboardSectionHeader>
              <DashboardSubheading>Details</DashboardSubheading>
            </DashboardSectionHeader>
            <DashboardSectionContent>
              <Descriptions
                orientation="vertical"
                items={[
                  { term: 'Email', detail: 'ada@example.com', copy: 'ada@example.com' },
                  { term: 'Currency', detail: 'GBP' },
                  { term: 'Balance', detail: '£0.00' },
                ]}
              />
            </DashboardSectionContent>
            <DashboardSectionContent>
              <DashboardSectionTitle>Notes</DashboardSectionTitle>
              <p className="text-muted-foreground text-sm">Pays by bank transfer on the first of the month.</p>
            </DashboardSectionContent>
          </DashboardSection>
        </DashboardSplitSidebar>
      </DashboardSplit>
    </DashboardContainer>
  );
}
