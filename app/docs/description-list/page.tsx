import type { Metadata } from 'next';

import { CodeBlock } from '@/components/docs/code-block';
import { Example } from '@/components/docs/example';
import { InstallCommand } from '@/components/docs/install-command';
import { A, C, DocsPage, P, Section, SubSection } from '@/components/docs/page-shell';
import { PropsTable, type PropRow } from '@/components/docs/props-table';
import { DescriptionListOverviewDemo } from '@/components/demos/description-list-overview';
import { DescriptionListPrimitivesDemo } from '@/components/demos/description-list-primitives';
import { DescriptionListVerticalDemo } from '@/components/demos/description-list-vertical';

export const metadata: Metadata = {
  title: 'Description List',
  description:
    'Term and detail pairs for shadcn/ui record pages, in one or two columns, with links, copy buttons and a "Show more" section.',
};

const sections = [
  ['installation', 'Installation'],
  ['usage', 'Usage'],
  ['links', 'Links'],
  ['examples', 'Examples'],
  ['api', 'API reference'],
] as const;

const USAGE = `
import { Descriptions } from '@/components/dentil/description-list/description-list';

<Descriptions
  columns={[
    [
      { term: 'Name', detail: customer.name },
      { term: 'Email', detail: customer.email, copy: customer.email },
    ],
    [
      { term: 'Created', detail: <Date date={customer.created} /> },
      { term: 'Latest invoice', detail: invoice.number, href: \`/invoices/\${invoice.id}\` },
    ],
  ]}
  more={[
    { term: 'Website', detail: customer.website, href: customer.website, external: true },
    customer.tax_id && { term: 'Tax ID', detail: customer.tax_id },
  ]}
/>
`;

const LINKS = `
import Link from 'next/link';

<Descriptions linkComponent={Link} items={items} />
`;

const PRIMITIVES = `
import {
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
} from '@/components/dentil/description-list/description-list';

<DescriptionList>
  <DescriptionTerm>Status</DescriptionTerm>
  <DescriptionDetails>Active</DescriptionDetails>
</DescriptionList>
`;

const descriptionsRows: PropRow[] = [
  {
    name: 'items',
    type: 'DescriptionItems',
    description: (
      <>
        One list, full width. Pass this or <code>columns</code>.
      </>
    ),
  },
  {
    name: 'columns',
    type: 'DescriptionItems[]',
    description: 'Lists shown side by side from the sm breakpoint, and one after another below it.',
  },
  {
    name: 'orientation',
    type: "'responsive' | 'vertical'",
    default: "'responsive'",
    description: (
      <>
        <code>responsive</code> puts the term beside the detail from sm. <code>vertical</code> always stacks them, for
        narrow containers.
      </>
    ),
  },
  {
    name: 'more',
    type: 'DescriptionItems',
    description: 'Items in a collapsed list below, opened by a toggle. The toggle is hidden when every entry is falsy.',
  },
  { name: 'moreLabel', type: 'ReactNode', default: "'Show more'", description: 'The toggle label.' },
  { name: 'defaultMoreOpen', type: 'boolean', default: 'false', description: 'Starts with the more list open.' },
  {
    name: 'linkComponent',
    type: 'LinkComponent',
    default: "'a'",
    description: (
      <>
        Passed to each item&apos;s <code>Link</code>, so <code>next/link</code> or your router renders the anchor.
      </>
    ),
  },
  {
    name: '…props',
    type: "ComponentProps<'div'>",
    description: (
      <>
        Other props (<code>className</code>, <code>id</code>…) are passed to the wrapper.
      </>
    ),
  },
];

const itemRows: PropRow[] = [
  {
    name: 'term',
    type: 'ReactNode',
    description: (
      <>
        The label. <code>&apos;&apos;</code> renders a continuation line, such as the second line of an address.
      </>
    ),
  },
  { name: 'detail', type: 'ReactNode', description: 'The value. Long text wraps, and linked text truncates.' },
  {
    name: 'href',
    type: 'string',
    description: (
      <>
        Renders the detail as a <code>Link</code>, with a chevron that turns into an arrow on hover.
      </>
    ),
  },
  {
    name: 'external',
    type: 'boolean',
    default: 'false',
    description: 'Opens the link in a new tab and swaps the arrow for an external-link icon.',
  },
  {
    name: 'copy',
    type: 'string',
    description:
      'Text copied by a button beside the detail. It shows on hover, on keyboard focus and on touch screens.',
  },
];

