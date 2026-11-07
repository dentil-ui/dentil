'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { DataTableFilter, parseToFilters, parseToQuery, useDataTableFilters } from './filter';
import type { ColumnConfig, FiltersState } from './filter/core/types';
import { PAGE_KEYS, type TableQuery } from './types';

/**
 * Server-side filter bar. Reads its state from `query` and writes filter values back into it, keeping
 * non-filter keys (tab, sort) and resetting the page (`offset`, `after`, `before`). Pass it as the table's `toolbar`.
 */
export function DataTableFilters<TData>({
  data,
  filterColumns,
  query,
  setQuery,
}: {
  data: TData[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filterColumns: ReadonlyArray<ColumnConfig<TData, any, any, any>>;
  query: TableQuery;
  setQuery: (query: TableQuery) => void;
}) {
  const [filterState, setFilterState] = useState<FiltersState>(() => parseToFilters({ query, filterColumns }));

  // Re-derive the filters when the query changes from outside (tabs, URL state, a reset). Done during render
  // rather than in an effect so the UI never shows a frame of stale filters.
  const [synced, setSynced] = useState({ query, filterColumns });
  if (synced.query !== query || synced.filterColumns !== filterColumns) {
    setSynced({ query, filterColumns });
    setFilterState(parseToFilters({ query, filterColumns }));
  }

  // Keep the latest values in refs so `onFiltersChange` can stay referentially
  // stable. If it changed identity each render, the downstream `actions` (memoised
  // on the change handler) would too, which reset the filter inputs' debounce
  // timers and dropped keystrokes while typing. The refs are written in an effect
  // (after commit) to keep render pure; the handler only reads them from events.
  const filterStateRef = useRef(filterState);
  const queryRef = useRef(query);
  const setQueryRef = useRef(setQuery);
  const filterColumnsRef = useRef(filterColumns);
  useEffect(() => {
    filterStateRef.current = filterState;
    queryRef.current = query;
    setQueryRef.current = setQuery;
    filterColumnsRef.current = filterColumns;
  });

  const handleFiltersChange = useCallback((newFilters: FiltersState | ((prev: FiltersState) => FiltersState)) => {
    const nextFilters = typeof newFilters === 'function' ? newFilters(filterStateRef.current) : newFilters;
    setFilterState(nextFilters);

    const filterIds = new Set(filterColumnsRef.current.map((column) => column.id));
    const preserved = Object.fromEntries(
      Object.entries(queryRef.current).filter(([key]) => !filterIds.has(key) && !PAGE_KEYS.includes(key))
    );
    const newQuery = { ...preserved, ...parseToQuery(nextFilters, filterColumnsRef.current) };

    if (JSON.stringify(newQuery) !== JSON.stringify(queryRef.current)) {
      setQueryRef.current(newQuery);
    }
  }, []);

  const { columns, filters, actions, strategy } = useDataTableFilters({
    strategy: 'server',
    data,
    columnsConfig: filterColumns,
    filters: filterState,
    onFiltersChange: handleFiltersChange,
  });

  return <DataTableFilter filters={filters} columns={columns} actions={actions} strategy={strategy} />;
}
