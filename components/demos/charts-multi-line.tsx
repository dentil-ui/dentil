'use client';

import { getPercentChange } from '@/components/dentil/charts/percent-change';
import { LineChart } from '@/components/dentil/charts/line-chart';
import { apiRequests, DEMO_UPDATED_AT, successRate } from '@/lib/demo/charts';

const percent = (rate: number) => `${(rate * 100).toFixed(1)}%`;

export function ChartsMultiLineDemo() {
  return (
    <LineChart
      title="API requests"
      value={`${percent(successRate.current)} success rate`}
      previousLabel={`${percent(successRate.previous)} previous period`}
      change={getPercentChange(successRate.current, successRate.previous)}
      data={apiRequests}
      series={[
        { key: 'succeeded', label: 'Succeeded', color: 'var(--chart-2)' },
        { key: 'failed', label: 'Failed', color: 'var(--destructive)' },
      ]}
      unit="day"
      showYAxis
      timezone="Europe/London"
      locale="en-GB"
      updatedAt={DEMO_UPDATED_AT}
    />
  );
}
