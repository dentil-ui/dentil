'use client';

import { ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState, type ComponentProps, type ElementType, type ReactNode } from 'react';

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';

import { formatDateParts, formatDateTime } from '../date/format';
import { isTimestamp, parseTimestamp, type JsonKey } from './timestamps';

/** Long enough to move from the value onto the hover card across the offset gap. */
const HOVER_CLOSE_MS = 150;

/** Props passed to a custom `linkComponent`. Compatible with `next/link`, an adapted React Router `Link`, or a plain `<a>`. */
export type JsonViewerLinkProps = { href: string; className?: string; children?: ReactNode };

export type JsonViewerLinkComponent = ElementType<JsonViewerLinkProps>;

export type JsonViewerProps = Omit<ComponentProps<'div'>, 'children'> & {
  /** Any JSON-serializable value. `undefined` and functions are skipped, and a `Date` renders as its ISO string. */
  data: unknown;
  /** Objects and arrays nested shallower than this start expanded. `0` starts with everything collapsed. */
  defaultExpandDepth?: number;
  /** Return a URL to render a string value as a link, such as an object ID. */
  getHref?: (value: string, key: JsonKey) => string | undefined;
  /** Renders links from `getHref`, e.g. `next/link`. Defaults to `'a'`. */
  linkComponent?: JsonViewerLinkComponent;
  /** Underline timestamps and show the date on hover. Pass a function to choose which values count. */
  timestamps?: boolean | ((value: string | number, key: JsonKey) => boolean);
  /** IANA time zone the hover card shows beside UTC. Omit it to use the runtime zone. */
  timezone?: string;
  /** BCP 47 language tag for the hover card. Omit it to use the runtime locale. */
  locale?: string;
};

type NodeOptions = {
  defaultExpandDepth: number;
  getHref?: JsonViewerProps['getHref'];
  linkComponent: JsonViewerLinkComponent;
  isTimestamp?: (value: string | number, key: JsonKey) => boolean;
  timezone?: string;
  locale?: string;
};

export function JsonViewer({
  data,
  defaultExpandDepth = Infinity,
  getHref,
  linkComponent = 'a',
  timestamps = true,
  timezone,
  locale,
  className,
  ...props
}: JsonViewerProps) {
  const options: NodeOptions = {
    defaultExpandDepth,
    getHref,
    linkComponent,
    isTimestamp: timestamps === true ? isTimestamp : timestamps || undefined,
    timezone,
    locale,
  };

  return (
    <div
      data-slot="json-viewer"
      className={cn('text-foreground font-mono text-xs leading-5 wrap-anywhere', className)}
      {...props}>
      <JsonNode value={data} depth={0} last options={options} />
    </div>
  );
}

function entriesOf(value: unknown): [string | number, unknown][] | null {
  if (Array.isArray(value)) return value.map((item, index) => [index, item]);
  if (value === null || typeof value !== 'object' || value instanceof Date) return null;
  return Object.entries(value).filter(([, item]) => !isSkipped(item));
}

function isSkipped(value: unknown) {
  return value === undefined || typeof value === 'function' || typeof value === 'symbol';
}

function Punctuation({ children }: { children: ReactNode }) {
  return <span className="text-muted-foreground/70">{children}</span>;
}

function Label({ name }: { name: JsonKey }) {
  if (typeof name !== 'string') return null;
  return (
    <>
      <span data-slot="json-viewer-key" className="text-muted-foreground">
        {JSON.stringify(name)}
      </span>
      <Punctuation>: </Punctuation>
    </>
  );
}

function Gutter() {
  return <span aria-hidden className="w-4 shrink-0" />;
}

