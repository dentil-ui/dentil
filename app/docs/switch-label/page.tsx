import type { Metadata } from 'next';

import { SwitchLabelOverviewDemo } from '@/components/demos/switch-label-overview';
import { Example } from '@/components/docs/example';
import { InstallCommand } from '@/components/docs/install-command';
import { C, DocsPage, P, Section, SubSection } from '@/components/docs/page-shell';
import { PropsTable, type PropRow } from '@/components/docs/props-table';

export const metadata: Metadata = {
  title: 'Switch Label',
  description: 'A labeled switch for shadcn/ui with an optional description aligned to the control or the label text.',
};

const sections = [
  ['installation', 'Installation'],
  ['api', 'API reference'],
] as const;

const rows: PropRow[] = [
  {
    name: 'label',
    type: 'ReactNode',
    description: 'Text beside the switch. Clicking it toggles the switch.',
  },
  {
    name: 'description',
    type: 'ReactNode',
    description: 'Muted line under the row. The switch points at it with aria-describedby.',
  },
  {
    name: 'alignDescription',
    type: "'switch' | 'label'",
    default: "'switch'",
    description:
      '`switch` starts the description at the control. `label` starts it at the label text, including when `size` is `sm`.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Applied to the wrapper.',
  },
  {
    name: '…props',
    type: 'ComponentProps<typeof Switch>',
    description: (
      <>
        Other props (<code>checked</code>, <code>onCheckedChange</code>, <code>disabled</code>, <code>id</code>,{' '}
        <code>name</code>, <code>aria-invalid</code>…) are passed to the switch. An <code>id</code> you pass is used;
        otherwise one is generated. <code>aria-describedby</code> is merged with the description.
      </>
    ),
  },
];

export default function SwitchLabelPage() {
  return (
    <DocsPage
      href="/docs/switch-label"
      sections={sections}
      lead={
        <>
          <C>SwitchLabel</C> puts a label and an optional description next to a switch. Click the label to toggle it.
          The weekly digest lines its description up with the text (<C>alignDescription=&quot;label&quot;</C>). The
          others line it up with the control. Marketing emails is disabled.
        </>
      }
      demo={
        <Example file="switch-label-overview.tsx" padded>
          <SwitchLabelOverviewDemo />
        </Example>
      }>
      <Section id="installation" title="Installation">
        <InstallCommand items={['@dentil/switch-label']} />
        <P>
          Files land in <C>components/dentil/switch-label/</C>. Uses the stock shadcn <C>switch</C> and <C>label</C>.
        </P>
      </Section>

      <Section id="api" title="API reference">
        <SubSection title="SwitchLabel">
          <PropsTable rows={rows} />
        </SubSection>
      </Section>
    </DocsPage>
  );
}
