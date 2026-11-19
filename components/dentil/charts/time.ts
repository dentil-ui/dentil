/** Unix timestamps in seconds are what most APIs return; anything above this is treated as milliseconds. */
const MAX_UNIX_SECONDS = 1e11;

/** Unix seconds, unix milliseconds, an ISO string or a `Date`. */
export type ChartDate = number | string | Date;

/** Size of the bucket each point covers. Picks the axis and tooltip date format. */
export type ChartUnit = 'hour' | 'day' | 'week' | 'month';

export type ChartDateFormatOptions = {
  unit?: ChartUnit;
  /** IANA time zone, for example `Europe/London`. Omit it to use the runtime zone. */
  timezone?: string;
  /** BCP 47 language tag. Omit it to use the runtime locale. */
  locale?: string;
};

/** Milliseconds since the epoch, or `null` when the value cannot be parsed. */
export function toChartTime(value: ChartDate | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.getTime();
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null;
    return value < MAX_UNIX_SECONDS ? value * 1000 : value;
  }
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
}

const DATE_FORMATS: Record<ChartUnit, Intl.DateTimeFormatOptions> = {
  hour: { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' },
  day: { day: 'numeric', month: 'short', year: '2-digit' },
  week: { day: 'numeric', month: 'short', year: '2-digit' },
  month: { month: 'short', year: '2-digit' },
};

function dateTimeFormat(options: Intl.DateTimeFormatOptions, timezone?: string, locale?: string) {
  try {
    return new Intl.DateTimeFormat(locale, { ...options, timeZone: timezone });
  } catch {
    // A zone or locale `Intl` rejects falls back to UTC and the runtime locale, so a bad setting does not throw.
    return new Intl.DateTimeFormat(undefined, { ...options, timeZone: timezone ? 'UTC' : undefined });
  }
}

/** Formats a bucket start for the axis and tooltip: `3 Nov 26` for days and weeks, `Nov 26` for months, `14:00` for hours. */
export function formatChartDate(value: ChartDate | null | undefined, options: ChartDateFormatOptions = {}) {
  const time = toChartTime(value);
  if (time === null) return '';
  return dateTimeFormat(DATE_FORMATS[options.unit ?? 'day'], options.timezone, options.locale).format(time);
}

/** Formats the footer's "Last updated" time as 24-hour `HH:mm`. */
export function formatChartTime(
  value: ChartDate | null | undefined,
  options: Omit<ChartDateFormatOptions, 'unit'> = {}
) {
  const time = toChartTime(value);
  if (time === null) return '';
  return dateTimeFormat(DATE_FORMATS.hour, options.timezone, options.locale).format(time);
}

/** Short axis numbers: `950`, `12.3K`, `4.5M`. */
export function formatCompactNumber(value: number, locale?: string) {
  return new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

/**
 * Sets `keys` to `null` on points whose bucket starts after `now`. Recharts joins adjacent numbers, so future buckets
 * an API fills with `0` would read as a real drop. A `null` ends the line at the last bucket that has started.
 */
export function maskFuture<T extends { date: ChartDate }>(
  data: T[],
  keys: readonly string[],
  now: ChartDate = Date.now()
): T[] {
  const cutoff = toChartTime(now) ?? Date.now();
  if (keys.length === 0) return data;

  return data.map((point) => {
    const time = toChartTime(point.date);
    if (time === null || time <= cutoff) return point;

    const masked: Record<string, unknown> = { ...point };
    for (const key of keys) {
      if (key in masked) masked[key] = null;
    }
    return masked as T;
  });
}
