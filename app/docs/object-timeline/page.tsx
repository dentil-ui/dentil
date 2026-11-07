import type { Metadata } from 'next';

import { CodeBlock } from '@/components/docs/code-block';
import { Example } from '@/components/docs/example';
import { InstallCommand } from '@/components/docs/install-command';
import { C, DocsPage, P, Section, SubSection } from '@/components/docs/page-shell';
import { PropsTable, type PropRow } from '@/components/docs/props-table';
import { ObjectTimelineOverviewDemo } from '@/components/demos/object-timeline-overview';

export const metadata: Metadata = {
  title: 'Object Timeline',
  description:
    'A vertical event list for shadcn/ui with an icon, title, description, date and an optional action on the title.',
};

const sections = [
  ['installation', 'Installation'],
  ['usage', 'Usage'],
  ['api', 'API reference'],
] as const;

const USAGE = `
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
/>
`;

const timelineRows: PropRow[] = [
  {
    name: 'items',
    type: 'ObjectTimelineItem[]',
    description: 'Events, in the order they render. The first item is at the top.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Merged onto the list.',
  },
  {
    name: '…props',
    type: "ComponentProps<'ol'>",
    description: (
      <>
        Other props (<code>aria-label</code>, <code>id</code>…) are passed to the list.
      </>
    ),
  },
];

const itemRows: PropRow[] = [
  { name: 'id', type: 'number | string', description: 'Stable identity for the row.' },
  {
    name: 'date',
    type: 'ReactNode',
    description: 'Secondary line under the description. Omit it when the event has no time.',
  },
  { name: 'title', type: 'ReactNode', description: 'The event. With onClick, this becomes the button label.' },
  { name: 'description', type: 'ReactNode', description: 'Muted line between the title and the date.' },
  {
    name: 'icon',
    type: 'ComponentType<{ className?: string; size?: number }>',
    description: 'Drawn at 14px on the rail. Lucide icons match this type.',
  },
  {
    name: 'iconClassName',
    type: 'string',
    description: (
      <>
        Colour and other classes for the icon. Defaults to <code>text-muted-foreground</code>.
      </>
    ),
  },
  {
    name: 'onClick',
    type: '() => void',
    description: 'When set, the title is a button. Omit it for a record that does nothing.',
  },
];

export default function ObjectTimelinePage() {
  return (
    <DocsPage
      href="/docs/object-timeline"
      sections={sections}
      lead={
        <>
          <C>ObjectTimeline</C> renders a vertical record of events. Each item has an icon and a title, and can add a
          description, a date and an <C>onClick</C> that turns the title into a button. Click the receipt.
        </>
      }
      demo={
        <Example file="object-timeline-overview.tsx" padded>
          <ObjectTimelineOverviewDemo />
        </Example>
      }>
      <Section id="installation" title="Installation">
        <InstallCommand items={['@dentil/object-timeline']} />
        <P>
          Files land in <C>components/dentil/object-timeline/</C>. It has no stock shadcn dependencies. Pass any icon
          component that accepts <C>className</C> and <C>size</C>, such as one from <C>lucide-react</C>.
        </P>
      </Section>

      <Section id="usage" title="Usage">
        <CodeBlock code={USAGE} />
        <P>
          Items without <C>onClick</C> stay plain text. The title is the button label when you pass one, so keep that
          title as text rather than nesting another link inside it.
        </P>
      </Section>

      <Section id="api" title="API reference">
        <SubSection title="ObjectTimeline">
          <PropsTable rows={timelineRows} />
        </SubSection>
        <SubSection title="ObjectTimelineItem">
          <PropsTable rows={itemRows} />
        </SubSection>
      </Section>
    </DocsPage>
  );
}
