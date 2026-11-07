import type { Metadata } from 'next';

import { Example } from '@/components/docs/example';
import { InstallCommand } from '@/components/docs/install-command';
import { C, DocsPage, P, Section, SubSection } from '@/components/docs/page-shell';
import { PropsTable, type PropRow } from '@/components/docs/props-table';
import { CurrencyInputOverviewDemo } from '@/components/demos/currency-input-overview';
import { CurrencyInputSearchableDemo } from '@/components/demos/currency-input-searchable';

export const metadata: Metadata = {
  title: 'Currency Input',
  description:
    'A money input for shadcn/ui that reads and writes minor units, with the currency symbol and decimal places taken from Intl.',
};

const sections = [
  ['installation', 'Installation'],
  ['examples', 'Examples'],
  ['api', 'API reference'],
] as const;

const rows: PropRow[] = [
  { name: 'currency', type: 'string', description: 'ISO 4217 code, e.g. GBP. Sets the symbol and decimal places.' },
  {
    name: 'value',
    type: 'number | null | undefined',
    description: 'Amount in minor units: 1050 is £10.50, and 1050 is ¥1,050 for JPY.',
  },
  {
    name: 'onChange',
    type: '(value: number | undefined) => void',
    description: (
      <>
        Called with the amount in minor units, or <code>undefined</code> when the field is empty.
      </>
    ),
  },
  {
    name: 'onCurrencyChange',
    type: '(currency: string) => void',
    description: (
      <>
        Turns the currency code into a picker. If the new currency has a different number of decimal places, the amount
        on screen is kept and <code>onChange</code> gets it in the new minor units.
      </>
    ),
  },
  {
    name: 'currencies',
    type: 'string[]',
    description: 'ISO 4217 codes the picker offers. Defaults to every currency the browser supports.',
  },
  {
    name: 'searchable',
    type: 'boolean',
    default: 'false',
    description:
      'Open the picker as a SelectSearch popover you can filter by code or name, instead of a native select.',
  },
  { name: 'maxAmount', type: 'number', description: 'Largest amount in minor units. Larger input is clamped to it.' },
  { name: 'allowNegative', type: 'boolean', default: 'false', description: 'Allow a leading minus.' },
  { name: 'locale', type: 'string', description: 'Locale for the currency symbol. Defaults to the browser’s.' },
  { name: 'inputClassName', type: 'string', description: 'Applied to the input. className goes on the group.' },
  {
    name: '…props',
    type: "ComponentProps<'input'>",
    description: (
      <>
        Other props (<code>id</code>, <code>aria-invalid</code>, <code>aria-describedby</code>, <code>onBlur</code>…)
        are passed to the input.
      </>
    ),
  },
];

export default function CurrencyInputPage() {
  return (
    <DocsPage
      href="/docs/currency-input"
      sections={sections}
      lead={
        <>
          <C>CurrencyInput</C> reads and writes integer minor units, as Stripe and most payment APIs do, so there are no
          floating-point amounts in your state. Type more than £120 into the first field to see it clamp. The second
          field passes <C>onCurrencyChange</C>, so its currency code is a picker. JPY has no minor unit, so it has no
          decimals.
        </>
      }
      demo={
        <Example file="currency-input-overview.tsx" padded>
          <CurrencyInputOverviewDemo />
        </Example>
      }>
      <Section id="installation" title="Installation">
        <InstallCommand items={['@dentil/currency-input']} />
        <P>
          Files land in <C>components/currency-input/</C>. Uses the stock shadcn <C>input-group</C>,{' '}
          <C>react-number-format</C> and <C>@dentil/select-search</C> for the searchable picker. The symbol and decimal
          places come from <C>Intl.NumberFormat</C>.
        </P>
      </Section>

      <Section id="examples" title="Examples">
        <SubSection
          title="Searchable currency picker"
          description="searchable opens the picker as a popover over every currency the browser supports. Type a code or a name, such as yen.">
          <Example file="currency-input-searchable.tsx" padded>
            <CurrencyInputSearchableDemo />
          </Example>
        </SubSection>
      </Section>

      <Section id="api" title="API reference">
        <SubSection title="CurrencyInput">
          <PropsTable rows={rows} />
        </SubSection>
      </Section>
    </DocsPage>
  );
}
