'use client';

import { CategoryBarChart } from '@/components/dentil/charts/category-bar-chart';
import { DEMO_UPDATED_AT, ticketAges } from '@/lib/demo/charts';

export function ChartsCategoryBarDemo() {
  return (
    <CategoryBarChart
      title="Open tickets by age"
      items={ticketAges}
      formatValue={(count) => `${count} ${count === 1 ? 'ticket' : 'tickets'}`}
      formatHeadlineValue={(count) => count.toLocaleString('en-GB')}
      previousValue={48}
      lowerIsBetter
      locale="en-GB"
      timezone="Europe/London"
      href="#api"
      updatedAt={DEMO_UPDATED_AT}
    />
  );
}
