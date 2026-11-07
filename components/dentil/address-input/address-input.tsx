'use client';

import * as React from 'react';

import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { cn } from '@/lib/utils';

import { CountrySelect, type CountrySelectProps } from '../country-select/country-select';
import { defaultRegions, type RegionList } from './regions';

export interface Address {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  /** A region code from the country's list (e.g. `'CA'` for California), or free text for other countries. */
  state?: string | null;
  postal_code?: string | null;
  /** ISO 3166-1 alpha-2 code. */
  country?: string | null;
}

type AddressField = keyof Address;

export interface AddressInputProps extends Omit<CountrySelectProps, 'value' | 'onChange' | 'disabled' | 'placeholder'> {
  value: Address | null | undefined;
  /** Called with only the non-empty fields, or `undefined` when every field is empty. */
  onChange: (value: Address | undefined) => void;
  disabled?: boolean;
  error?: string;
  /** When false, the country is fixed to `value.country` or `defaultCountry`. */
  allowCountryChange?: boolean;
  defaultCountry?: string;
  /** Region lists by country code, merged over the built-in US, CA and AU lists. */
  regions?: Record<string, RegionList>;
  /** Countries that never show a region field. Countries without a list get a free-text field. */
  hideStateFor?: string[];
  placeholders?: Partial<Record<AddressField, string>>;
}

const FIELDS: AddressField[] = ['line1', 'line2', 'city', 'state', 'postal_code', 'country'];

const defaultPlaceholders: Record<AddressField, string> = {
  line1: 'Address line 1',
  line2: 'Address line 2 (optional)',
  city: 'City',
  state: 'Region (optional)',
  postal_code: 'Postal code',
  country: 'Select a country...',
};

function toOutput(address: Address, showState: boolean): Address | undefined {
  const result: Address = {};
  for (const field of FIELDS) {
    const value = address[field];
    if (field === 'state' && !showState) continue;
    if (value !== null && value !== undefined && value !== '') result[field] = value;
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

export function AddressInput({
  value,
  onChange,
  disabled = false,
  error,
  allowCountryChange = true,
  defaultCountry,
  regions: regionsProp,
  hideStateFor = ['GB'],
  placeholders: placeholdersProp,
  className,
  ...props
}: AddressInputProps) {
  const errorId = React.useId();
  const regions = regionsProp ? { ...defaultRegions, ...regionsProp } : defaultRegions;
  const placeholders = { ...defaultPlaceholders, ...placeholdersProp };

  const address: Address = { ...value, country: value?.country ?? defaultCountry ?? null };
  const country = address.country;
  const regionList = country ? regions[country] : undefined;
  const showState = !!country && !hideStateFor.includes(country);

  const handleCountryChange = (next: string) => {
    onChange(toOutput({ country: next }, false));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const field = e.target.name as AddressField;
    onChange(toOutput({ ...address, [field]: e.target.value }, showState));
  };

  const fieldProps = (field: AddressField) => ({
    name: field,
    value: address[field] ?? '',
    onChange: handleChange,
    disabled,
    'aria-label': placeholders[field],
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errorId : undefined,
  });

  return (
    <div data-slot="address-input" className={cn('flex flex-col gap-2', className)}>
      <CountrySelect
        value={country}
        onChange={handleCountryChange}
        disabled={disabled || !allowCountryChange}
        placeholder={placeholders.country}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />

      {country && (
        <>
          <Input {...fieldProps('line1')} placeholder={placeholders.line1} autoComplete="address-line1" />
          <Input {...fieldProps('line2')} placeholder={placeholders.line2} autoComplete="address-line2" />
          <Input {...fieldProps('city')} placeholder={placeholders.city} autoComplete="address-level2" />
          {showState &&
            (regionList ? (
              <div className="*:data-[slot=native-select-wrapper]:w-full">
                <NativeSelect {...fieldProps('state')} aria-label={regionList.label} autoComplete="address-level1">
                  <NativeSelectOption value="" disabled>
                    {regionList.label}
                  </NativeSelectOption>
                  {regionList.regions.map((region) => (
                    <NativeSelectOption key={region.code} value={region.code}>
                      {region.name}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
            ) : (
              <Input {...fieldProps('state')} placeholder={placeholders.state} autoComplete="address-level1" />
            ))}
          <Input {...fieldProps('postal_code')} placeholder={placeholders.postal_code} autoComplete="postal-code" />
        </>
      )}

      {error && (
        <p id={errorId} className="text-destructive text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
