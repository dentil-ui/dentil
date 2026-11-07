'use client';

import { useState } from 'react';

import { PhoneInput } from '@/components/dentil/phone-input/phone-input';

export function PhoneInputOverviewDemo() {
  const [phone, setPhone] = useState('');

  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      <PhoneInput value={phone} onChange={setPhone} defaultCountry="US" aria-label="Phone number" />
      <span className="text-muted-foreground text-sm">
        Result: <code className="text-foreground">{phone || '—'}</code>
      </span>
    </div>
  );
}