const primitiveRows: PropRow[] = [
  {
    name: 'DescriptionListColumns',
    type: "ComponentProps<'div'>",
    description: (
      <>
        Grid that puts its <code>DescriptionList</code> children side by side from sm.
      </>
    ),
  },
  {
    name: 'DescriptionList',
    type: "ComponentProps<'dl'> & { orientation? }",
    description: (
      <>
        The <code>dl</code>. Takes the same <code>orientation</code> as <code>Descriptions</code>.
      </>
    ),
  },
  {
    name: 'DescriptionTerm',
    type: "ComponentProps<'dt'>",
    description: 'A muted term in the first column.',
  },
  {
    name: 'DescriptionDetails',
    type: "ComponentProps<'dd'>",
    description: (
      <>
        The detail beside the term. Add <code>flex items-center gap-2</code> to put a copy button after it.
      </>
    ),
  },
  {
    name: 'DescriptionCopyButton',
    type: "{ value: string } & ComponentProps<'button'>",
    description: (
      <>
        Copies <code>value</code> and shows a check for 1.5 seconds. Pass an <code>aria-label</code> that names what it
        copies.
      </>
    ),
  },
];

export default function DescriptionListPage() {
  return (
    <DocsPage
      href="/docs/description-list"
      sections={sections}
      lead={
        <>
          <C>Descriptions</C> renders term and detail pairs from an array, in one or two columns, with links, copy
          buttons and a &quot;Show more&quot; section. The primitives it&apos;s built from, such as{' '}
          <C>DescriptionList</C>, are exported for custom layouts. Hover the email to copy it.
        </>
      }
      demo={
        <Example file="description-list-overview.tsx" padded>
          <DescriptionListOverviewDemo />
        </Example>
      }>
      <Section id="installation" title="Installation">
        <InstallCommand items={['@dentil/description-list']} />
        <P>
          Files land in <C>components/dentil/description-list/</C>. It has no stock shadcn dependencies, and installs{' '}
          <A href="/docs/link">@dentil/link</A> for item links.
        </P>
      </Section>

      <Section id="usage" title="Usage">
        <CodeBlock code={USAGE} />
        <P>
          Pass <C>items</C> for one list or <C>columns</C> for several. Falsy entries are skipped, so{' '}
          <C>{'value && { term, detail }'}</C> adds an item only when there&apos;s something to show. <C>more</C> takes
          the same entries and hides them behind a toggle.
        </P>
        <P>For anything the array doesn&apos;t cover, compose the primitives directly. They carry the same layout.</P>
        <CodeBlock code={PRIMITIVES} />
      </Section>

      <Section id="links" title="Links">
        <P>
          Items with an <C>href</C> render a <C>Link</C>, which uses a plain <C>a</C> by default. Pass your
          router&apos;s link as <C>linkComponent</C> for client-side navigation, or change the default in your copy of
          the file so you don&apos;t pass it on every page.
        </P>
        <CodeBlock code={LINKS} />
      </Section>

      <Section id="examples" title="Examples">
        <SubSection title="Vertical" description="Stacks each term above its detail, for sidebars and narrow panels.">
          <Example file="description-list-vertical.tsx" padded>
            <DescriptionListVerticalDemo />
          </Example>
        </SubSection>
        <SubSection
          title="Primitives"
          description="Custom details, such as a status dot or a multi-line address, with a copy button placed by hand.">
          <Example file="description-list-primitives.tsx" padded>
            <DescriptionListPrimitivesDemo />
          </Example>
        </SubSection>
      </Section>

      <Section id="api" title="API reference">
        <SubSection title="Descriptions">
          <PropsTable rows={descriptionsRows} />
        </SubSection>
        <SubSection title="DescriptionItem">
          <PropsTable rows={itemRows} />
        </SubSection>
        <SubSection title="Primitives">
          <PropsTable rows={primitiveRows} />
        </SubSection>
      </Section>
    </DocsPage>
  );
}
