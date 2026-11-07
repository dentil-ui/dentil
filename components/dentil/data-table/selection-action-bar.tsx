'use client';

import { Loader2, XIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';

import { useHotkey } from './hooks';

export interface SelectionAction<TData> {
  /** Stable key; defaults to `label`. */
  id?: string;
  label: string;
  /** Receives every selected row (across pages). Return a promise to show a pending state until it settles. */
  onClick: (rows: TData[]) => void | Promise<void>;
  variant?: React.ComponentProps<typeof Button>['variant'];
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean | ((rows: TData[]) => boolean);
  hidden?: boolean | ((rows: TData[]) => boolean);
  /** Clear the selection once `onClick` resolves. Defaults to `false`. */
  clearOnSuccess?: boolean;
}

export interface SelectionActionBarProps<TData> {
  selectedRows: TData[];
  actions: SelectionAction<TData>[];
  onClearSelection: () => void;
  onSelectAll: () => void;
  /**
   * Replace the bar's contents with a custom status view (e.g. progress of a long-running bulk job).
   * Return `null` to show the default bar.
   */
  renderStatus?: (ctx: { selectedRows: TData[]; dismiss: () => void }) => React.ReactNode;
}

function resolve<TData>(value: boolean | ((rows: TData[]) => boolean) | undefined, rows: TData[]) {
  return typeof value === 'function' ? value(rows) : Boolean(value);
}

/** Floating bar shown at the bottom of the viewport while rows are selected. */
export function SelectionActionBar<TData>({
  selectedRows,
  actions,
  onClearSelection,
  onSelectAll,
  renderStatus,
}: SelectionActionBarProps<TData>) {
  const [pending, setPending] = React.useState<string | null>(null);

  useHotkey('a', onSelectAll, pending === null);

  const handleClick = async (action: SelectionAction<TData>, key: string) => {
    const result = action.onClick(selectedRows);
    if (!(result instanceof Promise)) {
      if (action.clearOnSuccess) onClearSelection();
      return;
    }
    setPending(key);
    try {
      await result;
      if (action.clearOnSuccess) onClearSelection();
    } finally {
      setPending(null);
    }
  };

  const status = renderStatus?.({ selectedRows, dismiss: onClearSelection });

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
      <div
        role="toolbar"
        aria-label="Selection actions"
        className="bg-background/95 supports-backdrop-filter:bg-background/60 pointer-events-auto rounded-full border shadow-2xl backdrop-blur">
        {status ? (
          <div className="flex items-center gap-3 px-4 py-3">
            {status}
            <Button
              variant="ghost"
              size="sm"
              className="ml-1 size-7 rounded-full p-0"
              onClick={onClearSelection}
              aria-label="Dismiss">
              <XIcon className="size-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-4 px-4 py-3">
            <div className="text-sm font-medium tabular-nums">{selectedRows.length} selected</div>

            <button type="button" className="hover:text-primary text-sm font-medium" onClick={onClearSelection}>
              Deselect
            </button>

            <button
              type="button"
              className="hover:text-primary flex items-center gap-1.5 text-sm font-medium"
              onClick={onSelectAll}>
              Select all
              <kbd className="bg-muted text-muted-foreground rounded border px-1 font-mono text-[10px] leading-4">
                A
              </kbd>
            </button>

            {actions.map((action) => {
              if (resolve(action.hidden, selectedRows)) return null;
              const key = action.id ?? action.label;
              const Icon = action.icon;
              const isPending = pending === key;
              return (
                <Button
                  key={key}
                  variant={action.variant ?? 'default'}
                  size="sm"
                  className="rounded-full"
                  disabled={pending !== null || resolve(action.disabled, selectedRows)}
                  onClick={() => handleClick(action, key)}>
                  {isPending ? <Loader2 className="size-4 animate-spin" /> : Icon && <Icon className="size-4" />}
                  {action.label}
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
