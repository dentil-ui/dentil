'use client';

import { CategoryBarChart } from '@/components/dentil/charts/category-bar-chart';
import { LineChart } from '@/components/dentil/charts/line-chart';
import { DEMO_NOW, DEMO_UPDATED_AT, revenue, revenueTotals, subscriptionsByPlan } from '@/lib/demo/charts';

const currency = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });
const formatPence = (pence: number) => currency.format(pence / 100);

export function ChartsOverviewDemo() {
  return (
    <div className="grid gap-6 md:grid-cols-[3fr_2fr] md:gap-0 md:divide-x">
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
        href="#examples"
        updatedAt={DEMO_UPDATED_AT}
        className="md:pr-6"
      />
      <CategoryBarChart
        title="Subscriptions by plan"
        meta="Today"
        items={subscriptionsByPlan}
        locale="en-GB"
        className="md:pl-6"
      />
    </div>
  );
}
