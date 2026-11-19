import type { Metadata } from 'next';

import { ChartsCategoryBarDemo } from '@/components/demos/charts-category-bar';
import { ChartsInViewDemo } from '@/components/demos/charts-in-view';
import { ChartsMultiLineDemo } from '@/components/demos/charts-multi-line';
import { ChartsOverviewDemo } from '@/components/demos/charts-overview';
import { ChartsStatesDemo } from '@/components/demos/charts-states';
import { CodeBlock } from '@/components/docs/code-block';
import { Example } from '@/components/docs/example';
import { InstallCommand } from '@/components/docs/install-command';
import { C, DocsPage, P, Section, SubSection } from '@/components/docs/page-shell';
import { PropsTable, type PropRow } from '@/components/docs/props-table';

export const metadata: Metadata = {
  title: 'Charts',
  description:
    'Dashboard metric charts on Recharts: a headline with a period-over-period change badge, line charts with previous-period comparisons that stop at today, a category share bar, and a hook that fetches when a chart scrolls into view.',
};

const sections = [
  ['installation', 'Installation'],
  ['usage', 'Usage'],
  ['data', 'Data'],
  ['examples', 'Examples'],
  ['composing', 'Composing'],
  ['api', 'API reference'],
] as const;

const USAGE = `
import NextLink from 'next/link';

import { LineChart } from '@/components/dentil/charts/line-chart';
import { useInViewFetch } from '@/components/dentil/charts/use-in-view-fetch';

const { ref } = useInViewFetch(() => load(range), [range.start, range.end]);

<div ref={ref} className="rounded-lg border p-6">
  <LineChart
    title="Revenue"
    value={totals.current}
    previousValue={totals.previous}
    formatValue={(pence) => currency.format(pence / 100)}
    data={points}
    series={[
      { key: 'value', label: 'This period' },
      { key: 'previous', label: 'Previous period', comparison: true, dateKey: 'previousDate' },
    ]}
    unit="day"
    timezone="Europe/London"
    loading={loading}
    href="/payments"
    updatedAt={lastUpdated}
    linkComponent={NextLink}
  />
</div>
`;

const DATA = `
// One point per bucket. \`date\` is the bucket start.
const points = [
  { date: 1794787200, value: 3_412_000, previous: 2_980_000, previousDate: 1792108800 }, // 16 Nov
  { date: 1794873600, value: 3_190_500, previous: 3_105_000, previousDate: 1792195200 }, // 17 Nov, today
  { date: 1794960000, value: 0,         previous: 2_870_000, previousDate: 1792281600 }, // 18 Nov, cut off
];
`;

const COMPOSING = `
import { Bar, BarChart, XAxis } from 'recharts';

import { Chart, ChartContent, ChartFooter, ChartHeader } from '@/components/dentil/charts/chart';
import { ChartContainer } from '@/components/ui/chart';

<Chart loading={loading} linkComponent={NextLink}>
  <ChartHeader title="Refunds" value={total} previousValue={previous} lowerIsBetter formatValue={formatPence} />
  <ChartContent error={error} empty={weeks.length === 0}>
    <ChartContainer config={{ amount: { label: 'Refunds', color: 'var(--chart-1)' } }} className="aspect-auto h-60 w-full">
      <BarChart data={weeks}>
        <XAxis dataKey="week" tickLine={false} axisLine={false} />
        <Bar dataKey="amount" fill="var(--color-amount)" radius={4} />
      </BarChart>
    </ChartContainer>
  </ChartContent>
  <ChartFooter href="/payments?status=refunded" updatedAt={lastUpdated} />
</Chart>
`;

const chartRows: PropRow[] = [
  {
    name: 'loading',
    type: 'boolean',
    default: 'false',
    description:
      'Shows a skeleton headline and a spinner in place of the plot. A part’s own loading prop overrides it.',
  },
  {
    name: 'embedded',
    type: 'boolean',
    default: 'false',
    description:
      'Compact mode for a chart inside another surface. Hides the title, the "previous period" line and the footer, and uses a 160px plot instead of 240px.',
  },
  {
    name: 'timezone',
    type: 'string',
    description: 'IANA zone for axis, tooltip and footer times. Omit it to use the runtime zone.',
  },
  {
    name: 'locale',
    type: 'string',
    description:
      'BCP 47 tag for dates and default number formatting. Set it when the page is server-rendered, so the server and browser agree.',
  },
  {
    name: 'linkComponent',
    type: 'LinkComponent',
    default: "'a'",
    description: (
      <>
        Renders the footer link and category rows, for example <code>next/link</code>. The same type as{' '}
        <code>@dentil/link</code>.
      </>
    ),
  },
  { name: 'className', type: 'string', description: 'Merged onto the root. It has no border or padding of its own.' },
];

