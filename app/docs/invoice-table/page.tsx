import type { Metadata } from 'next';

import { CodeBlock } from '@/components/docs/code-block';
import { Example } from '@/components/docs/example';
import { InstallCommand } from '@/components/docs/install-command';
import { C, DocsPage, P, Section, SubSection } from '@/components/docs/page-shell';
import { PropsTable, type PropRow } from '@/components/docs/props-table';
import { InvoiceTableAdjustmentsDemo } from '@/components/demos/invoice-table-adjustments';
import { InvoiceTableAllocationDemo } from '@/components/demos/invoice-table-allocation';
import { InvoiceTableOverviewDemo } from '@/components/demos/invoice-table-overview';

export const metadata: Metadata = {
  title: 'Invoice Table',
  description:
    'An invoice line items table for shadcn/ui with optional quantity, unit price and tax columns, a totals footer, and an optional per-line allocation column for credit notes and part payments.',
};

const sections = [
  ['installation', 'Installation'],
  ['usage', 'Usage'],
  ['examples', 'Examples'],
  ['allocation', 'Allocation'],
  ['api', 'API reference'],
] as const;

const USAGE = `
import { InvoiceTable } from '@/components/dentil/invoice-table/invoice-table';

<InvoiceTable
  currency="USD"
  lines={invoice.items.map((item) => ({
    id: item.id,
    description: item.description,
    period: item.period, // { start, end } as unix seconds, ISO strings or Dates
    quantity: item.quantity,
    unitAmount: item.unit_amount,
    taxRate: item.tax_percent,
    amount: item.amount,
  }))}
  totals={[
    { label: 'Subtotal', amount: invoice.subtotal },
    { label: 'Tax', amount: invoice.tax },
    { label: 'Amount due', amount: invoice.amount_due, variant: 'strong' },
  ]}
/>
`;

const ALLOCATION = `
const [values, setValues] = useState<Record<string, number | undefined>>({});

<InvoiceTable
  currency={invoice.currency}
  lines={lines} // InvoiceLine plus any fields you need, e.g. credited
  allocation={{
    label: 'Credit',
    values,
    onChange: setValues,
    max: (line) => line.amount + (line.tax ?? 0) - line.credited,
  }}
/>

// Send it as an array if your API wants one.
const items = Object.entries(values).map(([invoice_item, amount]) => ({ invoice_item, amount: amount ?? 0 }));
`;

const tableRows: PropRow[] = [
  {
    name: 'lines',
    type: 'TLine[]',
    description: (
      <>
        Rows, in display order. <code>TLine</code> extends <code>InvoiceLine</code>, so extra fields are kept and passed
        back to <code>allocation.max</code>.
      </>
    ),
  },
  { name: 'currency', type: 'string', description: 'ISO 4217 code, e.g. USD. Sets the symbol and decimal places.' },
  {
    name: 'locale',
    type: 'string',
    default: "'en-US'",
    description:
      'Locale for money, quantities, percentages and periods. It isn’t read from the browser, so server and client render the same text. Pass your user’s locale if you have it.',
  },
  {
    name: 'timezone',
    type: 'string',
    default: "'UTC'",
    description:
      'IANA time zone that line periods are shown in. Like locale, it isn’t read from the browser. Pass your billing zone if periods start at midnight there.',
  },
  {
    name: 'columns',
    type: "('quantity' | 'unitAmount' | 'taxRate' | 'tax')[]",
    description:
      'Optional columns to show. They always render in that order. Defaults to the ones any line has a value for. Description and Amount always show.',
  },
  {
    name: 'totals',
    type: 'InvoiceTotal[]',
    description: 'Footer rows, in display order. The table doesn’t add anything up, so pass the numbers from your API.',
  },
  {
    name: 'allocation',
    type: 'InvoiceAllocation<TLine>',
    description: 'Adds a Remaining column and an amount input per line. Totals then line up under the inputs.',
  },
  {
    name: 'verticalAlign',
    type: "'top' | 'middle'",
    default: "'top'",
    description: (
      <>
        Where cells sit when a line is taller than one row of text, e.g. with a period. <code>top</code> keeps numbers
        level with the description; with <code>allocation</code> it lines the first row of text up with the inputs.
      </>
    ),
  },
  {
    name: 'loading',
    type: 'boolean',
    default: 'false',
    description: 'Replaces the rows with a spinner and hides the totals.',
  },
  {
    name: 'empty',
    type: 'ReactNode',
    default: "'No items'",
    description: (
      <>
        Shown when <code>lines</code> is empty. The totals are hidden too.
      </>
    ),
  },
  {
    name: '…props',
    type: "ComponentProps<'table'>",
    description: (
      <>
        Other props (<code>className</code>, <code>aria-label</code>…) are passed to the table.
      </>
    ),
  },
];

