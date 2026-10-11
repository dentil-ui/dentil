import { isBefore } from 'date-fns';

import type { Column, ColumnOption } from '../core/types';

export function getColumn<TData>(columns: Column<TData>[], id: string) {
  const column = columns.find((c) => c.id === id);

  if (!column) {
    throw new Error(`Column with id ${id} not found`);
  }

  return column;
}

export function createNumberFilterValue(values: number[] | undefined): number[] {
  if (!values || values.length === 0) return [];
  if (values.length === 1) {
    const firstValue = values[0];
    return firstValue !== undefined ? [firstValue] : [];
  }
  if (values.length === 2) return createNumberRange(values);
  const firstValue = values[0];
  const secondValue = values[1];
  return [firstValue ?? 0, secondValue ?? 0];
}

export function createDateFilterValue(values: [Date, Date] | [Date] | [] | undefined) {
  if (!values || values.length === 0) return [];
  if (values.length === 1) return [values[0]];
  if (values.length === 2) return createDateRange(values);
  throw new Error('Cannot create date filter value from more than 2 values');
}

function createDateRange(values: [Date, Date]) {
  const [a, b] = values;
  const [min, max] = isBefore(a, b) ? [a, b] : [b, a];

  return [min, max];
}

export function createNumberRange(values: number[] | undefined) {
  if (!values || values.length === 0) return [0, 0];

  if (values.length === 1) {
    const firstValue = values[0];
    const a = firstValue ?? 0;
    return [a, a]; // For single value, return same value for both min and max
  }

  const firstValue = values[0];
  const secondValue = values[1];
  const a = firstValue ?? 0;
  const b = secondValue ?? 0;

  const [min, max] = a < b ? [a, b] : [b, a];

  return [min, max];
}

function isColumnOption(value: unknown): value is ColumnOption {
  return typeof value === 'object' && value !== null && 'value' in value && 'label' in value;
}

export function isColumnOptionArray(value: unknown): value is ColumnOption[] {
  return Array.isArray(value) && value.every(isColumnOption);
}

export function isColumnOptionMap(value: unknown): value is Map<string, number> {
  if (!(value instanceof Map)) {
    return false;
  }
  for (const key of value.keys()) {
    if (typeof key !== 'string') {
      return false;
    }
  }
  for (const val of value.values()) {
    if (typeof val !== 'number') {
      return false;
    }
  }
  return true;
}

export function isMinMaxTuple(value: unknown): value is [number, number] {
  return Array.isArray(value) && value.length === 2 && typeof value[0] === 'number' && typeof value[1] === 'number';
}
