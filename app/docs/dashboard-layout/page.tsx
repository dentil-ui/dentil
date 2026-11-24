import type { Metadata } from 'next';

import { DashboardLayoutOverviewDemo } from '@/components/demos/dashboard-layout-overview';
import { DashboardLayoutSplitDemo } from '@/components/demos/dashboard-layout-split';
import { CodeBlock } from '@/components/docs/code-block';
import { Example } from '@/components/docs/example';
import { InstallCommand } from '@/components/docs/install-command';
import { C, DocsPage, P, Section, SubSection } from '@/components/docs/page-shell';
import { PropsTable, type PropRow } from '@/components/docs/props-table';

export const metadata: Metadata = {
  title: 'Dashboard Layout',
  description:
    'Page layout for dashboards: a full-bleed container, a page header, section and table headers, a two-column chart grid, and a main pane with a sidebar, with shared 1px borders between bordered blocks.',
};

const sections = [
  ['installation', 'Installation'],
  ['usage', 'Usage'],
  ['borders', 'Borders'],
  ['examples', 'Examples'],
  ['api', 'API reference'],
] as const;

const USAGE = `
import {
  DashboardContainer,
  DashboardGrid,
  DashboardHeader,
  DashboardHeading,
  DashboardSection,
  DashboardSectionContent,
  DashboardSectionHeader,
  DashboardSubheading,
  DashboardTableHeader,
} from '@/components/dentil/dashboard-layout/dashboard-layout';

<DashboardContainer>
  <DashboardHeader>
    <DashboardHeading asChild>
      <h1>Billing</h1>
    </DashboardHeading>
    <Button>Create invoice</Button>
  </DashboardHeader>

  <DashboardSection>
    <DashboardSectionHeader>
      <DashboardSubheading>Overview</DashboardSubheading>
    </DashboardSectionHeader>
    <DashboardGrid>
      <DashboardSectionContent>
        <LineChart title="Revenue" … />
      </DashboardSectionContent>
      <DashboardSectionContent>
        <CategoryBarChart title="Subscriptions by plan" … />
      </DashboardSectionContent>
    </DashboardGrid>
  </DashboardSection>

  <DashboardTableHeader>
    <DashboardSubheading>Invoices</DashboardSubheading>
  </DashboardTableHeader>
  <DataTable … />
</DashboardContainer>
`;

const SPLIT = `
<DashboardContainer fixedHeight>
  <DashboardHeader>
    <DashboardHeading>Ada Lovelace</DashboardHeading>
  </DashboardHeader>
  <DashboardSplit className="border-t">
    <DashboardSplitMain>…</DashboardSplitMain>
    <DashboardSplitSidebar>…</DashboardSplitSidebar>
  </DashboardSplit>
</DashboardContainer>
`;

const divProps = (
  <>
    Other <code>div</code> props.
  </>
);

const containerRows: PropRow[] = [
  {
    name: 'fixedHeight',
    type: 'boolean',
    default: 'false',
    description: (
      <>
        Fills the parent&apos;s height instead of growing with the content. Use it with <code>DashboardSplit</code> so
        the main pane and sidebar scroll on their own. The parent needs a height.
      </>
    ),
  },
  { name: 'className', type: 'string', description: 'Merged onto the container.' },
  { name: '…props', type: "ComponentProps<'div'>", description: divProps },
];

const headingRows: PropRow[] = [
  {
    name: 'asChild',
    type: 'boolean',
    default: 'false',
    description: (
      <>
        Renders the styles on the child, so you can pick the heading level, e.g.{' '}
        <code>&lt;DashboardHeading asChild&gt;&lt;h1&gt;Billing&lt;/h1&gt;&lt;/DashboardHeading&gt;</code>.
      </>
    ),
  },
  { name: 'className', type: 'string', description: 'Merged onto the heading.' },
];

