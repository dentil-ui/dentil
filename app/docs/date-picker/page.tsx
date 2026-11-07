import type { Metadata } from 'next';

import { CodeBlock } from '@/components/docs/code-block';
import { Example } from '@/components/docs/example';
import { InstallCommand } from '@/components/docs/install-command';
import { C, DocsPage, P, Section, SubSection } from '@/components/docs/page-shell';
import { PropsTable, type PropRow } from '@/components/docs/props-table';
import { DatePickerApplyDemo } from '@/components/demos/date-picker-apply';
import { DatePickerCyclesDemo } from '@/components/demos/date-picker-cycles';
import { DatePickerOverviewDemo } from '@/components/demos/date-picker-overview';
import { DatePickerSingleDemo } from '@/components/demos/date-picker-single';
import { DatePickerTimestampDemo } from '@/components/demos/date-picker-timestamp';
import { registryItemUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Date Picker',
  description:
    'A single-date and range picker for shadcn/ui with range presets, date shortcuts, billing cycles, min and max dates, an Apply step, and Date or unix timestamp values.',
};

const sections = [
  ['installation', 'Installation'],
  ['usage', 'Usage'],
  ['examples', 'Examples'],
  ['presets', 'Custom presets'],
  ['api', 'API reference'],
] as const;

const USAGE = `
'use client';

import { useState } from 'react';

import { DateRangePicker, SingleDatePicker } from '@/components/dentil/date-picker/date-picker';

export function ReportFilters() {
  const [due, setDue] = useState<Date>();
  const [period, setPeriod] = useState<{ start: Date | undefined; end: Date | undefined }>();

  return (
    <>
      <SingleDatePicker value={due} onChange={setDue} minDate={new Date()} />
      <DateRangePicker value={period} onChange={setPeriod} showQuickSelect />
    </>
  );
}
`;

const PRESETS = `
import { endOfDay, startOfDay, subDays } from 'date-fns';

import { DateRangePicker, quickSelectOptions, type QuickSelectOption } from '@/components/dentil/date-picker/date-picker';

const presets: QuickSelectOption[] = [
  {
    label: 'Last 30 days',
    value: 'last_30_days',
    getRange: () => ({ start: startOfDay(subDays(new Date(), 29)), end: endOfDay(new Date()) }),
  },
  ...quickSelectOptions.filter((option) => option.value !== 'last_4_weeks'),
];

<DateRangePicker value={period} onChange={setPeriod} showQuickSelect presets={presets} />;
`;

const propsRows: PropRow[] = [
  {
    name: 'mode',
    type: "'single' | 'range'",
    description: (
      <>
        Required on <code>DatePicker</code>. <code>SingleDatePicker</code> and <code>DateRangePicker</code> set it for
        you.
      </>
    ),
  },
  {
    name: 'returnFormat',
    type: "'date' | 'timestamp'",
    default: "'date'",
    description: (
      <>
        <code>&apos;date&apos;</code> reads and writes <code>Date</code> objects. <code>&apos;timestamp&apos;</code>{' '}
        reads and writes unix seconds.
      </>
    ),
  },
  {
    name: 'value',
    type: 'Date | number | { start, end } | null | undefined',
    description: (
      <>
        A single value in single mode, or <code>{'{ start, end }'}</code> in range mode, in the{' '}
        <code>returnFormat</code> type.
      </>
    ),
  },
  {
    name: 'onChange',
    type: '(value) => void',
    description: (
      <>
        Called once a date or a full range is picked, or on Apply with <code>showApplyButton</code>. Called with{' '}
        <code>undefined</code> when cleared.
      </>
    ),
  },
  {
    name: 'placeholder',
    type: 'string',
    default: "'Select a date' | 'Select a date range'",
    description: 'Trigger label when there is no value.',
  },
  {
    name: 'dateFormat',
    type: 'string',
    default: "'d MMM yyyy'",
    description: 'A date-fns format string for the trigger label and cycle dates.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Applied to the root, which wraps the trigger and clear button. Set the width here.',
  },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the trigger and every day.' },
  {
    name: 'showClear',
    type: 'boolean',
    default: 'true',
    description: 'Show a clear button inside the trigger when there is a value.',
  },
  { name: 'align', type: "'start' | 'center' | 'end'", default: "'start'", description: 'Popover alignment.' },
  { name: 'buttonSize', type: "'sm' | 'default'", default: "'default'", description: 'Trigger button size.' },
  {
    name: 'endOfDay',
    type: 'boolean',
    default: 'true',
    description: 'Move a range’s end to 23:59:59.999 of its day, so the range includes the whole last day.',
  },
  {
    name: 'showQuickSelect',
    type: 'boolean',
    default: 'false',
    description: 'Range mode: show presets beside the calendar.',
  },
  {
    name: 'presets',
    type: 'QuickSelectOption[]',
    default: 'quickSelectOptions',
    description: 'Range presets: last 7 days, 4 weeks, 6 and 12 months, and month, quarter and year to date.',
  },
  {
    name: 'showShortcuts',
    type: 'boolean',
    default: 'false',
    description: (
      <>
        Single mode: show <code>shortcuts</code> and <code>cycleConfig</code> cycles beside the calendar.
      </>
    ),
  },
  {
    name: 'shortcuts',
    type: 'SingleDateShortcut[]',
    default: 'defaultSingleDateShortcuts',
    description: 'Today and the 1st of next month. Pass [] to show only cycles.',
  },
  {
    name: 'cycleConfig',
    type: '{ startDate: Date | number; durationMonths?: number }',
    description: (
      <>
        Adds 1, 3, 4, 6 and 12 cycle buttons and a custom count. Each picks the last second of that cycle, so 1 cycle
        from 1 Mar is 31 Mar 23:59:59. <code>durationMonths</code> defaults to 1.
      </>
    ),
  },
  {
    name: 'minDate',
    type: 'Date | number',
    description: 'Days before it are disabled, and shortcuts and cycles before it are greyed out.',
  },
  { name: 'maxDate', type: 'Date | number', description: 'Days after it are disabled.' },
  {
    name: 'defaultMonth',
    type: 'Date | number',
    description: (
      <>
        Month shown on open. Defaults to the selected date, then <code>minDate</code>, then today.
      </>
    ),
  },
  {
    name: 'showApplyButton',
    type: 'boolean',
    default: 'false',
    description: 'Hold the selection until Apply is clicked. Closing the popover without applying discards it.',
  },
];

