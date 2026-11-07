---
name: dentil
description: Installs and uses dentil, a shadcn/ui registry of server-driven data tables, promise-based modals and side sheets, a date display, a date picker, an object timeline, an invoice table and form inputs. Use when the user mentions dentil or @dentil, or wants a data table with server-side filters, sorting and pagination, modals and sheets opened with `await openModal(...)` or `await openSheet(...)`, a date formatted in a time zone, a date or date range picker, an event timeline, an invoice line items table with totals or credit note allocation, an async combobox, or country, address, phone, currency, date of birth, color or labeled switch inputs.
---

# dentil

[dentil]({{SITE_URL}}) is a shadcn/ui registry. The shadcn CLI copies its components into the project, so the project owns the code, and they build on its existing shadcn/ui primitives and theme (including dark mode).

| Item                           | Adds                                                                                                     | Docs                                   |
| ------------------------------ | -------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `@dentil/data-table`           | Server-driven TanStack table: row links, sorting, pagination, tabs, context menus, split view, selection | {{SITE_URL}}/docs/data-table           |
| `@dentil/data-table-filter`    | Linear-style filter bar for the table                                                                    | {{SITE_URL}}/docs/data-table#filters   |
| `@dentil/data-table-url-state` | `useTableQueryState`, which mirrors the table query to the URL                                           | {{SITE_URL}}/docs/data-table#url-state |
| `@dentil/modals`               | Typed modal registry: `await openModal(key, props)`, lazy contents, stacking                             | {{SITE_URL}}/docs/modals               |
| `@dentil/sheets`               | Typed side-sheet registry with stacking, minimize-to-dock and drafts                                     | {{SITE_URL}}/docs/sheets               |
| `@dentil/date-picker`          | Single-date and range picker with presets, shortcuts, billing cycles and an Apply step                   | {{SITE_URL}}/docs/date-picker          |
| `@dentil/date`                 | Compact date formatted in a time zone you supply, from unix, ISO or Date                                 | {{SITE_URL}}/docs/date                 |
| `@dentil/object-timeline`      | Vertical event list with an icon, title, description, date and an optional action                        | {{SITE_URL}}/docs/object-timeline      |
| `@dentil/invoice-table`        | Invoice line items with a totals footer and an optional per-line allocation column                       | {{SITE_URL}}/docs/invoice-table        |
| `@dentil/select-search`        | Searchable single-select combobox                                                                        | {{SITE_URL}}/docs/select-search        |
| `@dentil/async-select`         | Async combobox that loads options as you type, with preload and custom rendering                         | {{SITE_URL}}/docs/async-select         |
| `@dentil/country-select`       | Searchable country picker (ISO codes, localized names, optional flags)                                   | {{SITE_URL}}/docs/country-select       |
| `@dentil/address-input`        | Postal address fields with US, CA and AU state lists                                                     | {{SITE_URL}}/docs/address-input        |
| `@dentil/phone-input`          | International phone input that returns E.164 numbers                                                     | {{SITE_URL}}/docs/phone-input          |
| `@dentil/currency-input`       | Money input in minor units                                                                               | {{SITE_URL}}/docs/currency-input       |
| `@dentil/dob-input`            | DD / MM / YYYY date of birth fields                                                                      | {{SITE_URL}}/docs/dob-input            |
| `@dentil/switch-label`         | Labeled switch with an optional description                                                              | {{SITE_URL}}/docs/switch-label         |
| `@dentil/color-picker`         | Hex color input with a saturation and hue picker                                                         | {{SITE_URL}}/docs/color-picker         |

Install only what the user needs. If it's unclear which items they want, ask.

## 1. Check the project

- `components.json` must exist. If it doesn't, run `shadcn@latest init` first, and ask the user before choosing a style or base colour.
- dentil requires React 19 and Tailwind CSS v4. Any shadcn style works, Radix (`new-york`, `radix-*`) or Base UI (`base-*`). If the project uses React 18 or Tailwind v3, stop and tell the user rather than upgrading anything.
- Use the project's package manager, which you can tell from its lockfile: `pnpm dlx`, `npx`, `yarn dlx` or `bunx --bun`. The examples below use `npx`.
- Imports below use the `@/components` alias. Match whatever `aliases` in `components.json` says.

