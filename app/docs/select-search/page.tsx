import type { Metadata } from 'next';

import { Example } from '@/components/docs/example';
import { InstallCommand } from '@/components/docs/install-command';
import { C, DocsPage, P, Section, SubSection } from '@/components/docs/page-shell';
import { PropsTable, type PropRow } from '@/components/docs/props-table';
import { SelectSearchOverviewDemo } from '@/components/demos/select-search-overview';

export const metadata: Metadata = {
  title: 'Select Search',
  description: 'A searchable single-select combobox for shadcn/ui, built on Popover and Command.',
};

const sections = [
  ['installation', 'Installation'],
  ['api', 'API reference'],
] as const;

const rows: PropRow[] = [
  {
    name: 'options',
    type: '{ label: string; value: string; keywords?: string[] }[]',
    description: 'Options to list. Search matches the value, the label and any keywords.',
  },
  { name: 'value', type: 'string | null | undefined', description: 'The selected option’s value.' },
  {
    name: 'onChange',
    type: '(value: string) => void',
    description: (
      <>
        Called with the picked value, or <code>&apos;&apos;</code> when the selected option is picked again.
      </>
    ),
  },
  { name: 'placeholder', type: 'string', default: "'Select...'", description: 'Trigger label with no value.' },
  { name: 'searchPlaceholder', type: 'string', default: "'Search...'", description: 'Search field placeholder.' },
  { name: 'emptyText', type: 'ReactNode', default: "'No results.'", description: 'Shown when nothing matches.' },
  {
    name: 'filter',
    type: '(value, search, keywords?) => number',
    description: 'cmdk filter. Return 0 to hide an option, and higher numbers to rank it first.',
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

export default function SelectSearchPage() {
  return (
    <DocsPage
      href="/docs/select-search"
      sections={sections}
      lead={
        <>
          <C>SelectSearch</C> is a controlled single-select combobox for lists too long to scroll. Search by city, or by
          a keyword such as PST. Pick the selected option again to clear it.
        </>
      }
      demo={
        <Example file="select-search-overview.tsx" padded>
          <SelectSearchOverviewDemo />
        </Example>
      }>
      <Section id="installation" title="Installation">
        <InstallCommand items={['@dentil/select-search']} />
        <P>
          Files land in <C>components/select-search/</C>. Uses the stock shadcn <C>button</C>, <C>command</C> and{' '}
          <C>popover</C>, so it follows your theme.
        </P>
      </Section>

      <Section id="api" title="API reference">
        <SubSection title="SelectSearch">
          <PropsTable rows={rows} />
        </SubSection>
      </Section>
    </DocsPage>
  );
}
