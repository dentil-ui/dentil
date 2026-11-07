'use client';

import * as flagIcons from 'country-flag-icons/react/3x2';
import * as React from 'react';

import { SelectSearch, type SelectSearchOption, type SelectSearchProps } from '../select-search/select-search';
import { getCountries, type Country } from './countries';

type FlagIcon = (props: { title?: string; className?: string }) => React.JSX.Element;

const flags = flagIcons as Record<string, FlagIcon>;

function CountryFlag({ code, name }: { code: string; name: string }) {
  const Flag = flags[code];
  return (
    <span className="flex h-3.5 w-5 shrink-0 overflow-hidden rounded-[2px]" aria-hidden="true">
      {Flag ? <Flag title={name} className="size-full" /> : <span className="bg-muted size-full" />}
    </span>
  );
}

export interface CountrySelectProps extends Omit<SelectSearchProps, 'options' | 'value' | 'onChange' | 'groups'> {
  /** ISO 3166-1 alpha-2 code, e.g. `'GB'`. */
  value: string | null | undefined;
  onChange: (value: string) => void;
  /** Only list these codes. Lists every country when omitted. */
  allowedCountries?: string[];
  /** ISO codes listed first, in this order, ahead of the alphabetical list. */
  preferredCountries?: string[];
  /** Draw a flag beside each country, in the list and on the trigger. */
  showFlags?: boolean;
  /** Locale for country names. */
  locale?: string;
}

function partitionCountries(countries: Country[], preferredCountries?: string[]) {
  const rank = new Map<string, number>();
  for (const code of preferredCountries ?? []) {
    const key = code.toUpperCase();
    if (!rank.has(key)) rank.set(key, rank.size);
  }
  if (rank.size === 0) return { preferred: [], rest: countries };

  const preferred: Country[] = [];
  const rest: Country[] = [];
  for (const country of countries) {
    if (rank.has(country.code)) preferred.push(country);
    else rest.push(country);
  }
  preferred.sort((a, b) => (rank.get(a.code) ?? 0) - (rank.get(b.code) ?? 0));
  return { preferred, rest };
}

export function CountrySelect({
  value,
  onChange,
  allowedCountries,
  preferredCountries,
  showFlags = false,
  locale = 'en',
  placeholder = 'Select a country...',
  searchPlaceholder = 'Search countries...',
  emptyText = 'No country found.',
  ...props
}: CountrySelectProps) {
  const { options, groups } = React.useMemo(() => {
    const countries = getCountries(locale).filter(
      (country) => !allowedCountries || allowedCountries.includes(country.code)
    );
    const { preferred, rest } = partitionCountries(countries, preferredCountries);
    const toOption = (country: Country): SelectSearchOption => ({
      label: country.name,
      value: country.code,
      icon: showFlags ? <CountryFlag code={country.code} name={country.name} /> : undefined,
    });
    const preferredOptions = preferred.map(toOption);
    const restOptions = rest.map(toOption);
    return {
      options: [...preferredOptions, ...restOptions],
      groups: preferredOptions.length > 0 && restOptions.length > 0 ? [preferredOptions, restOptions] : undefined,
    };
  }, [locale, allowedCountries, preferredCountries, showFlags]);

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
      groups={groups}
    />
  );
}