const presetRows: PropRow[] = [
  { name: 'label', type: 'string', description: 'Button text.' },
  { name: 'value', type: 'string', description: 'A unique key.' },
  {
    name: 'getRange / getDate',
    type: '() => { start: Date; end: Date } | () => Date',
    description: (
      <>
        Called when the panel renders and on click, so relative dates stay current. <code>QuickSelectOption</code> has{' '}
        <code>getRange</code>, <code>SingleDateShortcut</code> has <code>getDate</code>.
      </>
    ),
  },
];

export default function DatePickerPage() {
  return (
    <DocsPage
      href="/docs/date-picker"
      sections={sections}
      lead={
        <>
          Pick a date with <C>SingleDatePicker</C> or a range with <C>DateRangePicker</C>. Both are controlled, return{' '}
          <C>Date</C> objects or unix seconds, and add presets, shortcuts and billing cycles beside the stock shadcn
          calendar.
        </>
      }
      demo={
        <Example file="date-picker-overview.tsx" padded>
          <DatePickerOverviewDemo />
        </Example>
      }>
      <Section id="installation" title="Installation">
        <InstallCommand items={['@dentil/date-picker']} />
        <P>
          Files land in <C>components/dentil/date-picker/</C>. Uses the stock shadcn <C>button</C>, <C>calendar</C>,{' '}
          <C>input</C> and <C>popover</C>, and <C>date-fns</C>. If your CLI can&apos;t resolve <C>@dentil</C>, install
          by URL: <C>{registryItemUrl('@dentil/date-picker')}</C>.
        </P>
      </Section>

      <Section id="usage" title="Usage">
        <P>
          A range only reaches <C>onChange</C> once both ends are picked. Clicking a day when a full range is already
          selected starts a new one.
        </P>
        <CodeBlock code={USAGE} />
      </Section>

      <Section id="examples" title="Examples">
        <SubSection
          title="Single date with limits"
          description="Days outside the next 90 days are disabled, and the shortcuts beside the calendar respect the same limits.">
          <Example file="date-picker-single.tsx" padded>
            <DatePickerSingleDemo />
          </Example>
        </SubSection>
        <SubSection
          title="Billing cycles"
          description="Each cycle picks the last second before the next period starts. Type a number to pick any cycle count.">
          <Example file="date-picker-cycles.tsx" padded>
            <DatePickerCyclesDemo />
          </Example>
        </SubSection>
        <SubSection
          title="Apply step"
          description="Pick a range, then close the popover without applying: onChange isn't called and the selection resets.">
          <Example file="date-picker-apply.tsx" padded>
            <DatePickerApplyDemo />
          </Example>
        </SubSection>
        <SubSection
          title="Unix timestamps"
          description={'With returnFormat="timestamp", value and onChange use unix seconds, ready for an API.'}>
          <Example file="date-picker-timestamp.tsx" padded>
            <DatePickerTimestampDemo />
          </Example>
        </SubSection>
      </Section>

      <Section id="presets" title="Custom presets">
        <P>
          The defaults are exported as <C>quickSelectOptions</C> and <C>defaultSingleDateShortcuts</C>, so you can
          extend them rather than starting over.
        </P>
        <CodeBlock code={PRESETS} />
      </Section>

      <Section id="api" title="API reference">
        <SubSection
          title="DatePicker"
          description="SingleDatePicker and DateRangePicker take the same props without mode.">
          <PropsTable rows={propsRows} />
        </SubSection>
        <SubSection title="QuickSelectOption and SingleDateShortcut">
          <PropsTable rows={presetRows} />
        </SubSection>
      </Section>
    </DocsPage>
  );
}
