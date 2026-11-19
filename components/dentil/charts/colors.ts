import type { ChartSeries } from './tooltip';

/** Default color for comparison series: the theme's muted text at reduced strength. */
export const COMPARISON_COLOR = 'color-mix(in oklab, var(--muted-foreground) 45%, transparent)';

/** Theme chart color for position `index`, cycling through `--chart-1` to `--chart-5`. */
export const chartColor = (index: number) => `var(--chart-${(index % 5) + 1})`;

/** Fills in each series' default color. Comparison series get `COMPARISON_COLOR`; the rest cycle the theme colors. */
export function resolveSeriesColors(series: ReadonlyArray<ChartSeries>) {
  let index = 0;
  return series.map((item) => ({
    ...item,
    color: item.color ?? (item.comparison ? COMPARISON_COLOR : chartColor(index++)),
  }));
}
