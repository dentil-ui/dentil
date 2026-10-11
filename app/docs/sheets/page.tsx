import type { Metadata } from 'next';

import { CodeBlock } from '@/components/docs/code-block';
import { Example } from '@/components/docs/example';
import { InstallCommand } from '@/components/docs/install-command';
import { A, C, DocsPage, P, Section, SubSection } from '@/components/docs/page-shell';
import { Step, Steps } from '@/components/docs/steps';
import { PropsTable, type PropRow } from '@/components/docs/props-table';
import { SheetsBasicDemo } from '@/components/demos/sheets-basic';
import { SheetsMinimizeDemo } from '@/components/demos/sheets-minimize';
import { SheetsOverviewDemo } from '@/components/demos/sheets-overview';
import { SheetsStackingDemo } from '@/components/demos/sheets-stacking';
import { SheetsStackingFlushDemo } from '@/components/demos/sheets-stacking-flush';
import { registryItemUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Sheets',
  description: 'A promise-based, typed sheet registry for shadcn/ui with stacking, minimizing and draft retention.',
};

const sections = [
  ['installation', 'Installation'],
  ['setup', 'Setup'],
  ['usage', 'Usage'],
  ['adding', 'Adding a sheet'],
  ['examples', 'Examples'],
  ['drafts', 'Drafts'],
  ['api', 'API reference'],
] as const;

const SETUP = `
// app/layout.tsx (or your root component)
import { ModalProvider } from '@/components/modals';
import { SheetProvider } from '@/components/sheets';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Using @dentil/modals too? Put SheetProvider inside it so sheets can open modals. */}
        <ModalProvider>
          <SheetProvider
            onClose={(key, { value, reason, durationMs, minimized }) =>
              analytics.track('sheet_closed', { key, completed: value !== undefined, reason, durationMs, minimized })
            }>
            {children}
          </SheetProvider>
        </ModalProvider>
      </body>
    </html>
  );
}
`;

const USAGE = `
'use client';

import { useSheet } from '@/components/sheets';

export function EditCustomerButton({ customer }: { customer: Customer }) {
  const { openSheet } = useSheet();

  const onClick = async () => {
    // \`details\` is \`{ name: string; notes: string } | undefined\`.
    const details = await openSheet(
      'edit-details',
      { title: 'Edit customer', defaultValues: { name: customer.name } },
      { size: 'md' }
    );
    if (details) await updateCustomer(customer.id, details);
  };

  return <Button onClick={onClick}>Edit</Button>;
}
`;

const CONTENT = `
// components/sheets/contents/create-price.tsx
'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';

import type { SheetContentProps } from '../types';
import { useSheetDraft } from '../use-sheet-draft';

// SheetContentProps<TReturn> adds \`sheetId\` and \`close(value?: TReturn)\`.
type CreatePriceSheetProps = SheetContentProps<Price> & { productId: string };

export default function CreatePriceSheet({ sheetId, close, productId }: CreatePriceSheetProps) {
  const [amount, setAmount] = useSheetDraft(sheetId, '');
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      close(await createPrice({ productId, amount }));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <form className="flex flex-1 flex-col" onSubmit={submit}>
      <SheetHeader>
        <SheetTitle>New price</SheetTitle>
      </SheetHeader>
      {/* …fields… */}
      <SheetFooter className="flex-row justify-end">
        <Button type="button" variant="outline" onClick={() => close()}>
          Cancel
        </Button>
        <Button type="submit">Create</Button>
      </SheetFooter>
    </form>
  );
}
`;

const REGISTER = `
// components/sheets/registry.tsx
const sheetLoaders = {
  'edit-details': () => import('./contents/edit-details'),
  'prices.create': () => import('./contents/create-price'), // ← the only line to add
} as const;
`;

const CALL = `
const price = await openSheet('prices.create', { productId }, { minimizable: true, title: 'New price' });
//    ^? Price | undefined
`;

const RHF = `
// react-hook-form: seed from the draft and write every change back.
const [draft, setDraft] = useSheetDraft<FormValues>(sheetId, defaultValues);
const form = useForm<FormValues>({ defaultValues: draft });

useEffect(() => {
  const subscription = form.watch((values) => setDraft(values as FormValues));
  return () => subscription.unsubscribe();
}, [form, setDraft]);
`;

