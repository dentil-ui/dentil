import type { Metadata } from 'next';

import { Example } from '@/components/docs/example';
import { InstallCommand } from '@/components/docs/install-command';
import { A, C, DocsPage, P, Section, SubSection } from '@/components/docs/page-shell';
import { PropsTable, type PropRow } from '@/components/docs/props-table';
import { CountrySelectOverviewDemo } from '@/components/demos/country-select-overview';

export const metadata: Metadata = {
  title: 'Country Select',
  description:
    'A searchable country picker for shadcn/ui with ISO 3166-1 codes, localized names, preferred countries, and optional flags.',
};

const sections = [
  ['installation', 'Installation'],
  ['api', 'API reference'],
] as const;

const rows: PropRow[] = [
  { name: 'value', type: 'string | null | undefined', description: 'ISO 3166-1 alpha-2 code, e.g. GB.' },
  { name: 'onChange', type: '(value: string) => void', description: 'Called with the picked code.' },
  { name: 'allowedCountries', type: 'string[]', description: 'Only list these codes. Lists all 250 when omitted.' },
  {
    name: 'preferredCountries',
    type: 'string[]',
    description:
      'ISO codes listed first, in this order. A separator sits under them until the search field has text. Unknown codes are ignored.',
  },
  {
    name: 'showFlags',
    type: 'boolean',
    default: 'false',
    description: 'Draws a flag beside each country, in the list and on the trigger. Same icons as Phone Input.',
  },
  {
    name: 'locale',
    type: 'string',
    default: "'en'",
    description: 'Locale for country names and sort order, from Intl.DisplayNames.',
  },
  {
    name: '…props',
    type: 'SelectSearchProps',
    description: 'Any SelectSearch prop except options, such as placeholder and emptyText.',
  },
];

export default function CountrySelectPage() {
  return (
    <DocsPage
      href="/docs/country-select"
      sections={sections}
      lead={
        <>
          <C>CountrySelect</C> is a <A href="/docs/select-search">Select Search</A> over every ISO 3166-1 country. Names
          come from <C>Intl.DisplayNames</C>, so pass <C>locale</C> to translate and sort them. Pass{' '}
          <C>preferredCountries</C> to list those codes first, and <C>showFlags</C> for a flag beside each country. The
          first select does both, for GB and US. The second is limited to six countries and named in German. Search by
          name or by code.
        </>
      }
      demo={
        <Example file="country-select-overview.tsx" padded>
          <CountrySelectOverviewDemo />
        </Example>
      }>
      <Section id="installation" title="Installation">
        <InstallCommand items={['@dentil/country-select']} />
        <P>
          Files land in <C>components/dentil/country-select/</C>. It installs <C>@dentil/select-search</C> and{' '}
          <C>country-flag-icons</C>. Country names come from <C>Intl.DisplayNames</C>, not a data file.
        </P>
      </Section>

      <Section id="api" title="API reference">
        <SubSection title="CountrySelect">
          <PropsTable rows={rows} />
        </SubSection>
      </Section>
    </DocsPage>
  );
}