const headerRows: PropRow[] = [
  { name: 'title', type: 'ReactNode', description: 'Hidden when embedded.' },
  { name: 'meta', type: 'ReactNode', description: 'Muted text to the right of the title, such as "All time".' },
  {
    name: 'value',
    type: 'ReactNode',
    description: (
      <>
        Headline. A number goes through <code>formatValue</code>. A string, such as &quot;98.4% success rate&quot;,
        renders as is. Nothing is shown when it&apos;s <code>undefined</code>.
      </>
    ),
  },
  {
    name: 'previousValue',
    type: 'number',
    description:
      'The comparison period’s value. Adds the change badge and a "… previous period" line under the headline.',
  },
  {
    name: 'previousLabel',
    type: 'ReactNode',
    description: 'Replaces the "… previous period" line, for headlines that aren’t a single number.',
  },
  {
    name: 'formatValue',
    type: '(value: number) => string',
    default: 'toLocaleString',
    description: 'Formats the headline and the previous value.',
  },
  {
    name: 'change',
    type: 'PercentChange | false',
    description: (
      <>
        The badge. Worked out with <code>getPercentChange</code> when <code>value</code> and <code>previousValue</code>{' '}
        are both numbers. Pass your own for a string headline, or <code>false</code> to hide it.
      </>
    ),
  },
  {
    name: 'lowerIsBetter',
    type: 'boolean',
    default: 'false',
    description: 'Colors a decrease green and an increase yellow, for churn, refunds or latency.',
  },
];

const contentRows: PropRow[] = [
  { name: 'error', type: 'ReactNode', description: 'Replaces the plot with a dashed box and this message.' },
  { name: 'empty', type: 'boolean', default: 'false', description: 'Replaces the plot with emptyMessage.' },
  { name: 'emptyMessage', type: 'ReactNode', default: "'No data'", description: 'Shown when empty is set.' },
];

const footerRows: PropRow[] = [
  { name: 'href', type: 'string', description: 'Adds a "View more" link on the left.' },
  { name: 'hrefLabel', type: 'ReactNode', default: "'View more'", description: 'Link text.' },
  {
    name: 'updatedAt',
    type: 'number | string | Date',
    description: 'Shows "Last updated HH:mm" on the right. Numbers are unix seconds or milliseconds.',
  },
];

const lineRows: PropRow[] = [
  {
    name: 'data',
    type: 'ChartPoint[]',
    description: (
      <>
        One point per bucket: <code>date</code> plus a field per series key and per <code>dateKey</code>. A{' '}
        <code>null</code> value leaves a gap.
      </>
    ),
  },
  {
    name: 'series',
    type: 'ChartSeries[]',
    description: 'The lines to draw, in tooltip order. See ChartSeries below.',
  },
  {
    name: 'unit',
    type: "'hour' | 'day' | 'week' | 'month'",
    default: "'day'",
    description: 'Bucket size. Picks the date format: 14:00, 3 Nov 26, or Nov 26.',
  },
  {
    name: 'formatValue',
    type: '(value: number) => string',
    default: 'toLocaleString',
    description: 'Formats the headline, the previous value and tooltip values.',
  },
  {
    name: 'formatDate',
    type: '(date: ChartDate) => string',
    description: (
      <>
        Formats axis and tooltip dates. Defaults to <code>formatChartDate</code> with <code>unit</code>,{' '}
        <code>timezone</code> and <code>locale</code>.
      </>
    ),
  },
  {
    name: 'formatAxisValue',
    type: '(value: number) => string',
    default: 'formatCompactNumber',
    description: 'Formats y-axis ticks, such as 12.3K.',
  },
  { name: 'showXAxis', type: 'boolean', default: 'true', description: 'Shows the first and last dates.' },
  { name: 'showYAxis', type: 'boolean', default: 'false', description: 'Shows zero and the maximum value.' },
  {
    name: 'now',
    type: 'number | string | Date',
    default: 'Date.now()',
    description: 'Points after this are cut off on non-comparison lines. Set it to freeze a server-rendered chart.',
  },
  { name: 'error', type: 'ReactNode', description: 'Replaces the plot with an error message.' },
  { name: 'emptyMessage', type: 'ReactNode', default: "'No data'", description: 'Shown when data is empty.' },
  {
    name: '…',
    type: 'Chart, ChartHeader and ChartFooter props',
    description: (
      <>
        <code>loading</code>, <code>embedded</code>, <code>timezone</code>, <code>locale</code>,{' '}
        <code>linkComponent</code>, <code>className</code>, the headline props and <code>href</code>,{' '}
        <code>hrefLabel</code> and <code>updatedAt</code>.
      </>
    ),
  },
];

