'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { LineChart } from '@/components/dentil/charts/line-chart';
import { useInViewFetch } from '@/components/dentil/charts/use-in-view-fetch';
import { apiRequests } from '@/lib/demo/charts';

type Range = '7d' | '14d';

async function fetchRequests(range: Range) {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return range === '7d' ? apiRequests.slice(-7) : apiRequests;
}

export function ChartsInViewDemo() {
  const [range, setRange] = useState<Range>('14d');
  const [data, setData] = useState<typeof apiRequests>([]);
  const [loading, setLoading] = useState(true);
  const [fetches, setFetches] = useState(0);

  const { ref } = useInViewFetch(async () => {
    setLoading(true);
    setFetches((count) => count + 1);
    setData(await fetchRequests(range));
    setLoading(false);
  }, [range]);

  const total = data.reduce((sum, point) => sum + point.succeeded + point.failed, 0);

  return (
    <div ref={ref} className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {(['7d', '14d'] as const).map((option) => (
          <Button
            key={option}
            size="sm"
            variant={range === option ? 'secondary' : 'ghost'}
            aria-pressed={range === option}
            onClick={() => setRange(option)}>
            Last {option.replace('d', ' days')}
          </Button>
        ))}
        <p className="text-muted-foreground ml-auto text-sm">
          Result: <code className="text-foreground">{fetches} fetches</code>
        </p>
      </div>
      <LineChart
        title="API requests"
        value={loading ? undefined : total}
        data={data}
        series={[
          { key: 'succeeded', label: 'Succeeded', color: 'var(--chart-2)' },
          { key: 'failed', label: 'Failed', color: 'var(--destructive)' },
        ]}
        loading={loading}
        timezone="Europe/London"
        locale="en-GB"
      />
    </div>
  );
}
