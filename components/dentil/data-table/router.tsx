'use client';

import { createContext, use, type ReactNode } from 'react';

import type { DataTableLinkComponent } from './types';

export interface DataTableRouterProps {
  /** Component used for row links and "Show more". Pass `next/link`, React Router's `Link`, etc. */
  linkComponent?: DataTableLinkComponent;
  /** Programmatic navigation, used on mobile when split view is enabled. */
  onNavigate?: (url: string) => void;
  /** Called (debounced, once per URL) when a linked row is hovered, e.g. `router.prefetch`. */
  onPrefetch?: (url: string) => void;
  children: ReactNode;
}

const DataTableRouterContext = createContext<Omit<DataTableRouterProps, 'children'>>({});

/** Sets the link component and navigation for every `DataTable` below it. A table's own props override these. */
export function DataTableRouter({ linkComponent, onNavigate, onPrefetch, children }: DataTableRouterProps) {
  return <DataTableRouterContext value={{ linkComponent, onNavigate, onPrefetch }}>{children}</DataTableRouterContext>;
}

export function useDataTableRouter() {
  return use(DataTableRouterContext);
}
