'use client';

import * as React from 'react';
import { NumericFormat } from 'react-number-format';

import { InputGroup, InputGroupInput, InputGroupText } from '@/components/ui/input-group';
import { cn } from '@/lib/utils';

export interface DOB {
  day: number;
  month: number;
  year: number;
}

export interface DOBInputProps extends Omit<
  React.ComponentProps<'input'>,
  'value' | 'onChange' | 'type' | 'defaultValue' | 'ref' | 'size'
> {
  value: DOB | null | undefined;
  /** Called with the date once day, month and a four-digit year form a real date, and with `undefined` otherwise. */
  onChange: (value: DOB | undefined) => void;
}

/** The text in each field, so a leading zero survives while typing. */
type Parts = { day: string; month: string; year: string };

const pad = (n: number) => String(n).padStart(2, '0');

const toParts = (value: DOB | null | undefined): Parts =>
  value ? { day: pad(value.day), month: pad(value.month), year: String(value.year) } : { day: '', month: '', year: '' };

function toDob(parts: Parts): DOB | undefined {
  const day = Number.parseInt(parts.day, 10);
  const month = Number.parseInt(parts.month, 10);
  const year = Number.parseInt(parts.year, 10);
  if (!day || !month || !(year >= 1000)) return undefined;
  const date = new Date(year, month - 1, day);
  if (date.getMonth() !== month - 1 || date.getDate() !== day) return undefined;
  return { day, month, year };
}

const dobKey = (value: DOB | null | undefined) => (value ? `${value.year}-${value.month}-${value.day}` : '');

const segmentClassName = 'flex-none px-0 text-center tabular-nums';

export function DOBInput({ value, onChange, disabled = false, className, ...props }: DOBInputProps) {
  const [parts, setParts] = React.useState<Parts>(() => toParts(value));
  const [prevKey, setPrevKey] = React.useState(() => dobKey(value));
  const monthRef = React.useRef<HTMLInputElement>(null);
  const yearRef = React.useRef<HTMLInputElement>(null);

  const valueKey = dobKey(value);
  if (valueKey !== prevKey) {
    setPrevKey(valueKey);
    if (valueKey !== dobKey(toDob(parts))) setParts(toParts(value));
  }

  const update = (patch: Partial<Parts>) => {
    const next = { ...parts, ...patch };
    setParts(next);
    onChange(toDob(next));
  };

  const ariaInvalid = props['aria-invalid'];

  return (
    <InputGroup data-slot="dob-input" data-disabled={disabled} className={cn('w-fit px-1', className)}>
      <NumericFormat
        customInput={InputGroupInput}
        className={cn(segmentClassName, 'w-9')}
        placeholder="DD"
        aria-label="Day"
        inputMode="numeric"
        autoComplete="bday-day"
        decimalScale={0}
        allowLeadingZeros
        allowNegative={false}
        disabled={disabled}
        value={parts.day}
        isAllowed={({ floatValue }) => floatValue === undefined || floatValue <= 31}
        onValueChange={({ floatValue, formattedValue }, { source }) => {
          if (source !== 'event') return;
          update({ day: formattedValue });
          if (formattedValue.length === 2 || (formattedValue.length === 1 && (floatValue ?? 0) > 3)) {
            monthRef.current?.focus();
          }
        }}
        onFocus={(e) => e.target.select()}
        {...props}
      />
      <InputGroupText aria-hidden="true">/</InputGroupText>
      <NumericFormat
        customInput={InputGroupInput}
        getInputRef={monthRef}
        className={cn(segmentClassName, 'w-10')}
        placeholder="MM"
        aria-label="Month"
        aria-invalid={ariaInvalid}
        inputMode="numeric"
        autoComplete="bday-month"
        decimalScale={0}
        allowLeadingZeros
        allowNegative={false}
        disabled={disabled}
        value={parts.month}
        isAllowed={({ floatValue }) => floatValue === undefined || floatValue <= 12}
        onValueChange={({ floatValue, formattedValue }, { source }) => {
          if (source !== 'event') return;
          update({ month: formattedValue });
          if (formattedValue.length === 2 || (formattedValue.length === 1 && (floatValue ?? 0) > 1)) {
            yearRef.current?.focus();
          }
        }}
        onFocus={(e) => e.target.select()}
      />
      <InputGroupText aria-hidden="true">/</InputGroupText>
      <NumericFormat
        customInput={InputGroupInput}
        getInputRef={yearRef}
        className={cn(segmentClassName, 'w-14 md:w-12')}
        placeholder="YYYY"
        aria-label="Year"
        aria-invalid={ariaInvalid}
        inputMode="numeric"
        autoComplete="bday-year"
        decimalScale={0}
        allowLeadingZeros={false}
        allowNegative={false}
        disabled={disabled}
        value={parts.year}
        isAllowed={({ floatValue }) => floatValue === undefined || floatValue <= 9999}
        onValueChange={({ formattedValue }, { source }) => {
          if (source === 'event') update({ year: formattedValue });
        }}
        onFocus={(e) => e.target.select()}
      />
    </InputGroup>
  );
}
