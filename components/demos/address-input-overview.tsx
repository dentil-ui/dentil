'use client';

import { useState } from 'react';

import { AddressInput, type Address } from '@/components/address-input/address-input';

export function AddressInputOverviewDemo() {
  const [address, setAddress] = useState<Address | undefined>({
    line1: '1 Market St',
    city: 'San Francisco',
    state: 'CA',
    postal_code: '94105',
    country: 'US',
  });

  return (
    <div className="grid w-full max-w-2xl gap-6 md:grid-cols-2">
      <AddressInput value={address} onChange={setAddress} />
      <pre className="bg-muted text-foreground overflow-x-auto rounded-md p-3 font-mono text-xs">
        {JSON.stringify(address ?? null, null, 2)}
      </pre>
    </div>
  );
}
