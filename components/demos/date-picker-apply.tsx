'use client';

import { format } from 'date-fns';
import { useState } from 'react';

import { DateRangePicker } from '@/components/date-picker/date-picker';

export function DatePickerApplyDemo() {
  const [period, setPeriod] = useState<{ start: Date | undefined; end: Date | undefined }>();
  const [applied, setApplied] = useState(0);

  return (
    <div className="flex flex-col items-start gap-4">
      <DateRangePicker
        value={period}
        onChange={(next) => {
          setPeriod(next);
          setApplied((count) => count + 1);
        }}
        showQuickSelect
        showApplyButton
        className="w-72"
      />
      <span className="text-muted-foreground text-sm">
        onChange calls: <code className="text-foreground">{applied}</code>
        {period?.start && period.end && (
          <>
            {' '}
            ·{' '}
            <code className="text-foreground">{`${format(period.start, 'd MMM')} → ${format(period.end, 'd MMM')}`}</code>
          </>
        )}
      </span>
    </div>
  );
}
