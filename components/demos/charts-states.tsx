'use client';

import { LineChart } from '@/components/dentil/charts/line-chart';
import { DEMO_NOW, revenue, revenueTotals } from '@/lib/demo/charts';

// Spelled out rather than `notation: 'compact'`, whose suffixes differ between Node and browsers (£549K vs £549k)
// and would break hydration.
const currency = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 1 });
const formatPence = (pence: number) => {
  const pounds = pence / 100;
  if (Math.abs(pounds) >= 1_000_000) return `${currency.format(pounds / 1_000_000)}M`;
  if (Math.abs(pounds) >= 1_000) return `${currency.format(Math.round(pounds / 1_000))}K`;
  return currency.format(pounds);
};

const series = [
  { key: 'value', label: 'This period' },
  { key: 'previous', label: 'Previous period', comparison: true, dateKey: 'previousDate' },
];

export function ChartsStatesDemo() {
  return (
    <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2">
      <LineChart title="Loading" data={[]} series={series} loading />
      <LineChart title="Error" data={[]} series={series} error="Couldn’t load this report. Try again later." />
      <LineChart title="No data" value={0} data={[]} series={series} locale="en-GB" />
      <div className="flex flex-col gap-2">
        <div className="text-muted-foreground text-sm">Embedded</div>
        <div className="rounded-lg border p-3">
          <LineChart
            embedded
            value={revenueTotals.current}
            previousValue={revenueTotals.previous}
            formatValue={formatPence}
            data={revenue}
            series={series}
            now={DEMO_NOW}
            timezone="Europe/London"
            locale="en-GB"
          />
        </div>
      </div>
    </div>
  );
}
