import { cn } from '@/lib/utils';

import type { ChartDate } from './time';

/** A line on a `LineChart`. */
export interface ChartSeries {
  /** Field on each point that holds this series' value. */
  key: string;
  label: string;
  /** Any CSS color. Defaults to `var(--chart-1)` through `var(--chart-5)` in order, or a muted gray for a comparison. */
  color?: string;
  /** A previous-period line: drawn underneath with no hover dot, never cut off at today, and left out of the axis label. */
  comparison?: boolean;
  /** Field on each point that holds the date this value belongs to. The tooltip shows that date in place of `label`. */
  dateKey?: string;
}

type TooltipEntry = {
  dataKey?: unknown;
  value?: unknown;
  payload?: Record<string, unknown>;
};

export interface ChartTooltipContentProps {
  /** Injected by Recharts. */
  active?: boolean;
  /** Injected by Recharts. */
  payload?: ReadonlyArray<TooltipEntry>;
  /** Rows, in this order. Series without a value at the hovered point are skipped. */
  series: ReadonlyArray<ChartSeries & { color: string }>;
  formatValue?: (value: number) => string;
  formatDate?: (date: ChartDate) => string;
  className?: string;
}

/**
 * Tooltip body for `ChartTooltip`'s `content`. When any series has a `dateKey`, each row is labelled with its own date
 * (this period against the previous one). Otherwise the hovered date is the heading and rows use the series labels.
 */
export function ChartTooltipContent({
  active,
  payload,
  series,
  formatValue = (value) => value.toLocaleString(),
  formatDate = (date) => String(date),
  className,
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload;
  if (!point) return null;

  const rows = series.flatMap((item) => {
    const value = point[item.key];
    return typeof value === 'number' && Number.isFinite(value) ? [{ item, value }] : [];
  });
  if (rows.length === 0) return null;

  const dated = series.some((item) => item.dateKey);
  const pointDate = point.date as ChartDate | undefined;

  const rowLabel = (item: ChartSeries) => {
    if (!dated) return item.label;
    const date = (item.dateKey ? point[item.dateKey] : pointDate) as ChartDate | null | undefined;
    return date === null || date === undefined ? item.label : formatDate(date);
  };

  return (
    <div
      data-slot="chart-tooltip"
      className={cn(
        'bg-popover text-popover-foreground grid min-w-32 gap-1.5 rounded-lg border px-3 py-1.5 text-xs shadow-lg',
        className
      )}>
      {!dated && pointDate !== undefined && <div className="font-medium">{formatDate(pointDate)}</div>}
      {rows.map(({ item, value }) => (
        <div key={item.key} className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <div aria-hidden className="size-2 shrink-0 rounded-xs" style={{ backgroundColor: item.color }} />
            <span className="text-muted-foreground truncate">{rowLabel(item)}</span>
          </div>
          <span className="text-foreground font-mono font-medium tabular-nums">{formatValue(value)}</span>
        </div>
      ))}
    </div>
  );
}
