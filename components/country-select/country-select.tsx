'use client';

import * as React from 'react';

import { SelectSearch, type SelectSearchProps } from '../select-search/select-search';
import { getCountries } from './countries';

export interface CountrySelectProps extends Omit<SelectSearchProps, 'options' | 'value' | 'onChange'> {
  /** ISO 3166-1 alpha-2 code, e.g. `'GB'`. */
  value: string | null | undefined;
  onChange: (value: string) => void;
  /** Only list these codes. Lists every country when omitted. */
  allowedCountries?: string[];
  /** Locale for country names. */
  locale?: string;
}

export function CountrySelect({
  value,
  onChange,
  allowedCountries,
  locale = 'en',
  placeholder = 'Select a country...',
  searchPlaceholder = 'Search countries...',
  emptyText = 'No country found.',
  ...props
}: CountrySelectProps) {
  const options = React.useMemo(
    () =>
      getCountries(locale)
        .filter((country) => !allowedCountries || allowedCountries.includes(country.code))
        .map((country) => ({ label: country.name, value: country.code })),
    [locale, allowedCountries]
  );

  return (
    <SelectSearch
      data-slot="country-select"
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      emptyText={emptyText}
      {...props}
    />
  );
}
