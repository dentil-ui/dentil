---
name: dentil
description: Installs and uses dentil, a shadcn/ui registry of server-driven data tables, promise-based modals and side sheets. Use when the user mentions dentil or @dentil, or wants a data table with server-side filters, sorting and pagination, or modals and sheets opened with `await openModal(...)` or `await openSheet(...)`.
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

Install only what the user needs. If it's unclear which items they want, ask.

## 1. Check the project

- `components.json` must exist. If it doesn't, run `shadcn@latest init` first, and ask the user before choosing a style or base colour.
- dentil requires React 19 and Tailwind CSS v4. Any shadcn style works, Radix (`new-york`, `radix-*`) or Base UI (`base-*`). If the project uses React 18 or Tailwind v3, stop and tell the user rather than upgrading anything.
- Use the project's package manager, which you can tell from its lockfile: `pnpm dlx`, `npx`, `yarn dlx` or `bunx --bun`. The examples below use `npx`.
- Imports below use the `@/components` alias. Match whatever `aliases` in `components.json` says.

## 2. Add the registry

Merge this into `components.json`, keeping any existing keys and registries:

```json
{
  "registries": {
    "@dentil": "{{SITE_URL}}/r/{name}.json"
  }
}
```

## 3. Install

```bash
npx shadcn@latest add @dentil/modals @dentil/sheets @dentil/data-table
```

The CLI installs any missing stock shadcn/ui components and npm packages. If it asks to overwrite an existing file in `components/ui`, answer no unless the user agrees: dentil works with the stock versions. Files land in `components/modals/`, `components/sheets/` and `components/data-table/`.

## 4. Mount the providers once

In the root layout (`app/layout.tsx` in Next.js, or the app's root component). The providers are client components, so a server layout can render them. Put `SheetProvider` inside `ModalProvider` so sheets can open modals.

```tsx
import { ModalProvider } from '@/components/modals';
import { SheetProvider } from '@/components/sheets';

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

import { DataTableRouter } from '@/components/data-table/router';

export function TableRouter({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <DataTableRouter linkComponent={Link} onNavigate={router.push} onPrefetch={router.prefetch}>
      {children}
    </DataTableRouter>
  );
}
```

For React Router, adapt its `Link` once with `DataTableLinkProps` from `@/components/data-table/types`: `const RouterLink = ({ href, ...props }: DataTableLinkProps) => <Link to={href} {...props} />`, then pass `linkComponent={RouterLink} onNavigate={useNavigate()}`.

## 5. Use them

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
// components/modals/contents/rename.tsx
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
// components/modals/registry.tsx
const modalLoaders = {
  confirm: () => import('./contents/confirm'),
  rename: () => import('./contents/rename'),
} as const;

// Anywhere: props and the result are typed from the loader.
const result = await openModal('rename', { name: 'Acme' }, { size: 'md' }); // { name: string } | undefined
```

### Sheets

Sheets work the same way, with `useSheet`, `openSheet`, `SheetContentProps<TReturn>`, `components/sheets/contents/` and `components/sheets/registry.tsx`. An `edit-details` sheet ships as a starting point.

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

import { DataTable } from '@/components/data-table/data-table';
import { DateCell } from '@/components/data-table/date-cell';
import type { TableQuery } from '@/components/data-table/types';

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

The table writes `offset` (zero-based page), `sort` (`'ascending' | 'descending'`), `sort_field` (a value from `sortableColumns`), and tab and filter values keyed by id. For a cursor-paginated API, pass `nextCursor` and `previousCursor` from the response instead of `hasMore`: Next writes `after: nextCursor` and Previous writes `before: previousCursor`, and `null` disables the button. Any change except paging resets the page (`offset`, `after`, `before`). Other props: `tabs`, `showDisplay`, `toolbar`, `toolbarActions`, `contextMenuActions`, `splitView`, `expandable` (`{ component: (row) => ReactNode, canExpand?, trigger? }`, a chevron column at the end of the row that opens a full-width panel under it; `trigger: 'row'` makes the whole row toggle it instead of linking), `enableSelection` with `selectionActions`, and `emptyState`. See {{SITE_URL}}/docs/data-table#api.

- **Filters** (`@dentil/data-table-filter`): build columns with `createColumnConfigHelper<Row>()` from `@/components/data-table/filter`, for example `dtf.option().id('status').accessor((r) => r.status).displayName('Status').options([...]).build()`. Pass `<DataTableFilters data={data} filterColumns={filterColumns} query={query} setQuery={setQuery} />` from `@/components/data-table/filters` as the table's `toolbar`.
- **URL state** (`@dentil/data-table-url-state`): replace `useState<TableQuery>` with `useTableQueryState({}, { urlState: true })` from `@/components/data-table/use-table-query-state`. In server-rendered Next.js pages, also pass `search: useSearchParams().toString()`.

## Rules

- Add modals and sheets through `contents/` and one line in `registry.tsx`. Keys, props and return types are inferred from the loader, so never hand-write types for `openModal` or `openSheet`.
- Every modal content renders a `DialogTitle`, and every sheet content a `SheetTitle`, for screen readers.
- `openModal` and `openSheet` resolve `undefined` when the user dismisses them. Always handle that case.
- When customising dentil files, use semantic tokens (`bg-background`, `text-muted-foreground`, `border`) rather than hard-coded colours, so they keep following the app's theme.
- Don't edit `components/ui`. dentil composes the stock shadcn/ui components.
- When you're done, run the project's typecheck and open the page in a browser to check it.

Full docs, live examples and API reference: {{SITE_URL}}. The latest version of this skill: {{SITE_URL}}/skill.md
