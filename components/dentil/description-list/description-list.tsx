'use client';

import { useEffect, useId, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { Check, ChevronDown, Copy } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Link, type LinkComponent } from '../link/link';

/**
 * `responsive` stacks the term above the detail on small screens and puts them side by side from `sm`.
 * `vertical` always stacks them, for narrow containers such as a sidebar.
 */
export type DescriptionListOrientation = 'responsive' | 'vertical';

export function DescriptionListColumns({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="description-list-columns"
      className={cn('grid grid-cols-1 items-start sm:grid-cols-2 sm:gap-x-6', className)}
      {...props}
    />
  );
}

export type DescriptionListProps = ComponentProps<'dl'> & {
  orientation?: DescriptionListOrientation;
};

export function DescriptionList({ orientation = 'responsive', className, ...props }: DescriptionListProps) {
  return (
    <dl
      data-slot="description-list"
      data-orientation={orientation}
      className={cn(
        'group/description-list grid grid-cols-1 text-sm sm:data-[orientation=responsive]:grid-cols-[min(40%,--spacing(80))_minmax(0,1fr)]',
        className
      )}
      {...props}
    />
  );
}

export function DescriptionTerm({ className, ...props }: ComponentProps<'dt'>) {
  return (
    <dt
      data-slot="description-term"
      className={cn(
        'text-muted-foreground col-start-1 pt-1 pr-2 sm:group-data-[orientation=responsive]/description-list:py-0.5',
        className
      )}
      {...props}
    />
  );
}

export function DescriptionDetails({ className, ...props }: ComponentProps<'dd'>) {
  return (
    <dd
      data-slot="description-details"
      className={cn('min-w-0 pb-1 sm:group-data-[orientation=responsive]/description-list:py-0.5', className)}
      {...props}
    />
  );
}

export type DescriptionCopyButtonProps = Omit<ComponentProps<'button'>, 'value' | 'children'> & {
  /** Text written to the clipboard. */
  value: string;
};

export function DescriptionCopyButton({
  value,
  className,
  onClick,
  'aria-label': ariaLabel = 'Copy',
  ...props
}: DescriptionCopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timeout.current), []);

  return (
    <button
      type="button"
      data-slot="description-copy-button"
      aria-label={copied ? 'Copied' : ariaLabel}
      className={cn(
        'text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 relative inline-flex size-5 shrink-0 items-center justify-center rounded-sm transition-colors outline-none focus-visible:ring-[3px]',
        className
      )}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        // Copy buttons often sit inside a clickable row or link.
        event.preventDefault();
        event.stopPropagation();
        void navigator.clipboard.writeText(value).then(() => {
          setCopied(true);
          clearTimeout(timeout.current);
          timeout.current = setTimeout(() => setCopied(false), 1500);
        });
      }}
      {...props}>
      <Check
        aria-hidden
        className={cn(
          'absolute size-3.5 transition-[opacity,scale] duration-150 motion-reduce:transition-none',
          copied ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        )}
      />
      <Copy
        aria-hidden
        className={cn(
          'absolute size-3.5 transition-[opacity,scale] duration-150 motion-reduce:transition-none',
          copied ? 'scale-50 opacity-0' : 'scale-100 opacity-100'
        )}
      />
    </button>
  );
}

export type DescriptionItem = {
  /** An empty string renders a continuation line, such as the second line of an address. */
  term: ReactNode;
  detail: ReactNode;
  /** Renders the detail as a `Link` from `@dentil/link`. */
  href?: string;
  /** Opens `href` in a new tab with an external-link icon instead of the arrow. */
  external?: boolean;
  /** Text copied by a button beside the detail. It shows on hover, on keyboard focus and on touch screens. */
  copy?: string;
};

/** Falsy entries are skipped, so `condition && { term, detail }` works inline. */
export type DescriptionItems = readonly (DescriptionItem | false | null | undefined | 0 | '')[];

type DescriptionsData =
  { items: DescriptionItems; columns?: never } | { columns: readonly DescriptionItems[]; items?: never };

export type DescriptionsProps = Omit<ComponentProps<'div'>, 'children'> &
  DescriptionsData & {
    orientation?: DescriptionListOrientation;
    /** Items hidden behind a "Show more" toggle below the list, lined up with the first column. */
    more?: DescriptionItems;
    moreLabel?: ReactNode;
    defaultMoreOpen?: boolean;
    /** Component used for item links. Pass `next/link`, React Router's `Link`, etc. Defaults to `<a>`. */
    linkComponent?: LinkComponent;
  };

export function Descriptions({
  items,
  columns,
  orientation = 'responsive',
  more,
  moreLabel = 'Show more',
  defaultMoreOpen = false,
  linkComponent = 'a',
  className,
  ...props
}: DescriptionsProps) {
  const renderList = (list: DescriptionItems, key?: number) => (
    <DescriptionList key={key} orientation={orientation}>
      {list.map((item, index) =>
        item ? <DescriptionRow key={index} item={item} linkComponent={linkComponent} /> : null
      )}
    </DescriptionList>
  );

  const showMore =
    more && more.some(Boolean) ? (
      <ShowMore label={moreLabel} defaultOpen={defaultMoreOpen}>
        {renderList(more)}
      </ShowMore>
    ) : null;

  return (
    <div data-slot="descriptions" className={className} {...props}>
      {columns ? (
        <DescriptionListColumns>
          {columns.map((column, index) => renderList(column, index))}
          {showMore}
        </DescriptionListColumns>
      ) : (
        <>
          {renderList(items ?? [])}
          {showMore}
        </>
      )}
    </div>
  );
}

function DescriptionRow({ item, linkComponent }: { item: DescriptionItem; linkComponent: LinkComponent }) {
  return (
    <>
      <DescriptionTerm>{item.term}</DescriptionTerm>
      <DescriptionDetails className="group/description-details flex items-center gap-2">
        {item.href ? (
          <Link href={item.href} external={item.external} linkComponent={linkComponent} className="min-w-0">
            {item.detail}
          </Link>
        ) : (
          <div className="min-w-0 wrap-break-word">{item.detail}</div>
        )}
        {item.copy ? (
          <DescriptionCopyButton
            value={item.copy}
            aria-label={typeof item.term === 'string' && item.term ? `Copy ${item.term}` : undefined}
            className="opacity-0 transition-[color,opacity] group-hover/description-details:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100"
          />
        ) : null}
      </DescriptionDetails>
    </>
  );
}

function ShowMore({ label, defaultOpen, children }: { label: ReactNode; defaultOpen: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();

  return (
    <div data-slot="descriptions-more" className="col-start-1 flex flex-col">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        className="text-primary hover:text-primary/80 focus-visible:ring-ring/50 mt-2 inline-flex items-center gap-1 self-start rounded-sm text-sm font-medium transition-colors outline-none focus-visible:ring-[3px]">
        {label}
        <ChevronDown
          aria-hidden
          className={cn('size-4 transition-transform duration-200 motion-reduce:transition-none', open && 'rotate-180')}
        />
      </button>
      <div
        id={id}
        inert={!open}
        data-state={open ? 'open' : 'closed'}
        className="grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-200 ease-out data-[state=open]:grid-rows-[1fr] data-[state=open]:opacity-100 motion-reduce:transition-none">
        <div className="min-h-0 overflow-hidden">
          <div className="pt-2">{children}</div>
        </div>
      </div>
    </div>
  );
}
