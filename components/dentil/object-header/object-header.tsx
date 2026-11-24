'use client';

import { Check, Copy, type LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

/*
 * The small row at the top of a record page: the object type with its icon on the left, and the people viewing the
 * record and copy buttons for its URL and ID on the right. Its 20px side padding lines up with the dashboard layout.
 */

export interface ObjectHeaderProps extends Omit<ComponentProps<'div'>, 'title' | 'id' | 'onCopy'> {
  /** The object type, such as "Invoice" or "Customer". */
  title: ReactNode;
  /** Icon shown before the title. */
  icon?: LucideIcon;
  /** The object's ID. Shown as a copy button labelled with the ID itself. */
  id?: string;
  /** Shows a "URL" copy button. Pass a URL to copy, or `true` to copy the page's address at the moment of the click. */
  url?: string | true;
  /** People viewing the record, shown as stacked avatars before the copy buttons. */
  presence?: ObjectHeaderUser[];
  /** Called after a value is written to the clipboard, e.g. to show a toast. */
  onCopy?: (value: string) => void;
}

export function ObjectHeader({
  title,
  icon: Icon,
  id,
  url,
  presence,
  onCopy,
  className,
  children,
  ...props
}: ObjectHeaderProps) {
  return (
    <div
      data-slot="object-header"
      className={cn('flex min-h-8 min-w-0 items-center justify-between gap-3 px-5 pt-3', className)}
      {...props}>
      <div data-slot="object-header-title" className="text-muted-foreground flex min-w-0 items-center gap-1">
        {Icon ? <Icon aria-hidden className="size-3 shrink-0" /> : null}
        <span className="truncate text-xs">{title}</span>
      </div>

      <div data-slot="object-header-actions" className="flex min-w-0 items-center gap-2">
        {presence?.length ? <ObjectHeaderPresence users={presence} /> : null}
        {children}
        {url || id ? (
          <div className="flex min-w-0 items-center gap-1">
            {url ? (
              <ObjectHeaderCopyButton value={url === true ? currentUrl : url} aria-label="Copy URL" onCopy={onCopy}>
                URL
              </ObjectHeaderCopyButton>
            ) : null}
            {id ? (
              <ObjectHeaderCopyButton value={id} aria-label="Copy ID" onCopy={onCopy}>
                {id}
              </ObjectHeaderCopyButton>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

const currentUrl = () => window.location.href;

export interface ObjectHeaderCopyButtonProps extends Omit<ComponentProps<'button'>, 'value' | 'onCopy'> {
  /** Text written to the clipboard, or a function that returns it at the moment of the click. */
  value: string | (() => string);
  /** Called after the value is written to the clipboard. */
  onCopy?: (value: string) => void;
}

/** A dashed chip with a monospace label that copies a value and shows a check for a moment. */
export function ObjectHeaderCopyButton({
  value,
  onCopy,
  className,
  onClick,
  children,
  'aria-label': ariaLabel = 'Copy',
  ...props
}: ObjectHeaderCopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timeout.current), []);

  return (
    <button
      type="button"
      data-slot="object-header-copy-button"
      aria-label={copied ? 'Copied' : ariaLabel}
      className={cn(
        'text-muted-foreground hover:bg-muted focus-visible:ring-ring/50 inline-flex h-5 max-w-60 min-w-0 shrink-0 items-center gap-1 rounded-sm border border-dashed px-1 transition-colors outline-none focus-visible:ring-[3px]',
        className
      )}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        const text = typeof value === 'function' ? value() : value;
        void navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          onCopy?.(text);
          clearTimeout(timeout.current);
          timeout.current = setTimeout(() => setCopied(false), 2000);
        });
      }}
      {...props}>
      <span className="min-w-0 truncate font-mono text-xs">{children}</span>
      <span aria-hidden className="relative size-3 shrink-0">
        <Check
          className={cn(
            'absolute inset-0 size-3 text-green-600 transition-[opacity,scale] duration-150 motion-reduce:transition-none dark:text-green-500',
            copied ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
          )}
        />
        <Copy
          className={cn(
            'absolute inset-0 size-3 transition-[opacity,scale] duration-150 motion-reduce:transition-none',
            copied ? 'scale-50 opacity-0' : 'scale-100 opacity-100'
          )}
        />
      </span>
    </button>
  );
}

export interface ObjectHeaderUser {
  /** Stable key, such as a user or connection ID. Falls back to the name. */
  id?: string;
  name: string;
  /** Image URL. Without one, the avatar shows the name's first letter. */
  avatar?: string;
}

export interface ObjectHeaderPresenceProps extends ComponentProps<'div'> {
  /** People viewing the record. Put the current user first: earlier avatars sit on top of later ones. */
  users: ObjectHeaderUser[];
  /** Avatars shown before the rest collapse into a "+N" count. */
  max?: number;
}

// The opaque background stops the tinted fill of an avatar showing the one beneath it through the overlap.
const avatar =
  'ring-background bg-background relative -ms-1.5 inline-flex shrink-0 rounded-full text-[8px] font-medium uppercase ring-2';
const avatarFill = 'bg-muted-foreground/25 text-foreground flex size-full items-center justify-center rounded-full';

/** Stacked avatars for the people viewing a record. Each new avatar grows in from the left. */
export function ObjectHeaderPresence({ users, max = 5, className, ...props }: ObjectHeaderPresenceProps) {
  const shown = users.slice(0, max);
  const hidden = users.slice(max);
  const names = users.map((user) => user.name).join(', ');

  return (
    <div
      role="group"
      aria-label={`Viewing: ${names}`}
      data-slot="object-header-presence"
      className={cn('flex items-center ps-1.5', className)}
      {...props}>
      {shown.map((user, index) => (
        <span
          key={user.id ?? user.name}
          title={user.name}
          className={cn(avatar, 'animate-in fade-in zoom-in-50 size-5 duration-200 motion-reduce:animate-none')}
          style={{ zIndex: shown.length - index }}>
          {user.avatar ? (
            <img src={user.avatar} alt="" className="size-full rounded-full object-cover" />
          ) : (
            <span aria-hidden className={avatarFill}>
              {user.name.slice(0, 1)}
            </span>
          )}
        </span>
      ))}
      {hidden.length ? (
        <span title={hidden.map((user) => user.name).join(', ')} className={cn(avatar, 'h-5 min-w-5')}>
          <span className={cn(avatarFill, 'px-1')}>+{hidden.length}</span>
        </span>
      ) : null}
    </div>
  );
}
