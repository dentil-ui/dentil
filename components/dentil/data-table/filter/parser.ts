import type { TableQuery } from '../types';

import type { ColumnConfig, FilterModel, FiltersState, NumberFilterOperator } from './core/types';

type NumberRangeQuery = {
  gt?: number;
  lt?: number;
  gte?: number;
  lte?: number;
  ne?: number;
  nbt?: { gte?: number; lte?: number };
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function toFiniteNumber(value: unknown): number | undefined {
  if (isFiniteNumber(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function coerceQueryValue(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return value;
    }
  }
  return value;
}

function getNumberScale(column?: ColumnConfig<unknown, 'number'> | ColumnConfig<any, any, any, any>): number {
  if (!column || column.type !== 'number') return 1;
  const scale = column.scale;
  return typeof scale === 'number' && Number.isFinite(scale) && scale > 0 ? scale : 1;
}

function scaleToQuery(value: number, scale: number): number {
  return scale === 1 ? value : Math.round(value * scale);
}

function scaleFromQuery(value: number, scale: number): number {
  return scale === 1 ? value : value / scale;
}

function parseNumberToQuery(filter: FilterModel<'number'>, scale: number): TableQuery[string] | undefined {
  const values = filter.values.filter(isFiniteNumber).map((value) => scaleToQuery(value, scale));
  if (values.length === 0) return undefined;

  const value = values[0]!;
  const max = values[1];

  switch (filter.operator) {
    case 'is':
      return value;
    case 'is not':
      return { ne: value };
    case 'is less than':
      return { lt: value };
    case 'is greater than':
      return { gt: value };
    case 'is greater than or equal to':
      return { gte: value };
    case 'is less than or equal to':
      return { lte: value };
    case 'is between':
      return max === undefined ? { gte: value } : { gte: value, lte: max };
    case 'is not between':
      return max === undefined ? { nbt: { gte: value } } : { nbt: { gte: value, lte: max } };
    default:
      return value;
  }
}

function parseNumberFromQuery(
  value: unknown,
  scale: number
): { operator: NumberFilterOperator; values: number[] } | null {
  const coerced = coerceQueryValue(value);
  const fromQuery = (raw: unknown) => {
    const parsed = toFiniteNumber(raw);
    return parsed === undefined ? undefined : scaleFromQuery(parsed, scale);
  };

  if (isFiniteNumber(coerced) || typeof coerced === 'string') {
    const parsed = fromQuery(coerced);
    if (parsed === undefined) return null;
    return { operator: 'is', values: [parsed] };
  }

  if (!coerced || typeof coerced !== 'object' || Array.isArray(coerced)) {
    return null;
  }

  const range = coerced as NumberRangeQuery;
  const nbtGte = fromQuery(range.nbt?.gte);
  const nbtLte = fromQuery(range.nbt?.lte);
  if (nbtGte !== undefined || nbtLte !== undefined) {
    return { operator: 'is not between', values: [nbtGte ?? nbtLte ?? 0, nbtLte ?? nbtGte ?? 0] };
  }

  const gt = fromQuery(range.gt);
  const lt = fromQuery(range.lt);
  const gte = fromQuery(range.gte);
  const lte = fromQuery(range.lte);
  const ne = fromQuery(range.ne);

  // The dashboard only writes inclusive pairs (`gte`+`lte`) or a single bound.
  // If a URL has both ends (including mixed exclusive/inclusive), keep both so
  // reload does not drop one side.
  const lower = gte ?? gt;
  const upper = lte ?? lt;
  if (lower !== undefined && upper !== undefined) {
    return { operator: 'is between', values: [lower, upper] };
  }
  if (gt !== undefined) return { operator: 'is greater than', values: [gt] };
  if (lt !== undefined) return { operator: 'is less than', values: [lt] };
  if (gte !== undefined) return { operator: 'is greater than or equal to', values: [gte] };
  if (lte !== undefined) return { operator: 'is less than or equal to', values: [lte] };
  if (ne !== undefined) return { operator: 'is not', values: [ne] };

  return null;
}

export function parseToQuery(
  filters: FiltersState,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filterColumns?: ReadonlyArray<ColumnConfig<any, any, any, any>>
): TableQuery {
  return filters.reduce<TableQuery>((acc, filter) => {
    if (filter.type === 'option') {
      acc[filter.columnId] = filter.values.length === 1 ? filter.values[0] : filter.values;
    } else if (filter.type === 'text') {
      acc[filter.columnId] = filter.values?.[0];
    } else if (filter.type === 'number') {
      const column = filterColumns?.find((item) => item.id === filter.columnId);
      const parsed = parseNumberToQuery(filter as FilterModel<'number'>, getNumberScale(column));
      if (parsed !== undefined) {
        acc[filter.columnId] = parsed;
      }
    }
    return acc;
  }, {});
}

export function parseToFilters<TData>({
  query,
  filterColumns,
}: {
  query: TableQuery;
  filterColumns: ReadonlyArray<ColumnConfig<TData, any, any, any>>;
}): FiltersState {
  return Object.entries(query)
    .map(([columnId, value]) => {
      const column = filterColumns.find((column) => column.id === columnId);
      if (!column) {
        return null;
      }

      if (column.type === 'number') {
        const parsed = parseNumberFromQuery(value, getNumberScale(column));
        if (!parsed) return null;
        return {
          columnId,
          operator: parsed.operator,
          type: column.type,
          values: parsed.values,
        };
      }

      return {
        columnId,
        operator: column.type === 'text' ? 'contains' : 'is',
        type: column.type,
        values: Array.isArray(value) ? value : [value],
      };
    })
    .filter((filter): filter is NonNullable<typeof filter> => filter !== null);
}
