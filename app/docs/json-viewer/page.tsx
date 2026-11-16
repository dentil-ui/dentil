import type { Metadata } from 'next';

import { JsonViewerCollapsedDemo } from '@/components/demos/json-viewer-collapsed';
import { JsonViewerOverviewDemo } from '@/components/demos/json-viewer-overview';
import { CodeBlock } from '@/components/docs/code-block';
import { Example } from '@/components/docs/example';
import { InstallCommand } from '@/components/docs/install-command';
import { C, DocsPage, P, Section, SubSection } from '@/components/docs/page-shell';
import { PropsTable, type PropRow } from '@/components/docs/props-table';

export const metadata: Metadata = {
  title: 'JSON Viewer',
  description:
    'A collapsible JSON tree for shadcn/ui that follows your theme, links object IDs to their pages and shows the date behind a unix timestamp on hover.',
};

const sections = [
  ['installation', 'Installation'],
  ['usage', 'Usage'],
  ['examples', 'Examples'],
  ['links', 'Links'],
  ['timestamps', 'Timestamps'],
  ['api', 'API reference'],
] as const;

const USAGE = `
import { JsonViewer } from '@/components/dentil/json-viewer/json-viewer';

<JsonViewer data={event} timezone="Europe/London" />
`;

const LINKS = `
import Link from 'next/link';

const routes: Record<string, string> = {
  cus_: '/customers',
  inv_: '/invoices',
};

function getHref(value: string) {
  const prefix = Object.keys(routes).find((candidate) => value.startsWith(candidate));
  return prefix ? \`\${routes[prefix]}/\${value}\` : undefined;
}

<JsonViewer data={event} getHref={getHref} linkComponent={Link} />
`;

const TIMESTAMPS = `
import { isTimestamp } from '@/components/dentil/json-viewer/timestamps';

// Also treat \`billed\` as a timestamp.
<JsonViewer data={event} timestamps={(value, key) => key === 'billed' || isTimestamp(value, key)} />

// Turn it off.
<JsonViewer data={event} timestamps={false} />
`;

const viewerRows: PropRow[] = [
  {
    name: 'data',
    type: 'unknown',
    description: (
      <>
        Any JSON-serializable value. As with <code>JSON.stringify</code>, <code>undefined</code> and functions are
        skipped in objects and shown as <code>null</code> in arrays. A <code>Date</code> renders as its ISO string.
      </>
    ),
  },
  {
    name: 'defaultExpandDepth',
    type: 'number',
    default: 'Infinity',
    description: (
      <>
        Objects and arrays nested shallower than this start expanded. <code>0</code> collapses the root, and{' '}
        <code>1</code> shows only its keys. It is read once per node, so change the <code>key</code> to reset.
      </>
    ),
  },
  {
    name: 'getHref',
    type: '(value: string, key: string | number | undefined) => string | undefined',
    description: (
      <>
        Called for every string value with its object key or array index. Return a URL to render the value as a link, or{' '}
        <code>undefined</code> to leave it as text.
      </>
    ),
  },
  {
    name: 'linkComponent',
    type: 'ElementType<{ href: string; className?: string; children?: ReactNode }>',
    default: "'a'",
    description: (
      <>
        Renders the links from <code>getHref</code>. Pass <code>next/link</code>, or adapt your router&apos;s link once.
      </>
    ),
  },
  {
    name: 'timestamps',
    type: 'boolean | ((value: string | number, key: string | number | undefined) => boolean)',
    default: 'true',
    description: (
      <>
        Underlines timestamps and shows the date in <code>timezone</code> and UTC on hover. <code>true</code> uses{' '}
        <code>isTimestamp</code>. A function decides per value, and <code>false</code> turns it off.
      </>
    ),
  },
  {
    name: 'timezone',
    type: 'string',
    description:
      'IANA time zone shown beside UTC in the hover card, such as Europe/London. Omit it to use the runtime zone. An unknown name is shown as UTC.',
  },
  {
    name: 'locale',
    type: 'string',
    description: 'BCP 47 language tag for the hover card dates. Omit it to use the runtime locale.',
  },
  {
    name: 'className',
    type: 'string',
    description: (
      <>
        Merged onto the root, which is <code>font-mono text-xs leading-5</code>. Override the size here.
      </>
    ),
  },
  {
    name: '…props',
    type: "Omit<ComponentProps<'div'>, 'children'>",
    description: 'Other props are passed to the root div.',
  },
];

