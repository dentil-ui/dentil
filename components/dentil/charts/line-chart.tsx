'use client';

import { useMemo, type ReactNode } from 'react';
import { CartesianGrid, Line, LineChart as RechartsLineChart, XAxis, YAxis } from 'recharts';

import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart';
import { cn } from '@/lib/utils';

import {
  Chart,
  ChartContent,
  ChartFooter,
  ChartHeader,
  type ChartFooterProps,
  type ChartHeaderProps,
  type ChartProps,
} from './chart';
import { resolveSeriesColors } from './colors';
import { ChartCursor } from './cursor';
import { formatChartDate, formatCompactNumber, maskFuture, toChartTime, type ChartDate, type ChartUnit } from './time';
import { ChartTooltipContent, type ChartSeries } from './tooltip';

/** One bucket: its start `date`, plus a field per series key (and per `dateKey`). `null` leaves a gap. */
export type ChartPoint = { date: ChartDate } & { [key: string]: ChartDate | null | undefined };

const X_KEY = '__x';

type EdgeTickProps = {
  x?: number | string;
  y?: number | string;
  payload?: { value?: unknown };
  tickFormatter?: (value: unknown, index: number) => string;
  index?: number;
};

/** First and last date labels, anchored inward so neither runs off the edge of the plot. */
function EdgeTick({ x, y, payload, tickFormatter, index = 0, last }: EdgeTickProps & { last: boolean }) {
  const label = tickFormatter ? tickFormatter(payload?.value, index) : String(payload?.value ?? '');
  return (
    <text
      x={Number(x)}
      y={Number(y)}
      dy="0.71em"
      textAnchor={last ? 'end' : 'start'}
      className="fill-muted-foreground text-xs">
      {label}
    </text>
  );
}

export interface LineChartProps
  extends
    Pick<ChartProps, 'loading' | 'embedded' | 'timezone' | 'locale' | 'linkComponent' | 'className'>,
    Pick<ChartHeaderProps, 'title' | 'meta' | 'value' | 'previousValue' | 'previousLabel' | 'change' | 'lowerIsBetter'>,
    Pick<ChartFooterProps, 'href' | 'hrefLabel' | 'updatedAt'> {
  data: ReadonlyArray<ChartPoint>;
  series: ReadonlyArray<ChartSeries>;
  /** Bucket size, which picks the date format. */
  unit?: ChartUnit;
  /** Formats the headline, the "previous period" line and tooltip values. */
  formatValue?: (value: number) => string;
  /** Formats axis and tooltip dates. Defaults to `formatChartDate` with `unit`, `timezone` and `locale`. */
  formatDate?: (date: ChartDate) => string;
  /** Formats y-axis ticks. Defaults to compact numbers such as `12.3K`. */
  formatAxisValue?: (value: number) => string;
  /** Show the first and last dates under the plot. */
  showXAxis?: boolean;
  /** Show the zero and maximum values beside the plot. */
  showYAxis?: boolean;
  /** Points after this are cut off on non-comparison series. Defaults to the current time. */
  now?: ChartDate;
  /** Replaces the plot with an error message. */
  error?: ReactNode;
  emptyMessage?: ReactNode;
}

/** A metric over time: headline, change badge, one or more lines with optional previous-period comparisons, and a footer. */
export function LineChart({
  data,
  series,
  unit = 'day',
  formatValue: formatValueProp,
  formatDate: formatDateProp,
  formatAxisValue: formatAxisValueProp,
  showXAxis = true,
  showYAxis = false,
  now,
  error,
  emptyMessage,
  title,
  meta,
  value,
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
}: LineChartProps) {
  const resolved = useMemo(() => resolveSeriesColors(series), [series]);

  const config = useMemo(
    () =>
      Object.fromEntries(resolved.map((item) => [item.key, { label: item.label, color: item.color }])) as ChartConfig,
    [resolved]
  );

  const plotted = useMemo(() => {
    const liveKeys = resolved.filter((item) => !item.comparison).map((item) => item.key);
    return maskFuture([...data], liveKeys, now).map((point): ChartPoint => ({
      ...point,
      [X_KEY]: toChartTime(point.date),
    }));
  }, [data, resolved, now]);

  const maxValue =
    Math.max(
      0,
      ...plotted.flatMap((point) =>
        resolved.map((item) => {
          const v = point[item.key];
          return typeof v === 'number' && Number.isFinite(v) ? v : 0;
        })
      )
    ) || 1;

  const formatValue = formatValueProp ?? ((v: number) => v.toLocaleString(locale));
  const formatDate = formatDateProp ?? ((date: ChartDate) => formatChartDate(date, { unit, timezone, locale }));
  const formatAxisValue = formatAxisValueProp ?? ((v: number) => formatCompactNumber(v, locale));

  const first = plotted[0];
  const last = plotted[plotted.length - 1];
  const ticks = [...new Set([first?.[X_KEY], last?.[X_KEY]])].filter((x): x is number => typeof x === 'number');

  const comparisons = resolved.filter((item) => item.comparison);
  const lines = resolved.filter((item) => !item.comparison);
  const cursorColor = lines[0]?.color ?? 'var(--chart-1)';

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
        value={value}
        previousValue={previousValue}
        previousLabel={previousLabel}
        change={change}
        lowerIsBetter={lowerIsBetter}
        formatValue={formatValue}
      />
      <ChartContent error={error} empty={plotted.length === 0} emptyMessage={emptyMessage}>
        <ChartContainer config={config} className={cn('aspect-auto w-full', embedded ? 'h-40' : 'h-60')}>
          <RechartsLineChart
            accessibilityLayer
            data={plotted}
            margin={{ left: showYAxis ? 0 : 12, right: 12, top: 12 }}>
            <CartesianGrid vertical={false} strokeDasharray="2 2" stroke="var(--border)" />
            <XAxis
              dataKey={X_KEY}
              ticks={ticks}
              interval={0}
              tickLine={false}
              tickMargin={12}
              tick={(props: EdgeTickProps) => (
                <EdgeTick {...props} last={ticks.length > 1 && props.payload?.value === ticks[ticks.length - 1]} />
              )}
              tickFormatter={(x: unknown) => (typeof x === 'number' ? formatDate(x) : '')}
              stroke="var(--border)"
              padding={{ left: 12, right: 12 }}
              hide={!showXAxis}
            />
            <YAxis
              width="auto"
              axisLine={false}
              tickLine={false}
              tickCount={2}
              tickFormatter={formatAxisValue}
              domain={[0, maxValue]}
              interval="preserveStartEnd"
              hide={!showYAxis}
            />
            <ChartTooltip
              cursor={<ChartCursor fill={cursorColor} />}
              content={<ChartTooltipContent series={resolved} formatValue={formatValue} formatDate={formatDate} />}
            />
            {comparisons.map((item) => (
              <Line
                key={item.key}
                type="linear"
                dataKey={item.key}
                stroke={item.color}
                strokeWidth={2}
                dot={false}
                activeDot={false}
                connectNulls={false}
              />
            ))}
            {lines.map((item) => (
              <Line
                key={item.key}
                type="linear"
                dataKey={item.key}
                stroke={item.color}
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                activeDot={{ r: 5, fill: item.color, stroke: 'var(--background)', strokeWidth: 2 }}
              />
            ))}
          </RechartsLineChart>
        </ChartContainer>
      </ChartContent>
      <ChartFooter href={href} hrefLabel={hrefLabel} updatedAt={updatedAt} />
    </Chart>
  );
}
