'use client';

import type { ComponentProps, ComponentType, ReactNode } from 'react';

import { cn } from '@/lib/utils';

/** Any icon component that accepts `className` and `size`, such as a Lucide icon. */
export type ObjectTimelineIcon = ComponentType<{ className?: string; size?: number }>;

export type ObjectTimelineItem = {
  id: number | string;
  date?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  icon: ObjectTimelineIcon;
  iconClassName?: string;
  /** Turns the title into a button. Most items are a record of something and have none. */
  onClick?: () => void;
};

export type ObjectTimelineProps = Omit<ComponentProps<'ol'>, 'children'> & {
  items: readonly ObjectTimelineItem[];
};

export function ObjectTimeline({ items, className, ...props }: ObjectTimelineProps) {
  return (
    <ol data-slot="object-timeline" className={cn('m-0 flex list-none flex-col p-0', className)} {...props}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <li key={item.id} data-slot="object-timeline-item" className="group relative flex gap-4 pb-6 last:pb-0">
            <span
              aria-hidden
              className="bg-border absolute top-4 bottom-0 left-2 w-px -translate-x-1/2 group-last:hidden"
            />
            <span
              aria-hidden
              className="text-muted-foreground relative z-10 flex size-4 shrink-0 items-center justify-center">
              <Icon size={14} className={item.iconClassName} />
            </span>
            <div className="-mt-0.5 flex min-w-0 flex-1 flex-col gap-1">
              <div className="text-sm">
                {item.onClick ? (
                  <button
                    type="button"
                    onClick={item.onClick}
                    className="focus-visible:ring-ring/50 cursor-pointer rounded-sm text-left underline-offset-4 outline-none hover:underline focus-visible:ring-[3px]">
                    {item.title}
                  </button>
                ) : (
                  item.title
                )}
              </div>
              {item.description ? <div className="text-muted-foreground text-sm">{item.description}</div> : null}
              {item.date ? <div className="text-muted-foreground text-xs">{item.date}</div> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
