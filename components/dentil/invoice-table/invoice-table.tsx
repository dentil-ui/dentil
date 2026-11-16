'use client';

import type { ComponentProps, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

import { CurrencyInput, getCurrencyFormat } from '../currency-input/currency-input';

/** Unix seconds, unix milliseconds, an ISO string or a `Date`. */
export type InvoiceDate = number | string | Date;

/** The service period a line covers, shown under its description. */
export type InvoicePeriod = { start: InvoiceDate; end: InvoiceDate };

/** How a prorated line relates to its full price, shown under its description. */
export type InvoiceProration = {
  /** The line's price for a whole billing period, in minor units. */
  fullAmount: number;
  /** Shown as "17 of 31 days of $20.00". Without it the detail reads "Prorated from $20.00". */
  days?: { used: number; total: number };
  /** Replaces the generated text, e.g. to translate it. */
  label?: ReactNode;
};

/** One row of the invoice. Amounts are in minor units (pence, cents). */
export type InvoiceLine = {
  id: string;
  description: ReactNode;
  /** Beside the description: badges, a link, a note. */
  meta?: ReactNode;
  period?: InvoicePeriod;
  proration?: InvoiceProration;
  quantity?: number;
  /**
   * A decimal string such as `'0.05'` keeps fractions of a minor unit
   * below one cent.
   */
  unitAmount?: number | string;
  /** Percent, e.g. `20` for 20%. */
  taxRate?: number;
  tax?: number;
  amount: number;
  /** Struck through before `amount`, e.g. the price before a discount. For proration, use `proration`. */
  originalAmount?: number;
};

/** Lines shown as one block under a heading row, such as the credit and charge of a plan change. */
export type InvoiceLineGroup<TLine extends InvoiceLine = InvoiceLine> = {
  id: string;
  description: ReactNode;
  meta?: ReactNode;
  /** Muted line under the description, e.g. "Upgraded Dec 15, 2026". */
  detail?: ReactNode;
  lines: readonly TLine[];
  /** Net of the lines, shown on the group row. Omit to leave it blank. */
  amount?: number;
};

export function isInvoiceLineGroup<TLine extends InvoiceLine>(
  item: TLine | InvoiceLineGroup<TLine>
): item is InvoiceLineGroup<TLine> {
  return 'lines' in item && Array.isArray(item.lines);
}

/** One row of the totals footer. `amount` is in minor units. */
export type InvoiceTotal = {
  id?: string;
  label: ReactNode;
  amount: number;
  /** `muted` for most rows, `strong` for the final amount due, `entry` for a left-aligned line such as a credit note. */
  variant?: 'muted' | 'strong' | 'entry';
  /** Adds space above, to start a group such as adjustments. */
  gap?: boolean;
  className?: string;
};

/** An editable amount per line, such as how much of each line a credit note covers. */
export type InvoiceAllocation<TLine extends InvoiceLine = InvoiceLine> = {
  /** Header of the input column. */
  label?: string;
  /** Allocated amount per line, in minor units, keyed by line id. */
  values: Record<string, number | undefined>;
  onChange: (values: Record<string, number | undefined>) => void;
  /** Largest amount a line can take, in minor units. Lines at 0 or below get a disabled input. */
  max: (line: TLine) => number;
  /** Shows each line's `max` in a Remaining column before the input. */
  showRemaining?: boolean;
  disabled?: boolean;
  /** Marks every enabled input invalid, e.g. when the allocated sum is over a cap. */
  invalid?: boolean;
};

export type InvoiceTableColumn = 'quantity' | 'unitAmount' | 'taxRate' | 'tax';

export type InvoiceTableProps<TLine extends InvoiceLine = InvoiceLine> = Omit<ComponentProps<'table'>, 'children'> & {
  /** Extra fields on a line are ignored by the table and passed back to `allocation.max`. */
  lines: readonly (TLine | InvoiceLineGroup<TLine>)[];
  /** ISO 4217 code, e.g. `'USD'`. */
  currency: string;
  /** Defaults to `'en-US'` rather than the browser's, so server and client render the same text. */
  locale?: string;
  /** IANA time zone for line periods. Defaults to `'UTC'` rather than the browser's, for the same reason. */
  timezone?: string;
  /** Optional columns, in display order. Defaults to the ones any line has a value for. Amount always shows. */
  columns?: readonly InvoiceTableColumn[];
  totals?: readonly InvoiceTotal[];
  allocation?: InvoiceAllocation<TLine>;
  /** Where cells sit in a line taller than one row of text. With `allocation`, `top` lines the first row of text up with the input. */
  verticalAlign?: 'top' | 'middle';
  loading?: boolean;
  /** Shown in place of the rows when `lines` is empty. */
  empty?: ReactNode;
};

const columnOrder: readonly InvoiceTableColumn[] = ['quantity', 'unitAmount', 'taxRate', 'tax'];

const columnLabels: Record<InvoiceTableColumn, string> = {
  quantity: 'Qty',
  unitAmount: 'Unit price',
  taxRate: 'Tax rate',
  tax: 'Tax',
};

/**
 * Formats an amount in minor units (`1050` is $10.50) with the currency's symbol and decimal places. A decimal string
 * (`'0.05'`) shows every fraction digit it has beyond the currency's own, so `'0.05'` USD is $0.0005.
 */
export function formatInvoiceAmount(amount: number | string, currency: string, locale = 'en-US') {
  const { digits } = getCurrencyFormat(currency, locale);
  const minor = typeof amount === 'string' ? Number(amount.trim()) : amount;
  if (!Number.isFinite(minor)) return String(amount);

  const extra = typeof amount === 'string' ? (amount.split('.')[1] ?? '').replace(/0+$/, '').length : 0;
  const fractionDigits = Math.min(digits + extra, 20);
  const major = minor / 10 ** digits;
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: digits,
      maximumFractionDigits: fractionDigits,
    }).format(major);
  } catch {
    return `${major.toFixed(fractionDigits)} ${currency.toUpperCase()}`;
  }
}

