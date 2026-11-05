import {
  addMonths,
  addSeconds,
  endOfDay,
  fromUnixTime,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
} from 'date-fns';

/** A range preset shown beside the range calendar. */
export interface QuickSelectOption {
  label: string;
  value: string;
  getRange: () => { start: Date; end: Date };
}

/** A one-click date shown beside the single-date calendar. */
export interface SingleDateShortcut {
  label: string;
  value: string;
  getDate: () => Date;
}

/** Billing-style cycles: each one ends the second before `startDate` plus `durationMonths`. */
export interface CycleConfig {
  /** A `Date` or unix seconds. */
  startDate: Date | number;
  durationMonths?: number;
}

export const quickSelectOptions: QuickSelectOption[] = [
  {
    label: 'Last 7 days',
    value: 'last_7_days',
    getRange: () => ({ start: startOfDay(subDays(new Date(), 6)), end: endOfDay(new Date()) }),
  },
  {
    label: 'Last 4 weeks',
    value: 'last_4_weeks',
    getRange: () => ({ start: startOfDay(subWeeks(new Date(), 4)), end: endOfDay(new Date()) }),
  },
  {
    label: 'Last 6 months',
    value: 'last_6_months',
    getRange: () => ({ start: startOfDay(subMonths(new Date(), 6)), end: endOfDay(new Date()) }),
  },
  {
    label: 'Last 12 months',
    value: 'last_12_months',
    getRange: () => ({ start: startOfDay(subMonths(new Date(), 12)), end: endOfDay(new Date()) }),
  },
  {
    label: 'Month to date',
    value: 'month_to_date',
    getRange: () => ({ start: startOfMonth(new Date()), end: endOfDay(new Date()) }),
  },
  {
    label: 'Quarter to date',
    value: 'quarter_to_date',
    getRange: () => ({ start: startOfQuarter(new Date()), end: endOfDay(new Date()) }),
  },
  {
    label: 'Year to date',
    value: 'year_to_date',
    getRange: () => ({ start: startOfYear(new Date()), end: endOfDay(new Date()) }),
  },
];

export const defaultSingleDateShortcuts: SingleDateShortcut[] = [
  { label: 'Today', value: 'today', getDate: () => startOfDay(new Date()) },
  { label: '1st of next month', value: 'first_next_month', getDate: () => startOfMonth(addMonths(new Date(), 1)) },
];

/** The last second of the given cycle, e.g. cycle 1 from 15 Jan ends 14 Feb 23:59:59. */
export function getCycleDate(startDate: Date | number, cycles: number, durationMonths = 1): Date {
  const start = typeof startDate === 'number' ? fromUnixTime(startDate) : startDate;
  return addSeconds(startOfDay(addMonths(start, cycles * durationMonths)), -1);
}