const seriesRows: PropRow[] = [
  { name: 'key', type: 'string', description: 'Field on each point that holds this line’s value.' },
  { name: 'label', type: 'string', description: 'Tooltip label.' },
  {
    name: 'color',
    type: 'string',
    description: (
      <>
        Any CSS color. Defaults to <code>var(--chart-1)</code> through <code>var(--chart-5)</code> in order, or muted
        gray for a comparison.
      </>
    ),
  },
  {
    name: 'comparison',
    type: 'boolean',
    default: 'false',
    description: 'A previous-period line: drawn underneath with no hover dot, and never cut off at now.',
  },
  {
    name: 'dateKey',
    type: 'string',
    description:
      'Field holding the date this value belongs to. When any series has one, tooltip rows are labelled with their own dates, so this period and the previous one read side by side.',
  },
];

const categoryRows: PropRow[] = [
  {
    name: 'items',
    type: 'CategoryBarItem[]',
    description: (
      <>
        <code>{'{ id, title, subtitle?, value, href?, color? }'}</code>. Items with <code>href</code> render as links
        with <code>linkComponent</code>. Colors default to the theme chart colors in order.
      </>
    ),
  },
  { name: 'value', type: 'ReactNode', default: 'sum of items', description: 'Headline.' },
  {
    name: 'formatValue',
    type: '(value: number) => string',
    default: 'toLocaleString',
    description: 'Formats each row’s value.',
  },
  {
    name: 'formatHeadlineValue',
    type: '(value: number) => string',
    default: 'formatValue',
    description: 'Formats the headline, when rows read "18 tickets" but the headline is just "41".',
  },
  { name: '…', type: 'Same as LineChart', description: 'Chart, headline and footer props, error and emptyMessage.' },
];

const hookRows: PropRow[] = [
  {
    name: 'fetch',
    type: '() => void | Promise<void>',
    description: 'Called once the element is near the viewport. The latest function is always used.',
  },
  {
    name: 'deps',
    type: 'unknown[]',
    description: (
      <>
        Fetch again when these change, compared with <code>JSON.stringify</code>. If they change while the chart is off
        screen, the fetch waits until it scrolls back.
      </>
    ),
  },
  {
    name: 'options.rootMargin',
    type: 'string',
    default: "'200px 0px'",
    description: 'Grows the viewport so loading starts just before the chart appears.',
  },
  {
    name: 'returns',
    type: '{ ref, inView }',
    description: 'Put ref on the chart’s wrapper element.',
  },
];

const helperRows: PropRow[] = [
  {
    name: 'getPercentChange',
    type: '(current, previous, { lowerIsBetter? }) => PercentChange',
    description: (
      <>
        <code>{"{ label: '+12.5%', variant: 'green' }"}</code>. Equal values are a zinc <code>0%</code>, and a rise from
        zero reads as <code>+100%</code>.
      </>
    ),
  },
  {
    name: 'formatChartDate',
    type: '(date, { unit?, timezone?, locale? }) => string',
    description: 'The default axis and tooltip format, built on Intl.DateTimeFormat.',
  },
  {
    name: 'formatCompactNumber',
    type: '(value, locale?) => string',
    description: 'The default y-axis format: 950, 12.3K, 4.5M.',
  },
  {
    name: 'maskFuture',
    type: '(data, keys, now?) => data',
    description: 'Sets keys to null on points whose date is after now. LineChart calls it for you.',
  },
];

