import type { Metadata } from 'next';

import { ObjectHeaderOverviewDemo } from '@/components/demos/object-header-overview';
import { ObjectHeaderPresenceDemo } from '@/components/demos/object-header-presence';
import { CodeBlock } from '@/components/docs/code-block';
import { Example } from '@/components/docs/example';
import { InstallCommand } from '@/components/docs/install-command';
import { C, DocsPage, P, Section, SubSection } from '@/components/docs/page-shell';
import { PropsTable, type PropRow } from '@/components/docs/props-table';

export const metadata: Metadata = {
  title: 'Object Header',
  description:
    'A record page header row: the object type with an icon, stacked avatars for the people viewing the record, and dashed copy buttons for the page URL and the object ID.',
};

const sections = [
  ['installation', 'Installation'],
  ['usage', 'Usage'],
  ['presence', 'Presence'],
  ['api', 'API reference'],
] as const;

const USAGE = `
import { Receipt } from 'lucide-react';
import { toast } from 'sonner';

import { ObjectHeader } from '@/components/dentil/object-header/object-header';

<ObjectHeader
  icon={Receipt}
  title="Invoice"
  id={invoice.id}
  url
  onCopy={() => toast.success('Copied to clipboard')}
/>
<DashboardHeader>
  <DashboardHeading>{invoice.total}</DashboardHeading>
</DashboardHeader>
`;

const SHARE_URL = `
// Copy a link that works for teammates in other accounts, instead of the page's own address.
<ObjectHeader
  icon={Receipt}
  title="Invoice"
  id={invoice.id}
  url={\`\${origin}/b/\${account.id}?destination=\${encodeURIComponent(pathname)}\`}
/>
`;

const LIVEBLOCKS = `
import { useOthersMapped, useSelf } from '@liveblocks/react';

function InvoiceHeader({ invoice }: { invoice: Invoice }) {
  const self = useSelf((me) => me.info);
  const others = useOthersMapped((other) => other.info);

  return (
    <ObjectHeader
      icon={Receipt}
      title="Invoice"
      id={invoice.id}
      url
      presence={[
        ...(self ? [{ id: 'self', name: self.name, avatar: self.avatar }] : []),
        ...others.map(([connectionId, info]) => ({ id: String(connectionId), name: info.name, avatar: info.avatar })),
      ]}
    />
  );
}
`;

const headerRows: PropRow[] = [
  { name: 'title', type: 'ReactNode', description: 'The object type, such as "Invoice" or "Customer". Truncates.' },
  { name: 'icon', type: 'LucideIcon', description: 'Icon shown before the title at 12px.' },
  {
    name: 'id',
    type: 'string',
    description: 'The object ID. Shown as a copy button labelled with the ID, truncated past 240px.',
  },
  {
    name: 'url',
    type: 'string | true',
    description: (
      <>
        Shows a copy button labelled &quot;URL&quot;. Pass the URL to copy, or <code>true</code> to copy{' '}
        <code>window.location.href</code> at the moment of the click, which is safe to render on the server.
      </>
    ),
  },
  {
    name: 'presence',
    type: 'ObjectHeaderUser[]',
    description: (
      <>
        People viewing the record, as <code>{'{ id?, name, avatar? }'}</code>. Rendered with{' '}
        <code>ObjectHeaderPresence</code>. Hidden when empty.
      </>
    ),
  },
  {
    name: 'onCopy',
    type: '(value: string) => void',
    description: 'Called after a value is written to the clipboard, e.g. to show a toast.',
  },
  {
    name: 'children',
    type: 'ReactNode',
    description: 'Extra actions, placed between the avatars and the copy buttons.',
  },
  { name: 'className', type: 'string', description: 'Merged onto the row.' },
  {
    name: '…props',
    type: "Omit<ComponentProps<'div'>, 'title' | 'id' | 'onCopy'>",
    description: (
      <>
        Other <code>div</code> props.
      </>
    ),
  },
];

const copyRows: PropRow[] = [
  {
    name: 'value',
    type: 'string | (() => string)',
    description: 'Text written to the clipboard, or a function that returns it when clicked.',
  },
  { name: 'onCopy', type: '(value: string) => void', description: 'Called after the value is copied.' },
  { name: 'children', type: 'ReactNode', description: 'The label, in a monospace font. Truncates.' },
  {
    name: 'aria-label',
    type: 'string',
    default: "'Copy'",
    description: 'Accessible name. Reads "Copied" for two seconds after a copy.',
  },
];

const presenceRows: PropRow[] = [
  {
    name: 'users',
    type: 'ObjectHeaderUser[]',
    description: (
      <>
        People viewing the record. Each needs a <code>name</code>; <code>avatar</code> is an image URL, and without one
        the avatar shows the first letter of the name. <code>id</code> is the React key and falls back to the name.
      </>
    ),
  },
  {
    name: 'max',
    type: 'number',
    default: '5',
    description: 'Avatars shown before the rest collapse into a "+N" count. Hover the count to see their names.',
  },
];

export default function ObjectHeaderPage() {
  return (
    <DocsPage
      href="/docs/object-header"
      sections={sections}
      lead={
        <>
          <C>ObjectHeader</C> is the small row at the top of a record page. It names the object type and gives one-click
          copies of the page URL and the object ID, with the avatars of anyone else looking at the same record.
        </>
      }
      demo={
        <Example file="object-header-overview.tsx" padded>
          <ObjectHeaderOverviewDemo />
        </Example>
      }>
      <Section id="installation" title="Installation">
        <InstallCommand items={['@dentil/object-header']} />
        <P>
          Files land in <C>components/dentil/object-header/</C>. It uses no shadcn components, only <C>lucide-react</C>{' '}
          icons. The avatars animate in with <C>tw-animate-css</C>, which shadcn sets up by default.
        </P>
      </Section>

      <Section id="usage" title="Usage">
        <P>
          Put it above the page heading. Its 20px side padding and 12px top padding line up with{' '}
          <C>@dentil/dashboard-layout</C>. There&apos;s no toast built in, so pass <C>onCopy</C> to show one with your
          own toaster.
        </P>
        <CodeBlock code={USAGE} />
        <SubSection
          title="Share links"
          description="Pass a string to url to copy something other than the page address.">
          <CodeBlock code={SHARE_URL} />
        </SubSection>
      </Section>

      <Section id="presence" title="Presence">
        <P>
          <C>presence</C> takes a plain array, so it works with any realtime provider. Put the current user first:
          earlier avatars sit on top of later ones. Names show on hover.
        </P>
        <Example file="object-header-presence.tsx" padded>
          <ObjectHeaderPresenceDemo />
        </Example>
        <SubSection title="Liveblocks" description="Map the current user and the others in the room to users.">
          <CodeBlock code={LIVEBLOCKS} />
        </SubSection>
      </Section>

      <Section id="api" title="API reference">
        <SubSection title="ObjectHeader">
          <PropsTable rows={headerRows} />
        </SubSection>
        <SubSection title="ObjectHeaderCopyButton">
          <PropsTable rows={copyRows} />
        </SubSection>
        <SubSection title="ObjectHeaderPresence">
          <PropsTable rows={presenceRows} />
        </SubSection>
      </Section>
    </DocsPage>
  );
}
