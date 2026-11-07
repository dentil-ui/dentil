import type { Metadata } from 'next';

import { CodeBlock } from '@/components/docs/code-block';
import { Example } from '@/components/docs/example';
import { InstallCommand } from '@/components/docs/install-command';
import { A, C, DocsPage, P, Section, SubSection } from '@/components/docs/page-shell';
import { PropsTable, type PropRow } from '@/components/docs/props-table';
import { AddressInputOverviewDemo } from '@/components/demos/address-input-overview';

export const metadata: Metadata = {
  title: 'Address Input',
  description:
    'Postal address fields for shadcn/ui that start from a country, with state lists for the US, Canada and Australia and your own lists for any other country.',
};

const sections = [
  ['installation', 'Installation'],
  ['regions', 'Adding regions'],
  ['api', 'API reference'],
] as const;

const REGIONS = `
import { AddressInput } from '@/components/dentil/address-input/address-input';

<AddressInput
  value={address}
  onChange={setAddress}
  regions={{
    IE: {
      label: 'County',
      regions: [
        { code: 'D', name: 'Dublin' },
        { code: 'CO', name: 'Cork' },
        // …
      ],
    },
  }}
  hideStateFor={['GB', 'FR', 'DE']}
/>;
`;

const rows: PropRow[] = [
  {
    name: 'value',
    type: 'Address | null | undefined',
    description: '{ line1, line2, city, state, postal_code, country }, all optional strings.',
  },
  {
    name: 'onChange',
    type: '(value: Address | undefined) => void',
    description: (
      <>
        Called with only the non-empty fields, or <code>undefined</code> when every field is empty. Changing the country
        clears the other fields.
      </>
    ),
  },
  {
    name: 'error',
    type: 'string',
    description: 'Shown under the fields, which get aria-invalid and aria-describedby pointing at it.',
  },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables every field.' },
  {
    name: 'allowCountryChange',
    type: 'boolean',
    default: 'true',
    description: 'When false, the country select is disabled.',
  },
  {
    name: 'defaultCountry',
    type: 'string',
    description: 'Country used while value has none. The fields appear once there is a country.',
  },
  {
    name: 'regions',
    type: 'Record<string, { label: string; regions: { code; name }[] }>',
    description: (
      <>
        Region lists by country code, merged over the built-in US, CA and AU lists. A listed country gets a select whose
        value is the region code.
      </>
    ),
  },
  {
    name: 'hideStateFor',
    type: 'string[]',
    default: "['GB']",
    description: 'Countries with no region field. Other countries without a list get a free-text field.',
  },
  {
    name: 'placeholders',
    type: 'Partial<Record<keyof Address, string>>',
    description: 'Placeholders and accessible labels for each field.',
  },
  { name: 'allowedCountries', type: 'string[]', description: 'Passed to CountrySelect.' },
  { name: 'preferredCountries', type: 'string[]', description: 'Passed to CountrySelect.' },
  { name: 'showFlags', type: 'boolean', default: 'false', description: 'Passed to CountrySelect.' },
  { name: 'locale', type: 'string', default: "'en'", description: 'Passed to CountrySelect.' },
];

export default function AddressInputPage() {
  return (
    <DocsPage
      href="/docs/address-input"
      sections={sections}
      lead={
        <>
          <C>AddressInput</C> starts with a country, then shows line 1, line 2, city, region and postal code. The US,
          Canada and Australia get a state or province select, the UK gets no region field, and other countries get a
          free-text region. Switch the country to the United Kingdom to see the region field go, or to France for a
          free-text one.
        </>
      }
      demo={
        <Example file="address-input-overview.tsx" padded>
          <AddressInputOverviewDemo />
        </Example>
      }>
      <Section id="installation" title="Installation">
        <InstallCommand items={['@dentil/address-input']} />
        <P>
          Files land in <C>components/dentil/address-input/</C>. Uses the stock shadcn <C>input</C> and{' '}
          <C>native-select</C>, and installs <A href="/docs/country-select">Country Select</A> and{' '}
          <A href="/docs/select-search">Select Search</A>.
        </P>
      </Section>

      <Section id="regions" title="Adding regions">
        <P>
          Pass <C>regions</C> to add a list for any country. The select stores the region code. Use <C>hideStateFor</C>{' '}
          for countries whose addresses have no region.
        </P>
        <CodeBlock code={REGIONS} />
      </Section>

      <Section id="api" title="API reference">
        <SubSection title="AddressInput">
          <PropsTable rows={rows} />
        </SubSection>
      </Section>
    </DocsPage>
  );
}
