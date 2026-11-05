import type { Metadata } from 'next';

import { Example } from '@/components/docs/example';
import { InstallCommand } from '@/components/docs/install-command';
import { A, C, DocsPage, P, Section, SubSection } from '@/components/docs/page-shell';
import { PropsTable, type PropRow } from '@/components/docs/props-table';
import { CountrySelectOverviewDemo } from '@/components/demos/country-select-overview';

export const metadata: Metadata = {
  title: 'Country Select',
  description: 'A searchable country picker for shadcn/ui with ISO 3166-1 codes and localized names.',
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
          come from <C>Intl.DisplayNames</C>, so pass <C>locale</C> to translate and sort them. The second select is
          limited to six countries and named in German. Search by name or by code.
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
          Files land in <C>components/country-select/</C>. It installs <C>@dentil/select-search</C>. No country data
          package is installed.
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
