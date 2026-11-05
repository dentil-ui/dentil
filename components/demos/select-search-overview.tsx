'use client';

import { useState } from 'react';

import { SelectSearch } from '@/components/select-search/select-search';

const timezones = [
  { label: 'London (GMT+0)', value: 'Europe/London', keywords: ['UK', 'Britain'] },
  { label: 'Paris (GMT+1)', value: 'Europe/Paris', keywords: ['France', 'CET'] },
  { label: 'New York (GMT-5)', value: 'America/New_York', keywords: ['EST', 'Eastern'] },
  { label: 'Los Angeles (GMT-8)', value: 'America/Los_Angeles', keywords: ['PST', 'Pacific'] },
  { label: 'Tokyo (GMT+9)', value: 'Asia/Tokyo', keywords: ['Japan', 'JST'] },
  { label: 'Sydney (GMT+11)', value: 'Australia/Sydney', keywords: ['AEDT'] },
];

export function SelectSearchOverviewDemo() {
  const [timezone, setTimezone] = useState('');

  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      <SelectSearch
        options={timezones}
        value={timezone}
        onChange={setTimezone}
        placeholder="Select a timezone"
        searchPlaceholder="Search timezones..."
        emptyText="No timezone found."
      />
      <span className="text-muted-foreground text-sm">
        Result: <code className="text-foreground">{timezone || '—'}</code>
      </span>
    </div>
  );
}
