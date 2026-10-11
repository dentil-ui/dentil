import type { Metadata } from 'next';

import { CodeBlock } from '@/components/docs/code-block';
import { Example } from '@/components/docs/example';
import { InstallCommand } from '@/components/docs/install-command';
import { A, C, DocsPage, P, Section, SubSection } from '@/components/docs/page-shell';
import { PropsTable, type PropRow } from '@/components/docs/props-table';
import { SourceFile } from '@/components/docs/source-file';
import { BasicDemo } from '@/components/demos/basic';
import { ExpandableDemo } from '@/components/demos/expandable';
import { ExpandableRowDemo } from '@/components/demos/expandable-row';
import { FiltersDemo } from '@/components/demos/filters';
import { OverviewDemo } from '@/components/demos/overview';
import { SelectionDemo } from '@/components/demos/selection';
import { SplitViewDemo } from '@/components/demos/split-view';
import { TabsDisplayDemo } from '@/components/demos/tabs-display';
import { registryItemUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Data Table',
  description: 'A server-driven data table for shadcn/ui built on TanStack Table.',
};

const sections = [
  ['installation', 'Installation'],
  ['usage', 'Usage'],
  ['query', 'The query contract'],
  ['frameworks', 'Routing & frameworks'],
  ['examples', 'Examples'],
  ['filters', 'Filters'],
  ['url-state', 'URL state'],
  ['api', 'API reference'],
] as const;

const USAGE = `
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
  // Any data layer works: SWR, React Query, a server action… SWR and React Query cache by key, so returning to a
  // tab, page or filter you've already loaded is instant.
  const { data, isLoading, isValidating } = useSWR(['/api/customers', query], fetcher, { keepPreviousData: true });

  return (
    <DataTable
      columns={columns}
      data={data?.data ?? []}
      hasMore={data?.has_more}
      loading={isLoading}
      fetching={isValidating}
      query={query}
      setQuery={setQuery}
      url={(customer) => \`/customers/\${customer.id}\`}
      sortableColumns={{ created: 'created_at' }}
      showPagination
    />
  );
}
`;

const QUERY = `
// What the table writes into \`query\`:
{
  offset: 2,                    // zero-based page index (Previous / Next, ← →)
  sort: 'ascending',            // or 'descending'
  sort_field: 'created_at',     // value from sortableColumns
  status: 'open',               // tab queries and filters, keyed by id
  amount: { gte: 1000, lte: 5000 },
}
`;

const CURSOR = `
const { data, isLoading } = useSWR(['/api/customers', query], fetcher);

<DataTable
  data={data?.data ?? []}
  nextCursor={data?.next_cursor}          // null on the last page
  previousCursor={data?.previous_cursor}  // null on the first page
  {...props}
/>

// Next     → { ...query, after: data.next_cursor }
// Previous → { ...query, before: data.previous_cursor }
`;

const NEXT = `
// components/table-router.tsx
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
`;

const REACT_ROUTER = `
// components/table-router.tsx
'use client';

import { Link, useNavigate } from 'react-router';

import { DataTableRouter } from '@/components/data-table/router';
import type { DataTableLinkProps } from '@/components/data-table/types';

// React Router's Link takes \`to\`, so adapt it once:
const RouterLink = ({ href, ...props }: DataTableLinkProps) => <Link to={href} {...props} />;

export function TableRouter({ children }: { children: React.ReactNode }) {
  return (
    <DataTableRouter linkComponent={RouterLink} onNavigate={useNavigate()}>
      {children}
    </DataTableRouter>
  );
}
`;

