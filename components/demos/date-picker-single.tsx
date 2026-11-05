'use client';

import { addDays, format } from 'date-fns';
import { useState } from 'react';

import { SingleDatePicker } from '@/components/date-picker/date-picker';

export function DatePickerSingleDemo() {
  const [dueDate, setDueDate] = useState<Date>();
  const today = new Date();

  return (
    <div className="flex flex-col items-start gap-4">
      <SingleDatePicker
        value={dueDate}
        onChange={setDueDate}
        placeholder="Due date"
        minDate={today}
        maxDate={addDays(today, 90)}
        showShortcuts
        className="w-60"
      />
      <span className="text-muted-foreground text-sm">
        Result: <code className="text-foreground">{dueDate ? format(dueDate, 'yyyy-MM-dd') : '—'}</code>
      </span>
    </div>
  );
}
