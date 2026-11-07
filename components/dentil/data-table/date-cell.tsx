import { cn } from '@/lib/utils';

export type DateCellValue = number | string | Date | null | undefined;

/** Unix timestamps in seconds are what most APIs return; anything above this is treated as milliseconds. */
const MAX_UNIX_SECONDS = 1e11;

export function toDate(value: DateCellValue): Date | null {
  if (value === null || value === undefined || value === '') return null;
  if (value instanceof Date) return value;
  if (typeof value === 'number') return new Date(value < MAX_UNIX_SECONDS ? value * 1000 : value);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(date: Date, { showTime = true, locale }: { showTime?: boolean; locale?: string } = {}) {
  const isThisYear = date.getFullYear() === new Date().getFullYear();
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: isThisYear ? undefined : 'numeric',
    hour: showTime ? '2-digit' : undefined,
    minute: showTime ? '2-digit' : undefined,
    hourCycle: 'h23',
  }).format(date);
}

/**
 * Compact date such as "Mar 4, 14:30" (or "Mar 4, 2024, 14:30" outside the current year).
 * Accepts unix seconds, milliseconds, ISO strings or `Date`.
 */
export function DateCell({
  align = 'left',
  date,
  showTime = true,
  locale,
  fallback = '-',
}: {
  align?: 'left' | 'right';
  date: DateCellValue;
  showTime?: boolean;
  locale?: string;
  fallback?: React.ReactNode;
}) {
  const parsed = toDate(date);
  return (
    <div className={cn(align === 'right' && 'text-right')}>
      {parsed ? (
        <time dateTime={parsed.toISOString()} suppressHydrationWarning>
          {formatDate(parsed, { showTime, locale })}
        </time>
      ) : (
        fallback
      )}
    </div>
  );
}
