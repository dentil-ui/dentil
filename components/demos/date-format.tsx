'use client';

import { Date } from '@/components/date/date';

/** 7 Nov 2026, 09:14 UTC. */
const created = 1_794_042_840;
/** 4 Mar 2024, 14:30 UTC. */
const older = 1_709_562_600;

const rows = [
  ['This year', <Date key="year" date={created} timezone="Europe/London" />],
  ['Date only', <Date key="date" date={created} timezone="Europe/London" showTime={false} />],
  ['Another year', <Date key="older" date={older} timezone="Europe/London" />],
  ['Forced year', <Date key="forced" date={created} timezone="Europe/London" showYear />],
  ['Missing', <Date key="missing" date={null} fallback="—" />],
] as const;

export function DateFormatDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-2 text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-baseline justify-between gap-6">
          <span className="text-muted-foreground">{label}</span>
          {value}
        </div>
      ))}
    </div>
  );
}
