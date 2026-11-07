'use client';

import { format } from 'date-fns';
import { useState } from 'react';

import { DateRangePicker } from '@/components/dentil/date-picker/date-picker';

export function DatePickerOverviewDemo() {
  const [period, setPeriod] = useState<{ start: Date | undefined; end: Date | undefined }>();

  return (
    <div className="flex flex-col items-start gap-4">
      <DateRangePicker value={period} onChange={setPeriod} showQuickSelect className="w-72" />
      <span className="text-muted-foreground text-sm">
        Result:{' '}
        <code className="text-foreground">
          {period?.start && period.end
            ? `${format(period.start, 'yyyy-MM-dd HH:mm')} → ${format(period.end, 'yyyy-MM-dd HH:mm')}`
            : '—'}
        </code>
      </span>
    </div>
  );
}