function toDate(value: InvoiceDate) {
  const date =
    value instanceof Date ? value : new Date(typeof value === 'number' && value < 1e11 ? value * 1000 : value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Formats a period with the parts the two dates share written once: "Dec 1 – 31, 2026", or
 * "Dec 15, 2026 – Jan 14, 2027". Returns `null` when either date is invalid.
 */
export function formatInvoicePeriod(period: InvoicePeriod, locale = 'en-US', timezone = 'UTC') {
  const start = toDate(period.start);
  const end = toDate(period.end);
  if (!start || !end) return null;

  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  let text: string;
  try {
    text = new Intl.DateTimeFormat(locale, { ...options, timeZone: timezone }).formatRange(start, end);
  } catch {
    text = new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }).formatRange(start, end);
  }
  // ICU versions disagree on thin or regular spaces around the dash, which breaks hydration between Node and browsers.
  return text.replace(/[\u2009\u202f]/g, ' ');
}

export function InvoiceTable<TLine extends InvoiceLine>({
  lines,
  currency,
  locale = 'en-US',
  timezone = 'UTC',
  columns,
  totals,
  allocation,
  verticalAlign = 'top',
  loading = false,
  empty = 'No items',
  className,
  ...props
}: InvoiceTableProps<TLine>) {
  const flat = lines.flatMap((item) => (isInvoiceLineGroup(item) ? item.lines : [item]));
  const visible = columns
    ? columnOrder.filter((column) => columns.includes(column))
    : columnOrder.filter((column) => flat.some((line) => line[column] !== undefined));
  const showRemaining = allocation ? (allocation.showRemaining ?? true) : false;
  const columnCount = 2 + visible.length + (allocation ? 1 : 0) + (showRemaining ? 1 : 0);

  // With allocation, text cells start lower so their first line centres on the 36px input (py-1.5 + h-9).
  const lineCell = verticalAlign === 'middle' ? 'align-middle' : cn('align-top', allocation && 'pt-3.5');

  const money = (amount: number | string) => formatInvoiceAmount(amount, currency, locale);
  const percent = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 2 });
  const number = new Intl.NumberFormat(locale);

  const cellValue = (line: TLine, column: InvoiceTableColumn) => {
    if (column === 'quantity') return line.quantity === undefined ? null : number.format(line.quantity);
    if (column === 'taxRate') return line.taxRate === undefined ? null : percent.format(line.taxRate / 100);
    const value = line[column];
    return value === undefined ? null : money(value);
  };

  const prorationText = ({ fullAmount, days, label }: InvoiceProration) => {
    if (label !== undefined) return label;
    if (!days) return `Prorated from ${money(fullAmount)}`;
    return `${number.format(days.used)} of ${number.format(days.total)} days of ${money(fullAmount)}`;
  };

  const renderLine = (line: TLine, index: number, group?: { id: string; last: boolean }) => {
    const max = allocation ? allocation.max(line) : 0;
    const inputDisabled = !allocation || allocation.disabled || max <= 0;
    const struck = line.originalAmount !== undefined && line.originalAmount !== line.amount;
    const period = line.period ? formatInvoicePeriod(line.period, locale, timezone) : null;

    return (
      <TableRow
        key={line.id}
        data-slot="invoice-table-line"
        data-group={group?.id}
        className={cn(group && !group.last && 'border-0')}>
        <TableCell className={cn(lineCell, 'w-full min-w-48 whitespace-normal', group && 'pl-6')}>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>{line.description}</span>
            {line.meta}
          </div>
          {period || line.proration ? (
            <div data-slot="invoice-table-detail" className="text-muted-foreground mt-0.5 text-xs">
              {period ? <span data-slot="invoice-table-period">{period}</span> : null}
              {period && line.proration ? ' · ' : null}
              {line.proration ? <span data-slot="invoice-table-proration">{prorationText(line.proration)}</span> : null}
            </div>
          ) : null}
        </TableCell>
        {visible.map((column) => (
          <TableCell key={column} className={cn(lineCell, 'text-right tabular-nums')}>
            {cellValue(line, column)}
          </TableCell>
        ))}
        <TableCell className={cn(lineCell, 'text-right tabular-nums')}>
          {struck ? (
            <span className="text-muted-foreground mr-2 line-through">{money(line.originalAmount ?? 0)}</span>
          ) : null}
          {money(line.amount)}
        </TableCell>
        {showRemaining ? (
          <TableCell className={cn(lineCell, 'text-muted-foreground text-right tabular-nums')}>
            {money(Math.max(max, 0))}
          </TableCell>
        ) : null}
        {allocation ? (
          <TableCell
            data-slot="invoice-table-allocation"
            className={cn('py-1.5', verticalAlign === 'middle' ? 'align-middle' : 'align-top')}>
            <CurrencyInput
              className="ml-auto w-44"
              inputClassName="text-right"
              currency={currency}
              locale={locale}
              value={allocation.values[line.id] ?? null}
              maxAmount={Math.max(max, 0)}
              disabled={inputDisabled}
              aria-invalid={(allocation.invalid && !inputDisabled) || undefined}
              aria-label={
                typeof line.description === 'string'
                  ? `${allocation.label ?? 'Amount'} for ${line.description}`
                  : `${allocation.label ?? 'Amount'}, line ${index + 1}`
              }
              onChange={(value) => allocation.onChange({ ...allocation.values, [line.id]: value })}
            />
          </TableCell>
        ) : null}
      </TableRow>
    );
  };

  const renderGroup = (group: InvoiceLineGroup<TLine>) => (
    <TableRow
      key={`group:${group.id}`}
      data-slot="invoice-table-group"
      className={cn('hover:bg-transparent', group.lines.length > 0 && 'border-0')}>
      <TableCell className={cn(lineCell, 'w-full min-w-48 whitespace-normal')}>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-medium">{group.description}</span>
          {group.meta}
        </div>
        {group.detail ? <div className="text-muted-foreground mt-0.5 text-xs">{group.detail}</div> : null}
      </TableCell>
      {visible.map((column) => (
        <TableCell key={column} className={lineCell} />
      ))}
      <TableCell className={cn(lineCell, 'text-right font-medium tabular-nums')}>
        {group.amount === undefined ? null : money(group.amount)}
      </TableCell>
      {showRemaining ? <TableCell className={lineCell} /> : null}
      {allocation ? <TableCell className={lineCell} /> : null}
    </TableRow>
  );

  let lineIndex = 0;
  const rows = lines.flatMap((item) => {
    if (!isInvoiceLineGroup(item)) return [renderLine(item, lineIndex++)];
    return [
      renderGroup(item),
      ...item.lines.map((line, i) => renderLine(line, lineIndex++, { id: item.id, last: i === item.lines.length - 1 })),
    ];
  });

  return (
    <Table data-slot="invoice-table" className={className} {...props}>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="text-muted-foreground">Description</TableHead>
          {visible.map((column) => (
            <TableHead key={column} className="text-muted-foreground text-right">
              {columnLabels[column]}
            </TableHead>
          ))}
          <TableHead className="text-muted-foreground text-right">Amount</TableHead>
          {showRemaining ? <TableHead className="text-muted-foreground text-right">Remaining</TableHead> : null}
          {allocation ? (
            <TableHead className="text-muted-foreground text-right">{allocation.label ?? 'Amount'}</TableHead>
          ) : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={columnCount} className="h-24">
              <Loader2 className="text-muted-foreground mx-auto size-5 animate-spin" />
            </TableCell>
          </TableRow>
        ) : lines.length === 0 ? (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={columnCount} className="text-muted-foreground h-24 text-center">
              {empty}
            </TableCell>
          </TableRow>
        ) : (
          rows
        )}
      </TableBody>
      {!loading && lines.length > 0 && totals?.length ? (
        <TableFooter className="bg-background font-normal">
          {totals.map((total, index) => {
            const variant = total.variant ?? 'muted';
            const spacing = cn('py-1', (index === 0 || total.gap) && 'pt-3', index === totals.length - 1 && 'pb-3');
            const tone = variant === 'strong' ? 'text-foreground font-medium' : 'text-muted-foreground';

            return (
              <TableRow
                key={total.id ?? index}
                data-slot="invoice-table-total"
                data-variant={variant}
                className="border-0 hover:bg-transparent">
                {variant === 'entry' ? (
                  <>
                    <TableCell className={cn(spacing, 'whitespace-normal')}>{total.label}</TableCell>
                    {columnCount > 2 ? <TableCell colSpan={columnCount - 2} className={spacing} /> : null}
                  </>
                ) : (
                  <TableCell colSpan={columnCount - 1} className={cn(spacing, tone, 'text-right')}>
                    {total.label}
                  </TableCell>
                )}
                <TableCell className={cn(spacing, tone, 'text-right tabular-nums', total.className)}>
                  {money(total.amount)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableFooter>
      ) : null}
    </Table>
  );
}
