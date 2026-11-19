import type { CategoryBarItem } from '@/components/dentil/charts/category-bar-chart';

/** Unix seconds. The fixtures are frozen at 18 Nov 2026 so the page renders the same on the server and in the browser. */
export const DEMO_NOW = Date.UTC(2026, 10, 18, 14, 30) / 1000;
export const DEMO_UPDATED_AT = DEMO_NOW - 12 * 60;

const DAY = 86_400;

/** Small seeded generator so the fixtures are stable between renders. */
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = seeded(42);
const novemberStart = Date.UTC(2026, 10, 1) / 1000;
const octoberStart = Date.UTC(2026, 9, 1) / 1000;

/**
 * Daily revenue in pence for November, against the same day in October. Days after `DEMO_NOW` come back as
 * `0`, the way most reporting APIs fill buckets that haven't happened yet.
 */
export const revenue = Array.from({ length: 30 }, (_, day) => {
  const date = novemberStart + day * DAY;
  const weekend = [0, 6].includes(new Date(date * 1000).getUTCDay());
  const base = weekend ? 1_400_000 : 3_200_000;
  return {
    date,
    value: date > DEMO_NOW ? 0 : Math.round(base * (0.85 + random() * 0.45) + day * 25_000),
    previous: Math.round(base * (0.8 + random() * 0.4)),
    previousDate: octoberStart + day * DAY,
  };
});

const elapsed = revenue.filter((point) => point.date <= DEMO_NOW);

/** Month to date, against the same days last month. */
export const revenueTotals = {
  current: elapsed.reduce((sum, point) => sum + point.value, 0),
  previous: elapsed.reduce((sum, point) => sum + point.previous, 0),
};

/** Daily API requests for the two weeks to 17 Nov. */
export const apiRequests = Array.from({ length: 14 }, (_, day) => {
  const date = Date.UTC(2026, 10, 4) / 1000 + day * DAY;
  const succeeded = Math.round(18_000 + random() * 6_000);
  const failed = day === 9 ? 1_840 : Math.round(80 + random() * 260);
  return { date, succeeded, failed };
});

const requestTotals = apiRequests.reduce(
  (sum, point) => ({ succeeded: sum.succeeded + point.succeeded, failed: sum.failed + point.failed }),
  { succeeded: 0, failed: 0 }
);

/** Share of requests that succeeded, this period and the one before. */
export const successRate = {
  current: requestTotals.succeeded / (requestTotals.succeeded + requestTotals.failed),
  previous: 0.9872,
};

const tickets = [
  { id: 'under-1d', title: 'Under 1 day', value: 18 },
  { id: '1-3d', title: '1–3 days', value: 11 },
  { id: '4-7d', title: '4–7 days', value: 7 },
  { id: '8-30d', title: '8–30 days', value: 3 },
  { id: 'over-30d', title: 'Over 30 days', value: 2 },
];
const ticketTotal = tickets.reduce((sum, item) => sum + item.value, 0);

/** Open support tickets, grouped by how long they've been waiting. */
export const ticketAges: CategoryBarItem[] = tickets.map((item) => ({
  ...item,
  subtitle: `${Math.round((item.value / ticketTotal) * 100)}% of open tickets`,
  href: `#tickets-${item.id}`,
}));

/** Active subscriptions by plan. */
export const subscriptionsByPlan: CategoryBarItem[] = [
  { id: 'free', title: 'Free', value: 1284 },
  { id: 'starter', title: 'Starter', value: 642 },
  { id: 'pro', title: 'Pro', value: 318 },
  { id: 'enterprise', title: 'Enterprise', value: 41 },
];