const useSheetRows: PropRow[] = [
  {
    name: 'openSheet',
    type: '(key, props?, options?) => Promise<Return | undefined>',
    description: (
      <>
        Opens a sheet on top of the stack. Resolves with the value passed to <code>close</code>, or{' '}
        <code>undefined</code> when dismissed. If a sheet with the same key is already open, it&apos;s restored and the
        same promise is returned (unless <code>multiple</code> is set).
      </>
    ),
  },
  {
    name: 'closeSheet',
    type: '(id, value?, reason?) => void',
    description: 'Closes a sheet by id. Contents usually call their own close prop instead.',
  },
  { name: 'minimizeSheet', type: '(id: string) => void', description: 'Hides a sheet in the dock, keeping its draft.' },
  { name: 'restoreSheet', type: '(id: string) => void', description: 'Brings a minimized sheet back on top.' },
  {
    name: 'stack',
    type: 'SheetDescriptor[]',
    description: 'Open, minimized and closing sheets, bottom to top.',
  },
];

const optionsRows: PropRow[] = [
  {
    name: 'size',
    type: "'default' | 'md' | 'lg' | 'xl' | 'full'",
    default: "'default'",
    description: 'Max width from the sm breakpoint: 24rem (stock sheet), 36rem, 42rem, 56rem or full.',
  },
  {
    name: 'stacking',
    type: "'inset' | 'flush'",
    default: "'inset'",
    description:
      'How the sheet recedes when another opens on top. inset scales it down so it floats with a gap above and below; flush keeps it full height and only shifts it left.',
  },
  {
    name: 'rounded',
    type: 'boolean',
    default: "stacking === 'inset'",
    description: 'Round the sheet’s exposed left corners.',
  },
  {
    name: 'title',
    type: 'string',
    description: 'Label in the minimized dock. Defaults to the key in sentence case.',
  },
  {
    name: 'dismissible',
    type: 'boolean',
    default: 'true',
    description: 'False ignores outside clicks and Escape. The close button and close() still work.',
  },
  {
    name: 'minimizable',
    type: 'boolean',
    default: 'false',
    description: 'Clicking outside minimizes the sheet to the dock instead of closing it.',
  },
  {
    name: 'multiple',
    type: 'boolean',
    default: 'false',
    description:
      'Allow more than one sheet with this key at a time. Otherwise opening an open key restores that sheet and returns its pending result.',
  },
  {
    name: 'retainDraft',
    type: 'boolean',
    default: 'false',
    description:
      'Keep the useSheetDraft state when dismissed with Escape or an outside click, and restore it the next time this key opens.',
  },
];

const providerRows: PropRow[] = [
  { name: 'onOpen', type: '(key: SheetKey) => void', description: 'Called when any sheet opens.' },
  {
    name: 'onClose',
    type: '(key, { value, reason, durationMs, minimized }) => void',
    description: "Called when any sheet closes. reason is 'button', 'escape' or 'backdrop'.",
  },
];

const contentRows: PropRow[] = [
  { name: 'sheetId', type: 'string', description: 'This sheet’s id. Pass it to useSheetDraft.' },
  {
    name: 'close',
    type: '(value?: TReturn) => void',
    description: 'Closes this sheet and resolves openSheet. Stable for the life of the sheet.',
  },
];

const draftRows: PropRow[] = [
  { name: 'sheetId', type: 'string', description: 'The sheetId prop.' },
  { name: 'initial', type: 'T | (() => T)', description: 'Used when there is no stored draft.' },
  {
    name: 'returns',
    type: '[value, setValue, clear]',
    description: 'Like useState. clear() drops the stored draft without changing the current value.',
  },
];