## 2. Install

dentil is in the shadcn registry directory, so the CLI resolves `@dentil` names without any `components.json` changes:

```bash
npx shadcn@latest add @dentil/modals @dentil/sheets @dentil/data-table
```

If the CLI says it can't find the `@dentil` registry, merge this into `components.json`, keeping any existing keys and registries, and run the command again:

```json
{
  "registries": {
    "@dentil": "{{SITE_URL}}/r/{name}.json"
  }
}
```

The CLI installs any missing stock shadcn/ui components and npm packages. If it asks to overwrite an existing file in `components/ui`, answer no unless the user agrees: dentil works with the stock versions. Files land in `components/dentil/<item>/`, e.g. `components/dentil/modals/`, `components/dentil/data-table/` or `components/dentil/date-picker/`.

The date display, date picker, object timeline, invoice table and form inputs need no provider, so skip step 3 if those are all the user wants.

## 3. Mount the providers once

In the root layout (`app/layout.tsx` in Next.js, or the app's root component). The providers are client components, so a server layout can render them. Put `SheetProvider` inside `ModalProvider` so sheets can open modals.

```tsx
import { ModalProvider } from '@/components/dentil/modals';
import { SheetProvider } from '@/components/dentil/sheets';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ModalProvider>
          <SheetProvider>{children}</SheetProvider>
        </ModalProvider>
      </body>
    </html>
  );
}
```

For the data table, wrap the app once in `DataTableRouter` so row links and prefetching use the app's router. With no router provider, rows render a plain `<a>`.

```tsx
// components/table-router.tsx (Next.js)
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { DataTableRouter } from '@/components/dentil/data-table/router';

export function TableRouter({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <DataTableRouter linkComponent={Link} onNavigate={router.push} onPrefetch={router.prefetch}>
      {children}
    </DataTableRouter>
  );
}
```

For React Router, adapt its `Link` once with `DataTableLinkProps` from `@/components/dentil/data-table/types`: `const RouterLink = ({ href, ...props }: DataTableLinkProps) => <Link to={href} {...props} />`, then pass `linkComponent={RouterLink} onNavigate={useNavigate()}`.

## 4. Use them

### Modals

A `confirm` modal ships with the registry. Call `useModal` from any client component, including inside another modal.

```tsx
const { openModal } = useModal();

const confirmed = await openModal('confirm', {
  title: 'Delete webhook?',
  description: 'This action cannot be undone.',
  confirmLabel: 'Delete',
  destructive: true,
  onConfirm: () => deleteWebhook(id), // a thrown error shows inline and keeps the modal open
});
if (confirmed) toast('Webhook deleted');
```

To add a modal, write a content file and register it with one line:

```tsx
// components/dentil/modals/contents/rename.tsx
'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import type { ModalContentProps } from '../types';

type RenameModalProps = ModalContentProps<{ name: string }> & { name: string };

export default function RenameModal({ name: initial, close }: RenameModalProps) {
  const [name, setName] = useState(initial);
  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        close({ name });
      }}>
      <DialogHeader>
        <DialogTitle>Rename</DialogTitle>
      </DialogHeader>
      <Input value={name} onChange={(event) => setName(event.target.value)} autoFocus />
      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => close()}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  );
}
```

```tsx
// components/dentil/modals/registry.tsx
const modalLoaders = {
  confirm: () => import('./contents/confirm'),
  rename: () => import('./contents/rename'),
} as const;

// Anywhere: props and the result are typed from the loader.
const result = await openModal('rename', { name: 'Acme' }, { size: 'md' }); // { name: string } | undefined
```

### Sheets

Sheets work the same way, with `useSheet`, `openSheet`, `SheetContentProps<TReturn>`, `components/dentil/sheets/contents/` and `components/dentil/sheets/registry.tsx`. An `edit-details` sheet ships as a starting point.

```tsx
const { openSheet } = useSheet();

const details = await openSheet(
  'edit-details',
  { title: 'Edit customer', defaultValues: { name: customer.name } },
  { size: 'md' }
);
if (details) await updateCustomer(customer.id, details);
```

Useful options: `size` (`'default' | 'md' | 'lg' | 'xl' | 'full'`), `minimizable` (an outside click minimizes the sheet to a dock), `retainDraft` (keep form state after a dismissal), `dismissible: false`, `stacking: 'flush'` and `title` (the dock label). Minimized sheets unmount, so state that should survive minimizing must use `useSheetDraft(sheetId, initial)` instead of `useState`.

### Data table

The table doesn't fetch. It reads and writes one `query` object; send it to the API and pass back `data`, `hasMore` and `loading`. Keep the previous data while a new query loads and pass `fetching` so the stale rows fade instead of sitting unchanged.

```tsx
'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { useState } from 'react';

import { DataTable } from '@/components/dentil/data-table/data-table';
import { DateCell } from '@/components/dentil/data-table/date-cell';
import type { TableQuery } from '@/components/dentil/data-table/types';

type Customer = { id: string; name: string; email: string; created: number };

const col = createColumnHelper<Customer>();

const columns = [
  col.accessor('name', { header: 'Name', enableHiding: false }),
  col.accessor('email', { header: 'Email' }),
  col.accessor('created', {
    header: 'Created',
    cell: ({ getValue }) => <DateCell date={getValue()} />,
    meta: { align: 'right', minimize: true },
  }),
];

export function CustomersTable() {
  const [query, setQuery] = useState<TableQuery>({});
  const { data, isLoading, isFetching } = useCustomers(query); // the project's own data layer: React Query, SWR, a server action…

  return (
    <DataTable
      columns={columns}
      data={data?.data ?? []}
      hasMore={data?.has_more}
      loading={isLoading}
      fetching={isFetching}
      query={query}
      setQuery={setQuery}
      url={(customer) => `/customers/${customer.id}`}
      sortableColumns={{ created: 'created_at' }}
      showPagination
    />
  );
}
```

The table writes `offset` (zero-based page), `sort` (`'ascending' | 'descending'`), `sort_field` (a value from `sortableColumns`), and tab and filter values keyed by id. For a cursor-paginated API, pass `nextCursor` and `previousCursor` from the response instead of `hasMore`: Next writes `after: nextCursor` and Previous writes `before: previousCursor`, and `null` disables the button. Any change except paging resets the page (`offset`, `after`, `before`). Other props: `tabs`, `showDisplay`, `toolbar`, `toolbarActions`, `contextMenuActions`, `splitView`, `expandable` (`{ component: (row) => ReactNode, canExpand?, trigger? }`, a chevron column at the end of the row that opens a full-width panel under it; `trigger: 'row'` makes the whole row toggle it instead of linking), `enableSelection` with `selectionActions`, and `emptyState`. Column `meta` takes `align` (`'left' | 'center' | 'right'`), `verticalAlign` (`'top' | 'middle' | 'bottom'`, for cells beside a taller one), `minimize`, `itemAlign: 'center'` (for a checkbox or icon button) and `disableRowLink`. See {{SITE_URL}}/docs/data-table#api.

- **Filters** (`@dentil/data-table-filter`): build columns with `createColumnConfigHelper<Row>()` from `@/components/dentil/data-table/filter`, for example `dtf.option().id('status').accessor((r) => r.status).displayName('Status').options([...]).build()`. Pass `<DataTableFilters data={data} filterColumns={filterColumns} query={query} setQuery={setQuery} />` from `@/components/dentil/data-table/filters` as the table's `toolbar`.
- **URL state** (`@dentil/data-table-url-state`): replace `useState<TableQuery>` with `useTableQueryState({}, { urlState: true })` from `@/components/dentil/data-table/use-table-query-state`. In server-rendered Next.js pages, also pass `search: useSearchParams().toString()`.

### Date picker

```tsx
import { DateRangePicker, SingleDatePicker } from '@/components/dentil/date-picker/date-picker';

const [due, setDue] = useState<Date>();
<SingleDatePicker value={due} onChange={setDue} minDate={new Date()} showShortcuts />;

// returnFormat="timestamp" reads and writes unix seconds instead of Date objects.
const [period, setPeriod] = useState<{ start: number | undefined; end: number | undefined }>();
<DateRangePicker returnFormat="timestamp" value={period} onChange={setPeriod} showQuickSelect />;
```

Range ends move to the end of their day unless `endOfDay={false}`. `showApplyButton` holds the selection until Apply. `cycleConfig={{ startDate, durationMonths }}` adds billing-cycle end dates beside the single-date calendar. See {{SITE_URL}}/docs/date-picker#api.

### Date

```tsx
import { Date } from '@/components/dentil/date/date';
import { formatDate } from '@/components/dentil/date/format';

const created = 1_794_042_840; // unix seconds; milliseconds, ISO strings and Date also work

<Date date={created} timezone="Europe/London" />;
<Date date={created} timezone="America/New_York" showTimezone hover side="top" align="end" />;

formatDate(created, { timezone: 'Europe/London', showTime: false });
```

The year is omitted in the current year unless `showYear` is set. `showTimezone` underlines the date and opens a popover with that zone and the UTC time. `hover` opens it on hover and keeps it open while the pointer is over the popover. `side` (`'top' | 'right' | 'bottom' | 'left'`, default `'bottom'`) and `align` (`'start' | 'center' | 'end'`, default `'start'`) set where it opens. An unknown `timezone` is formatted as UTC. Omit `timezone` to use the runtime zone. `formatDate` and `toDate` are safe to call from a server component. See {{SITE_URL}}/docs/date#api.

### Object timeline

```tsx
import { CreditCard, Mail } from 'lucide-react';

import { ObjectTimeline } from '@/components/dentil/object-timeline/object-timeline';

<ObjectTimeline
  items={[
    {
      id: 'created',
      icon: CreditCard,
      title: 'Payment created from an invoice',
      date: '7 Nov 2026, 09:14',
    },
    {
      id: 'sent',
      icon: Mail,
      iconClassName: 'text-primary',
      title: 'Receipt sent to ada@example.com',
      description: 'Delivered',
      date: '7 Nov 2026, 09:15',
      onClick: () => openReceipt(),
    },
  ]}
/>;
```

`onClick` turns the title into a button. Items without it stay plain text. `icon` is any component that takes `className` and `size`, such as a Lucide icon. See {{SITE_URL}}/docs/object-timeline#api.

### Invoice table

The table doesn't fetch or calculate totals. Map the project's invoice onto `lines` and `totals`. Every amount is in minor units.

```tsx
import { InvoiceTable } from '@/components/dentil/invoice-table/invoice-table';

<InvoiceTable
  currency="USD"
  lines={invoice.items.map((item) => ({
    id: item.id,
    description: item.description,
    quantity: item.quantity,
    unitAmount: item.unit_amount,
    taxRate: item.tax_percent,
    amount: item.amount,
  }))}
  totals={[
    { label: 'Subtotal', amount: invoice.subtotal },
    { label: 'Tax', amount: invoice.tax },
    { label: 'Amount due', amount: invoice.amount_due, variant: 'strong' },
  ]}
/>;
```

Optional columns (`quantity`, `unitAmount`, `taxRate`, `tax`) show when any line has a value, or pass `columns` to choose them. `unitAmount` also takes a decimal string in minor units (`'0.05'` is $0.0005), such as Stripe's `unit_amount_decimal`, for prices below one cent. `period: { start, end }` (unix seconds, ISO strings or `Date`s) adds a muted line under the description, such as "Dec 1 – 31, 2026", shown in UTC unless you pass `timezone`. Cells sit at the top of taller lines; pass `verticalAlign="middle"` to centre them, inputs included. `originalAmount` shows a struck-through price before `amount`, and `meta` renders beside the description. A total with `variant: 'entry'` puts its label on the left, for a credit note or part payment line, and `gap` adds space above a group. For credit notes and part payments, pass `allocation={{ values, onChange, max }}`: `values` is keyed by line id, and each line's input is capped at `max(line)`. `formatInvoiceAmount(amount, currency)` formats minor units for labels such as "Tax (10% on $100.00)". See {{SITE_URL}}/docs/invoice-table#api.

### Form inputs

Import them from `@/components/dentil/<item>/<item>`. The text fields are controlled with `value` and `onChange`. `SwitchLabel` uses `checked` and `onCheckedChange`.

- `SelectSearch`: `options={[{ label, value, icon, description }]}`. `icon` is a component (a Lucide icon) or a React node, shown before the label. `description` is muted text in the list, and search matches it. `onChange` gets `''` when the selected option is picked again. `groups` splits the list, with a separator that hides while searching. `renderValue` replaces the trigger content.
- `AsyncSelect`: `fetcher(query, signal)` returns the options. `value` is the selected id and `onChange` receives the option or `null`. Pass the stored option as `defaultOption` so its label shows before the list loads. `preload` loads once and filters locally. Picking the selected option again clears it, unless `clearable={false}`.
- `CountrySelect`: `value` is an ISO 3166-1 alpha-2 code. `allowedCountries` limits the list, `preferredCountries` lists those codes first, `showFlags` draws a flag beside each country, `locale` names countries.
- `AddressInput`: `value` is `{ line1, line2, city, state, postal_code, country }`, and `onChange` gets only the non-empty fields or `undefined`. `state` is a code (`'CA'`) for countries in `regions` and free text otherwise. Pass `regions={{ IN: { label: 'State', regions: [...] } }}` to add a list.
- `PhoneInput`: `value` is E.164 (`'+447700900123'`), `onChange` gets `''` when cleared. Set `defaultCountry`.
- `CurrencyInput`: `value` is in minor units (`1050` is £10.50 with `currency="GBP"`), `onChange` gets `undefined` when empty. Decimal places follow the currency (0 for JPY). Pass `onCurrencyChange` to make the currency code a picker, `currencies` to limit its list, and `searchable` to open it as a `SelectSearch` popover filtered by code or name.
- `DOBInput`: `value` is `{ day, month, year }`. `onChange` gets `undefined` until the three fields form a real date.
- `ColorPicker`: `value` is a 6-digit hex without `#` (`'ed5656'`). `onChange` gets that hex on every change, including a partial value. Pass `aria-invalid` until it is six digits. With no valid hex, the picker opens on a random color.
- `SwitchLabel`: a switch plus `label`, with an optional `description`. `alignDescription="label"` lines the description up with the text; the default `"switch"` lines it up with the control. Other props go to the stock `Switch` (`checked`, `onCheckedChange`, `disabled`, `size`).

Pass `aria-invalid` when a field fails validation, and the stock destructive styles apply. `AddressInput` takes an `error` message instead.

## Rules

- Add modals and sheets through `contents/` and one line in `registry.tsx`. Keys, props and return types are inferred from the loader, so never hand-write types for `openModal` or `openSheet`.
- Every modal content renders a `DialogTitle`, and every sheet content a `SheetTitle`, for screen readers.
- `openModal` and `openSheet` resolve `undefined` when the user dismisses them. Always handle that case.
- When customising dentil files, use semantic tokens (`bg-background`, `text-muted-foreground`, `border`) rather than hard-coded colours, so they keep following the app's theme.
- Don't edit `components/ui`. dentil composes the stock shadcn/ui components.
- When you're done, run the project's typecheck and open the page in a browser to check it.

Full docs, live examples and API reference: {{SITE_URL}}. The latest version of this skill: {{SITE_URL}}/skill.md
