'use client';

import { useState } from 'react';

import { CurrencyInput } from '@/components/dentil/currency-input/currency-input';

export function CurrencyInputOverviewDemo() {
  const [refund, setRefund] = useState<number | undefined>(2500);
  const [fee, setFee] = useState<number>();
  const [feeCurrency, setFeeCurrency] = useState('JPY');

  return (
    <div className="grid w-full max-w-xl gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-2">
        <CurrencyInput currency="GBP" value={refund} onChange={setRefund} maxAmount={12000} aria-label="Refund" />
        <span className="text-muted-foreground text-sm">
          Result: <code className="text-foreground">{refund ?? '—'}</code> (max 12000)
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <CurrencyInput
          currency={feeCurrency}
          onCurrencyChange={setFeeCurrency}
          currencies={['GBP', 'USD', 'EUR', 'JPY']}
          value={fee}
          onChange={setFee}
          aria-label="Fee"
        />
        <span className="text-muted-foreground text-sm">
          Result: <code className="text-foreground">{fee ?? '—'}</code> {feeCurrency}
        </span>
      </div>
    </div>
  );
}