export default function SheetsPage() {
  return (
    <DocsPage
      href="/docs/sheets"
      sections={sections}
      lead={
        <>
          The <A href="/docs/modals">modal registry</A> for side sheets: <C>await openSheet(key, props)</C> returns a
          typed result, and sheets are code-split and stack. Sheets also minimize to a dock, keep drafts, and stay open
          while you use a popover, menu or modal on top of them.
        </>
      }
      demo={
        <Example file="sheets-overview.tsx" padded>
          <SheetsOverviewDemo />
        </Example>
      }>
      <Section id="installation" title="Installation">
        <InstallCommand items={['@dentil/sheets']} />
        <P>
          Files land in <C>components/sheets/</C>, including <C>registry.tsx</C>, which you edit to add sheets. Uses the
          stock shadcn <C>sheet</C>, <C>button</C> and <C>input</C>. Requires React 19. Without the <C>@dentil</C>{' '}
          registry in <C>components.json</C>, install by URL: <C>{registryItemUrl('@dentil/sheets')}</C>.
        </P>
      </Section>

      <Section id="setup" title="Setup">
        <P>
          Wrap your app once in <C>SheetProvider</C>. It renders the sheets and the minimized dock itself.
        </P>
        <CodeBlock code={SETUP} />
      </Section>

      <Section id="usage" title="Usage">
        <P>
          An <C>edit-details</C> sheet ships with the registry as a starting point.
        </P>
        <CodeBlock code={USAGE} />
      </Section>

      <Section id="adding" title="Adding a sheet">
        <Steps>
          <Step
            title="Write the content"
            description="Rendered inside SheetContent. Type its props with SheetContentProps<TReturn>; render a SheetTitle for screen readers.">
            <CodeBlock code={CONTENT} />
          </Step>
          <Step title="Register it" description="Keys, props and return types are inferred from the loader.">
            <CodeBlock code={REGISTER} />
          </Step>
          <Step title="Open it">
            <CodeBlock code={CALL} />
          </Step>
        </Steps>
      </Section>

      <Section id="examples" title="Examples">
        <SubSection
          title="Edit and return a value"
          description="Save resolves with the form values; Escape, an outside click or Cancel resolves undefined.">
          <Example file="sheets-basic.tsx" padded>
            <SheetsBasicDemo />
          </Example>
        </SubSection>
        <SubSection
          title="Inset stacking"
          description="The default. Every sheet is the same width. Open another from the button inside, up to three deep; the ones underneath shrink back, floating with a gap above and below and rounded corners. Saving opens a confirm modal over the sheets still open, and clicking the modal doesn't close them.">
          <Example file="sheets-stacking.tsx" padded>
            <SheetsStackingDemo />
          </Example>
        </SubSection>
        <SubSection
          title="Flush stacking"
          description="With stacking: 'flush', every sheet is the same width. Open another from the button inside, up to three deep. The sheets underneath stay full height with square corners and only shift left.">
          <Example file="sheets-stacking-flush.tsx" padded>
            <SheetsStackingFlushDemo />
          </Example>
        </SubSection>
        <SubSection
          title="Minimize and retained drafts"
          description="Type something, then click outside. The first sheet minimizes to the dock; the second closes, and reopening it brings your draft back.">
          <Example file="sheets-minimize.tsx" padded>
            <SheetsMinimizeDemo />
          </Example>
        </SubSection>
      </Section>

      <Section id="drafts" title="Drafts">
        <P>
          Minimized sheets unmount, so state that should survive minimizing (or, with <C>retainDraft</C>, closing and
          reopening) goes through <C>useSheetDraft</C> instead of <C>useState</C>. Drafts live in memory for the
          lifetime of the provider and are cleared when the sheet closes with a value or the close button.
        </P>
        <CodeBlock code={RHF} />
      </Section>

      <Section id="api" title="API reference">
        <SubSection title="useSheet()">
          <PropsTable rows={useSheetRows} />
        </SubSection>
        <SubSection title="openSheet options">
          <PropsTable rows={optionsRows} />
        </SubSection>
        <SubSection title="SheetProvider">
          <PropsTable rows={providerRows} />
        </SubSection>
        <SubSection title="SheetContentProps<TReturn>" description="Injected into every sheet content.">
          <PropsTable rows={contentRows} />
        </SubSection>
        <SubSection title="useSheetDraft(sheetId, initial)">
          <PropsTable rows={draftRows} />
        </SubSection>
      </Section>
    </DocsPage>
  );
}
