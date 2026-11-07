'use client';

import { useState } from 'react';

import { SingleDatePicker } from '@/components/dentil/date-picker/date-picker';

export function DatePickerTimestampDemo() {
  const [startsAt, setStartsAt] = useState<number>();

  return (
    <div className="flex flex-col items-start gap-4">
      <SingleDatePicker returnFormat="timestamp" value={startsAt} onChange={setStartsAt} className="w-60" />
      <span className="text-muted-foreground text-sm">
        Result: <code className="text-foreground">{startsAt ?? '—'}</code>
      </span>
    </div>
  );
}