const FILTER_USAGE = `
import { createColumnConfigHelper } from '@/components/data-table/filter';
import { DataTableFilters } from '@/components/data-table/filters';

const dtf = createColumnConfigHelper<Invoice>();

const filterColumns = [
  dtf.text().id('email').accessor((r) => r.email).displayName('Email').icon(Mail).build(),
  dtf
    .option()
    .id('status')
    .accessor((r) => r.status)
    .displayName('Status')
    .icon(CircleDot)
    .options([{ label: 'Open', value: 'open' }, { label: 'Paid', value: 'paid' }])
    .allowMultiple()
    .build(),
  dtf
    .option()
    .id('customer')
    .accessor((r) => r.customer)
    .displayName('Customer')
    .icon(User)
    .asyncOptions({
      fetchOptions: (search) => api.searchCustomers(search),  // => { label, value }[]
      resolveLabel: (id) => api.getCustomerName(id),           // for values restored from the URL
    })
    .build(),
  dtf.number().id('amount').accessor((r) => r.amount).displayName('Amount').icon(PoundSterling).scale(100).build(),
] as const;

<DataTable
  toolbar={<DataTableFilters data={data} filterColumns={filterColumns} query={query} setQuery={setQuery} />}
  {...props}
/>
`;

const FILTER_QUERY = `
// text     → email: 'ada'
// option   → status: 'open'  |  status: ['open', 'paid']
// number   → amount: 1500 | { gt } | { gte } | { lt } | { lte } | { ne }
//            | { gte, lte }          (between)
//            | { nbt: { gte, lte } } (not between)
// .scale(100) multiplies number values on the way out, so users type £15 and the API gets 1500.
`;

const URL_STATE = `
import { useTableQueryState } from '@/components/data-table/use-table-query-state';

// Drop-in replacement for useState<TableQuery>.
const [query, setQuery] = useTableQueryState({ sort: 'descending' }, { urlState: true });

// Several tables on one page? Namespace them:
const [invoiceQuery, setInvoiceQuery] = useTableQueryState({}, { urlState: { prefix: 'inv.' } });

// Server-rendered (Next.js)? Pass the search string so the first render matches:
const searchParams = useSearchParams();
const [query, setQuery] = useTableQueryState({}, { urlState: true, search: searchParams.toString() });
`;

const COLUMN_META = `
col.accessor('amount', {
  header: 'Amount',
  meta: {
    align: 'right',          // right-align header and cell
    minimize: true,          // shrink the column to its content (w-px)
    itemAlign: 'center',     // vertically centre the cell content
    disableRowLink: true,    // the cell renders its own link/button, so leave it out of the row link
  },
});
`;

const routerRows: PropRow[] = [
  {
    name: 'linkComponent',
    type: 'ElementType<DataTableLinkProps>',
    description: 'Link used for rows and “Show more”. Pass next/link or an adapted React Router Link.',
  },
  {
    name: 'onNavigate',
    type: '(url: string) => void',
    description: 'Programmatic navigation, used on mobile when split view is on. For example router.push.',
  },
  {
    name: 'onPrefetch',
    type: '(url: string) => void',
    description: 'Called when a linked row is hovered, debounced 100ms, once per URL. For example router.prefetch.',
  },
];