const isTimestampRows: PropRow[] = [
  { name: 'value', type: 'string | number', description: 'A string or number value from the data.' },
  {
    name: 'key',
    type: 'string | number | undefined',
    description: 'Its object key, array index, or undefined for the root value.',
  },
];

export default function JsonViewerPage() {
  return (
    <DocsPage
      href="/docs/json-viewer"
      sections={sections}
      lead={
        <>
          <C>JsonViewer</C> renders a value as a collapsible JSON tree in your theme&apos;s tokens. <C>getHref</C> turns
          object IDs into links, and timestamps show their date on hover. Hover <C>created</C>, or click the customer
          ID.
        </>
      }
      demo={
        <Example file="json-viewer-overview.tsx" padded>
          <JsonViewerOverviewDemo />
        </Example>
      }>
      <Section id="installation" title="Installation">
        <InstallCommand items={['@dentil/json-viewer']} />
        <P>
          Files land in <C>components/dentil/json-viewer/</C>. It uses the stock <C>HoverCard</C> and the date
          formatting from <C>@dentil/date</C>, which the CLI installs with it. There is no provider and no JSON library.
        </P>
      </Section>

      <Section id="usage" title="Usage">
        <CodeBlock code={USAGE} />
        <P>
          Click an object or array to collapse it to a count of its keys or items. Keys are muted so the values read
          first. Quotes, colons and commas are real text, so selecting an expanded tree copies valid JSON.
        </P>
      </Section>

      <Section id="examples" title="Examples">
        <SubSection title="Collapsed">
          <P>
            <C>defaultExpandDepth={'{1}'}</C> shows the top-level keys and collapses everything under them. Expand{' '}
            <C>body</C> to see its nested <C>address</C> stay collapsed.
          </P>
          <Example file="json-viewer-collapsed.tsx" padded>
            <JsonViewerCollapsedDemo />
          </Example>
        </SubSection>
      </Section>

      <Section id="links" title="Links">
        <P>
          <C>getHref</C> receives every string value and its key. Match the ID prefixes your API uses and return the
          page for each. Values without a match stay plain text. Pass <C>linkComponent</C> so links use your router.
        </P>
        <CodeBlock code={LINKS} />
      </Section>

      <Section id="timestamps" title="Timestamps">
        <P>
          By default, ISO 8601 date-times and unix timestamps between 2000 and 2100, in seconds or milliseconds, are
          underlined with a dotted line. A number counts when its key looks like a date (<C>created</C>, <C>paid_at</C>,{' '}
          <C>dueDate</C>) and never when it looks like money or a count (<C>amount</C>, <C>quantity</C>). With any other
          key, a number counts only in seconds, and a numeric string doesn&apos;t count. Pass a function to{' '}
          <C>timestamps</C> to change the rule.
        </P>
        <CodeBlock code={TIMESTAMPS} />
      </Section>

      <Section id="api" title="API reference">
        <SubSection title="JsonViewer">
          <PropsTable rows={viewerRows} />
        </SubSection>
        <SubSection title="isTimestamp">
          <P>
            <C>isTimestamp(value, key)</C> from <C>@/components/dentil/json-viewer/timestamps</C> is the default rule.{' '}
            <C>parseTimestamp(value)</C> from the same file returns the <C>Date</C> it refers to, or <C>null</C>.
          </P>
          <PropsTable rows={isTimestampRows} />
        </SubSection>
      </Section>
    </DocsPage>
  );
}
