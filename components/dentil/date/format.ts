/** Unix timestamps in seconds are what most APIs return; anything above this is treated as milliseconds. */
const MAX_UNIX_SECONDS = 1e11;

export type DateInput = number | string | Date | null | undefined;

export type DateFormatOptions = {
  /** IANA time zone, for example `Europe/London`. Omit it to use the runtime zone. */
  timezone?: string;
  /** BCP 47 language tag. Omit it to use the runtime locale. */
  locale?: string;
  /** Include the 24-hour time. Defaults to true. */
  showTime?: boolean;
  /** Include the year even when the date is in the current year. */
  showYear?: boolean;
  /** Append the short zone name, such as GMT. */
  showTimezone?: boolean;
};

export type FormattedDate = {
  /** Date text, without the zone name. */
  label: string;
  /** Short zone name when `showTimezone` is set. */
  zone?: string;
  /** Zone the value was formatted in. Invalid names are replaced with `UTC`. */
  timezone?: string;
  iso: string;
};

/**
 * Accepts unix seconds, unix milliseconds, an ISO string or a `Date`.
 * Returns `null` when the value cannot be parsed.
 */
export function toDate(value: DateInput): Date | null {
  if (value === null || value === undefined || value === '') return null;

  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null;
    const date = new Date(value < MAX_UNIX_SECONDS ? value * 1000 : value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** A zone `Intl` rejects is treated as UTC, so a bad setting does not throw. */
function resolvedTimezone(timezone: string | undefined) {
  if (!timezone) return undefined;

  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return timezone;
  } catch {
    return 'UTC';
  }
}

function yearInZone(date: Date, timeZone: string | undefined) {
  return new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric' }).format(date);
}

/** Compact date such as "Nov 7, 09:14", or "Mar 4, 2024, 14:30" outside the current year. */
export function formatDateParts(value: DateInput, options: DateFormatOptions = {}): FormattedDate | null {
  const date = toDate(value);
  if (!date) return null;

  const timezone = resolvedTimezone(options.timezone);
  const showTime = options.showTime ?? true;
  const showYear = options.showYear ?? false;
  const showTimezone = options.showTimezone ?? false;
  const isThisYear = yearInZone(date, timezone) === yearInZone(new Date(), timezone);

  const parts = new Intl.DateTimeFormat(options.locale, {
    timeZone: timezone,
    month: 'short',
    day: 'numeric',
    year: showYear || !isThisYear ? 'numeric' : undefined,
    hour: showTime ? '2-digit' : undefined,
    minute: showTime ? '2-digit' : undefined,
    hourCycle: 'h23',
    timeZoneName: showTimezone ? 'short' : undefined,
  }).formatToParts(date);

  const zone = parts.find((part) => part.type === 'timeZoneName')?.value;
  const label = parts
    .filter((part) => part.type !== 'timeZoneName')
    .map((part) => part.value)
    .join('')
    .trim();

  return { label, zone, timezone, iso: date.toISOString() };
}

/** Full clock time in a zone, such as "07 Nov 2026, 09:14". */
export function formatDateTime(date: Date, timeZone: string, locale?: string) {
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date);
}

/** The compact label. `showTimezone` appends the short zone name, such as GMT. */
export function formatDate(value: DateInput, options: DateFormatOptions = {}) {
  const formatted = formatDateParts(value, options);
  if (!formatted) return null;
  return formatted.zone ? `${formatted.label} ${formatted.zone}` : formatted.label;
}
