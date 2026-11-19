'use client';

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

import {
  Chart,
  ChartContent,
  ChartFooter,
  ChartHeader,
  useChartContext,
  type ChartFooterProps,
  type ChartHeaderProps,
  type ChartProps,
} from './chart';
import { chartColor } from './colors';

export interface CategoryBarItem {
  id: string | number;
  title: ReactNode;
  /** Second line under the title, for example "12% of total". */
  subtitle?: ReactNode;
  value: number;
  /** Makes the row a link, rendered with the chart's `linkComponent`. */
  href?: string;
  /** Any CSS color. Defaults to `var(--chart-1)` through `var(--chart-5)` in order. */
  color?: string;
}

export interface CategoryBarChartProps
  extends
    Pick<ChartProps, 'loading' | 'embedded' | 'timezone' | 'locale' | 'linkComponent' | 'className'>,
    Pick<ChartHeaderProps, 'title' | 'meta' | 'previousValue' | 'previousLabel' | 'change' | 'lowerIsBetter'>,
    Pick<ChartFooterProps, 'href' | 'hrefLabel' | 'updatedAt'> {
  items: ReadonlyArray<CategoryBarItem>;
  /** Headline. Defaults to the sum of `items`. */
  value?: ReactNode;
  /** Formats each row's value. */
  formatValue?: (value: number) => string;
  /** Formats the headline. Defaults to `formatValue`. */
  formatHeadlineValue?: (value: number) => string;
  error?: ReactNode;
  emptyMessage?: ReactNode;
}

/** A total split into categories: one stacked bar showing each share, and a row per category with its value. */
export function CategoryBarChart({
  items,
  value,
  formatValue: formatValueProp,
  formatHeadlineValue,
  error,
  emptyMessage,
  title,
  meta,
  previousValue,
  previousLabel,
  change,
  lowerIsBetter,
  href,
  hrefLabel,
  updatedAt,
  loading,
  embedded,
  timezone,
  locale,
  linkComponent,
  className,
}: CategoryBarChartProps) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const formatValue = formatValueProp ?? ((v: number) => v.toLocaleString(locale));

  return (
    <Chart
      loading={loading}
      embedded={embedded}
      timezone={timezone}
      locale={locale}
      linkComponent={linkComponent}
      className={className}>
      <ChartHeader
        title={title}
        meta={meta}
        value={value ?? total}
        previousValue={previousValue}
        previousLabel={previousLabel}
        change={change}
        lowerIsBetter={lowerIsBetter}
        formatValue={formatHeadlineValue ?? formatValue}
      />
      <ChartContent
        error={error}
        empty={items.length === 0}
        emptyMessage={emptyMessage}
        className="flex flex-col gap-4">
        <div aria-hidden className="bg-muted flex h-4 overflow-hidden rounded-md">
          {total > 0 &&
            items.map((item, index) => (
              <div
                key={item.id}
                className="h-full"
                style={{ width: `${(item.value / total) * 100}%`, backgroundColor: item.color ?? chartColor(index) }}
              />
            ))}
        </div>
        <ul className="flex flex-col gap-2">
          {items.map((item, index) => (
            <CategoryRow key={item.id} item={item} color={item.color ?? chartColor(index)} formatValue={formatValue} />
          ))}
        </ul>
      </ChartContent>
      <ChartFooter href={href} hrefLabel={hrefLabel} updatedAt={updatedAt} />
    </Chart>
  );
}

function CategoryRow({
  item,
  color,
  formatValue,
}: {
  item: CategoryBarItem;
  color: string;
  formatValue: (value: number) => string;
}) {
  const { linkComponent: Anchor = 'a' } = useChartContext();
  const className = 'flex items-center justify-between gap-3 border-b pb-2';

  const content = (
    <>
      <div className="flex min-w-0 items-center gap-3">
        <div aria-hidden className="size-3 shrink-0 rounded-xs" style={{ backgroundColor: color }} />
        <div className="flex min-w-0 flex-col">
          <div className="truncate text-sm leading-tight">{item.title}</div>
          {item.subtitle && <div className="text-muted-foreground truncate text-xs leading-tight">{item.subtitle}</div>}
        </div>
      </div>
      <div className="shrink-0 text-sm leading-tight tabular-nums">{formatValue(item.value)}</div>
    </>
  );

  return (
    <li data-slot="chart-category">
      {item.href ? (
        <Anchor
          href={item.href}
          className={cn(
            className,
            'hover:bg-muted/50 focus-visible:ring-ring/50 rounded-xs transition-colors outline-none focus-visible:ring-[3px]'
          )}>
          {content}
        </Anchor>
      ) : (
        <div className={className}>{content}</div>
      )}
    </li>
  );
}
