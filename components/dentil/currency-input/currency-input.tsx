'use client';

import { ChevronDownIcon } from 'lucide-react';
import * as React from 'react';
import { NumericFormat } from 'react-number-format';

import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group';
import { cn } from '@/lib/utils';

import { SelectSearch } from '../select-search/select-search';

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
  /** Turns the currency code into a picker. Called with the new ISO 4217 code. */
  onCurrencyChange?: (currency: string) => void;
  /** Codes the picker offers. Defaults to every currency the browser supports. */
  currencies?: string[];
  /** Use a searchable popover for the picker instead of the native select. */
  searchable?: boolean;
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
  onCurrencyChange,
  currencies,
  searchable = false,
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
  const code = currency.toUpperCase();
  const picking = onCurrencyChange != null;
  const options = React.useMemo(() => {
    if (!picking) return [];
    const codes = (currencies ?? Intl.supportedValuesOf('currency')).map((c) => c.toUpperCase());
    return codes.includes(code) ? codes : [code, ...codes];
  }, [picking, currencies, code]);
  const factor = 10 ** digits;
  const toMinor = (amount: number | undefined) => (amount === undefined ? undefined : Math.round(amount * factor));

  const changeCurrency = (next: string) => {
    onCurrencyChange?.(next);
    const nextDigits = getCurrencyFormat(next, locale).digits;
    // Keep the displayed amount when the number of minor-unit digits changes (GBP 10.50 → JPY 11).
    if (typeof value === 'number' && nextDigits !== digits) onChange(Math.round(value * 10 ** (nextDigits - digits)));
  };

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
      {onCurrencyChange && searchable ? (
        <CurrencySearch
          value={code}
          options={options}
          locale={locale}
          disabled={disabled}
          onChange={changeCurrency}
        />
      ) : onCurrencyChange ? (
        <CurrencySelect
          value={code}
          options={options}
          locale={locale}
          disabled={disabled}
          onChange={changeCurrency}
        />
      ) : (
        <InputGroupAddon align="inline-end">
          <InputGroupText>{code}</InputGroupText>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}

interface CurrencySelectProps {
  value: string;
  options: string[];
  locale: string | undefined;
  disabled: boolean;
  onChange: (currency: string) => void;
}

function currencyNamer(locale: string | undefined) {
  const names = new Intl.DisplayNames(locale, { type: 'currency', fallback: 'code' });
  return (code: string) => {
    try {
      return names.of(code) ?? code;
    } catch {
      return code;
    }
  };
}

/** Every code stacked in one grid cell with only `value` visible, so the picker keeps the widest code's width. */
function CodeStack({ value, options }: { value: string; options: string[] }) {
  return (
    <span className="grid justify-items-start">
      {options.map((c) => (
        <span key={c} className={cn('[grid-area:1/1]', c !== value && 'invisible')}>
          {c}
        </span>
      ))}
    </span>
  );
}

function CurrencySearch({ value, options, locale, disabled, onChange }: CurrencySelectProps) {
  const nameOf = currencyNamer(locale);
  const selectOptions = React.useMemo(() => {
    const name = currencyNamer(locale);
    return options.map((c) => ({
      value: c,
      label: c,
      description: name(c),
      labelClassName: 'w-[3ch] font-mono',
    }));
  }, [options, locale]);

  return (
    <SelectSearch
      data-slot="currency-input-select"
      data-align="inline-end"
      aria-label={`Currency: ${nameOf(value)}`}
      options={selectOptions}
      value={value}
      onChange={(next) => {
        if (next) onChange(next);
      }}
      disabled={disabled}
      searchPlaceholder="Search currencies..."
      emptyText="No currency found."
      align="end"
      contentClassName="min-w-72"
      renderValue={() => <CodeStack value={value} options={options} />}
      className="text-muted-foreground hover:text-muted-foreground focus-visible:bg-accent order-last h-full w-auto gap-1 rounded-l-none rounded-r-md border-0 border-l bg-transparent font-medium shadow-none group-data-[disabled=true]/input-group:opacity-50 focus-visible:border-border focus-visible:ring-0 has-[>svg]:ps-2.5 has-[>svg]:pe-2 dark:border-border dark:bg-transparent dark:hover:bg-accent"
    />
  );
}

function CurrencySelect({ value, options, locale, disabled, onChange }: CurrencySelectProps) {
  const nameOf = currencyNamer(locale);

  // Not an InputGroupAddon: its click handler focuses the input, which would close the native picker.
  return (
    <div
      data-slot="currency-input-select"
      data-align="inline-end"
      className="text-muted-foreground hover:bg-accent has-focus-visible:bg-accent relative order-last flex h-full shrink-0 items-center gap-1 rounded-r-md border-l ps-2.5 pe-2 text-sm font-medium transition-colors select-none has-disabled:pointer-events-none group-data-[disabled=true]/input-group:opacity-50">
      <CodeStack value={value} options={options} />
      <ChevronDownIcon className="size-4 opacity-50" aria-hidden="true" />
      <select
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 text-sm opacity-0"
        aria-label="Currency">
        {options.map((c) => (
          <option key={c} value={c}>
            {c} – {nameOf(c)}
          </option>
        ))}
      </select>
    </div>
  );
}
