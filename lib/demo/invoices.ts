'use client';

import { useEffect, useState } from 'react';

import type { TableQuery } from '@/components/data-table/types';

export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'void';

export interface Customer {
  id: string;
  name: string;
  email: string;
}

export interface Invoice {
  id: string;
  number: string;
  customer: Customer;
  status: InvoiceStatus;
  /** Minor units (pence). */
  amount: number;
  currency: 'USD';
  /** Unix seconds. */
  created: number;
  due: number;
}

const FIRST = ['Ada', 'Grace', 'Alan', 'Linus', 'Margaret', 'Ken', 'Barbara', 'Dennis', 'Frances', 'Tim', 'Radia'];
const LAST = ['Lovelace', 'Hopper', 'Turing', 'Torvalds', 'Hamilton', 'Thompson', 'Liskov', 'Ritchie', 'Allen'];

export const CUSTOMERS: Customer[] = FIRST.flatMap((first, i) =>
  LAST.slice(0, 3).map((_, j) => {
    const last = LAST[(i + j) % LAST.length]!;
    return {
      id: `cus_${String(i * 3 + j).padStart(3, '0')}`,
      name: `${first} ${last}`,
      email: `${first}.${last}@example.com`.toLowerCase(),
    };
  })
);

const STATUSES: InvoiceStatus[] = ['paid', 'open', 'paid', 'draft', 'open', 'paid', 'void'];
const DAY = 86_400;
const NOW = Math.floor(new Date('2026-10-01T09:00:00Z').getTime() / 1000);

// Deterministic pseudo-random so server and client renders agree.
function seeded(n: number) {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export const INVOICES: Invoice[] = Array.from({ length: 137 }, (_, i) => {
  const created = NOW - Math.floor(seeded(i) * 400) * DAY - Math.floor(seeded(i + 1) * DAY);
  return {
    id: `in_${String(1000 + i)}`,
    number: `WS-${String(1000 + i)}`,
    customer: CUSTOMERS[Math.floor(seeded(i + 2) * CUSTOMERS.length)]!,
    status: STATUSES[i % STATUSES.length]!,
    amount: Math.round(seeded(i + 3) * 250_000) + 500,
    currency: 'USD',
    created,
    due: created + 30 * DAY,
  };
});

export function formatAmount(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount / 100);
}

type NumberQuery =
  number | { gt?: number; gte?: number; lt?: number; lte?: number; ne?: number; nbt?: { gte?: number; lte?: number } };

function matchesNumber(value: number, q: NumberQuery) {
  if (typeof q === 'number') return value === q;
  if (q.nbt) return value < (q.nbt.gte ?? -Infinity) || value > (q.nbt.lte ?? Infinity);
  return (
    (q.gt === undefined || value > q.gt) &&
    (q.gte === undefined || value >= q.gte) &&
    (q.lt === undefined || value < q.lt) &&
    (q.lte === undefined || value <= q.lte) &&
    (q.ne === undefined || value !== q.ne)
  );
}

const asArray = (value: unknown) => (Array.isArray(value) ? value.map(String) : [String(value)]);

export const PAGE_SIZE = 10;

/** Pretend API: applies filters, sort and offset pagination the way a real list endpoint would. */
export function listInvoices(query: TableQuery): { data: Invoice[]; has_more: boolean } {
  let rows = INVOICES.filter((invoice) => {
    if (query.status && !asArray(query.status).includes(invoice.status)) return false;
    if (query.customer && !asArray(query.customer).includes(invoice.customer.id)) return false;
    if (query.email && !invoice.customer.email.includes(String(query.email).toLowerCase())) return false;
    if (query.number && !invoice.number.toLowerCase().includes(String(query.number).toLowerCase())) return false;
    if (query.amount !== undefined && !matchesNumber(invoice.amount, query.amount as NumberQuery)) return false;
    return true;
  });

  const field = query.sort_field as keyof Pick<Invoice, 'created' | 'amount' | 'due'> | undefined;
  const direction = query.sort === 'ascending' ? 1 : -1;
  rows = [...rows].sort((a, b) => (field ? (a[field] - b[field]) * direction : b.created - a.created));

  const offset = Number(query.offset || 0);
  return {
    data: rows.slice(offset * PAGE_SIZE, (offset + 1) * PAGE_SIZE),
    has_more: rows.length > (offset + 1) * PAGE_SIZE,
  };
}

// Responses by query key, shared by every demo on the page. The fixtures never change, so a cached query is served
// straight away without refetching.
const cache = new Map<string, ReturnType<typeof listInvoices>>();

/**
 * Stand-in for SWR / React Query: "fetches" with a short delay the first time it sees a query, then serves it from
 * the cache.
 */
export function useInvoices(query: TableQuery, { latency = 250 }: { latency?: number } = {}) {
  const key = JSON.stringify(query);
  // The query whose rows are on screen. It trails `key` while an uncached query loads.
  const [shownKey, setShownKey] = useState<string | null>(null);
  if (shownKey !== key && cache.has(key)) setShownKey(key);

  useEffect(() => {
    if (cache.has(key)) return;
    const timer = setTimeout(() => {
      cache.set(key, listInvoices(JSON.parse(key)));
      setShownKey(key);
    }, latency);
    return () => clearTimeout(timer);
  }, [key, latency]);

  const shown = shownKey === null ? undefined : cache.get(shownKey);
  return {
    data: shown?.data,
    hasMore: shown?.has_more ?? false,
    // Keep showing the previous page while the next one loads, like SWR's keepPreviousData.
    loading: shown === undefined,
    fetching: shown !== undefined && shownKey !== key,
  };
}

/** Pretend search endpoint for async filter options. */
export async function searchCustomers(search: string) {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const term = search.toLowerCase();
  return CUSTOMERS.filter((c) => c.name.toLowerCase().includes(term) || c.email.includes(term))
    .slice(0, 8)
    .map((c) => ({ label: c.name, value: c.id }));
}

export async function getCustomerName(id: string) {
  return CUSTOMERS.find((c) => c.id === id)?.name;
}
