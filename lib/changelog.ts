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
    date: '2026-11-07',
    title: 'Install into components/dentil',
    items: ['@dentil/*'],
    changes: [
      'Breaking: every item now installs into `components/dentil/<item>/` instead of `components/<item>/`, so imports become `@/components/dentil/<item>/…`. Existing installs keep working where they are. Re-adding an item writes a fresh copy to the new folder, so move any edits (such as your `modals/registry.tsx` and `sheets/registry.tsx` entries) across and delete the old folder.',
    ],
  },
  {
    date: '2026-11-07',
    title: 'Column alignment',
    items: ['@dentil/data-table'],
    changes: [
      "`@dentil/data-table`: column `meta.verticalAlign` (`'top' | 'middle' | 'bottom'`) sets where cells sit when the row is taller than them. The default is `'middle'`, as before.",
      "`@dentil/data-table`: column `meta.align` also takes `'center'`.",
    ],
  },
  {
    date: '2026-11-07',
    title: 'Data table without a toolbar',
    items: ['@dentil/data-table'],
    changes: [
      '`@dentil/data-table`: with no `toolbar`, `toolbarActions`, `showDisplay` or `tabs`, the table no longer draws a border above its header.',
    ],
  },
  {
    date: '2026-11-07',
    title: 'Date hover on Base UI',
    items: ['@dentil/date'],
    changes: [
      '`@dentil/date`: `hover` now opens a `HoverCard` instead of a `Popover`, so it builds on Base UI styles and hovering never moves focus. Now depends on `hover-card`.',
    ],
  },
  {
    date: '2026-11-07',
    title: 'Currency picker',
    items: ['@dentil/currency-input', '@dentil/select-search'],
    changes: [
      '`@dentil/currency-input`: `onCurrencyChange` turns the currency code into a picker, and `currencies` limits its list. `searchable` opens it as a `SelectSearch` popover filtered by code or name. Switching to a currency with different decimal places keeps the amount on screen and emits it in the new minor units. Now depends on `lucide-react` and `@dentil/select-search`.',
      '`@dentil/select-search`: an option `icon` can be a component, such as a Lucide icon, or any React node. It is shown before the label in the list and on the trigger.',
      '`@dentil/select-search`: options take a `description`, shown muted in the list and matched by search. `renderValue` replaces the trigger content, and `align` and `contentClassName` position and size the popover.',
      '`@dentil/currency-input`: in the searchable list, each currency code sits in a fixed-width column so the names line up.',
    ],
  },
  {
    date: '2026-11-07',
    title: 'Date popover hover and placement',
    items: ['@dentil/date'],
    changes: [
      '`@dentil/date`: `hover` opens the time-zone popover on hover and keeps it open while the pointer is over the popover. `side` and `align` set where it opens.',
    ],
  },
  {
    date: '2026-11-07',
    title: 'Date',
    items: ['@dentil/date'],
    changes: [
      '`@dentil/date`: `Date`, a compact date formatted in a time zone you supply, from unix seconds, milliseconds, an ISO string or a `Date`. `showTimezone` underlines the date and opens a popover with that zone and the UTC time. `formatDate` and `toDate` parse the same values.',
    ],
  },
  {
    date: '2026-11-07',
    title: 'Invoice table',
    items: ['@dentil/invoice-table'],
    changes: [
      '`@dentil/invoice-table`: `InvoiceTable`, an invoice line items table with optional quantity, unit price and tax columns, a totals footer, and an optional per-line allocation column for credit notes and part payments.',
    ],
  },
  {
    date: '2026-11-07',
    title: 'Async select',
    items: ['@dentil/async-select'],
    changes: [
      '`@dentil/async-select`: `AsyncSelect`, a searchable combobox that loads options from an async fetcher, with debounced search, preloading and custom option rendering.',
    ],
  },
  {
    date: '2026-11-07',
    title: 'Object timeline',
    items: ['@dentil/object-timeline'],
    changes: [
      '`@dentil/object-timeline`: `ObjectTimeline`, a vertical event list with an icon, title, description, date and an optional action on the title.',
    ],
  },
  {
    date: '2026-11-07',
    title: 'Color picker',
    items: ['@dentil/color-picker'],
    changes: [
      '`@dentil/color-picker`: `ColorPicker`, a hex color input that reads and writes a 6-digit hex, with a swatch that opens a saturation and hue picker. With no valid hex, the picker opens on a random color.',
    ],
  },
  {
    date: '2026-11-07',
    title: 'Switch label',
    items: ['@dentil/switch-label'],
    changes: [
      '`@dentil/switch-label`: `SwitchLabel`, a switch with a clickable label and an optional description aligned to the control or the label text.',
    ],
  },
  {
    date: '2026-11-06',
    title: 'Preferred countries and flags',
    items: ['@dentil/country-select', '@dentil/select-search'],
    changes: [
      '`@dentil/country-select`: `preferredCountries` lists those ISO codes first, ahead of the alphabetical list.',
      '`@dentil/country-select`: `showFlags` draws a flag beside each country, in the list and on the trigger.',
      '`@dentil/select-search`: `groups` renders options in groups with a separator between them. The separator hides while searching.',
      '`@dentil/select-search`: an option `icon` is shown before the label.',
    ],
  },
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
