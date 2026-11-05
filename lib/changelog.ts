export interface ChangelogEntry {
  /** ISO date, `YYYY-MM-DD`. */
  date: string;
  title: string;
  /** Registry items the entry touches. */
  items: string[];
  /** One sentence per change. Wrap code in backticks. Start a change that needs consumer edits with "Breaking:". */
  changes: string[];
}

/** Newest first. Rendered at /docs/changelog and linked from /llms.txt. */
export const changelog: ChangelogEntry[] = [
  {
    date: '2026-11-05',
    title: 'Date picker and form inputs',
    items: [
      '@dentil/date-picker',
      '@dentil/select-search',
      '@dentil/country-select',
      '@dentil/address-input',
      '@dentil/phone-input',
      '@dentil/currency-input',
      '@dentil/dob-input',
    ],
    changes: [
      '`@dentil/date-picker`: `DatePicker`, `SingleDatePicker` and `DateRangePicker`, with range presets, date shortcuts, billing cycles, min and max dates, an Apply step, and `Date` or unix timestamp values.',
      '`@dentil/select-search`: `SelectSearch`, a searchable single-select combobox.',
      '`@dentil/country-select`: `CountrySelect`, with ISO 3166-1 codes and names from `Intl.DisplayNames`.',
      '`@dentil/address-input`: `AddressInput`, with state lists for the US, Canada and Australia and a `regions` prop for any other country.',
      '`@dentil/phone-input`: `PhoneInput`, which returns E.164 numbers.',
      '`@dentil/currency-input`: `CurrencyInput`, which reads and writes minor units.',
      '`@dentil/dob-input`: `DOBInput`, which only emits real dates.',
    ],
  },
  {
    date: '2026-10-11',
    title: 'Initial release',
    items: [
      '@dentil/data-table',
      '@dentil/data-table-filter',
      '@dentil/data-table-url-state',
      '@dentil/modals',
      '@dentil/sheets',
    ],
    changes: [
      '`@dentil/data-table`: `DataTable` with row links, server-side sorting, offset or cursor pagination, tabs, column visibility, context menus, split view, expandable rows and cross-page selection.',
      '`@dentil/data-table-filter`: Linear-style filter bar adapted from bazza/ui. Ships its MIT license as `components/data-table/filter/LICENSE.md`.',
      '`@dentil/data-table-url-state`: `useTableQueryState`, which syncs the table query to the URL.',
      '`@dentil/modals`: promise-based modal registry with lazy-loaded contents and stacking.',
      '`@dentil/sheets`: the same registry for side sheets, plus minimize-to-dock and draft retention.',
      'Every item works with Radix styles (`new-york`, `radix-*`) and Base UI styles (`base-*`).',
    ],
  },
];