const parts: PropRow[] = [
  {
    name: 'DashboardHeader',
    type: 'div',
    description: 'Page title row: heading on the left, actions on the right. Stacks below sm. 20px side padding.',
  },
  { name: 'DashboardHeading', type: 'h3', description: 'Page title, 18px bold.' },
  {
    name: 'DashboardSubheading',
    type: 'h4',
    description: 'Section title for a section or table header, 16px bold.',
  },
  { name: 'DashboardGrid', type: 'div', description: 'One column, then two from xl. Rows size to their content.' },
  {
    name: 'DashboardSplit',
    type: 'div',
    description: 'Main pane and sidebar, stacked until xl, then side by side. Pulls its panes together by 1px.',
  },
  { name: 'DashboardSplitMain', type: 'div', description: 'The wide pane. Scrolls when the split has a height.' },
  {
    name: 'DashboardSplitSidebar',
    type: 'div',
    description: 'Full width when stacked, 384px from xl, with a left border. Scrolls when the split has a height.',
  },
  { name: 'DashboardSection', type: 'section', description: 'Groups a section header with its content. No styles.' },
  {
    name: 'DashboardSectionHeader',
    type: 'div',
    description: 'Title row with a bottom border and 16px above it, 62px tall.',
  },
  { name: 'DashboardSectionContent', type: 'div', description: 'Padded body: 20px sides, 16px top and bottom.' },
  { name: 'DashboardSectionTitle', type: 'p', description: 'Small 14px label above a block in a section body.' },
  {
    name: 'DashboardTableHeader',
    type: 'div',
    description: (
      <>
        Title row above a table, 61px tall, with no bottom border so the table&apos;s top border closes it. Its 16px top
        margin is <code>!important</code>, so it clears the block above even as a direct child of the container.
      </>
    ),
  },
];

export default function DashboardLayoutPage() {
  return (
    <DocsPage
      href="/docs/dashboard-layout"
      sections={sections}
      lead={
        <>
          <C>DashboardContainer</C> lays out a dashboard page edge to edge: a header, section headers, a chart grid and
          tables, each bringing its own padding. Bordered blocks share their edges instead of doubling them.
        </>
      }
      demo={
        <Example file="dashboard-layout-overview.tsx">
          <DashboardLayoutOverviewDemo />
        </Example>
      }>
      <Section id="installation" title="Installation">
        <InstallCommand items={['@dentil/dashboard-layout']} />
        <P>
          Files land in <C>components/dentil/dashboard-layout/</C>. It has no shadcn dependencies and no client code, so
          it renders in a Server Component. <C>asChild</C> uses Radix <C>Slot</C>.
        </P>
      </Section>

      <Section id="usage" title="Usage">
        <P>
          Put <C>DashboardContainer</C> straight inside your app shell&apos;s content area, with no padding. Headers and
          section bodies add 20px on each side, and tables run to the edge.
        </P>
        <CodeBlock code={USAGE} />
      </Section>

      <Section id="borders" title="Borders">
        <P>
          The blocks draw no outer border. Each child of <C>DashboardContainer</C>, <C>DashboardSplit</C> and its panes
          is pulled up and left by 1px, so a table&apos;s top border, a split&apos;s top border and the sidebar&apos;s
          left border land on the line before them instead of beside it. The container&apos;s -1px margin does the same
          against your shell, so a bordered child sits on the shell&apos;s edge.
        </P>
      </Section>

      <Section id="examples" title="Examples">
        <SubSection
          title="Split"
          description="A record page: the main pane holds tables, and the sidebar holds details. They sit side by side from xl.">
          <Example file="dashboard-layout-split.tsx">
            <DashboardLayoutSplitDemo />
          </Example>
          <P>
            Give the container <C>fixedHeight</C> and a parent with a height, and each pane scrolls on its own.
          </P>
          <CodeBlock code={SPLIT} />
        </SubSection>
      </Section>

      <Section id="api" title="API reference">
        <SubSection title="DashboardContainer">
          <PropsTable rows={containerRows} />
        </SubSection>
        <SubSection title="DashboardHeading and DashboardSubheading">
          <PropsTable rows={headingRows} />
        </SubSection>
        <SubSection
          title="Parts"
          description="Every part takes className and the props of the element it renders, and sets a data-slot.">
          <PropsTable rows={parts} />
        </SubSection>
      </Section>
    </DocsPage>
  );
}