const lineRows: PropRow[] = [
  { name: 'id', type: 'string', description: 'Stable identity for the row, and the key in allocation values.' },
  { name: 'description', type: 'ReactNode', description: 'The line. Wraps onto more lines when long.' },
  { name: 'meta', type: 'ReactNode', description: 'Beside the description: a badge, a link or a note.' },
  {
    name: 'period',
    type: '{ start: InvoiceDate; end: InvoiceDate }',
    description: (
      <>
        Muted line under the description, such as &quot;Dec 1 – 31, 2026&quot;. Each date is unix seconds, unix
        milliseconds, an ISO string or a <code>Date</code>. Both dates are shown as given, so pass an inclusive end if
        your API&apos;s is exclusive. An invalid date hides the line.
      </>
    ),
  },
  { name: 'quantity', type: 'number', description: 'Shown in the Qty column.' },
  {
    name: 'unitAmount',
    type: 'number | string',
    description: (
      <>
        Unit price in minor units. A decimal string such as <code>&apos;0.05&apos;</code> keeps fractions of a minor
        unit, like Stripe&apos;s <code>unit_amount_decimal</code>, and shows as $0.0005.
      </>
    ),
  },
  { name: 'taxRate', type: 'number', description: 'Percent, e.g. 10 for 10%.' },
  { name: 'tax', type: 'number', description: 'Tax in minor units.' },
  { name: 'amount', type: 'number', description: 'Line amount in minor units.' },
  {
    name: 'originalAmount',
    type: 'number',
    description: (
      <>
        Struck through before <code>amount</code> when the two differ, e.g. the price before proration.
      </>
    ),
  },
];

const totalRows: PropRow[] = [
  { name: 'id', type: 'string', description: 'React key. Defaults to the row index.' },
  { name: 'label', type: 'ReactNode', description: 'Right-aligned beside the amount, or left-aligned for an entry.' },
  { name: 'amount', type: 'number', description: 'Amount in minor units. Pass negatives for credits and payments.' },
  {
    name: 'variant',
    type: "'muted' | 'strong' | 'entry'",
    default: "'muted'",
    description: (
      <>
        <code>strong</code> is for the final amount due. <code>entry</code> puts the label in the description column,
        for a credit note or a payment.
      </>
    ),
  },
  { name: 'gap', type: 'boolean', default: 'false', description: 'Adds space above, to start a group.' },
  {
    name: 'className',
    type: 'string',
    description: (
      <>
        Applied to the amount cell, e.g. <code>line-through</code> for a void payment.
      </>
    ),
  },
];

const allocationRows: PropRow[] = [
  { name: 'label', type: 'string', default: "'Amount'", description: 'Header of the input column.' },
  {
    name: 'values',
    type: 'Record<string, number | undefined>',
    description: 'Allocated amount per line in minor units, keyed by line id.',
  },
  {
    name: 'onChange',
    type: '(values: Record<string, number | undefined>) => void',
    description: (
      <>
        Called with every value when one input changes. An emptied input sets its line to <code>undefined</code>.
      </>
    ),
  },
  {
    name: 'max',
    type: '(line: TLine) => number',
    description:
      'Largest amount a line can take, in minor units. Input above it is clamped. At 0 or below, the input is disabled.',
  },
  {
    name: 'showRemaining',
    type: 'boolean',
    default: 'true',
    description: (
      <>
        Shows each line&apos;s <code>max</code> in a Remaining column.
      </>
    ),
  },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables every input.' },
  {
    name: 'invalid',
    type: 'boolean',
    default: 'false',
    description: (
      <>
        Sets <code>aria-invalid</code> on every enabled input, e.g. when the sum is over a cap.
      </>
    ),
  },
];

const formatRows: PropRow[] = [
  {
    name: 'amount',
    type: 'number | string',
    description: 'Amount in minor units. A decimal string shows every fraction digit it has.',
  },
  { name: 'currency', type: 'string', description: 'ISO 4217 code.' },
  { name: 'locale', type: 'string', default: "'en-US'", description: 'Locale for the separators and symbol.' },
];

