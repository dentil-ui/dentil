'use client';

import { useState } from 'react';

import { CurrencyInput } from '@/components/currency-input/currency-input';

export function CurrencyInputSearchableDemo() {
  const [amount, setAmount] = useState<number | undefined>(4999);
  const [currency, setCurrency] = useState('USD');

  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <CurrencyInput
        currency={currency}
        onCurrencyChange={setCurrency}
        searchable
        value={amount}
        onChange={setAmount}
        aria-label="Price"
      />
      <span className="text-muted-foreground text-sm">
        Result: <code className="text-foreground">{amount ?? '—'}</code> {currency}
      </span>
    </div>
  );
}
