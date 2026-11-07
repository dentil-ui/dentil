import type { Metadata } from 'next';

import { AsyncSelectEmptyDemo } from '@/components/demos/async-select-empty';
import { AsyncSelectOverviewDemo } from '@/components/demos/async-select-overview';
import { AsyncSelectPreloadDemo } from '@/components/demos/async-select-preload';
import { CodeBlock } from '@/components/docs/code-block';
import { Example } from '@/components/docs/example';
import { InstallCommand } from '@/components/docs/install-command';
import { A, C, DocsPage, P, Section, SubSection } from '@/components/docs/page-shell';
import { PropsTable, type PropRow } from '@/components/docs/props-table';

export const metadata: Metadata = {
  title: 'Async Select',
  description:
    'A searchable single-select combobox that loads options from an async fetcher, with debounced search, preloading and custom option rendering.',
};

const sections = [
  ['installation', 'Installation'],
  ['usage', 'Usage'],
  ['examples', 'Examples'],
  ['api', 'API reference'],
] as const;

const USAGE = `
'use client';

import { useState } from 'react';

import { AsyncSelect } from '@/components/async-select/async-select';

type Customer = { id: string; name: string; email: string };

// searchCustomers is your request. Reject to show the error and a retry.
export function CustomerSelect() {
  const [customer, setCustomer] = useState<Customer | null>(null);

  return (
    <AsyncSelect
      fetcher={(query, signal) => searchCustomers(query, signal)}
      value={customer?.id}
      defaultOption={customer}
      onChange={setCustomer}
      getOptionValue={(option) => option.id}
      getDisplayValue={(option) => option.name}
      renderOption={(option) => (
        <span className="flex min-w-0 flex-col">
          <span className="truncate">{option.name}</span>
          <span className="text-muted-foreground truncate text-xs">{option.email}</span>
        </span>
      )}
      placeholder="Select a customer"
      searchPlaceholder="Search customers..."
      emptyText="No customer found."
    />
  );
}
`;

const rows: PropRow[] = [
  {
    name: 'fetcher',
    type: '(query: string, signal: AbortSignal) => Promise<T[]>',
    description: (
      <>
        Loads options for a search. <code>&apos;&apos;</code> asks for the unfiltered list. <code>signal</code> aborts
        the previous request. The latest function is used on the next search, so remount the component when the same
        query should return a different set.
      </>
    ),
  },
  {
    name: 'value',
    type: 'string | null | undefined',
    description: "The selected option's value. null, undefined and '' are empty.",
  },
  {
    name: 'onChange',
    type: '(option: T | null) => void',
    description: 'Called with the picked option, or null when the selection is cleared.',
  },
  {
    name: 'getOptionValue',
    type: '(option: T) => string',
    description: 'Unique value for an option. This is what value is compared to.',
  },
  {
    name: 'getDisplayValue',
    type: '(option: T) => ReactNode',
    description: 'Trigger contents for the selected option.',
  },
  {
    name: 'renderOption',
    type: '(option: T) => ReactNode',
    description: 'Contents of the option row. A check mark is added after it.',
  },
  {
    name: 'defaultOption',
    type: 'T | null',
    description:
      'Shown on the trigger when value matches it and that option is not in the current results. Pass the selection you already have so its label shows before the list loads.',
  },
  {
    name: 'preload',
    type: 'boolean',
    default: 'false',
    description:
      'Load once with an empty query, then filter in the browser. Otherwise each search calls fetcher after debounce.',
  },
  {
    name: 'filterFn',
    type: '(option: T, query: string) => boolean',
    description:
      'Client filter used when preload is set. Return true to keep the option. When omitted, the filter matches getOptionValue and getSearchValue.',
  },
  {
    name: 'getSearchValue',
    type: '(option: T) => string',
    description: 'Extra text the default preload filter matches, besides the option value.',
  },
  {
    name: 'isOptionDisabled',
    type: '(option: T) => boolean',
    description: 'Disabled options stay in the list and cannot be picked.',
  },
  {
    name: 'placeholder',
    type: 'string',
    default: "'Select...'",
    description: 'Trigger label when nothing is selected.',
  },
  {
    name: 'searchPlaceholder',
    type: 'string',
    default: "'Search...'",
    description: 'Search field placeholder.',
  },
  {
    name: 'emptyText',
    type: 'ReactNode | ((state: { query: string; close: () => void }) => ReactNode)',
    default: "'No results.'",
    description: 'Shown when the list is empty. A function receives the current query and a way to close the popover.',
  },
  {
    name: 'loadingSkeleton',
    type: 'ReactNode',
    description: 'Replaces the three loading rows shown while the first results are in flight.',
  },
  {
    name: 'debounce',
    type: 'number',
    default: '300',
    description:
      'Wait before calling fetcher after a keystroke, in milliseconds. Ignored when preload is set. Clearing the field fetches immediately.',
  },
  {
    name: 'clearable',
    type: 'boolean',
    default: 'true',
    description: 'Picking the selected option again clears it and calls onChange with null.',
  },
  {
    name: '…props',
    type: "ComponentProps<'button'>",
    description: (
      <>
        Other props (<code>id</code>, <code>aria-invalid</code>, <code>aria-describedby</code>, <code>onBlur</code>…)
        are passed to the trigger button.
      </>
    ),
  },
];

export default function AsyncSelectPage() {
  return (
    <DocsPage
      href="/docs/async-select"
      sections={sections}
      lead={
        <>
          <C>AsyncSelect</C> is a controlled combobox for options that come from a search. <C>fetcher</C> runs when the
          popover opens and again as you type. <C>onChange</C> receives the whole option, or <C>null</C> when you clear
          it. Search for a person, or for an email. Pick the selected row again to clear it.
        </>
      }
      demo={
        <Example file="async-select-overview.tsx" padded>
          <AsyncSelectOverviewDemo />
        </Example>
      }>
      <Section id="installation" title="Installation">
        <InstallCommand items={['@dentil/async-select']} />
        <P>
          Files land in <C>components/async-select/</C>. Uses the stock shadcn <C>button</C>, <C>command</C> and{' '}
          <C>popover</C>, so it follows your theme. For a list you already have in memory, use{' '}
          <A href="/docs/select-search">Select Search</A>.
        </P>
      </Section>

      <Section id="usage" title="Usage">
        <P>
          <C>value</C> is the selected id. Store the option and pass it as <C>defaultOption</C>, so the trigger keeps
          its label before the list has loaded and after a search that leaves it out. A thrown error replaces the list
          with the message and a retry. With <C>preload</C>, <C>fetcher</C> runs once per mount.
        </P>
        <CodeBlock code={USAGE} />
      </Section>

      <Section id="examples" title="Examples">
        <SubSection
          title="Preload"
          description="Options load once. Further typing filters them in the browser, and Initech cannot be picked.">
          <Example file="async-select-preload.tsx" padded>
            <AsyncSelectPreloadDemo />
          </Example>
        </SubSection>
        <SubSection
          title="Empty state"
          description="Search for a name that is not listed, then use it anyway. The popover closes and the result is that string.">
          <Example file="async-select-empty.tsx" padded>
            <AsyncSelectEmptyDemo />
          </Example>
        </SubSection>
      </Section>

      <Section id="api" title="API reference">
        <SubSection title="AsyncSelect">
          <PropsTable rows={rows} />
        </SubSection>
      </Section>
    </DocsPage>
  );
}
