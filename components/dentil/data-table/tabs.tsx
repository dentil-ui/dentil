'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

import { PAGE_KEYS, type TableQuery, type TableTab, type TableTabsOptions } from './types';

const ALL_TAB: TableTab = { label: 'All', query: {} };

/**
 * Underlined tabs that each apply a query. Built on plain buttons rather than shadcn `Tabs` so it looks the same
 * whichever shadcn style the host app uses.
 */
export function DataTableTabs({
  tabs,
  query,
  setQuery,
  options,
  onChange,
  className,
}: {
  tabs: TableTab[];
  query: TableQuery;
  setQuery: (query: TableQuery) => void;
  onChange?: (tab: TableTab) => void;
  options?: TableTabsOptions;
  className?: string;
}) {
  const showAll = options?.showAll !== false;
  const combinedTabs = showAll ? (options?.allPosition === 'start' ? [ALL_TAB, ...tabs] : [...tabs, ALL_TAB]) : tabs;
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  // A tab is active when every key in its query matches; otherwise fall back to "All", then the first tab.
  const activeTab =
    combinedTabs.find(
      (tab) =>
        Object.keys(tab.query).length > 0 && Object.entries(tab.query).every(([key, value]) => query[key] === value)
    ) ??
    combinedTabs.find((tab) => Object.keys(tab.query).length === 0) ??
    combinedTabs[0];

  const tabKeys = new Set(combinedTabs.flatMap((tab) => Object.keys(tab.query)));

  const select = (tab: TableTab) => {
    if (tab === activeTab) return;
    // Keep filters and sort, but drop other tabs' keys and reset pagination.
    const preserved: TableQuery = {};
    for (const [key, value] of Object.entries(query)) {
      if (tabKeys.has(key) || PAGE_KEYS.includes(key)) continue;
      preserved[key] = value;
    }
    setQuery({ ...preserved, ...tab.query });
    onChange?.(tab);
  };

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    const last = combinedTabs.length - 1;
    const next =
      event.key === 'ArrowRight'
        ? index === last
          ? 0
          : index + 1
        : event.key === 'ArrowLeft'
          ? index === 0
            ? last
            : index - 1
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    // Stop the table's left/right pagination hotkeys from also firing.
    event.stopPropagation();
    tabRefs.current[next]?.focus();
    select(combinedTabs[next]!);
  };

  return (
    <div role="tablist" className={cn('flex items-center gap-4 overflow-x-auto px-5', className)}>
      {combinedTabs.map((tab, index) => {
        const isActive = tab === activeTab;
        return (
          <button
            key={tab.label}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            data-state={isActive ? 'active' : 'inactive'}
            onClick={() => select(tab)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cn(
              'text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 relative h-9 shrink-0 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px]',
              'after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-transparent after:transition-colors',
              isActive && 'text-foreground after:bg-primary'
            )}>
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
