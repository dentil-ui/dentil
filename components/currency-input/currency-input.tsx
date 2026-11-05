'use client';

import * as React from 'react';
import { NumericFormat } from 'react-number-format';

import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group';
import { cn } from '@/lib/utils';

export interface CurrencyInputProps extends Omit<
  React.ComponentProps<'input'>,
  'value' | 'onChange' | 'type' | 'defaultValue' | 'ref' | 'size' | 'prefix' | 'max'
> {
  /** ISO 4217 code, e.g. `'GBP'`. */
  currency: string;
  /** Amount in minor units (pence, cents). `1050` is £10.50. */
  value: number | null | undefined;
  /** Called with the amount in minor units, or `undefined` when the field is empty. */
  onChange: (value: number | undefined) => void;
  /** Largest allowed amount, in minor units. Larger input is clamped to it. */
  maxAmount?: number;
  allowNegative?: boolean;
  /** Locale for the currency symbol. */
  locale?: string;
  inputClassName?: string;
}

/** The narrow symbol (`£`, `$`) and minor-unit digits for a currency. Unknown codes fall back to the code and 2 digits. */
export function getCurrencyFormat(currency: string, locale?: string) {
  try {
    const format = new Intl.NumberFormat(locale, { style: 'currency', currency, currencyDisplay: 'narrowSymbol' });
    const symbol = format.formatToParts(0).find((part) => part.type === 'currency')?.value ?? currency;
    return { symbol, digits: format.resolvedOptions().maximumFractionDigits ?? 2 };
  } catch {
    return { symbol: currency.toUpperCase(), digits: 2 };
  }
}

export function CurrencyInput({
  currency,
  value,
  onChange,
  maxAmount,
  allowNegative = false,
  locale,
  disabled = false,
  className,
  inputClassName,
  placeholder,
  onFocus,
  ...props
}: CurrencyInputProps) {
  const { symbol, digits } = getCurrencyFormat(currency, locale);
  const factor = 10 ** digits;
  const toMinor = (amount: number | undefined) => (amount === undefined ? undefined : Math.round(amount * factor));

  return (
    <InputGroup data-slot="currency-input" data-disabled={disabled} className={className}>
      <InputGroupAddon>
        <InputGroupText>{symbol}</InputGroupText>
      </InputGroupAddon>
      <NumericFormat
        customInput={InputGroupInput}
        className={cn('tabular-nums', inputClassName)}
        placeholder={placeholder ?? (0).toFixed(digits)}
        inputMode="decimal"
        autoComplete="off"
        thousandSeparator
        decimalScale={digits}
        fixedDecimalScale
        allowLeadingZeros={false}
        allowNegative={allowNegative}
        disabled={disabled}
        value={typeof value === 'number' ? value / factor : ''}
        onValueChange={(values, { source }) => {
          if (source !== 'event') return;
          const next = toMinor(values.floatValue);
          onChange(next !== undefined && maxAmount !== undefined ? Math.min(next, maxAmount) : next);
        }}
        isAllowed={(values) => {
          const next = toMinor(values.floatValue);
          if (maxAmount === undefined || next === undefined || next <= maxAmount) return true;
          onChange(maxAmount);
          return false;
        }}
        onFocus={(e) => {
          e.target.select();
          onFocus?.(e);
        }}
        {...props}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupText>{currency.toUpperCase()}</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  );
}
