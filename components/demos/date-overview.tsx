'use client';

import { Date } from '@/components/date/date';

/** 7 Nov 2026, 09:14 UTC. */
const created = 1_794_042_840;

const zones = [
  ['London', 'Europe/London'],
  ['New York', 'America/New_York'],
  ['Tokyo', 'Asia/Tokyo'],
] as const;

export function DateOverviewDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-2 text-sm">
      {zones.map(([label, timezone]) => (
        <div key={timezone} className="flex items-baseline justify-between gap-6">
          <span className="text-muted-foreground">{label}</span>
          <Date date={created} timezone={timezone} showTimezone hover align="end" />
        </div>
      ))}
    </div>
  );
}
