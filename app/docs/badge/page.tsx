import type { Metadata } from 'next';

import { BadgeColorsDemo } from '@/components/demos/badge-colors';
import { BadgeOverviewDemo } from '@/components/demos/badge-overview';
import { BadgeSizesDemo } from '@/components/demos/badge-sizes';
import { CodeBlock } from '@/components/docs/code-block';
import { Example } from '@/components/docs/example';
import { InstallCommand } from '@/components/docs/install-command';
import { C, DocsPage, P, Section, SubSection } from '@/components/docs/page-shell';
import { PropsTable, type PropRow } from '@/components/docs/props-table';

export const metadata: Metadata = {
  title: 'Badge',
  description:
    'Small status label with theme-aware default, secondary, outline and destructive variants, fixed color variants from red to zinc, and a compact size.',
};

const sections = [
  ['installation', 'Installation'],
  ['usage', 'Usage'],
  ['examples', 'Examples'],
  ['api', 'API reference'],
] as const;

const USAGE = `
import { Circle } from 'lucide-react';

import { Badge } from '@/components/dentil/badge/badge';

<Badge variant="green">
  <Circle className="fill-current" />
  paid
</Badge>
<Badge variant="amber" size="sm">past due</Badge>
<Badge variant="blue" asChild>
  <a href="/invoices/in_123">open</a>
</Badge>
`;

const rows: PropRow[] = [
  {
    name: 'variant',
    type: "'default' | 'secondary' | 'destructive' | 'outline' | 'red' | 'orange' | 'amber' | 'yellow' | 'lime' | 'green' | 'emerald' | 'teal' | 'cyan' | 'sky' | 'blue' | 'indigo' | 'violet' | 'purple' | 'fuchsia' | 'pink' | 'rose' | 'zinc'",
    default: "'default'",
    description: (
      <>
        <code>default</code> is a muted fill, <code>secondary</code> uses the secondary token, and <code>outline</code>{' '}
        is text with an accent hover when the badge is a link. <code>destructive</code> uses the theme&apos;s
        destructive tint. The named colors are fixed Tailwind hues, so a paid badge stays green when the theme changes.
        A parent with <code>className=&quot;group&quot;</code> and <code>data-hover</code> deepens a named color.
      </>
    ),
  },
  {
    name: 'size',
    type: "'default' | 'sm'",
    default: "'default'",
    description: 'default is padded text. sm is 19px tall with tighter horizontal padding.',
  },
  {
    name: 'asChild',
    type: 'boolean',
    default: 'false',
    description: (
      <>
        Renders the styles on the child instead of a span, for a link or button. The child must be one element, such as{' '}
        <code>&lt;a&gt;</code>.
      </>
    ),
  },
  {
    name: 'className',
    type: 'string',
    description: 'Merged onto the badge.',
  },
  {
    name: '…props',
    type: "ComponentProps<'span'>",
    description: (
      <>
        Other span props, such as <code>onClick</code> and <code>aria-invalid</code>. <code>aria-invalid</code> draws
        the destructive ring.
      </>
    ),
  },
];

export default function BadgePage() {
  return (
    <DocsPage
      href="/docs/badge"
      sections={sections}
      lead={
        <>
          <C>Badge</C> labels a status. The first letter is capitalized, so paid reads as Paid. Green, amber, red and
          zinc keep their hue in any theme. <C>default</C>, <C>secondary</C> and <C>outline</C> follow the theme. Active
          uses <C>size=&quot;sm&quot;</C>, and Draft is the badge rendered as a link.
        </>
      }
      demo={
        <Example file="badge-overview.tsx" padded>
          <BadgeOverviewDemo />
        </Example>
      }>
      <Section id="installation" title="Installation">
        <InstallCommand items={['@dentil/badge']} />
        <P>
          Files land in <C>components/dentil/badge/</C>. It has no shadcn dependencies. <C>asChild</C> uses Radix{' '}
          <C>Slot</C>.
        </P>
      </Section>

      <Section id="usage" title="Usage">
        <P>
          Pass the status in lowercase. An icon inside is 12px. <C>asChild</C> puts the same styles on a link.
        </P>
        <CodeBlock code={USAGE} />
      </Section>

      <Section id="examples" title="Examples">
        <SubSection title="Colors" description="Theme variants first, then the fixed hues.">
          <Example file="badge-colors.tsx" padded>
            <BadgeColorsDemo />
          </Example>
        </SubSection>
        <SubSection title="Sizes" description="sm is the compact chip used in dense tables.">
          <Example file="badge-sizes.tsx" padded>
            <BadgeSizesDemo />
          </Example>
        </SubSection>
      </Section>

      <Section id="api" title="API reference">
        <SubSection title="Badge">
          <PropsTable rows={rows} />
        </SubSection>
      </Section>
    </DocsPage>
  );
}