function JsonNode({
  name,
  value,
  depth,
  last,
  options,
}: {
  name?: JsonKey;
  value: unknown;
  depth: number;
  last: boolean;
  options: NodeOptions;
}) {
  const [open, setOpen] = useState(depth < options.defaultExpandDepth);
  const entries = entriesOf(value);
  const comma = last ? null : <Punctuation>,</Punctuation>;

  if (!entries) {
    return (
      <div data-slot="json-viewer-row" className="flex">
        <Gutter />
        <span className="min-w-0">
          <Label name={name} />
          <Value name={name} value={isSkipped(value) ? null : value} options={options} />
          {comma}
        </span>
      </div>
    );
  }

  const [openBrace, closeBrace] = Array.isArray(value) ? ['[', ']'] : ['{', '}'];

  if (entries.length === 0) {
    return (
      <div data-slot="json-viewer-row" className="flex">
        <Gutter />
        <span className="min-w-0">
          <Label name={name} />
          <Punctuation>
            {openBrace}
            {closeBrace}
          </Punctuation>
          {comma}
        </span>
      </div>
    );
  }

  const count = Array.isArray(value)
    ? `${entries.length} ${entries.length === 1 ? 'item' : 'items'}`
    : `${entries.length} ${entries.length === 1 ? 'key' : 'keys'}`;

  return (
    <div data-slot="json-viewer-node">
      <button
        type="button"
        data-slot="json-viewer-row"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="hover:bg-muted/60 focus-visible:ring-ring/50 flex w-full cursor-pointer rounded-sm text-left transition-colors outline-none focus-visible:ring-[3px]">
        <span aria-hidden className="text-muted-foreground flex h-[1lh] w-4 shrink-0 items-center justify-center">
          <ChevronRight
            className={cn(
              'size-3.5 transition-transform duration-150 ease-out motion-reduce:transition-none',
              open && 'rotate-90'
            )}
          />
        </span>
        <span className="min-w-0">
          <Label name={name} />
          <Punctuation>{openBrace}</Punctuation>
          {open ? null : (
            <>
              <span className="text-muted-foreground"> {count} </span>
              <Punctuation>{closeBrace}</Punctuation>
              {comma}
            </>
          )}
        </span>
      </button>
      {open ? (
        <>
          <div className="ml-2 border-l pl-2">
            {entries.map(([key, item], index) => (
              <JsonNode
                key={key}
                name={key}
                value={item}
                depth={depth + 1}
                last={index === entries.length - 1}
                options={options}
              />
            ))}
          </div>
          <div className="flex">
            <Gutter />
            <span>
              <Punctuation>{closeBrace}</Punctuation>
              {comma}
            </span>
          </div>
        </>
      ) : null}
    </div>
  );
}

function Value({ name, value, options }: { name: JsonKey; value: unknown; options: NodeOptions }) {
  if (value === null) return <span className="text-muted-foreground">null</span>;
  if (value instanceof Date) return <Value name={name} value={value.toISOString()} options={options} />;

  if (typeof value === 'string') {
    const text = JSON.stringify(value).slice(1, -1);
    const href = options.getHref?.(value, name);
    const date = options.isTimestamp?.(value, name) ? parseTimestamp(value) : null;
    const Anchor = options.linkComponent;

    return (
      <>
        <Punctuation>&quot;</Punctuation>
        {href ? (
          <Anchor
            href={href}
            className="text-primary decoration-primary/40 hover:decoration-primary underline underline-offset-2 transition-colors">
            {text}
          </Anchor>
        ) : date ? (
          <Timestamp date={date} options={options}>
            {text}
          </Timestamp>
        ) : (
          text
        )}
        <Punctuation>&quot;</Punctuation>
      </>
    );
  }

  if (typeof value === 'number') {
    const date = options.isTimestamp?.(value, name) ? parseTimestamp(value) : null;
    return date ? (
      <Timestamp date={date} options={options}>
        {String(value)}
      </Timestamp>
    ) : (
      String(value)
    );
  }

  return String(value);
}

function Timestamp({ date, options, children }: { date: Date; options: NodeOptions; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  const zone =
    formatDateParts(date, { timezone: options.timezone })?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;

  function openCard() {
    window.clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function closeCard() {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), HOVER_CLOSE_MS);
  }

  function handleOpenChange(next: boolean) {
    window.clearTimeout(closeTimer.current);
    setOpen(next);
  }

  return (
    <HoverCard open={open} onOpenChange={handleOpenChange}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          data-slot="json-viewer-timestamp"
          className="hover:bg-muted cursor-default rounded-sm underline decoration-dotted underline-offset-2 transition-colors"
          onMouseEnter={openCard}
          onMouseLeave={closeCard}>
          {children}
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        align="start"
        side="top"
        sideOffset={8}
        className="w-auto p-3 font-sans"
        onMouseEnter={openCard}
        onMouseLeave={closeCard}>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
          <dt className="text-muted-foreground">{zone}</dt>
          <dd className="text-right">{formatDateTime(date, zone, options.locale)}</dd>
          <dt className="text-muted-foreground">UTC</dt>
          <dd className="text-right">{formatDateTime(date, 'UTC', options.locale)}</dd>
        </dl>
      </HoverCardContent>
    </HoverCard>
  );
}