const dataTableProps: PropRow[] = [
  { name: 'columns', type: 'ColumnDef<TData, any>[]', description: 'TanStack column definitions.' },
  { name: 'data', type: 'TData[]', description: 'Rows for the current page.' },
  { name: 'query / setQuery', type: 'TableQuery', description: 'Controlled query. See the query contract.' },
  { name: 'loading', type: 'boolean', description: 'Show the loading state instead of rows.' },
  {
    name: 'fetching',
    type: 'boolean',
    description:
      'Fade the current rows while the next query loads, e.g. SWR’s isValidating or React Query’s isFetching.',
  },
  { name: 'hasMore', type: 'boolean', description: 'Enables “Next” for offset pagination.' },
  {
    name: 'nextCursor',
    type: 'string | null',
    description: 'Cursor pagination. “Next” writes it into `query.after`; `null` disables “Next”. Overrides `hasMore`.',
  },
  {
    name: 'previousCursor',
    type: 'string | null',
    description: 'Cursor pagination. “Previous” writes it into `query.before`; `null` disables “Previous”.',
  },
  {
    name: 'getRowId',
    type: '(row) => string',
    default: 'row.id',
    description: 'Identity for selection and split view.',
  },
  { name: 'url', type: '(row) => string | undefined', description: 'Turn rows into links.' },
  { name: 'onRowClick', type: '(row) => void', description: 'Click handler for rows (with or without `url`).' },
  {
    name: 'linkComponent',
    type: 'ElementType<DataTableLinkProps>',
    default: "'a'",
    description: 'Link used for rows and “Show more”. Overrides DataTableRouter.',
  },
  {
    name: 'onPrefetch',
    type: '(url) => void',
    description: 'Called on row hover, debounced 100ms, once per URL. Overrides DataTableRouter.',
  },
  {
    name: 'onNavigate',
    type: '(url) => void',
    default: 'location.assign',
    description: 'Programmatic navigation (mobile split view). Overrides DataTableRouter.',
  },
  { name: 'toolbar', type: 'ReactNode', description: 'Left side of the toolbar, usually `<DataTableFilters />`.' },
  { name: 'toolbarActions', type: 'ReactNode', description: 'Right side of the toolbar, e.g. an export button.' },
  { name: 'showDisplay', type: 'boolean', default: 'false', description: 'Column visibility dropdown.' },
  { name: 'tabs', type: 'TableTab[]', description: '`{ label, query }[]`; selecting a tab merges its query.' },
  {
    name: 'tabsOptions',
    type: '{ allPosition?, showAll? }',
    default: "{ 'end', true }",
    description: 'Placement of the “All” tab.',
  },
  { name: 'onTabChange', type: '(tab) => void', description: 'Called after a tab is selected.' },
  { name: 'showPagination', type: 'boolean', default: 'false', description: 'Previous/Next footer and ← → hotkeys.' },
  { name: 'showMore', type: 'string | null', description: '“Show more” link in the footer instead of pagination.' },
  { name: 'sortableColumns', type: 'Record<string, string>', description: 'Column id → API sort field.' },
  { name: 'contextMenuActions', type: 'Action[] | (row) => Action[]', description: 'Right-click menu per row.' },
  {
    name: 'splitView',
    type: '{ component: (row | null) => ReactNode }',
    description: 'Detail panel beside the table; ↑ ↓ move between rows.',
  },
  {
    name: 'expandable',
    type: "{ component: (row) => ReactNode, canExpand?: (row) => boolean, trigger?: 'chevron' | 'row' }",
    description:
      "Adds a chevron column at the end of each row. Each chevron opens a full-width panel under its row, and several rows can be open. `canExpand` returning `false` hides a row’s chevron. `trigger: 'row'` makes the whole row toggle it instead of following `url`.",
  },
  {
    name: 'enableSelection',
    type: 'boolean',
    default: 'false',
    description: 'Checkbox column and floating action bar.',
  },
  {
    name: 'selectedRows / onSelectionChange',
    type: 'TData[]',
    description: 'Controlled selection; persists across pages.',
  },
  { name: 'selectedRowFilter', type: '(row) => boolean', description: 'Return `false` to disable a row’s checkbox.' },
  { name: 'selectionActions', type: 'SelectionAction<TData>[]', description: 'Buttons in the selection bar.' },
  {
    name: 'renderSelectionStatus',
    type: '({ selectedRows, dismiss }) => ReactNode',
    description: 'Replace the bar with custom status, e.g. bulk-job progress.',
  },
  { name: 'customRowClassName', type: '(row) => string | undefined', description: 'Per-row classes.' },
  { name: 'noResultsText', type: 'string', default: "'No results'", description: 'Empty message.' },
  { name: 'emptyState / loadingState', type: 'ReactNode', description: 'Replace the empty or loading UI.' },
  {
    name: 'meta',
    type: 'TableMeta<TData>',
    description: 'Passed to TanStack; read it in cells via `table.options.meta`.',
  },
];

