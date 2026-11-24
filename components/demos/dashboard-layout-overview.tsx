'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';

import { CategoryBarChart } from '@/components/dentil/charts/category-bar-chart';
import { LineChart } from '@/components/dentil/charts/line-chart';
import {
  DashboardContainer,
  DashboardGrid,
  DashboardHeader,
  DashboardHeading,
  DashboardSection,
  DashboardSectionContent,
  DashboardSectionHeader,
  DashboardSubheading,
  DashboardTableHeader,
} from '@/components/dentil/dashboard-layout/dashboard-layout';
import { DataTable } from '@/components/dentil/data-table/data-table';
import type { TableQuery } from '@/components/dentil/data-table/types';
import { Button } from '@/components/ui/button';
import { DEMO_NOW, DEMO_UPDATED_AT, revenue, revenueTotals, subscriptionsByPlan } from '@/lib/demo/charts';
import { invoiceColumns } from '@/lib/demo/columns';
import { useInvoices } from '@/lib/demo/invoices';

const currency = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });
const formatPence = (pence: number) => currency.format(pence / 100);

export function DashboardLayoutOverviewDemo() {
  const [query, setQuery] = useState<TableQuery>({});
  const { data, hasMore, loading, fetching } = useInvoices(query);

  return (
    <DashboardContainer>
      <DashboardHeader>
        <DashboardHeading>Billing</DashboardHeading>
        <Button size="sm">
          <Plus />
          Create invoice
        </Button>
      </DashboardHeader>

      <DashboardSection>
        <DashboardSectionHeader>
          <DashboardSubheading>Overview</DashboardSubheading>
        </DashboardSectionHeader>
        <DashboardGrid>
          <DashboardSectionContent>
            <LineChart
              title="Revenue"
              value={revenueTotals.current}
              previousValue={revenueTotals.previous}
              formatValue={formatPence}
              data={revenue}
              series={[
                { key: 'value', label: 'This period' },
                { key: 'previous', label: 'Previous period', comparison: true, dateKey: 'previousDate' },
              ]}
              unit="day"
              now={DEMO_NOW}
              timezone="Europe/London"
              locale="en-GB"
              updatedAt={DEMO_UPDATED_AT}
            />
          </DashboardSectionContent>
          <DashboardSectionContent>
            <CategoryBarChart title="Subscriptions by plan" meta="Today" items={subscriptionsByPlan} locale="en-GB" />
          </DashboardSectionContent>
        </DashboardGrid>
      </DashboardSection>

      <DashboardTableHeader>
        <DashboardSubheading>Invoices</DashboardSubheading>
        <Button size="sm" variant="secondary">
          Export
        </Button>
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
    </DashboardContainer>
  );
}
