import type { Metadata } from 'next';

import { DateFormatDemo } from '@/components/demos/date-format';
import { DateOverviewDemo } from '@/components/demos/date-overview';
import { CodeBlock } from '@/components/docs/code-block';
import { Example } from '@/components/docs/example';
import { InstallCommand } from '@/components/docs/install-command';
import { C, DocsPage, P, Section, SubSection } from '@/components/docs/page-shell';
import { PropsTable, type PropRow } from '@/components/docs/props-table';

export const metadata: Metadata = {
  title: 'Date',
  description:
    'A compact date for shadcn/ui, formatted in a time zone you supply, from unix seconds, milliseconds, an ISO string or a Date.',
};

const sections = [
  ['installation', 'Installation'],
  ['usage', 'Usage'],
  ['examples', 'Examples'],
  ['api', 'API reference'],
] as const;

const USAGE = `
import { Date } from '@/components/dentil/date/date';

// 7 Nov 2026, 09:14 UTC. Unix seconds, milliseconds, an ISO string or a Date all work.
const created = 1_794_042_840;

<Date date={created} timezone="Europe/London" />
<Date date={created} timezone="America/New_York" showTimezone hover side="top" align="end" />
<Date date={created} timezone="Europe/London" showTime={false} showYear />
`;

const dateRows: PropRow[] = [
  {
    name: 'date',
    type: 'number | string | Date | null | undefined',
    description:
      'Unix seconds, unix milliseconds, an ISO string or a Date. Anything above 1e11 is treated as milliseconds. Empty or invalid values render fallback.',
  },
  {
    name: 'timezone',
    type: 'string',
    description:
      'IANA time zone the value is formatted in, such as Europe/London. Omit it to use the runtime zone, which can differ between server and client. An unknown name is formatted as UTC.',
  },
  {
    name: 'locale',
    type: 'string',
    description: 'BCP 47 language tag passed to Intl.DateTimeFormat. Omit it to use the runtime locale.',
  },
  {
    name: 'showTime',
    type: 'boolean',
    default: 'true',
    description: 'Include the time in 24-hour form, such as 09:14.',
  },
  {
    name: 'showYear',
    type: 'boolean',
    default: 'false',
    description: 'Include the year even when the date falls in the current year in timezone.',
  },
  {
    name: 'showTimezone',
    type: 'boolean',
    default: 'false',
    description:
      'Underlines the date and opens a popover with the time in timezone and the same instant in UTC. Click it, or hover when hover is set.',
  },
  {
    name: 'hover',
    type: 'boolean',
    default: 'false',
    description:
      'Opens the popover while the pointer is over the date or the popover. Clicking and the keyboard still open it. Ignored unless showTimezone is set.',
  },
  {
    name: 'side',
    type: "'top' | 'right' | 'bottom' | 'left'",
    default: "'bottom'",
    description: 'Side of the date the popover opens on.',
  },
  {
    name: 'align',
    type: "'start' | 'center' | 'end'",
    default: "'start'",
    description: 'Alignment of the popover along that side.',
  },
  {
    name: 'fallback',
    type: 'ReactNode',
    default: 'null',
    description: 'Rendered when date is null, undefined, an empty string or invalid.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Merged onto the date. With showTimezone, that is the button that opens the popover.',
  },
  {
    name: '…props',
    type: "Omit<ComponentProps<'time'>, 'dateTime' | 'children'>",
    description: 'Other props are passed to the time element. dateTime is the UTC ISO string.',
  },
];

const formatRows: PropRow[] = [
  {
    name: 'value',
    type: 'number | string | Date | null | undefined',
    description: 'Same values as the date prop. Returns null when the value cannot be parsed.',
  },
  {
    name: 'timezone',
    type: 'string',
    description: 'IANA time zone. Omit it to use the runtime zone. An unknown name is formatted as UTC.',
  },
  {
    name: 'locale',
    type: 'string',
    description: 'BCP 47 language tag. Omit it to use the runtime locale.',
  },
  {
    name: 'showTime',
    type: 'boolean',
    default: 'true',
    description: 'Include the 24-hour time.',
  },
  {
    name: 'showYear',
    type: 'boolean',
    default: 'false',
    description: 'Include the year even when the date is in the current year.',
  },
  {
    name: 'showTimezone',
    type: 'boolean',
    default: 'false',
    description: 'Append the short zone name to the returned string.',
  },
];

const toDateRows: PropRow[] = [
  {
    name: 'value',
    type: 'number | string | Date | null | undefined',
    description: 'Unix seconds, unix milliseconds, an ISO string or a Date. Returns null for empty or invalid values.',
  },
];

export default function DatePage() {
  return (
    <DocsPage
      href="/docs/date"
      sections={sections}
      lead={
        <>
          <C>Date</C> formats one instant in a time zone you pass as <C>timezone</C>. The same timestamp reads as
          London, New York or Tokyo time. <C>showTimezone</C> underlines the date. Hover one to see that zone beside
          UTC.
        </>
      }
      demo={
        <Example file="date-overview.tsx" padded>
          <DateOverviewDemo />
        </Example>
      }>
      <Section id="installation" title="Installation">
        <InstallCommand items={['@dentil/date']} />
        <P>
          Files land in <C>components/dentil/date/</C>. It uses <C>Intl.DateTimeFormat</C> and the stock <C>Popover</C>{' '}
          and <C>HoverCard</C>. Pass an IANA name such as <C>Europe/London</C>. There is no provider.
        </P>
      </Section>

      <Section id="usage" title="Usage">
        <CodeBlock code={USAGE} />
        <P>
          The year is omitted when the date is in the current year in <C>timezone</C>. <C>showYear</C> puts it back. The
          popover always shows the clock time, including when the date itself hides it. <C>hover</C> opens it on hover
          and keeps it open while the pointer is over the popover. <C>side</C> and <C>align</C> set where it opens.{' '}
          <C>formatDate</C> and <C>toDate</C> live in <C>components/dentil/date/format</C>, so a server component can
          call them without pulling in the client component. <C>formatDate</C> appends the short zone name when{' '}
          <C>showTimezone</C> is set, instead of opening a popover.
        </P>
      </Section>

      <Section id="examples" title="Examples">
        <SubSection title="Format">
          <P>
            Turn the time off for a date, or pass a past year and the year appears on its own. An empty value renders{' '}
            <C>fallback</C>.
          </P>
          <Example file="date-format.tsx" padded>
            <DateFormatDemo />
          </Example>
        </SubSection>
      </Section>

      <Section id="api" title="API reference">
        <SubSection title="Date">
          <PropsTable rows={dateRows} />
        </SubSection>
        <SubSection title="formatDate">
          <P>
            <C>formatDate(value, options)</C> from <C>@/components/dentil/date/format</C> returns the compact string, or{' '}
            <C>null</C>. With <C>showTimezone</C> it appends the short zone name.
          </P>
          <PropsTable rows={formatRows} />
        </SubSection>
        <SubSection title="toDate">
          <P>
            <C>toDate(value)</C> returns a <C>Date</C> or <C>null</C>.
          </P>
          <PropsTable rows={toDateRows} />
        </SubSection>
      </Section>
    </DocsPage>
  );
}
