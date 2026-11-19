'use client';

import { AlertCircle, Loader2 } from 'lucide-react';
import { createContext, use, useMemo, type ComponentProps, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { Badge } from '../badge/badge';
import { Link, type LinkComponent } from '../link/link';
import { getPercentChange, type PercentChange } from './percent-change';
import { formatChartTime, type ChartDate } from './time';

type ChartContextValue = {
  loading: boolean;
  embedded: boolean;
  timezone?: string;
  locale?: string;
  linkComponent?: LinkComponent;
};

const ChartContext = createContext<ChartContextValue>({ loading: false, embedded: false });

/** Shared state from the nearest `Chart`: loading, embedded, timezone, locale and link component. */
export function useChartContext() {
  return use(ChartContext);
}

export interface ChartProps extends ComponentProps<'div'> {
  /** Shows a skeleton headline and a spinner in place of the plot. Each part can override it. */
  loading?: boolean;
  /** Compact mode for a chart inside another surface: no title or footer, and a 160px plot instead of 240px. */
  embedded?: boolean;
  /** IANA time zone for axis, tooltip and footer times. Omit it to use the runtime zone. */
  timezone?: string;
  /** BCP 47 language tag for dates and numbers. Omit it to use the runtime locale. */
  locale?: string;
  /** Renders links in the footer and category rows, e.g. `next/link`. Defaults to `'a'`. */
  linkComponent?: LinkComponent;
}

/** Root of a chart. It has no border or padding, so place it in your own card or grid cell. */
export function Chart({
  loading = false,
  embedded = false,
  timezone,
  locale,
  linkComponent,
  className,
  ...props
}: ChartProps) {
  const value = useMemo(
    () => ({ loading, embedded, timezone, locale, linkComponent }),
    [loading, embedded, timezone, locale, linkComponent]
  );

  return (
    <ChartContext value={value}>
      <div
        data-slot="chart-root"
        data-embedded={embedded || undefined}
        className={cn('flex min-w-0 flex-col', embedded ? 'gap-1' : 'gap-2.5', className)}
        {...props}
      />
    </ChartContext>
  );
}

export interface ChartHeaderProps extends Omit<ComponentProps<'div'>, 'title'> {
  title?: ReactNode;
  /** Shown beside the title, for example "All time". */
  meta?: ReactNode;
  /** Headline. A number goes through `formatValue`; anything else renders as is. */
  value?: ReactNode;
  /** The comparison period's value. Drives the change badge and the "… previous period" line. */
  previousValue?: number;
  /** Replaces the "… previous period" line, for example "98.1% previous period". */
  previousLabel?: ReactNode;
  formatValue?: (value: number) => string;
  /** The badge beside the headline. Worked out from `value` and `previousValue` when both are numbers. `false` hides it. */
  change?: PercentChange | false;
  /** Treat a decrease as the improvement when working out the badge color. */
  lowerIsBetter?: boolean;
  loading?: boolean;
}

export function ChartHeader({
  title,
  meta,
  value,
  previousValue,
  previousLabel,
  formatValue: formatValueProp,
  change,
  lowerIsBetter,
  loading: loadingProp,
  className,
  ...props
}: ChartHeaderProps) {
  const context = useChartContext();
  const loading = loadingProp ?? context.loading;
  const { embedded, locale } = context;
  const formatValue = formatValueProp ?? ((v: number) => v.toLocaleString(locale));

  const hasHeadline = value !== undefined && value !== null && value !== '';
  if (embedded && !loading && !hasHeadline) return null;

  const badge =
    change === false
      ? null
      : (change ??
        (typeof value === 'number' && previousValue !== undefined
          ? getPercentChange(value, previousValue, { lowerIsBetter })
          : null));

  const previousLine =
    previousLabel ?? (previousValue !== undefined ? `${formatValue(previousValue)} previous period` : null);

  return (
    <div data-slot="chart-header" className={cn('flex flex-col gap-0.5', className)} {...props}>
      {!embedded && (title || meta) && (
        <div className="flex items-center justify-between gap-2">
          <div className="leading-none font-semibold">{title}</div>
          {meta && <div className="text-muted-foreground text-sm">{meta}</div>}
        </div>
      )}
      {loading ? (
        <div className="bg-muted mt-1 h-8 w-24 animate-pulse rounded-md" />
      ) : (
        hasHeadline && (
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-medium tabular-nums">
                {typeof value === 'number' ? formatValue(value) : value}
              </div>
              {badge && (
                <Badge variant={badge.variant} className="tabular-nums">
                  {badge.label}
                </Badge>
              )}
            </div>
            {!embedded && previousLine && <div className="text-muted-foreground text-sm">{previousLine}</div>}
          </div>
        )
      )}
    </div>
  );
}

export interface ChartContentProps extends ComponentProps<'div'> {
  loading?: boolean;
  /** Replaces the plot with a dashed error box. */
  error?: ReactNode;
  /** Replaces the plot with `emptyMessage`. */
  empty?: boolean;
  emptyMessage?: ReactNode;
}

export function ChartContent({
  loading: loadingProp,
  error,
  empty,
  emptyMessage = 'No data',
  className,
  children,
  ...props
}: ChartContentProps) {
  const context = useChartContext();
  const loading = loadingProp ?? context.loading;
  const height = context.embedded ? 'h-40' : 'h-60';

  let content = children;
  if (error) {
    content = (
      <div
        role="alert"
        className={cn(
          'text-muted-foreground flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-4 text-center text-sm sm:flex-row',
          height
        )}>
        <AlertCircle aria-hidden className="text-foreground size-4 shrink-0" />
        {error}
      </div>
    );
  } else if (loading) {
    content = (
      <div className={cn('flex items-center justify-center', height)}>
        <Loader2 aria-label="Loading" className="text-muted-foreground size-5 animate-spin" />
      </div>
    );
  } else if (empty) {
    content = (
      <div className={cn('text-muted-foreground flex items-center justify-center text-sm', height)}>{emptyMessage}</div>
    );
  }

  return (
    <div data-slot="chart-content" aria-busy={loading || undefined} className={cn('min-w-0', className)} {...props}>
      {content}
    </div>
  );
}

export interface ChartFooterProps extends ComponentProps<'div'> {
  /** Shows a "View more" link. */
  href?: string;
  /** Link text. */
  hrefLabel?: ReactNode;
  /** When the data was last refreshed, shown as "Last updated HH:mm". */
  updatedAt?: ChartDate;
}

export function ChartFooter({ href, hrefLabel = 'View more', updatedAt, className, ...props }: ChartFooterProps) {
  const { embedded, timezone, locale, linkComponent } = useChartContext();
  if (embedded || (!href && updatedAt === undefined)) return null;

  const updated = formatChartTime(updatedAt, { timezone, locale });

  return (
    <div
      data-slot="chart-footer"
      className={cn('flex min-h-5 items-center justify-between gap-4 text-sm', className)}
      {...props}>
      <div className="min-w-0">
        {href && (
          <Link href={href} linkComponent={linkComponent}>
            {hrefLabel}
          </Link>
        )}
      </div>
      {updated && <div className="text-muted-foreground shrink-0">Last updated {updated}</div>}
    </div>
  );
}
