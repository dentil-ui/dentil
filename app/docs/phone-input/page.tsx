import type { Metadata } from 'next';

import { Example } from '@/components/docs/example';
import { InstallCommand } from '@/components/docs/install-command';
import { C, DocsPage, P, Section, SubSection } from '@/components/docs/page-shell';
import { PropsTable, type PropRow } from '@/components/docs/props-table';
import { PhoneInputOverviewDemo } from '@/components/demos/phone-input-overview';

export const metadata: Metadata = {
  title: 'Phone Input',
  description:
    'An international phone number input for shadcn/ui with a flag country picker that returns E.164 numbers.',
};

const sections = [
  ['installation', 'Installation'],
  ['api', 'API reference'],
] as const;

const rows: PropRow[] = [
  { name: 'value', type: 'string | null | undefined', description: 'E.164 number, e.g. +447700900123.' },
  {
    name: 'onChange',
    type: '(value: string) => void',
    description: (
      <>
        Called with the E.164 number as you type, or <code>&apos;&apos;</code> when cleared.
      </>
    ),
  },
  { name: 'defaultCountry', type: 'PhoneCountry', description: 'Country preselected while the field is empty.' },
  { name: 'countries', type: 'PhoneCountry[]', description: 'Only list these countries.' },
  { name: 'placeholder', type: 'string', default: "'Enter phone number'", description: 'Number field placeholder.' },
  {
    name: '…props',
    type: "ComponentProps<'input'>",
    description: (
      <>
        Other props (<code>id</code>, <code>aria-invalid</code>, <code>aria-describedby</code>, <code>onBlur</code>…)
        are passed to the number input.
      </>
    ),
  },
];

export default function PhoneInputPage() {
  return (
    <DocsPage
      href="/docs/phone-input"
      sections={sections}
      lead={
        <>
          <C>PhoneInput</C> formats as you type and returns E.164, which most SMS and auth APIs expect. Pick a country
          from the flag, then type a local number to see the result.
        </>
      }
      demo={
        <Example file="phone-input-overview.tsx" padded>
          <PhoneInputOverviewDemo />
        </Example>
      }>
      <Section id="installation" title="Installation">
        <InstallCommand items={['@dentil/phone-input']} />
        <P>
          Files land in <C>components/phone-input/</C>. Wraps <C>react-phone-number-input</C> with the stock shadcn{' '}
          <C>input</C> and a flag country picker.
        </P>
      </Section>

      <Section id="api" title="API reference">
        <SubSection title="PhoneInput">
          <PropsTable rows={rows} />
        </SubSection>
      </Section>
    </DocsPage>
  );
}
