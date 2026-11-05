'use client';

import { format, startOfMonth } from 'date-fns';
import { useState } from 'react';

import { SingleDatePicker } from '@/components/date-picker/date-picker';

const subscriptionStart = startOfMonth(new Date());

export function DatePickerCyclesDemo() {
  const [cancelAt, setCancelAt] = useState<Date>();

  return (
    <div className="flex flex-col items-start gap-4">
      <SingleDatePicker
        value={cancelAt}
        onChange={setCancelAt}
        placeholder="Cancel subscription on"
        minDate={subscriptionStart}
        showShortcuts
        shortcuts={[]}
        cycleConfig={{ startDate: subscriptionStart, durationMonths: 1 }}
        className="w-64"
      />
      <span className="text-muted-foreground text-sm">
        Result: <code className="text-foreground">{cancelAt ? format(cancelAt, 'yyyy-MM-dd HH:mm:ss') : '—'}</code>
      </span>
    </div>
  );
}
