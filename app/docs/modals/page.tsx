import type { Metadata } from 'next';

import { CodeBlock } from '@/components/docs/code-block';
import { Example } from '@/components/docs/example';
import { InstallCommand } from '@/components/docs/install-command';
import { C, DocsPage, P, Section, SubSection } from '@/components/docs/page-shell';
import { Step, Steps } from '@/components/docs/steps';
import { PropsTable, type PropRow } from '@/components/docs/props-table';
import { ModalsBasicDemo } from '@/components/demos/modals-basic';
import { ModalsOverviewDemo } from '@/components/demos/modals-overview';
import { ModalsStackingDemo } from '@/components/demos/modals-stacking';
import { registryItemUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Modals',
  description: 'A promise-based, typed modal registry for shadcn/ui with lazy loading and stacking.',
};

const sections = [
  ['installation', 'Installation'],
  ['setup', 'Setup'],
  ['usage', 'Usage'],
  ['adding', 'Adding a modal'],
  ['examples', 'Examples'],
  ['api', 'API reference'],
] as const;

const SETUP = `
// app/layout.tsx (or your root component)
import { ModalProvider } from '@/components/modals';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ModalProvider
          // Optional: one place to track every modal.
          onOpen={(key) => analytics.track('modal_opened', { key })}
          onClose={(key, { value, durationMs }) =>
            analytics.track('modal_closed', { key, completed: value !== undefined, durationMs })
          }>
          {children}
        </ModalProvider>
      </body>
    </html>
  );
}
`;

const USAGE = `
'use client';

import { useModal } from '@/components/modals';

export function DeleteButton({ id }: { id: string }) {
  const { openModal } = useModal();

  const onClick = async () => {
    // Props are type-checked against the modal; \`confirmed\` is \`boolean | undefined\`.
    const confirmed = await openModal('confirm', {
      title: 'Delete webhook?',
      description: 'This action cannot be undone.',
      confirmLabel: 'Delete',
      destructive: true,
      onConfirm: () => deleteWebhook(id), // errors show inline and keep the modal open
    });
    if (confirmed) toast('Webhook deleted');
  };

  return <Button onClick={onClick}>Delete</Button>;
}
`;

const CONTENT = `
// components/modals/contents/rename.tsx
'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import type { ModalContentProps } from '../types';

// ModalContentProps<TReturn> adds \`modalId\` and \`close(value?: TReturn)\`.
type RenameModalProps = ModalContentProps<{ name: string }> & { name: string };

export default function RenameModal({ name: initial, close }: RenameModalProps) {
  const [name, setName] = useState(initial);

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        close({ name });
      }}>
      <DialogHeader>
        <DialogTitle>Rename</DialogTitle>
      </DialogHeader>
      <Input value={name} onChange={(event) => setName(event.target.value)} autoFocus />
      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => close()}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  );
}
`;

const REGISTER = `
// components/modals/registry.tsx
const modalLoaders = {
  confirm: () => import('./contents/confirm'),
  rename: () => import('./contents/rename'), // ← the only line to add
} as const;
`;

const CALL = `
const result = await openModal('rename', { name: 'Acme' }, { size: 'md' });
//    ^? { name: string } | undefined
`;

const NESTED = `
// Inside any modal content: useModal works there too.
const { openModal } = useModal();

const onDelete = async () => {
  const sure = await openModal('confirm', { title: 'Are you sure?', destructive: true });
  if (sure) close({ deleted: true });
};
`;

const useModalRows: PropRow[] = [
  {
    name: 'openModal',
    type: '(key, props?, options?) => Promise<Return | undefined>',
    description: (
      <>
        Opens a modal on top of the stack. Props are required when the modal has required props. Resolves with the value
        passed to <code>close</code>, or <code>undefined</code> when dismissed with Esc, the overlay or the close
        button.
      </>
    ),
  },
  {
    name: 'closeModal',
    type: '(id: string, value?: unknown) => void',
    description: 'Closes a modal by id. Contents usually call their own close prop instead.',
  },
  {
    name: 'stack',
    type: 'ModalDescriptor[]',
    description: 'Open modals, bottom to top, including ones animating out.',
  },
];

const optionsRows: PropRow[] = [
  {
    name: 'size',
    type: "'default' | 'md' | 'lg' | 'xl' | 'full'",
    default: "'default'",
    description: 'Max width from the sm breakpoint: 32rem (stock dialog), 36rem, 42rem, 48rem or 56rem.',
  },
];

