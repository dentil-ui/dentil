'use client';

import { useState } from 'react';

import { CountrySelect } from '@/components/country-select/country-select';

export function CountrySelectOverviewDemo() {
  const [country, setCountry] = useState('');
  const [shipsTo, setShipsTo] = useState('');

  return (
    <div className="grid w-full max-w-xl gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-2">
        <CountrySelect value={country} onChange={setCountry} />
        <span className="text-muted-foreground text-sm">
          Result: <code className="text-foreground">{country || '—'}</code>
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <CountrySelect
          value={shipsTo}
          onChange={setShipsTo}
          allowedCountries={['GB', 'IE', 'FR', 'DE', 'NL', 'ES']}
          locale="de"
          placeholder="Lieferland"
        />
        <span className="text-muted-foreground text-sm">
          Result: <code className="text-foreground">{shipsTo || '—'}</code>
        </span>
      </div>
    </div>
  );
}
