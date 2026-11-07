'use client';

import { useState } from 'react';

import { DOBInput, type DOB } from '@/components/dentil/dob-input/dob-input';

export function DobInputOverviewDemo() {
  const [dob, setDob] = useState<DOB>();

  return (
    <div className="flex flex-col items-start gap-4">
      <DOBInput value={dob} onChange={setDob} />
      <span className="text-muted-foreground text-sm">
        Result: <code className="text-foreground">{dob ? JSON.stringify(dob) : 'undefined'}</code>
      </span>
    </div>
  );
}
