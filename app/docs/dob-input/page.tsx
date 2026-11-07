import type { Metadata } from 'next';

import { Example } from '@/components/docs/example';
import { InstallCommand } from '@/components/docs/install-command';
import { C, DocsPage, P, Section, SubSection } from '@/components/docs/page-shell';
import { PropsTable, type PropRow } from '@/components/docs/props-table';
import { DobInputOverviewDemo } from '@/components/demos/dob-input-overview';

export const metadata: Metadata = {
  title: 'Date of Birth Input',
  description: 'DD / MM / YYYY date of birth fields for shadcn/ui that auto-advance and only emit real dates.',
};

const sections = [
  ['installation', 'Installation'],
  ['api', 'API reference'],
] as const;

const rows: PropRow[] = [
  { name: 'value', type: '{ day; month; year } | null | undefined', description: 'Day and month are 1-based.' },
  {
    name: 'onChange',
    type: '(value: DOB | undefined) => void',
    description: (
      <>
        Called on every keystroke: with the date once the three fields form a real date with a four-digit year, and{' '}
        <code>undefined</code> otherwise. 31/02 never reaches you.
      </>
    ),
  },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the three fields.' },
  {
    name: '…props',
    type: "ComponentProps<'input'>",
    description: (
      <>
        Other props (<code>id</code>, <code>aria-invalid</code>, <code>aria-describedby</code>, <code>onBlur</code>…)
        are passed to the day input. aria-invalid also reaches month and year.
      </>
    ),
  },
];

export default function DobInputPage() {
  return (
    <DocsPage
      href="/docs/dob-input"
      sections={sections}
      lead={
        <>
          <C>DOBInput</C> is three numeric fields instead of a calendar, which is faster for dates decades back. Focus
          moves on as soon as a field can&apos;t take another digit. Type 31 02 1990: the result stays undefined because
          the date isn&apos;t real.
        </>
      }
      demo={
        <Example file="dob-input-overview.tsx" padded>
          <DobInputOverviewDemo />
        </Example>
      }>
      <Section id="installation" title="Installation">
        <InstallCommand items={['@dentil/dob-input']} />
        <P>
          Files land in <C>components/dentil/dob-input/</C>. Uses the stock shadcn <C>input-group</C> and{' '}
          <C>react-number-format</C>.
        </P>
      </Section>

      <Section id="api" title="API reference">
        <SubSection title="DOBInput">
          <PropsTable rows={rows} />
        </SubSection>
      </Section>
    </DocsPage>
  );
}
