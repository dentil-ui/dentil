'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

import type { TableQuery } from './types';

/** `true` syncs with no prefix; `{ prefix }` namespaces params when several tables share a page. */
export type UrlStateConfig = boolean | { prefix?: string };

export interface UseTableQueryStateOptions {
  /** Defaults to `false` (plain `useState`). */
  urlState?: UrlStateConfig;
  /** Keys whose URL values are read back as numbers. Defaults to `['offset', 'limit']`. */
  numericKeys?: string[];
  /**
   * The current search string (e.g. `useSearchParams().toString()` in Next.js). Pass it when the table renders on
   * the server to apply URL params on the very first render. Without it, SSR apps start from `initialQuery` and apply
   * URL params right after hydration; client-only apps read `window.location.search` immediately.
   */
  search?: string;
}

const DEFAULT_NUMERIC_KEYS = ['offset', 'limit'];

function resolveUrlState(urlState: UrlStateConfig | undefined): { enabled: boolean; prefix: string } {
  if (!urlState) return { enabled: false, prefix: '' };
  if (urlState === true) return { enabled: true, prefix: '' };
  return { enabled: true, prefix: urlState.prefix ?? '' };
}

function isEmpty(value: unknown): boolean {
  if (value === undefined || value === null || value === '') return true;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

export function serializeTableQuery(query: TableQuery, prefix = ''): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (isEmpty(value)) continue;
    const k = `${prefix}${key}`;
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(k, String(v)));
    } else if (typeof value === 'object') {
      params.set(k, JSON.stringify(value));
    } else if (typeof value === 'number') {
      // Skip default pagination zeros so `?offset=0` doesn't clutter the URL, but keep meaningful zeros.
      if (value === 0 && (key === 'offset' || key === 'limit')) continue;
      params.set(k, String(value));
    } else {
      params.set(k, String(value));
    }
  }
  return params;
}

export function deserializeTableQuery(
  searchParams: URLSearchParams,
  prefix = '',
  numericKeys: string[] = DEFAULT_NUMERIC_KEYS
): TableQuery {
  const grouped = new Map<string, string[]>();
  for (const [k, v] of searchParams.entries()) {
    if (prefix && !k.startsWith(prefix)) continue;
    const key = prefix ? k.slice(prefix.length) : k;
    grouped.set(key, [...(grouped.get(key) ?? []), v]);
  }
  const out: TableQuery = {};
  for (const [key, values] of grouped) {
    const raw: string | string[] = values.length > 1 ? values : values[0]!;
    if (numericKeys.includes(key) && typeof raw === 'string') {
      const n = Number(raw);
      out[key] = Number.isNaN(n) ? raw : n;
    } else if (typeof raw === 'string' && (raw.startsWith('{') || raw.startsWith('['))) {
      try {
        out[key] = JSON.parse(raw);
      } catch {
        out[key] = raw;
      }
    } else {
      out[key] = raw;
    }
  }
  return out;
}

/**
 * Drop-in replacement for `useState<TableQuery>` that can sync the query to the URL, so filters, sort and
 * pagination survive reloads, shared links and Back navigation.
 *
 * Writes use `history.replaceState`, so they don't add history entries or trigger router navigations.
 * On mount, URL params win over `initialQuery`.
 *
 * @example
 * const [query, setQuery] = useTableQueryState({ sort: 'descending' }, { urlState: true });
 */
const noopSubscribe = () => () => {};

/** `true` on the server and during hydration, `false` for every client render after it (and in client-only apps). */
function useIsHydrating() {
  return useSyncExternalStore(
    noopSubscribe,
    () => false,
    () => true
  );
}

export function useTableQueryState(
  initialQuery: TableQuery = {},
  { urlState, numericKeys = DEFAULT_NUMERIC_KEYS, search }: UseTableQueryStateOptions = {}
): [TableQuery, (next: TableQuery) => void] {
  const { enabled, prefix } = resolveUrlState(urlState);
  const isHydrating = useIsHydrating();

  const readUrl = (source: string) => {
    const fromUrl = deserializeTableQuery(new URLSearchParams(source), prefix, numericKeys);
    return Object.keys(fromUrl).length > 0 ? { ...initialQuery, ...fromUrl } : initialQuery;
  };

  // Read the URL up front when it's safe: a `search` the server also saw, or a client render that isn't hydrating.
  // While hydrating without `search`, start from `initialQuery` so the markup matches, and read the URL after mount.
  const deferUrlRead = enabled && search === undefined && isHydrating;
  const [query, setQueryState] = useState<TableQuery>(() => {
    if (!enabled) return initialQuery;
    if (search !== undefined) return readUrl(search);
    return isHydrating ? initialQuery : readUrl(window.location.search);
  });

  const shouldReadAfterMount = useRef(deferUrlRead);
  useEffect(() => {
    if (!shouldReadAfterMount.current) return;
    shouldReadAfterMount.current = false;
    // Syncing from an external source (the URL) once after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (window.location.search) setQueryState(readUrl(window.location.search));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const config = useRef({ enabled, prefix });
  useEffect(() => {
    config.current = { enabled, prefix };
  });

  const setQuery = useCallback((next: TableQuery) => {
    setQueryState(next);

    const { enabled, prefix } = config.current;
    if (!enabled || typeof window === 'undefined') return;

    const current = new URLSearchParams(window.location.search);
    for (const key of Array.from(current.keys())) {
      if (!prefix || key.startsWith(prefix)) current.delete(key);
    }
    serializeTableQuery(next, prefix).forEach((v, k) => current.append(k, v));

    const qs = current.toString();
    const url = `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`;
    window.history.replaceState(window.history.state, '', url);
  }, []);

  return [query, setQuery];
}
