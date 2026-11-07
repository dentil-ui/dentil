import type { RowData } from '@tanstack/react-table';

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Horizontal alignment of the header and cells. Defaults to `'left'`. */
    align?: 'left' | 'center' | 'right';
    /** Where a cell sits when its row is taller than the cell, e.g. beside a multi-line cell. Defaults to `'middle'`. */
    verticalAlign?: 'top' | 'middle' | 'bottom';
    /**
     * Centre items shorter than a line of text, like a checkbox or icon button, within the cell's 40px minimum height.
     * Doesn't move the cell in a taller row; use `verticalAlign` for that.
     */
    itemAlign?: 'center';
    /** Shrink the column to its content width (`w-px`). */
    minimize?: boolean;
    /** Keep the cell out of the row link when it renders its own link or control. */
    disableRowLink?: boolean;
  }
}

/**
 * The controlled query that drives a server-side table. Reserved keys:
 * - `offset`: zero-based page index
 * - `after` / `before`: the `nextCursor` or `previousCursor` of the page the user came from (cursor pagination)
 * - `sort` / `sort_field`: `'ascending' | 'descending'` and the API field name
 *
 * Every other key is a filter or tab value passed straight to your API.
 */
export type TableQuery = Record<string, string | string[] | number | object>;

/** Keys that locate the current page. Any change except paging drops them, so the user lands on the first page. */
export const PAGE_KEYS: ReadonlyArray<string> = ['offset', 'after', 'before'];

export function withoutPage(query: TableQuery): TableQuery {
  return Object.fromEntries(Object.entries(query).filter(([key]) => !PAGE_KEYS.includes(key)));
}

export interface TableTab {
  label: string;
  query: TableQuery;
}

export interface TableTabsOptions {
  /** Where to place the "All" tab. Defaults to `'end'`. */
  allPosition?: 'start' | 'end';
  /** Whether to show the "All" tab. Defaults to `true`. */
  showAll?: boolean;
}

/** Props passed to a custom `linkComponent`. Compatible with `next/link`, React Router's `Link`, or a plain `<a>`. */
export interface DataTableLinkProps {
  href: string;
  className?: string;
  children?: React.ReactNode;
}

export type DataTableLinkComponent = React.ElementType<DataTableLinkProps>;

export function defaultGetRowId<TData>(row: TData): string {
  return String((row as { id: string | number }).id);
}
