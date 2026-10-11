'use client';

import {
  type ColumnDef,
  type ExpandedState,
  type RowSelectionState,
  type TableMeta,
  type Updater,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowDown, ArrowRight, ArrowUp, ChevronDown, Loader2 } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

import { type Action, TableContextMenu } from './context-menu';
import { DataTableDisplay } from './display';
import { TableError, TableErrorBoundary } from './error';
import { useHotkey, useMediaQuery } from './hooks';
import { Table, TableBody, TableCell, TableCellContent, TableHead, TableHeader, TableRow } from './primitives';
import { useDataTableRouter } from './router';
import { type SelectionAction, SelectionActionBar } from './selection-action-bar';
import { DataTableTabs } from './tabs';
import {
  type DataTableLinkComponent,
  type TableQuery,
  type TableTab,
  type TableTabsOptions,
  defaultGetRowId,
  withoutPage,
} from './types';

// Callers commonly pass `data={list?.data || []}`, which creates a fresh `[]` every render while loading and
// resets the TanStack table. Normalising empty data to one constant keeps the reference stable.
const EMPTY_DATA: ReadonlyArray<unknown> = [];
const EMPTY_SELECTED_ROWS: ReadonlyArray<unknown> = [];
const EMPTY_SELECTION_ACTIONS: ReadonlyArray<unknown> = [];
const PREFETCH_DELAY_MS = 100;

export interface DataTableProps<TData> {
  // `any` is TanStack's recommended type for arrays mixing column value types (e.g. from `createColumnHelper`).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TData, any>[];
  data: TData[];
  loading?: boolean;
  /**
   * The current rows are stale while a new query loads (SWR's `isValidating`, React Query's `isFetching`). Fades the
   * rows instead of swapping them for the spinner.
   */
  fetching?: boolean;
  /** Enables the "Next" button. */
  hasMore?: boolean;
  /**
   * Cursor pagination. "Next" writes this into `query.after`; `null` disables it. Setting either cursor switches the
   * table from `offset` to cursors, and `hasMore` is ignored.
   */
  nextCursor?: string | null;
  /** Cursor pagination. "Previous" writes this into `query.before`; `null` disables it. */
  previousCursor?: string | null;
  /** Controlled query (filters, tab, sort, and the `offset` page index or `after` / `before` cursor). */
  query: TableQuery;
  setQuery: (query: TableQuery) => void;
  /** Row identity used for selection and split view. Defaults to `row.id`. */
  getRowId?: (row: TData) => string;

  /** Left side of the toolbar, typically `<DataTableFilters />`. */
  toolbar?: React.ReactNode;
  /** Right side of the toolbar, e.g. an export button. */
  toolbarActions?: React.ReactNode;
  /** Show the column visibility dropdown. */
  showDisplay?: boolean;

  tabs?: TableTab[];
  tabsOptions?: TableTabsOptions;
  onTabChange?: (tab: TableTab) => void;

  showPagination?: boolean;
  /** Render a "Show more" link to this URL in the footer (ignored when `showPagination`). */
  showMore?: string | null;

  /** Make each row a link. Cells in `select`/`actions` columns, or with `meta.disableRowLink`, are excluded. */
  url?: (row: TData) => string | undefined;
  onRowClick?: (row: TData) => void;
  /** Component used for row links and "Show more". Overrides `DataTableRouter`. Defaults to `<a>`. */
  linkComponent?: DataTableLinkComponent;
  /** Programmatic navigation, used on mobile when split view is enabled. Overrides `DataTableRouter`. */
  onNavigate?: (url: string) => void;
  /** Called (debounced, once per URL) when a linked row is hovered. Overrides `DataTableRouter`. */
  onPrefetch?: (url: string) => void;

  customRowClassName?: (row: TData) => string | undefined;
  noResultsText?: string;
  /** Replaces the "no results" message. */
  emptyState?: React.ReactNode;
  /** Replaces the loading spinner. */
  loadingState?: React.ReactNode;

  /** Map column id → API sort field for server-side sortable columns, e.g. `{ created: 'createdAt' }`. */
  sortableColumns?: Record<string, string>;

