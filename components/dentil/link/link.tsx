import { ArrowRight, ChevronRight, ExternalLink } from 'lucide-react';
import type * as React from 'react';

import { cn } from '@/lib/utils';

/** Props passed to a custom `linkComponent`. Compatible with `next/link`, an adapted React Router `Link`, or a plain `<a>`. */
export type LinkComponentProps = Omit<React.ComponentProps<'a'>, 'href'> & { href: string };

export type LinkComponent = React.ElementType<LinkComponentProps>;

export interface LinkProps extends Omit<React.ComponentProps<'a'>, 'href'> {
  href: string;
  /** Show the chevron that turns into an arrow on hover. Ignored when `external` is set. */
  arrow?: boolean;
  /** Open in a new tab with `rel="noopener noreferrer"` and show an external link icon. */
  external?: boolean;
  /** Renders the anchor, e.g. `next/link`. Defaults to `'a'`. */
  linkComponent?: LinkComponent;
  /** Merged onto the label, which truncates when the link is narrower than its text. */
  labelClassName?: string;
}

const icon = 'size-4 transition-[translate,opacity] duration-200 ease-out';

export function Link({
  href,
  arrow = true,
  external = false,
  linkComponent: Anchor = 'a',
  className,
  labelClassName,
  children,
  ...props
}: LinkProps) {
  return (
    <Anchor
      data-slot="link"
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      {...props}
      className={cn(
        'group/link text-primary hover:text-primary/80 focus-visible:ring-ring/50 inline-flex max-w-full items-center gap-1 rounded-sm font-medium transition-colors outline-none focus-visible:ring-[3px]',
        className
      )}>
      <span className={cn('min-w-0 truncate', labelClassName)}>{children}</span>
      {external ? (
        <>
          <ExternalLink aria-hidden className="size-3 shrink-0" />
          <span className="sr-only">(opens in a new tab)</span>
        </>
      ) : arrow ? (
        <span aria-hidden className="relative -ml-0.5 shrink-0 overflow-hidden">
          <ChevronRight
            className={cn(
              icon,
              'group-hover/link:opacity-0 group-focus-visible/link:opacity-0',
              'motion-safe:group-hover/link:translate-x-1 motion-safe:group-focus-visible/link:translate-x-1'
            )}
          />
          <ArrowRight
            className={cn(
              icon,
              'absolute inset-0 opacity-0 group-hover/link:opacity-100 group-focus-visible/link:opacity-100',
              'motion-safe:-translate-x-1 motion-safe:group-hover/link:translate-x-0 motion-safe:group-focus-visible/link:translate-x-0'
            )}
          />
        </span>
      ) : null}
    </Anchor>
  );
}