const providerRows: PropRow[] = [
  { name: 'onOpen', type: '(key: ModalKey) => void', description: 'Called when any modal opens.' },
  {
    name: 'onClose',
    type: '(key: ModalKey, info: { value, durationMs }) => void',
    description: 'Called when any modal closes. value is undefined when it was dismissed.',
  },
];

const contentRows: PropRow[] = [
  { name: 'modalId', type: 'string', description: 'This modal’s id in the stack.' },
  {
    name: 'close',
    type: '(value?: TReturn) => void',
    description: 'Closes this modal and resolves openModal. Stable for the life of the modal.',
  },
];

const confirmRows: PropRow[] = [
  { name: 'title', type: 'string', description: 'Dialog title.' },
  { name: 'description', type: 'ReactNode', description: 'Optional supporting text.' },
  { name: 'confirmLabel', type: 'string', default: "'Confirm'", description: 'Confirm button label.' },
  { name: 'cancelLabel', type: 'string', default: "'Cancel'", description: 'Cancel button label (closes with false).' },
  { name: 'destructive', type: 'boolean', default: 'false', description: 'Use the destructive button variant.' },
  {
    name: 'onConfirm',
    type: '() => Promise<void> | void',
    description: 'Runs before closing with true. Buttons are disabled while it runs; a thrown error is shown inline.',
  },
];

export default function ModalsPage() {
  return (
    <DocsPage
      href="/docs/modals"
      sections={sections}
      lead={
        <>
          Open any modal from anywhere with <C>await openModal(key, props)</C> and get its result back, fully typed.
          Modals are registered by key, code-split until first opened, and stack: opening one from inside another pushes
          it on top while the ones beneath recede.
        </>
      }
      demo={
        <Example file="modals-overview.tsx" padded>
          <ModalsOverviewDemo />
        </Example>
      }>
      <Section id="installation" title="Installation">
        <InstallCommand items={['@dentil/modals']} />
        <P>
          Files land in <C>components/modals/</C>, including <C>registry.tsx</C>, which you edit to add modals. Uses the
          stock shadcn <C>dialog</C> and <C>button</C>. Requires React 19. Without the <C>@dentil</C> registry in{' '}
          <C>components.json</C>, install by URL: <C>{registryItemUrl('@dentil/modals')}</C>.
        </P>
      </Section>

      <Section id="setup" title="Setup">
        <P>
          Wrap your app once in <C>ModalProvider</C>. It renders the modal stack itself, so there&apos;s nothing else to
          mount.
        </P>
        <CodeBlock code={SETUP} />
      </Section>

      <Section id="usage" title="Usage">
        <P>
          A <C>confirm</C> modal ships with the registry.
        </P>
        <CodeBlock code={USAGE} />
      </Section>

      <Section id="adding" title="Adding a modal">
        <Steps>
          <Step
            title="Write the content"
            description="A component rendered inside DialogContent. Type its props with ModalContentProps<TReturn>; render a DialogTitle for screen readers.">
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
          title="Confirm with an async action"
          description="onConfirm runs before the modal closes. Dismiss with Esc to see the undefined result.">
          <Example file="modals-basic.tsx" padded>
            <ModalsBasicDemo />
          </Example>
        </SubSection>
        <SubSection
          title="Stacking"
          description="The first modal opens a second one from its onConfirm. Only the top modal is interactive, and Esc closes it alone.">
          <Example file="modals-stacking.tsx" padded>
            <ModalsStackingDemo />
          </Example>
        </SubSection>
        <SubSection title="Opening a modal from a modal">
          <CodeBlock code={NESTED} />
        </SubSection>
      </Section>

      <Section id="api" title="API reference">
        <SubSection title="useModal()">
          <PropsTable rows={useModalRows} />
        </SubSection>
        <SubSection title="openModal options">
          <PropsTable rows={optionsRows} />
        </SubSection>
        <SubSection title="ModalProvider">
          <PropsTable rows={providerRows} />
        </SubSection>
        <SubSection title="ModalContentProps<TReturn>" description="Injected into every modal content.">
          <PropsTable rows={contentRows} />
        </SubSection>
        <SubSection title="confirm" description="Resolves true when confirmed, false when cancelled.">
          <PropsTable rows={confirmRows} />
        </SubSection>
      </Section>
    </DocsPage>
  );
}
