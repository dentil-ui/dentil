'use client';

import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react';

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import { formatDateParts, formatDateTime, type DateFormatOptions, type DateInput } from './format';

/** Long enough to move from the date onto the popover across the offset gap. */
const HOVER_CLOSE_MS = 150;

export type DateProps = {
  date: DateInput;
  /** IANA time zone, for example `Europe/London`. Omit it to use the runtime zone. */
  timezone?: DateFormatOptions['timezone'];
  /** BCP 47 language tag. Omit it to use the runtime locale. */
  locale?: DateFormatOptions['locale'];
  /** Include the 24-hour time. */
  showTime?: boolean;
  /** Include the year even when the date is in the current year. */
  showYear?: boolean;
  /** Underline the date and open a popover with this zone and the UTC time. */
  showTimezone?: boolean;
  /** Open the popover on hover, and keep it open while the pointer is over the popover. */
  hover?: boolean;
  /** Side of the date the popover opens on. */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Alignment of the popover along that side. */
  align?: 'start' | 'center' | 'end';
  /** Rendered when `date` is empty or invalid. */
  fallback?: ReactNode;
  className?: string;
} & Omit<ComponentProps<'time'>, 'dateTime' | 'children' | 'className'>;

/**
 * Compact date such as "Nov 7, 09:14", formatted in `timezone`.
 * Accepts unix seconds, milliseconds, an ISO string or a `Date`.
 */
export function Date({
  date,
  timezone,
  locale,
  showTime = true,
  showYear = false,
  showTimezone = false,
  hover = false,
  side = 'bottom',
  align = 'start',
  fallback = null,
  className,
  ...props
}: DateProps) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  const formatted = formatDateParts(date, { timezone, locale, showTime, showYear });
  if (!formatted) return fallback;

  if (!showTimezone) {
    return (
      <time
        data-slot="date"
        dateTime={formatted.iso}
        suppressHydrationWarning={!timezone}
        className={cn(className)}
        {...props}>
        {formatted.label}
      </time>
    );
  }

  const instant = new globalThis.Date(formatted.iso);
  const zone = formatted.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;

  function clearClose() {
    window.clearTimeout(closeTimer.current);
  }

  function openPopover() {
    clearClose();
    setOpen(true);
  }

  function closePopover() {
    clearClose();
    closeTimer.current = window.setTimeout(() => setOpen(false), HOVER_CLOSE_MS);
  }

  function handleOpenChange(next: boolean) {
    clearClose();
    setOpen(next);
  }

  const triggerClassName = cn(
    'hover:bg-muted cursor-pointer rounded-sm underline underline-offset-2 transition-colors',
    className
  );
  const time = (
    <time dateTime={formatted.iso} suppressHydrationWarning={!timezone} {...props}>
      {formatted.label}
    </time>
  );
  const details = (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
      <dt className="text-muted-foreground">{zone}</dt>
      <dd className="text-right">{formatDateTime(instant, zone, locale)}</dd>
      <dt className="text-muted-foreground">UTC</dt>
      <dd className="text-right">{formatDateTime(instant, 'UTC', locale)}</dd>
    </dl>
  );

  // A popover moves focus into itself on open in both Radix and Base UI, so hovering would steal focus from
  // whatever the user is typing in. A hover card leaves focus alone.
  if (hover) {
    return (
      <HoverCard open={open} onOpenChange={handleOpenChange}>
        <HoverCardTrigger asChild>
          <button
            type="button"
            data-slot="date"
            className={triggerClassName}
            onMouseEnter={openPopover}
            onMouseLeave={closePopover}>
            {time}
          </button>
        </HoverCardTrigger>
        <HoverCardContent
          align={align}
          className="w-auto p-3"
          side={side}
          sideOffset={8}
          onMouseEnter={openPopover}
          onMouseLeave={closePopover}>
          {details}
        </HoverCardContent>
      </HoverCard>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" data-slot="date" className={triggerClassName}>
          {time}
        </button>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-auto p-3" side={side} sideOffset={8}>
        {details}
      </PopoverContent>
    </Popover>
  );
}
