'use client';

import { ChevronDownIcon, PhoneIcon } from 'lucide-react';
import * as React from 'react';
import * as RPNInput from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type PhoneCountry = RPNInput.Country;

export interface PhoneInputProps extends Omit<
  React.ComponentProps<'input'>,
  'value' | 'onChange' | 'type' | 'defaultValue' | 'ref'
> {
  /** E.164 number, e.g. `'+447700900123'`. */
  value: string | null | undefined;
  /** Called with the E.164 number, or `''` when the field is cleared. */
  onChange: (value: string) => void;
  /** Country preselected while the field is empty. */
  defaultCountry?: PhoneCountry;
  /** Only list these countries. */
  countries?: PhoneCountry[];
}

export function PhoneInput({
  className,
  defaultCountry,
  countries,
  disabled,
  value,
  onChange,
  placeholder = 'Enter phone number',
  ...props
}: PhoneInputProps) {
  return (
    <RPNInput.default
      containerComponentProps={{ 'data-slot': 'phone-input' }}
      className={cn(
        'border-input dark:bg-input/30 flex h-9 w-full rounded-md border shadow-xs transition-[color,box-shadow]',
        'has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-ring/50 has-[input:focus-visible]:ring-[3px]',
        'has-[[aria-invalid=true]]:border-destructive has-[[aria-invalid=true]]:ring-destructive/20 dark:has-[[aria-invalid=true]]:ring-destructive/40',
        'has-disabled:opacity-50',
        className
      )}
      dir="ltr"
      international
      flagComponent={Flag}
      countrySelectComponent={CountrySelect}
      inputComponent={PhoneNumberInput}
      countries={countries}
      defaultCountry={defaultCountry}
      placeholder={placeholder}
      disabled={disabled}
      value={value ?? undefined}
      onChange={(next) => onChange(next ?? '')}
      {...props}
    />
  );
}

function PhoneNumberInput({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <Input
      className={cn(
        'h-full flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent',
        className
      )}
      {...props}
    />
  );
}

interface CountrySelectProps {
  disabled?: boolean;
  value: PhoneCountry | undefined;
  onChange: (value: PhoneCountry | undefined) => void;
  options: { label: string; value: PhoneCountry | undefined }[];
}

function CountrySelect({ disabled, value, onChange, options }: CountrySelectProps) {
  return (
    <div className="text-muted-foreground hover:bg-accent has-focus-visible:bg-accent relative inline-flex shrink-0 items-center gap-1 rounded-l-md border-r ps-3 pe-2 transition-colors has-disabled:pointer-events-none">
      <Flag country={value} countryName={value ?? ''} />
      <ChevronDownIcon className="size-4 opacity-50" aria-hidden="true" />
      <select
        disabled={disabled}
        value={value ?? ''}
        onChange={(e) => onChange((e.target.value || undefined) as PhoneCountry | undefined)}
        className="absolute inset-0 text-sm opacity-0"
        aria-label="Country">
        <option value="">Select a country</option>
        {options
          .filter((option): option is { label: string; value: PhoneCountry } => !!option.value)
          .map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} +{RPNInput.getCountryCallingCode(option.value)}
            </option>
          ))}
      </select>
    </div>
  );
}

function Flag({ country, countryName }: { country: PhoneCountry | undefined; countryName: string }) {
  const FlagSvg = country ? flags[country] : undefined;

  return (
    <span className="flex h-3.5 w-5 items-center justify-center overflow-hidden rounded-[2px]" aria-hidden="true">
      {FlagSvg ? <FlagSvg title={countryName} /> : <PhoneIcon className="size-4" />}
    </span>
  );
}
