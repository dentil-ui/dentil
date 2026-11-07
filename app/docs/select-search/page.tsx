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
    type: '{ label: string; value: string; keywords?: string[]; icon?: ReactNode | ComponentType; description?: string; labelClassName?: string }[]',
    description:
      'Options to list. Search matches the value, the label, the description and any keywords. icon is a component, such as a Lucide icon, or any node, shown before the label. description is muted text after the label, in the list only. labelClassName sizes that label, such as a fixed-width code.',
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
    name: 'groups',
    type: 'SelectSearchOption[][]',
    description:
      'Renders these groups instead of one list, with a separator between them. The separator hides while searching, and a group hides when none of its options match. options is still used for the selected label.',
  },
  {
    name: 'renderValue',
    type: '(selected: SelectSearchOption | undefined) => ReactNode',
    description: 'Trigger content in place of the selected option’s icon and label. The chevron stays.',
  },
  {
    name: 'align',
    type: "'start' | 'center' | 'end'",
    default: "'start'",
    description: 'Popover alignment against the trigger.',
  },
  {
    name: 'contentClassName',
    type: 'string',
    description: 'Applied to the popover. It is at least as wide as the trigger; use a min-w-* class to widen it.',
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
          a keyword such as PST. Pass an icon component to show it before the label. Pick the selected option again to
          clear it.
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
          Files land in <C>components/dentil/select-search/</C>. Uses the stock shadcn <C>button</C>, <C>command</C> and{' '}
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
