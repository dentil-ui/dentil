/** Object key, array index, or `undefined` for the root value. */
export type JsonKey = string | number | undefined;

const UNIX_SECONDS_MIN = 946_684_800; // 2000-01-01
const UNIX_SECONDS_MAX = 4_102_444_800; // 2100-01-01

const TIMESTAMP_KEY =
  /^(created|updated|deleted|timestamp|expires|available_on|billing_cycle_anchor|period_start|period_end|current_period_start|current_period_end|cancel_at|due|start|end)$|_(at|date|time|timestamp|until|from|on)$|[a-z](At|Date|Time|Timestamp)$/;
const AMOUNT_KEY =
  /(amount|total|subtotal|balance|price|fee|quantity|count|limit|offset|index|tax|credit|debit|percent)/i;

/** Date and time, such as `2026-11-07T09:14:00Z`. A date alone has no instant to show, so it doesn't match. */
const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

function toInteger(value: string | number) {
  if (typeof value === 'number') return Number.isInteger(value) ? value : undefined;
  return /^-?\d+$/.test(value) ? Number(value) : undefined;
}

/** Unix seconds for an integer, or an integer string, between 2000 and 2100 in seconds or milliseconds. */
export function toUnixSeconds(value: string | number): number | undefined {
  const integer = toInteger(value);
  if (integer === undefined) return undefined;
  if (integer >= UNIX_SECONDS_MIN && integer <= UNIX_SECONDS_MAX) return integer;
  if (integer >= UNIX_SECONDS_MIN * 1000 && integer <= UNIX_SECONDS_MAX * 1000) return Math.floor(integer / 1000);
  return undefined;
}

/** The instant a timestamp value refers to: unix seconds, unix milliseconds or an ISO 8601 date and time. */
export function parseTimestamp(value: string | number): Date | null {
  const seconds = toUnixSeconds(value);
  if (seconds !== undefined) return new Date(seconds * 1000);
  if (typeof value !== 'string' || !ISO_DATE_TIME.test(value)) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * The default test for which values show a date on hover. ISO date-times always match. A unix timestamp matches when
 * its key looks like a date (`created`, `paid_at`, `dueDate`), never when it looks like money or a count (`amount`,
 * `quantity`), and otherwise only as a bare number in seconds.
 */
export function isTimestamp(value: string | number, key: JsonKey): boolean {
  if (typeof value === 'string' && ISO_DATE_TIME.test(value)) return parseTimestamp(value) !== null;
  if (toUnixSeconds(value) === undefined) return false;

  const name = typeof key === 'string' ? key : '';
  if (name && TIMESTAMP_KEY.test(name)) return true;
  if (name && AMOUNT_KEY.test(name)) return false;

  return typeof value === 'number' && value >= UNIX_SECONDS_MIN && value <= UNIX_SECONDS_MAX;
}