const selectionActionProps: PropRow[] = [
  { name: 'label', type: 'string', description: 'Button text.' },
  {
    name: 'onClick',
    type: '(rows) => void | Promise<void>',
    description: 'Receives every selected row. A promise shows a spinner until it settles.',
  },
  { name: 'variant', type: 'Button variant', default: "'default'", description: 'shadcn Button variant.' },
  { name: 'icon', type: 'ComponentType', description: 'Leading icon.' },
  { name: 'disabled / hidden', type: 'boolean | (rows) => boolean', description: 'Conditionally disable or hide.' },
  {
    name: 'clearOnSuccess',
    type: 'boolean',
    default: 'false',
    description: 'Clear the selection after `onClick` resolves.',
  },
];

export default function DataTablePage() {
  return (
    <DocsPage
      href="/docs/data-table"
      sections={sections}
      lead={
        <>
          A server-driven table built on TanStack Table. You own data fetching: the table reads and writes a single{' '}
          <C>query</C> object (filters, tab, sort and page), and you pass back <C>data</C>, <C>loading</C>, and either{' '}
          <C>hasMore</C> or the next and previous cursors.
        </>
      }
      demo={
        <Example file="overview.tsx">
          <OverviewDemo />
        </Example>
      }>
      <Section id="installation" title="Installation">
        <P>
          Add the <C>@dentil</C> registry to <C>components.json</C> (see <A href="/#install">Get started</A>), then
          install the pieces you need. Without it, swap each name for its URL, e.g.{' '}
          <C>{registryItemUrl('@dentil/data-table')}</C>. The table uses stock shadcn/ui components, Radix or Base UI,
          which the CLI installs if they&apos;re missing.
        </P>
        <InstallCommand title="Table (required)" items={['@dentil/data-table']} />
        <InstallCommand title="Filter bar (optional)" items={['@dentil/data-table-filter']} />
        <InstallCommand title="URL state hook (optional)" items={['@dentil/data-table-url-state']} />
        <P>
          Files land in <C>components/data-table/</C>. Requires React 19, Tailwind v4 and <C>@tanstack/react-table</C>{' '}
          v8.
        </P>
      </Section>

      <Section id="usage" title="Usage">
        <CodeBlock code={USAGE} />
      </Section>

      <Section id="query" title="The query contract">
        <P>
          Everything the user changes ends up in <C>query</C>. Send it to your API as-is, or map it. Tabs and filters
          keep each other&apos;s keys, and any change except paging resets the page.
        </P>
        <CodeBlock code={QUERY} />
        <SubSection
          title="Cursor pagination"
          description="If your API pages with cursors, pass back the cursors from each response instead of hasMore.">
          <P>
            Next writes <C>nextCursor</C> into <C>query.after</C>, and Previous writes <C>previousCursor</C> into{' '}
            <C>query.before</C>. Only one of <C>after</C> and <C>before</C> is set at a time, and <C>offset</C> is never
            written. A <C>null</C> cursor disables its button. Filter, tab and sort changes drop both cursors, so the
            user goes back to the first page.
          </P>
          <CodeBlock code={CURSOR} />
        </SubSection>
      </Section>

      <Section id="frameworks" title="Routing & frameworks">
        <P>
          The table has no router dependency. Wrap the app once in <C>DataTableRouter</C> and every table below it uses
          that link, prefetch and navigation. A table can still pass <C>linkComponent</C>, <C>onNavigate</C> or{' '}
          <C>onPrefetch</C> to override it. With no provider, row links render a plain <C>{'<a>'}</C> and programmatic
          navigation uses <C>window.location.assign</C>.
        </P>
        <CodeBlock title="Next.js" code={NEXT} />
        <CodeBlock title="React Router" code={REACT_ROUTER} />
      </Section>

      <Section id="examples" title="Examples">
        <SubSection
          title="Columns"
          description="The demos below share these definitions: a custom amount cell, a status badge, mono text, DateCell, an actions menu, and column meta for alignment and width.">
          <SourceFile file="lib/demo/columns.tsx" />
        </SubSection>
        <SubSection
          title="Links, sorting and pagination"
          description="Rows are links and prefetch on hover, from the DataTableRouter in the root layout. Sort by Created or Due. Use ← → to change page.">
          <Example file="basic.tsx">
            <BasicDemo />
          </Example>
        </SubSection>
        <SubSection
          title="Tabs, column visibility and toolbar actions"
          description="Tabs merge their query with existing filters. Display toggles any column without enableHiding: false.">
          <Example file="tabs-display.tsx">
            <TabsDisplayDemo />
          </Example>
        </SubSection>
        <SubSection
          title="Selection and context menu"
          description="Select across pages, press A to select the whole page, and right-click a row. Void invoices can't be selected.">
          <Example file="selection.tsx">
            <SelectionDemo />
          </Example>
        </SubSection>
        <SubSection
          title="Split view"
          description="Click a row, or use ↑ ↓, to show its details. On mobile, rows navigate instead.">
          <Example file="split-view.tsx">
            <SplitViewDemo />
          </Example>
        </SubSection>
        <SubSection
          title="Expandable rows"
          description="Open two rows with their chevrons; both stay open. Clicking anywhere else on a row still follows its link. Drafts can't be expanded.">
          <Example file="expandable.tsx">
            <ExpandableDemo />
          </Example>
        </SubSection>
        <SubSection
          title="Expand on row click"
          description="With trigger: 'row', clicking anywhere on a row opens its panel, and the row isn't a link. Drafts can't expand, so they still link. Tab to a chevron to toggle a row from the keyboard.">
          <Example file="expandable-row.tsx">
            <ExpandableRowDemo />
          </Example>
        </SubSection>
      </Section>

      <Section id="filters" title="Filters">
        <P>
          <C>@dentil/data-table-filter</C> adds a Linear-style filter bar (adapted from{' '}
          <A href="https://ui.bazza.dev">bazza/ui</A>) that reads and writes the same <C>query</C>. Try the async
          Customer filter and a number range, then reload the page: the filters come back from the URL.
        </P>
        <Example file="filters.tsx">
          <FiltersDemo />
        </Example>
        <CodeBlock code={FILTER_USAGE} />
        <SubSection title="Query values by filter type">
          <CodeBlock lang="ts" code={FILTER_QUERY} />
        </SubSection>
      </Section>

      <Section id="url-state" title="URL state">
        <P>
          <C>@dentil/data-table-url-state</C> mirrors the query to the URL with <C>history.replaceState</C>, so links
          are shareable, reloads keep the view, and Back from a detail page returns to the same filters, without adding
          history entries or triggering router navigations.
        </P>
        <CodeBlock code={URL_STATE} />
      </Section>

      <Section id="api" title="API reference">
        <SubSection title="DataTableRouter" description="Wrap the app once. Props on a table override these.">
          <PropsTable rows={routerRows} />
        </SubSection>
        <SubSection title="DataTable">
          <PropsTable rows={dataTableProps} />
        </SubSection>
        <SubSection title="Column meta" description="Typed via module augmentation of TanStack's ColumnMeta.">
          <CodeBlock code={COLUMN_META} />
        </SubSection>
        <SubSection title="SelectionAction">
          <PropsTable rows={selectionActionProps} />
        </SubSection>
        <SubSection
          title="Helpers"
          description="ActionsButton (row … menu), DateCell (unix seconds, ms, ISO or Date), createCommonActions / createCustomAction / createSubMenu / createSeparator / createLabel for context menus, and the table primitives in primitives.tsx."
        />
      </Section>
    </DocsPage>
  );
}
