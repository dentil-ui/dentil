'use client';

import { Copy, ExternalLink } from 'lucide-react';
import * as React from 'react';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { cn } from '@/lib/utils';

export interface ItemAction<T> {
  id: string;
  type: 'item';
  label: string;
  onClick: (row: T) => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive';
}

export interface SeparatorAction {
  id: string;
  type: 'separator';
}

export interface LabelAction {
  id: string;
  type: 'label';
  label: string;
}

export interface SubMenuAction<T> {
  id: string;
  type: 'submenu';
  label: string;
  actions: Action<T>[];
  disabled?: boolean;
  icon?: React.ReactNode;
}

export type Action<T> = ItemAction<T> | SeparatorAction | LabelAction | SubMenuAction<T>;

function renderAction<T>(action: Action<T>, row: T): React.ReactNode {
  switch (action.type) {
    case 'item':
      return (
        <ContextMenuItem
          key={action.id}
          variant={action.variant}
          disabled={action.disabled}
          onClick={(e) => {
            e.stopPropagation();
            action.onClick(row);
          }}>
          {action.icon}
          {action.label}
        </ContextMenuItem>
      );
    case 'separator':
      return <ContextMenuSeparator key={action.id} />;
    case 'label':
      // Base UI throws if a menu label isn't inside a group.
      return (
        <ContextMenuGroup key={action.id}>
          <ContextMenuLabel>{action.label}</ContextMenuLabel>
        </ContextMenuGroup>
      );
    case 'submenu':
      return (
        <ContextMenuSub key={action.id}>
          <ContextMenuSubTrigger disabled={action.disabled} className="gap-2">
            {action.icon}
            {action.label}
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            {action.actions.map((subAction) => renderAction(subAction, row))}
          </ContextMenuSubContent>
        </ContextMenuSub>
      );
    default:
      return null;
  }
}

type Props = Record<string, unknown>;

function setRef(ref: unknown, value: unknown) {
  if (typeof ref === 'function') ref(value);
  else if (ref && typeof ref === 'object') (ref as { current: unknown }).current = value;
}

/**
 * Passes the trigger's props and ref on to its one child element, so the child (e.g. a `<tr>`) is the trigger.
 * It exists so the trigger below can use `asChild` with a JSX child: the shadcn CLI only rewrites `asChild` to Base UI's
 * `render` prop when the child is a JSX element, not `{children}`.
 */
function TriggerTarget({ children, ...injected }: Props & { children?: React.ReactNode }) {
  if (!React.isValidElement<Props>(children)) return null;
  const own = children.props;
  const merged: Props = { ...injected };
  for (const [key, value] of Object.entries(own)) {
    const theirs = merged[key];
    if (value === undefined) continue;
    if (key === 'className') merged[key] = cn(theirs as string, value as string);
    else if (key === 'style') merged[key] = { ...(theirs as object), ...(value as object) };
    else if (key === 'ref' && theirs) {
      merged[key] = (node: unknown) => {
        setRef(theirs, node);
        setRef(value, node);
      };
    } else if (/^on[A-Z]/.test(key) && typeof theirs === 'function' && typeof value === 'function') {
      merged[key] = (...args: unknown[]) => {
        value(...args);
        theirs(...args);
      };
    } else merged[key] = value;
  }
  return React.cloneElement(children, merged);
}

/** Right-click menu for a row. Renders `children` untouched when there are no actions. */
export function TableContextMenu<T>({
  children,
  className,
  actions,
  row,
  childAsTrigger,
}: {
  children: React.ReactNode;
  className?: string;
  actions?: Action<T>[];
  row: T;
  /** Use the child element (e.g. a `<tr>`) as the trigger instead of wrapping it, so one menu covers the whole row. */
  childAsTrigger?: boolean;
}) {
  if (!actions || actions.length === 0) {
    return <>{children}</>;
  }

  return (
    <ContextMenu>
      {childAsTrigger ? (
        <ContextMenuTrigger asChild>
          <TriggerTarget>{children}</TriggerTarget>
        </ContextMenuTrigger>
      ) : (
        <ContextMenuTrigger className={className}>{children}</ContextMenuTrigger>
      )}
      <ContextMenuContent className="max-w-56">{actions.map((action) => renderAction(action, row))}</ContextMenuContent>
    </ContextMenu>
  );
}

/** "Copy ID" and "Open in new tab" actions. */
export function createCommonActions<T>(
  // Unused at runtime; lets TypeScript infer `T` from the row at the call site.
  _row: T,
  options: {
    getId?: (row: T) => string;
    /** Called after the ID is copied, e.g. to show a toast. */
    onCopyId?: (id: string) => void;
    /** Overrides the default `window.open(\`${baseUrl}/${id}\`)`. */
    onOpenInNewTab?: (row: T) => void;
    baseUrl?: string;
    showCopyId?: boolean;
    showOpenInNewTab?: boolean;
  } = {}
): Action<T>[] {
  const {
    getId = (r: T) => String((r as { id: string | number }).id),
    onCopyId,
    onOpenInNewTab,
    baseUrl,
    showCopyId = true,
    showOpenInNewTab = true,
  } = options;

  const actions: Action<T>[] = [];

  if (showCopyId) {
    actions.push({
      id: 'copy-id',
      type: 'item',
      label: 'Copy ID',
      icon: <Copy className="size-4" />,
      onClick: (r) => {
        const id = getId(r);
        void navigator.clipboard.writeText(id).then(() => onCopyId?.(id));
      },
    });
  }

  if (showOpenInNewTab && (baseUrl || onOpenInNewTab)) {
    actions.push({
      id: 'new-tab',
      type: 'item',
      label: 'Open in new tab',
      icon: <ExternalLink className="size-4" />,
      onClick: (r) => {
        if (onOpenInNewTab) onOpenInNewTab(r);
        else window.open(`${baseUrl}/${getId(r)}`, '_blank', 'noopener');
      },
    });
  }

  return actions;
}

export function createCustomAction<T>(
  id: string,
  label: string,
  onClick: (row: T) => void,
  icon?: React.ReactNode,
  disabled?: boolean
): Action<T> {
  return { id, type: 'item', label, onClick, icon, disabled };
}

export function createSeparator<T>(id: string): Action<T> {
  return { id, type: 'separator' };
}

export function createLabel<T>(id: string, label: string): Action<T> {
  return { id, type: 'label', label };
}

export function createSubMenu<T>(
  id: string,
  label: string,
  actions: Action<T>[],
  icon?: React.ReactNode,
  disabled?: boolean
): Action<T> {
  return { id, type: 'submenu', label, actions, icon, disabled };
}