  contextMenuActions?: Action<TData>[] | ((row: TData) => Action<TData>[]);

  /** Render a detail panel beside the table. Up/down arrow keys move between rows. */
  splitView?: {
    component: (row: TData | null) => React.ReactNode;
  };

  /** Adds a chevron column at the end; each chevron toggles a full-width panel under its row. Several can be open. */
  expandable?: {
    component: (row: TData) => React.ReactNode;
    /** Return `false` to hide a row's chevron. */
    canExpand?: (row: TData) => boolean;
    /**
     * `'row'` makes a click anywhere on an expandable row toggle it, so `url` doesn't link those rows. The chevron stays
     * as the keyboard control. Defaults to `'chevron'`.
     */
    trigger?: 'chevron' | 'row';
  };

  enableSelection?: boolean;
  /** Selected rows; persists across pages. */
  selectedRows?: TData[];
  onSelectionChange?: (selectedRows: TData[]) => void;
  /** Return `false` to make a row unselectable. */
  selectedRowFilter?: (row: TData) => boolean;
  selectionActions?: SelectionAction<TData>[];
  renderSelectionStatus?: React.ComponentProps<typeof SelectionActionBar<TData>>['renderStatus'];

  /** Passed through to TanStack's `table.options.meta`, available to cells via `table.options.meta`. */
  meta?: TableMeta<TData>;
  className?: string;
}

