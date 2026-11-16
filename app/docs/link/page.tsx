import type { Metadata } from 'next';

import { LinkOverviewDemo } from '@/components/demos/link-overview';
import { CodeBlock } from '@/components/docs/code-block';
import { Example } from '@/components/docs/example';
import { InstallCommand } from '@/components/docs/install-command';
import { C, DocsPage, P, Section, SubSection } from '@/components/docs/page-shell';
import { PropsTable, type PropRow } from '@/components/docs/props-table';

export const metadata: Metadata = {
  title: 'Link',
  description:
    'A text link for shadcn/ui with a chevron that turns into an arrow on hover, an external variant that opens a new tab, and a linkComponent prop for your router.',
};

const sections = [
  ['installation', 'Installation'],
  ['usage', 'Usage'],
  ['api', 'API reference'],
] as const;

const USAGE = `
import { Link } from '@/components/dentil/link/link';

<Link href="/customers/cus_123">View customer</Link>
<Link href="/invoices" arrow={false}>All invoices</Link>
<Link href="https://stripe.com/docs" external>Stripe docs</Link>
`;

const NEXT = `
import NextLink from 'next/link';

import { Link, type LinkComponentProps } from '@/components/dentil/link/link';

<Link href="/customers/cus_123" linkComponent={NextLink}>
  View customer
</Link>

// To set next/link props such as prefetch, wrap it once:
const NoPrefetchLink = (props: LinkComponentProps) => <NextLink prefetch={false} {...props} />;
`;

const REACT_ROUTER = `
import { Link as RouterLink } from 'react-router';

import { Link, type LinkComponentProps } from '@/components/dentil/link/link';

// React Router's Link takes \`to\`, so adapt it once:
const AppLink = ({ href, ...props }: LinkComponentProps) => <RouterLink to={href} {...props} />;

<Link href="/customers/cus_123" linkComponent={AppLink}>
  View customer
</Link>
`;

const rows: PropRow[] = [
  {
    name: 'href',
    type: 'string',
    description: 'Where the link goes. Passed to linkComponent unchanged.',
  },
  {
    name: 'arrow',
    type: 'boolean',
    default: 'true',
    description:
      'Shows a chevron after the label that turns into an arrow on hover and keyboard focus. Ignored when external is set.',
  },
  {
    name: 'external',
    type: 'boolean',
    default: 'false',
    description: (
      <>
        Sets <code>target=&quot;_blank&quot;</code> and <code>rel=&quot;noopener noreferrer&quot;</code>, and shows an
        external link icon with screen reader text saying it opens a new tab. Pass <code>target</code> or{' '}
        <code>rel</code> to override them.
      </>
    ),
  },
  {
    name: 'linkComponent',
    type: 'ElementType<LinkComponentProps>',
    default: "'a'",
    description: (
      <>
        Renders the anchor. Pass <code>next/link</code> directly, or adapt a router link that takes <code>to</code>.
      </>
    ),
  },
  {
    name: 'labelClassName',
    type: 'string',
    description: 'Merged onto the label. The label truncates with an ellipsis when the link is narrower than it.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Merged onto the anchor.',
  },
  {
    name: '…props',
    type: "Omit<ComponentProps<'a'>, 'href'>",
    description: (
      <>
        Other anchor props, such as <code>onClick</code>, <code>title</code> and <code>aria-*</code> attributes, go to{' '}
        <code>linkComponent</code>.
      </>
    ),
  },
];

export default function LinkPage() {
  return (
    <DocsPage
      href="/docs/link"
      sections={sections}
      lead={
        <>
          <C>Link</C> is a text link whose chevron turns into an arrow on hover. With <C>external</C> it opens a new tab
          and shows an external link icon instead. Long labels truncate, like the invoice ID capped with <C>max-w-48</C>.
        </>
      }
      demo={
        <Example file="link-overview.tsx" padded>
          <LinkOverviewDemo />
        </Example>
      }>
      <Section id="installation" title="Installation">
        <InstallCommand items={['@dentil/link']} />
        <P>
          Files land in <C>components/dentil/link/</C>. It uses no shadcn components, only <C>lucide-react</C> icons and
          your theme&apos;s <C>primary</C> colour.
        </P>
      </Section>

      <Section id="usage" title="Usage">
        <P>
          The link inherits the surrounding font size. With no <C>linkComponent</C> it renders a plain <C>&lt;a&gt;</C>,
          which reloads the page on click.
        </P>
        <CodeBlock code={USAGE} />
        <SubSection title="Next.js" description="Pass next/link directly, or wrap it to set its own props.">
          <CodeBlock code={NEXT} />
        </SubSection>
        <SubSection title="React Router" description="Adapt its Link once, since it takes to instead of href.">
          <CodeBlock code={REACT_ROUTER} />
        </SubSection>
      </Section>

      <Section id="api" title="API reference">
        <SubSection title="Link">
          <PropsTable rows={rows} />
        </SubSection>
      </Section>
    </DocsPage>
  );
}
