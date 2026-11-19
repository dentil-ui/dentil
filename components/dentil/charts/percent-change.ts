export type PercentChange = {
  /** Signed percentage, for example `+12.5%`, `-3.0%` or `+140%`. */
  label: string;
  /** Badge color: `green` for an improvement, `yellow` for a decline, `zinc` for no change. */
  variant: 'green' | 'yellow' | 'zinc';
};

export type PercentChangeOptions = {
  /** Treat a decrease as the improvement, for metrics such as churn, refunds or latency. */
  lowerIsBetter?: boolean;
};

/**
 * Change from `previous` to `current` as a badge label and color. A rise from zero reads as `+100%`, since there is no
 * finite percentage to show. Changes of 100% or more drop the decimal.
 */
export function getPercentChange(current: number, previous: number, options: PercentChangeOptions = {}): PercentChange {
  const { lowerIsBetter = false } = options;

  if (current === previous) return { label: '0%', variant: 'zinc' };

  if (previous === 0) {
    const up = current > 0;
    return { label: up ? '+100%' : '-100%', variant: up !== lowerIsBetter ? 'green' : 'yellow' };
  }

  const change = ((current - previous) / Math.abs(previous)) * 100;
  const prefix = change > 0 ? '+' : '';
  const improved = lowerIsBetter ? change < 0 : change > 0;

  return {
    label: `${prefix}${Math.abs(change) >= 100 ? change.toFixed(0) : change.toFixed(1)}%`,
    variant: improved ? 'green' : 'yellow',
  };
}