export default function ChartsPage() {
  return (
    <DocsPage
      href="/docs/charts"
      sections={sections}
      lead={
        <>
          <C>LineChart</C> and <C>CategoryBarChart</C> show one metric each: a headline, a change badge against the
          previous period, the plot, and a footer link. Lines stop at the last bucket that has started, and{' '}
          <C>useInViewFetch</C> holds a chart&apos;s request until it scrolls into view.
        </>
      }
      demo={
        <Example file="charts-overview.tsx" padded>
          <ChartsOverviewDemo />
        </Example>
      }>
      <Section id="installation" title="Installation">
        <InstallCommand items={['@dentil/charts']} />
        <P>
          Files land in <C>components/dentil/charts/</C>. It uses the stock shadcn <C>chart</C> component, which adds
          Recharts 3, plus <C>@dentil/badge</C> and <C>@dentil/link</C>. Colors come from your theme&apos;s{' '}
          <C>--chart-1</C> to <C>--chart-5</C>.
        </P>
      </Section>

      <Section id="usage" title="Usage">
        <P>
          Pass the totals you already have as <C>value</C> and <C>previousValue</C>, and the change badge follows.
          Charts have no border or padding, so place them in your own card or grid cell.
        </P>
        <CodeBlock code={USAGE} />
      </Section>

      <Section id="data" title="Data">
        <P>
          Each point carries its bucket start as <C>date</C>, in unix seconds, milliseconds, an ISO string or a{' '}
          <C>Date</C>. Formatting happens at render time in <C>timezone</C>, so you don&apos;t format labels yourself.
          Points after now are cut off on the main lines, because reporting APIs usually fill future buckets with{' '}
          <C>0</C>, which would read as a real drop. Comparison lines run the full width.
        </P>
        <CodeBlock code={DATA} />
      </Section>

      <Section id="examples" title="Examples">
        <SubSection
          title="Several lines"
          description="A string headline with its own change badge. Failed uses the theme’s destructive color. Hover to see both values for a day.">
          <Example file="charts-multi-line.tsx" padded>
            <ChartsMultiLineDemo />
          </Example>
        </SubSection>
        <SubSection
          title="Category bar"
          description="Rows link elsewhere. With lowerIsBetter, fewer open tickets than last week reads as green.">
          <Example file="charts-category-bar.tsx" padded>
            <ChartsCategoryBarDemo />
          </Example>
        </SubSection>
        <SubSection
          title="States"
          description="Loading, error, empty, and embedded inside another surface without its title or footer.">
          <Example file="charts-states.tsx" padded>
            <ChartsStatesDemo />
          </Example>
        </SubSection>
        <SubSection
          title="Fetch in view"
          description="The request starts when the chart scrolls into view. Switch the range to fetch again; scrolling away and back doesn’t.">
          <Example file="charts-in-view.tsx" padded>
            <ChartsInViewDemo />
          </Example>
        </SubSection>
      </Section>

      <Section id="composing" title="Composing">
        <P>
          The presets are built from <C>Chart</C>, <C>ChartHeader</C>, <C>ChartContent</C> and <C>ChartFooter</C> in{' '}
          <C>chart.tsx</C>. Use them around any Recharts plot to keep the same header, states and footer. <C>Chart</C>{' '}
          passes <C>loading</C>, <C>embedded</C>, <C>timezone</C>, <C>locale</C> and <C>linkComponent</C> down to the
          parts.
        </P>
        <CodeBlock code={COMPOSING} />
      </Section>

      <Section id="api" title="API reference">
        <SubSection title="LineChart">
          <PropsTable rows={lineRows} />
        </SubSection>
        <SubSection title="ChartSeries">
          <PropsTable rows={seriesRows} />
        </SubSection>
        <SubSection title="CategoryBarChart">
          <PropsTable rows={categoryRows} />
        </SubSection>
        <SubSection title="Chart">
          <PropsTable rows={chartRows} />
        </SubSection>
        <SubSection title="ChartHeader">
          <PropsTable rows={headerRows} />
        </SubSection>
        <SubSection title="ChartContent">
          <PropsTable rows={contentRows} />
        </SubSection>
        <SubSection title="ChartFooter">
          <PropsTable rows={footerRows} />
        </SubSection>
        <SubSection title="useInViewFetch">
          <PropsTable rows={hookRows} />
        </SubSection>
        <SubSection title="Helpers">
          <PropsTable rows={helperRows} />
        </SubSection>
      </Section>
    </DocsPage>
  );
}