const periodRows: PropRow[] = [
  { name: 'period', type: 'InvoicePeriod', description: 'The start and end dates.' },
  { name: 'locale', type: 'string', default: "'en-US'", description: 'Locale for the month names and order.' },
  { name: 'timezone', type: 'string', default: "'UTC'", description: 'IANA time zone the dates are shown in.' },
];

export default function InvoiceTablePage() {
  return (
    <DocsPage
      href="/docs/invoice-table"
      sections={sections}
      lead={
        <>
          <C>InvoiceTable</C> renders an invoice&apos;s line items with a totals footer. It doesn&apos;t fetch or
          calculate anything: you pass <C>lines</C> and <C>totals</C> in minor units. Click Reload to see the loading
          state.
        </>
      }
      demo={
        <Example file="invoice-table-overview.tsx" padded>
          <InvoiceTableOverviewDemo />
        </Example>
      }>
      <Section id="installation" title="Installation">
        <InstallCommand items={['@dentil/invoice-table']} />
        <P>
          Files land in <C>components/dentil/invoice-table/</C>. Uses the stock shadcn <C>table</C>, and{' '}
          <C>@dentil/currency-input</C> for the allocation inputs and currency formatting.
        </P>
      </Section>

      <Section id="usage" title="Usage">
        <CodeBlock code={USAGE} />
        <P>
          Map your API&apos;s invoice onto <C>InvoiceLine</C> and <C>InvoiceTotal</C>. The Qty, Unit price, Tax rate and
          Tax columns show when any line has a value for them, or pass <C>columns</C> to choose. Use{' '}
          <C>formatInvoiceAmount(amount, currency)</C> for amounts inside labels, such as &quot;Tax (10% on
          $851.00)&quot;.
        </P>
        <P>
          For prices below one cent, pass <C>unitAmount</C> as a decimal string in minor units, such as Stripe&apos;s{' '}
          <C>unit_amount_decimal</C>. The API requests line above uses <C>&apos;0.05&apos;</C>, which shows as $0.0005.
          A string is never rounded to the currency&apos;s decimal places.
        </P>
        <P>
          <C>period</C> adds a muted line under the description. Parts the two dates share are written once, so a month
          reads &quot;Dec 1 – 31, 2026&quot; and a period across the new year reads &quot;Dec 15, 2026 – Jan 14,
          2027&quot;. Dates are shown in UTC unless you pass <C>timezone</C>.
        </P>
      </Section>

      <Section id="examples" title="Examples">
        <SubSection
          title="Credit notes and payments"
          description="Entry rows put a credit note or part payment on the left. gap starts each group, and className strikes through the void payment.">
          <Example file="invoice-table-adjustments.tsx" padded>
            <InvoiceTableAdjustmentsDemo />
          </Example>
        </SubSection>
      </Section>

      <Section id="allocation" title="Allocation">
        <P>
          Pass <C>allocation</C> to split an amount across lines, for a credit note or a part payment. Each line gets an
          input capped at <C>max(line)</C>, and a line with nothing left gets a disabled one. Allocate more than $150.00
          in total to see the inputs marked invalid.
        </P>
        <Example file="invoice-table-allocation.tsx" padded>
          <InvoiceTableAllocationDemo />
        </Example>
        <CodeBlock code={ALLOCATION} />
        <P>
          <C>values</C> is keyed by line id, so reordering lines never moves an amount to the wrong row. The inputs show
          the currency code, so the column is wider than the amounts beside it.
        </P>
      </Section>

      <Section id="api" title="API reference">
        <SubSection title="InvoiceTable">
          <PropsTable rows={tableRows} />
        </SubSection>
        <SubSection title="InvoiceLine">
          <PropsTable rows={lineRows} />
        </SubSection>
        <SubSection title="InvoiceTotal">
          <PropsTable rows={totalRows} />
        </SubSection>
        <SubSection title="InvoiceAllocation">
          <PropsTable rows={allocationRows} />
        </SubSection>
        <SubSection
          title="formatInvoiceAmount"
          description="Formats minor units with the currency’s symbol and decimals.">
          <PropsTable rows={formatRows} />
        </SubSection>
        <SubSection
          title="formatInvoicePeriod"
          description="Formats a period the way line items show it, for your own labels. Returns null when either date is invalid.">
          <PropsTable rows={periodRows} />
        </SubSection>
      </Section>
    </DocsPage>
  );
}