function DataTableInner<TData>({
  columns,
  data: dataProp,
  loading,
  fetching = false,
  hasMore,
  nextCursor,
  previousCursor,
  query,
  setQuery,
  getRowId = defaultGetRowId,
  toolbar,
  toolbarActions,
  showDisplay = false,
  tabs,
  tabsOptions,
  onTabChange,
  showPagination = false,
  showMore = null,
  url,
  onRowClick,
  linkComponent,
  onNavigate,
  onPrefetch,
  customRowClassName,
  noResultsText = 'No results',
  emptyState,
  loadingState,
  sortableColumns,
  contextMenuActions,
  splitView,
  expandable,
  enableSelection = false,
  selectedRows = EMPTY_SELECTED_ROWS as TData[],
  onSelectionChange,
  selectedRowFilter,
  selectionActions = EMPTY_SELECTION_ACTIONS as SelectionAction<TData>[],
  renderSelectionStatus,
  meta,
  className,
}: DataTableProps<TData>) {
  const routing = useDataTableRouter();
  const Link = linkComponent ?? routing.linkComponent ?? 'a';
  const navigate = onNavigate ?? routing.onNavigate ?? ((href: string) => window.location.assign(href));
  const prefetch = onPrefetch ?? routing.onPrefetch;

  const data = dataProp.length === 0 ? (EMPTY_DATA as TData[]) : dataProp;
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [expanded, setExpanded] = React.useState<ExpandedState>({});
  const [splitViewRow, setSplitViewRow] = React.useState<TData | null>(null);
  const splitViewRowId = splitViewRow ? getRowId(splitViewRow) : null;

  // --- Prefetch on hover ---------------------------------------------------
  const prefetchedUrls = React.useRef(new Set<string>());
  const prefetchTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelPrefetch = React.useCallback(() => {
    if (prefetchTimer.current) {
      clearTimeout(prefetchTimer.current);
      prefetchTimer.current = null;
    }
  }, []);

  const debouncedPrefetch = React.useCallback(
    (rowUrl: string) => {
      if (!prefetch) return;
      cancelPrefetch();
      prefetchTimer.current = setTimeout(() => {
        if (prefetchedUrls.current.has(rowUrl)) return;
        prefetchedUrls.current.add(rowUrl);
        prefetch(rowUrl);
      }, PREFETCH_DELAY_MS);
    },
    [prefetch, cancelPrefetch]
  );

  React.useEffect(() => cancelPrefetch, [cancelPrefetch]);

  // --- Selection -----------------------------------------------------------
  const selectedIds = React.useMemo(() => new Set(selectedRows.map(getRowId)), [selectedRows, getRowId]);
  const rowSelection = React.useMemo<RowSelectionState>(
    () => Object.fromEntries(Array.from(selectedIds, (id) => [id, true])),
    [selectedIds]
  );
  const isSelectable = React.useCallback(
    (row: TData) => !selectedRowFilter || selectedRowFilter(row),
    [selectedRowFilter]
  );

  const handleRowSelectionChange = React.useCallback(
    (updater: Updater<RowSelectionState>) => {
      if (!onSelectionChange) return;
      const next = typeof updater === 'function' ? updater(rowSelection) : updater;
      const pageIds = new Set(data.map(getRowId));
      // Rows selected on other pages stay selected; this page's selection is replaced.
      const otherPages = selectedRows.filter((row) => !pageIds.has(getRowId(row)));
      const thisPage = data.filter((row) => next[getRowId(row)]);
      onSelectionChange([...thisPage, ...otherPages]);
    },
    [onSelectionChange, rowSelection, data, getRowId, selectedRows]
  );

  const selectAllRows = React.useCallback(() => {
    const additions = data.filter((row) => isSelectable(row) && !selectedIds.has(getRowId(row)));
    onSelectionChange?.([...selectedRows, ...additions]);
  }, [data, isSelectable, selectedIds, getRowId, onSelectionChange, selectedRows]);

  const hasExpandable = Boolean(expandable);
  const panelIdPrefix = React.useId();

  const selectionColumn = React.useMemo<ColumnDef<TData> | null>(() => {
    if (!enableSelection) return null;

    const selectableRows = data.filter(isSelectable);
    const allSelected = selectableRows.length > 0 && selectableRows.every((row) => selectedIds.has(getRowId(row)));

    return {
      id: 'select',
      header: () => (
        <Checkbox
          checked={allSelected}
          disabled={selectableRows.length === 0}
          onCheckedChange={(value) => {
            if (value) {
              selectAllRows();
            } else {
              const pageIds = new Set(selectableRows.map(getRowId));
              onSelectionChange?.(selectedRows.filter((row) => !pageIds.has(getRowId(row))));
            }
          }}
          onClick={(e) => e.stopPropagation()}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => {
        const id = getRowId(row.original);
        return (
          <Checkbox
            checked={selectedIds.has(id)}
            disabled={!isSelectable(row.original)}
            onCheckedChange={(value) => {
              onSelectionChange?.(
                value ? [...selectedRows, row.original] : selectedRows.filter((r) => getRowId(r) !== id)
              );
            }}
            onClick={(e) => e.stopPropagation()}
            aria-label="Select row"
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
      meta: { minimize: true, itemAlign: 'center' },
    };
  }, [enableSelection, data, isSelectable, selectedIds, getRowId, selectAllRows, onSelectionChange, selectedRows]);

  const expandColumn = React.useMemo<ColumnDef<TData> | null>(() => {
    if (!hasExpandable) return null;

    return {
      id: 'expand',
      header: () => null,
      cell: ({ row }) => {
        if (!row.getCanExpand()) return null;
        const isExpanded = row.getIsExpanded();
        return (
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground -my-1 size-8 md:size-6"
            aria-expanded={isExpanded}
            aria-controls={`${panelIdPrefix}-${row.id}`}
            aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
            onClick={(e) => {
              e.stopPropagation();
              row.toggleExpanded();
            }}>
            <ChevronDown
              className={cn(
                'size-4 transition-transform duration-150 motion-reduce:transition-none',
                isExpanded && 'rotate-180'
              )}
            />
          </Button>
        );
      },
      enableSorting: false,
      enableHiding: false,
      meta: { align: 'right', minimize: true, itemAlign: 'center' },
    };
  }, [hasExpandable, panelIdPrefix]);

  const tableColumns = React.useMemo(() => {
    if (!selectionColumn && !expandColumn) return columns;
    return [selectionColumn, ...columns, expandColumn].filter((column) => column !== null);
  }, [selectionColumn, expandColumn, columns]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => getRowId(row),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: handleRowSelectionChange,
    onExpandedChange: setExpanded,
    state: { columnVisibility, rowSelection, expanded },
    enableRowSelection: enableSelection ? (row) => isSelectable(row.original) : false,
    getRowCanExpand: (row) => (expandable ? (expandable.canExpand?.(row.original) ?? true) : false),
    meta,
  });

  // --- Pagination & sorting ------------------------------------------------
  const offset = Number(query.offset || 0);
  // Cursors are usually `undefined` while a page loads, so a cursor already in the query keeps cursor mode on.
  const usesCursors =
    nextCursor !== undefined || previousCursor !== undefined || query.after !== undefined || query.before !== undefined;
  const isFirstPage = usesCursors ? query.after === undefined && query.before === undefined : offset === 0;
  const canGoNext = usesCursors ? Boolean(nextCursor) : Boolean(hasMore);
  const canGoPrevious = usesCursors ? Boolean(previousCursor) : offset > 0;

  const goToNextPage = () => {
    if (!usesCursors) return setQuery({ ...query, offset: offset + 1 });
    if (nextCursor) setQuery({ ...withoutPage(query), after: nextCursor });
  };
  const goToPreviousPage = () => {
    if (!usesCursors) return setQuery({ ...query, offset: Math.max(offset - 1, 0) });
    if (previousCursor) setQuery({ ...withoutPage(query), before: previousCursor });
  };

  const sortField = (query.sort_field as string | undefined) ?? '';
  const sortDirection = (query.sort as string | undefined) || 'descending';

  const handleSort = (columnId: string) => {
    const field = sortableColumns?.[columnId];
    if (!field) return;
    const nextSort = sortField === field && sortDirection === 'descending' ? 'ascending' : 'descending';
    setQuery({ ...withoutPage(query), sort: nextSort, sort_field: field });
  };

  // --- Split view ----------------------------------------------------------
  const hasSplitView = Boolean(splitView);

  React.useEffect(() => {
    if (!hasSplitView) return;
    // Keep the selected row (with fresh data) if it's still on the page, otherwise fall back to the first row.
    setSplitViewRow((current) => {
      const currentId = current ? getRowId(current) : null;
      return data.find((row) => getRowId(row) === currentId) ?? data[0] ?? null;
    });
  }, [hasSplitView, data, getRowId]);

  const moveSplitView = (delta: 1 | -1) => {
    if (data.length === 0) return;
    const index = data.findIndex((row) => getRowId(row) === splitViewRowId);
    const next = index < 0 ? 0 : Math.min(Math.max(index + delta, 0), data.length - 1);
    setSplitViewRow(data[next] ?? null);
  };

  const paginationHotkeys = (showPagination || hasSplitView) && data.length > 0;
  useHotkey('ArrowDown', () => moveSplitView(1), hasSplitView);
  useHotkey('ArrowUp', () => moveSplitView(-1), hasSplitView);
  useHotkey('ArrowRight', goToNextPage, paginationHotkeys && canGoNext);
  useHotkey('ArrowLeft', goToPreviousPage, paginationHotkeys && canGoPrevious);

  const hasToolbar = Boolean(toolbar || toolbarActions || showDisplay);

  return (
    <div data-slot="data-table" className={cn('flex flex-col', hasSplitView && 'flex-1', className)}>
      {hasToolbar && (
        <div
          className={cn(
            'flex flex-col items-start justify-between gap-4 px-5 md:flex-row md:gap-2',
            !tabs && 'pb-2.5'
          )}>
          {toolbar ?? <div />}
          <div className="flex items-center gap-2">
            {toolbarActions}
            {showDisplay && <DataTableDisplay table={table} align={toolbar ? 'end' : 'start'} />}
          </div>
        </div>
      )}

      {tabs && (
        <div className="pt-1">
          <DataTableTabs tabs={tabs} query={query} setQuery={setQuery} options={tabsOptions} onChange={onTabChange} />
        </div>
      )}

      <div className={cn('flex w-full flex-row', hasSplitView && 'flex-1')}>
        <div className={cn('min-w-0 flex-1 border-t', hasSplitView && 'border-r md:w-1/2')}>
          {loading ? (
            (loadingState ?? (
              <div className="flex h-30 items-center justify-center" role="status" aria-label="Loading">
                <Loader2 className="text-muted-foreground size-5 animate-spin" />
              </div>
            ))
          ) : (
            <>
              <div
                aria-busy={fetching}
                className={cn(
                  'transition-opacity duration-150 motion-reduce:transition-none',
                  // The delay applies only on the way in, so quick responses don't flicker.
                  fetching && 'opacity-60 delay-100'
                )}>
                <Table containerClassName={cn(expandable && '@container')}>
                  {data.length > 0 && (
                    <TableHeader>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className="hover:bg-transparent">
                          {headerGroup.headers.map((header) => {
                            const columnMeta = header.column.columnDef.meta;
                            const columnId = header.column.id;
                            const isSortable = Boolean(sortableColumns && columnId in sortableColumns);
                            const isSorted = isSortable && sortField === sortableColumns?.[columnId];
                            const content = header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext());
                            return (
                              <TableHead
                                key={header.id}
                                className={cn(
                                  'text-xs font-bold uppercase',
                                  columnMeta?.align === 'right' && 'text-right',
                                  columnMeta?.minimize && 'w-px'
                                )}
                                aria-sort={
                                  isSortable
                                    ? isSorted
                                      ? (sortDirection as 'ascending' | 'descending')
                                      : 'none'
                                    : undefined
                                }>
                                {isSortable ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="hover:bg-muted -ml-2 h-8 gap-1.5 px-2 text-xs font-bold uppercase"
                                    onClick={() => handleSort(columnId)}>
                                    {content}
                                    {isSorted && sortDirection === 'ascending' ? (
                                      <ArrowUp className="size-3.5 opacity-70" />
                                    ) : isSorted ? (
                                      <ArrowDown className="size-3.5 opacity-70" />
                                    ) : (
                                      <ArrowUp className="size-3.5 opacity-30" aria-hidden />
                                    )}
                                  </Button>
                                ) : (
                                  content
                                )}
                              </TableHead>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableHeader>
                  )}
                  <TableBody>
                    {table.getRowModel().rows.map((row) => {
                      const isActive = hasSplitView && row.id === splitViewRowId;
                      const expandsOnClick = expandable?.trigger === 'row' && row.getCanExpand();
                      const rowUrl = expandsOnClick ? undefined : url?.(row.original);
                      const isInteractive = Boolean(rowUrl || hasSplitView || onRowClick || expandsOnClick);

                      const handleRowClick = () => {
                        if (expandsOnClick) row.toggleExpanded();
                        if (hasSplitView) setSplitViewRow(row.original);
                        onRowClick?.(row.original);
                        // The split panel is hidden on mobile, so go to the row's page instead.
                        if (hasSplitView && isMobile && rowUrl) navigate(rowUrl);
                      };

                      // One context menu per row (not per cell) keeps the number of menu trees down.
                      const rowActions =
                        typeof contextMenuActions === 'function'
                          ? contextMenuActions(row.original)
                          : contextMenuActions;

                      return (
                        <React.Fragment key={row.id}>
                          <TableContextMenu childAsTrigger row={row.original} actions={rowActions}>
                            <TableRow
                              data-state={row.getIsSelected() ? 'selected' : undefined}
                              data-active={isActive || undefined}
                              onMouseEnter={rowUrl && prefetch ? () => debouncedPrefetch(rowUrl) : undefined}
                              onMouseLeave={rowUrl && prefetch ? cancelPrefetch : undefined}
                              className={cn(
                                customRowClassName?.(row.original),
                                isInteractive && 'hover:bg-muted/50 cursor-pointer',
                                'data-[state=selected]:bg-muted/40',
                                isActive && 'bg-muted/75 shadow-[inset_4px_0px_var(--primary)]'
                              )}>
                              {row.getVisibleCells().map((cell) => {
                                const columnMeta = cell.column.columnDef.meta;
                                const content = (
                                  <TableCellContent
                                    className={cn(
                                      'h-full min-h-10 w-full',
                                      columnMeta?.align === 'right' && 'justify-end',
                                      columnMeta?.itemAlign === 'center' && 'items-center'
                                    )}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                  </TableCellContent>
                                );
                                const skipRowLink =
                                  cell.column.id === 'select' ||
                                  cell.column.id === 'expand' ||
                                  cell.column.id === 'actions' ||
                                  columnMeta?.disableRowLink;

                                let wrapped = content;
                                if (!skipRowLink) {
                                  if (hasSplitView || (!rowUrl && onRowClick)) {
                                    wrapped = (
                                      <div
                                        role="button"
                                        tabIndex={0}
                                        onClick={handleRowClick}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handleRowClick();
                                          }
                                        }}
                                        className="block h-full w-full text-left outline-none">
                                        {content}
                                      </div>
                                    );
                                  } else if (expandsOnClick) {
                                    // Mouse only: the chevron's button is the keyboard control and carries aria-expanded.
                                    wrapped = (
                                      <div onClick={handleRowClick} className="block h-full w-full">
                                        {content}
                                      </div>
                                    );
                                  } else if (rowUrl) {
                                    wrapped = (
                                      <Link
                                        href={rowUrl}
                                        className="block h-full w-full"
                                        {...(onRowClick ? { onClick: () => onRowClick(row.original) } : {})}>
                                        {content}
                                      </Link>
                                    );
                                  }
                                }

                                return (
                                  <TableCell
                                    key={cell.id}
                                    className={cn('leading-6.5', columnMeta?.minimize && 'w-px')}>
                                    {wrapped}
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          </TableContextMenu>
                          {expandable && row.getIsExpanded() && (
                            <TableRow data-slot="table-row-expanded" className="hover:bg-transparent">
                              <TableCell
                                id={`${panelIdPrefix}-${row.id}`}
                                colSpan={row.getVisibleCells().length}
                                className="p-0 whitespace-normal">
                                {/* Pinned to the visible width so wide tables don't scroll the panel out of view. */}
                                <div className="animate-in fade-in sticky left-0 max-w-[100cqw] px-5 py-3 duration-150">
                                  {expandable.component(row.original)}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>

                {data.length === 0 &&
                  (emptyState ? (
                    <div className="p-4">{emptyState}</div>
                  ) : (
                    <div className="py-4">
                      <TableError error={noResultsText} />
                    </div>
                  ))}
              </div>

              {data.length > 0 && !showPagination && !showMore && <div className="border-t" />}

              {data.length > 0 && showMore && !showPagination && (
                <div className="flex items-center justify-center border-t px-5 py-2.5">
                  <Link
                    href={showMore}
                    className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm font-medium">
                    Show more
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              )}

              {showPagination && (data.length > 0 || !isFirstPage) && (
                <div className="flex items-center justify-between border-t px-5 py-3">
                  <p className="text-muted-foreground text-sm tabular-nums">
                    {data.length} result{data.length === 1 ? '' : 's'}
                    {!usesCursors && offset > 0 && ` · page ${offset + 1}`}
                  </p>
                  <div className="flex items-center gap-x-2">
                    <Button variant="outline" size="sm" onClick={goToPreviousPage} disabled={!canGoPrevious}>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" onClick={goToNextPage} disabled={!canGoNext}>
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {splitView && (
          <div className="relative hidden flex-1 border-t md:block">
            <div className="absolute inset-0 overflow-y-auto">{splitView.component(splitViewRow)}</div>
          </div>
        )}
      </div>

      {enableSelection && selectedRows.length > 0 && (
        <SelectionActionBar
          selectedRows={selectedRows}
          actions={selectionActions}
          onClearSelection={() => onSelectionChange?.([])}
          onSelectAll={selectAllRows}
          renderStatus={renderSelectionStatus}
        />
      )}
    </div>
  );
}

/**
 * Server-driven data table built on TanStack Table. Data fetching stays with you: read `query`, fetch, and pass
 * `data`/`loading` and `hasMore` (or `nextCursor`/`previousCursor`) back in.
 */
export function DataTable<TData>(props: DataTableProps<TData>) {
  // Reset the boundary when the data or query changes so a transient render error doesn't wedge the table.
  return (
    <TableErrorBoundary resetKeys={[props.data, props.query]}>
      <DataTableInner<TData> {...props} />
    </TableErrorBoundary>
  );
}
