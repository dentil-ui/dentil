import { isEqual } from 'date-fns';
import { format } from 'date-fns';
import { Check, Ellipsis, Loader2 } from 'lucide-react';
import {
  cloneElement,
  isValidElement,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import type { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

import { numberFilterOperators } from '../core/operators';
import type {
  Column,
  ColumnDataType,
  ColumnOption,
  ColumnOptionExtended,
  DataTableFilterActions,
  FilterModel,
  FilterStrategy,
} from '../core/types';
import { useDebounceCallback } from '../hooks/use-debounce-callback';
import { take } from '../lib/array';
import { createNumberRange } from '../lib/helpers';
import { type Locale, t } from '../lib/i18n';
import { DebouncedInput } from '../ui/debounced-input';

/** Cache of display labels for async option filters (columnId:valueId -> label), set when user selects in the filter. */
const asyncOptionLabelCache = new Map<string, string>();

function getAsyncOptionLabel(columnId: string, valueId: string): string | undefined {
  return asyncOptionLabelCache.get(`${columnId}:${valueId}`);
}

function setAsyncOptionLabel(columnId: string, valueId: string, label: string): void {
  asyncOptionLabelCache.set(`${columnId}:${valueId}`, label);
}

function AsyncOptionLabel({
  columnId,
  value,
  resolveLabel,
}: {
  columnId: string;
  value: string;
  resolveLabel?: (value: string) => Promise<string | undefined>;
}) {
  const cached = getAsyncOptionLabel(columnId, value);
  const [resolved, setResolved] = useState<{ value: string; label: string } | null>(null);

  useEffect(() => {
    if (cached || !resolveLabel) return;
    let cancelled = false;
    resolveLabel(value)
      .then((label) => {
        if (cancelled || !label) return;
        setAsyncOptionLabel(columnId, value, label);
        setResolved({ value, label });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [cached, resolveLabel, columnId, value]);

  const label = cached ?? (resolved?.value === value ? resolved.label : undefined);
  return <span className="inline-flex min-w-0 truncate">{label ?? value}</span>;
}

interface FilterValueProps<TData, TType extends ColumnDataType> {
  filter: FilterModel<TType>;
  column: Column<TData, TType>;
  actions: DataTableFilterActions;
  strategy: FilterStrategy;
  locale?: Locale;
}

export const FilterValue = memo(__FilterValue) as typeof __FilterValue;

function __FilterValue<TData, TType extends ColumnDataType>({
  filter,
  column,
  actions,
  strategy,
  locale,
}: FilterValueProps<TData, TType>) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="m-0 h-full w-fit rounded-none p-0 px-2 text-xs whitespace-nowrap">
          <FilterValueDisplay filter={filter} column={column} actions={actions} locale={locale} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" side="bottom" sideOffset={4} className="w-fit p-0">
        <FilterValueController filter={filter} column={column} actions={actions} strategy={strategy} locale={locale} />
      </PopoverContent>
    </Popover>
  );
}

interface FilterValueDisplayProps<TData, TType extends ColumnDataType> {
  filter: FilterModel<TType>;
  column: Column<TData, TType>;
  actions: DataTableFilterActions;
  locale?: Locale;
}

function FilterValueDisplay<TData, TType extends ColumnDataType>({
  filter,
  column,
  actions,
  locale = 'en',
}: FilterValueDisplayProps<TData, TType>) {
  switch (column.type) {
    case 'option':
      return (
        <FilterValueOptionDisplay
          filter={filter as FilterModel<'option'>}
          column={column as Column<TData, 'option'>}
          actions={actions}
          locale={locale}
        />
      );
    case 'multiOption':
      return (
        <FilterValueMultiOptionDisplay
          filter={filter as FilterModel<'multiOption'>}
          column={column as Column<TData, 'multiOption'>}
          actions={actions}
          locale={locale}
        />
      );
    case 'date':
      return (
        <FilterValueDateDisplay
          filter={filter as FilterModel<'date'>}
          column={column as Column<TData, 'date'>}
          actions={actions}
          locale={locale}
        />
      );
    case 'text':
      return (
        <FilterValueTextDisplay
          filter={filter as FilterModel<'text'>}
          column={column as Column<TData, 'text'>}
          actions={actions}
          locale={locale}
        />
      );
    case 'number':
      return (
        <FilterValueNumberDisplay
          filter={filter as FilterModel<'number'>}
          column={column as Column<TData, 'number'>}
          actions={actions}
          locale={locale}
        />
      );
    default:
      return null;
  }
}

function FilterValueOptionDisplay<TData>({ filter, column }: FilterValueDisplayProps<TData, 'option'>) {
  const options = useMemo(() => column.getOptions(), [column]);
  const selected = options.filter((o) => filter?.values.includes(o.value));

  // We display the selected options based on how many are selected
  //
  // If there is only one option selected, we display its icon and label
  //
  // If there are multiple options selected, we display:
  // 1) up to 3 icons of the selected options
  // 2) the number of selected options
  if (selected.length === 1) {
    const selectedOption = selected[0];
    if (!selectedOption) return null;
    const { label, icon: Icon } = selectedOption;
    const hasIcon = !!Icon;
    return (
      <span className="inline-flex items-center gap-1">
        {hasIcon && (isValidElement(Icon) ? Icon : <Icon className="text-primary size-3" />)}
        <span>{label}</span>
      </span>
    );
  }

  if (selected.length === 0 && filter.values.length === 1 && filter.values[0]) {
    const rawValue = filter.values[0];
    if (column.asyncOptions) {
      return <AsyncOptionLabel columnId={column.id} value={rawValue} resolveLabel={column.asyncOptions.resolveLabel} />;
    }
    return <span>{rawValue}</span>;
  }

  const name = column.displayName.toLowerCase();
  // TODO: Better pluralization for different languages
  const pluralName = name.endsWith('s') ? `${name}es` : `${name}s`;

  const hasOptionIcons = !options?.some((o) => !o.icon);

  return (
    <div className="inline-flex items-center gap-0.5">
      {hasOptionIcons &&
        take(selected, 3).map(({ value, icon }) => {
          const Icon = icon!;
          return isValidElement(Icon) ? Icon : <Icon key={value} className="size-3" />;
        })}
      <span className={cn(hasOptionIcons && 'ml-1.5')}>
        {selected.length} {pluralName}
      </span>
    </div>
  );
}

function FilterValueMultiOptionDisplay<TData>({ filter, column }: FilterValueDisplayProps<TData, 'multiOption'>) {
  const options = useMemo(() => column.getOptions(), [column]);
  const selected = options.filter((o) => filter.values.includes(o.value));

  if (selected.length === 1) {
    const selectedOption = selected[0];
    if (!selectedOption) return null;
    const { label, icon: Icon } = selectedOption;
    const hasIcon = !!Icon;
    return (
      <span className="inline-flex items-center gap-1.5">
        {hasIcon && (isValidElement(Icon) ? Icon : <Icon className="text-primary size-3" />)}

        <span>{label}</span>
      </span>
    );
  }

  const name = column.displayName.toLowerCase();

  const hasOptionIcons = !options?.some((o) => !o.icon);

  return (
    <div className="inline-flex items-center gap-1.5">
      {hasOptionIcons && (
        <div key="icons" className="inline-flex items-center gap-0.5">
          {take(selected, 3).map(({ value, icon }) => {
            const Icon = icon!;
            return isValidElement(Icon) ? cloneElement(Icon, { key: value }) : <Icon key={value} className="size-3" />;
          })}
        </div>
      )}
      <span>
        {selected.length} {name}
      </span>
    </div>
  );
}

function formatDateRange(start: Date, end: Date) {
  const sameMonth = start.getMonth() === end.getMonth();
  const sameYear = start.getFullYear() === end.getFullYear();

  if (sameMonth && sameYear) {
    return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`;
  }

  if (sameYear) {
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
  }

  return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`;
}

function FilterValueDateDisplay<TData>({ filter }: FilterValueDisplayProps<TData, 'date'>) {
  if (!filter) return null;
  if (filter.values.length === 0) return <Ellipsis className="size-4" />;
  if (filter.values.length === 1) {
    const value = filter.values[0];
    if (!value) return <Ellipsis className="size-4" />;

    const formattedDateStr = format(value, 'MMM d, yyyy');

    return <span>{formattedDateStr}</span>;
  }

  const startDate = filter.values[0];
  const endDate = filter.values[1];
  if (!startDate || !endDate) return <Ellipsis className="size-4" />;

  const formattedRangeStr = formatDateRange(startDate, endDate);

  return <span>{formattedRangeStr}</span>;
}

function FilterValueTextDisplay<TData>({ filter }: FilterValueDisplayProps<TData, 'text'>) {
  if (!filter) return null;
  if (filter.values.length === 0 || !filter.values[0] || filter.values[0].trim() === '')
    return <Ellipsis className="size-4" />;

  const value = filter.values[0];

  return <span>{value}</span>;
}

function formatScaledNumber(value: number | undefined, scale?: number): string {
  if (value === undefined) return '';
  if (typeof scale === 'number' && scale > 1) {
    const decimals = Math.log10(scale);
    if (Number.isInteger(decimals) && decimals > 0 && decimals <= 4) {
      return value.toFixed(decimals);
    }
  }
  return String(value);
}

function FilterValueNumberDisplay<TData>({ filter, column, locale = 'en' }: FilterValueDisplayProps<TData, 'number'>) {
  if (!filter || !filter.values || filter.values.length === 0) return null;

  if (filter.operator === 'is between' || filter.operator === 'is not between') {
    const minValue = filter.values[0];
    const maxValue = filter.values[1];

    return (
      <span className="tracking-tight tabular-nums">
        {formatScaledNumber(minValue, column.scale)} {t('and', locale)} {formatScaledNumber(maxValue, column.scale)}
      </span>
    );
  }

  const value = filter.values[0];
  return <span className="tracking-tight tabular-nums">{formatScaledNumber(value, column.scale)}</span>;
}

/****** Property Filter Value Controller ******/

interface FilterValueControllerProps<TData, TType extends ColumnDataType> {
  filter: FilterModel<TType>;
  column: Column<TData, TType>;
  actions: DataTableFilterActions;
  strategy: FilterStrategy;
  locale?: Locale;
}

export const FilterValueController = memo(__FilterValueController) as typeof __FilterValueController;

function __FilterValueController<TData, TType extends ColumnDataType>({
  filter,
  column,
  actions,
  strategy,
  locale = 'en',
}: FilterValueControllerProps<TData, TType>) {
  switch (column.type) {
    case 'option':
      return (
        <FilterValueOptionController
          filter={filter as FilterModel<'option'>}
          column={column as Column<TData, 'option'>}
          actions={actions}
          strategy={strategy}
          locale={locale}
        />
      );
    case 'multiOption':
      return (
        <FilterValueMultiOptionController
          filter={filter as FilterModel<'multiOption'>}
          column={column as Column<TData, 'multiOption'>}
          actions={actions}
          strategy={strategy}
          locale={locale}
        />
      );
    case 'date':
      return (
        <FilterValueDateController
          filter={filter as FilterModel<'date'>}
          column={column as Column<TData, 'date'>}
          actions={actions}
          strategy={strategy}
          locale={locale}
        />
      );
    case 'text':
      return (
        <FilterValueTextController
          filter={filter as FilterModel<'text'>}
          column={column as Column<TData, 'text'>}
          actions={actions}
          strategy={strategy}
          locale={locale}
        />
      );
    case 'number':
      return (
        <FilterValueNumberController
          filter={filter as FilterModel<'number'>}
          column={column as Column<TData, 'number'>}
          actions={actions}
          strategy={strategy}
          locale={locale}
        />
      );
    default:
      return null;
  }
}

interface OptionItemProps {
  option: ColumnOptionExtended & { initialSelected: boolean };
  onToggle: (value: string, checked: boolean) => void;
}

// Memoized option item to prevent re-renders unless its own props change
const OptionItem = memo(function OptionItem({ option, onToggle }: OptionItemProps) {
  const { value, label, icon: Icon, selected } = option;
  const handleSelect = useCallback(() => {
    onToggle(value, !selected);
  }, [onToggle, value, selected]);

  return (
    <CommandItem key={value} onSelect={handleSelect} className="group flex items-center justify-between gap-1.5">
      <div className="flex items-center gap-1.5">
        <Checkbox
          checked={selected}
          className="dark:border-ring mr-1 opacity-0 group-data-[selected=true]:opacity-100 data-checked:opacity-100 data-[state=checked]:opacity-100"
        />
        {Icon && (isValidElement(Icon) ? Icon : <Icon className="text-primary size-3" />)}
        <span>{label}</span>
      </div>
    </CommandItem>
  );
});

function FilterValueOptionAsyncController<TData>({
  filter,
  column,
  actions,
  locale = 'en',
}: FilterValueControllerProps<TData, 'option'>) {
  const { fetchOptions, debounceMs = 300 } = column.asyncOptions!;
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState<ColumnOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const latestRequest = useRef(0);
  const selectedValues = filter?.values ?? [];

  const load = useCallback(
    async (term: string) => {
      const request = ++latestRequest.current;
      setLoading(true);
      setError(null);
      try {
        const result = await fetchOptions(term);
        // Ignore responses that arrive after a newer search has started.
        if (request === latestRequest.current) setOptions(result);
      } catch (err) {
        if (request === latestRequest.current) setError(err instanceof Error ? err.message : 'Failed to load options');
      } finally {
        if (request === latestRequest.current) setLoading(false);
      }
    },
    [fetchOptions]
  );

  const debouncedLoad = useDebounceCallback(load, debounceMs);

  useEffect(() => {
    void load('');
  }, [load]);

  const handleSelect = (option: ColumnOption) => {
    setAsyncOptionLabel(column.id, option.value, option.label);
    const isSelected = selectedValues.includes(option.value);
    if (column.allowMultiple) {
      if (isSelected) actions.removeFilterValue(column, [option.value]);
      else actions.addFilterValue(column, [option.value]);
    } else {
      actions.setFilterValue(column, isSelected ? [] : [option.value]);
    }
  };

  return (
    <Command shouldFilter={false} className="w-[280px]">
      <CommandInput
        autoFocus
        placeholder={t('search', locale)}
        value={search}
        onValueChange={(value) => {
          setSearch(value);
          debouncedLoad(value);
        }}
      />
      <CommandList>
        {error ? (
          <div className="text-destructive p-4 text-center text-sm">{error}</div>
        ) : loading && options.length === 0 ? (
          <div className="flex justify-center p-4">
            <Loader2 className="text-muted-foreground size-4 animate-spin" />
          </div>
        ) : (
          <CommandEmpty>{t('noresults', locale)}</CommandEmpty>
        )}
        <CommandGroup>
          {options.map((option) => {
            const Icon = option.icon;
            const selected = selectedValues.includes(option.value);
            return (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => handleSelect(option)}
                className="flex items-center gap-1.5">
                {Icon && (isValidElement(Icon) ? Icon : <Icon className="text-primary size-3" />)}
                <span className="truncate">{option.label}</span>
                <Check className={cn('ml-auto size-3', selected ? 'opacity-100' : 'opacity-0')} />
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

function FilterValueOptionSyncController<TData>({
  filter,
  column,
  actions,
  locale = 'en',
}: FilterValueControllerProps<TData, 'option'>) {
  // Compute initial options once per mount
  const initialOptions = useMemo(() => {
    const counts = column.getFacetedUniqueValues();
    return column.getOptions().map((o) => ({
      ...o,
      selected: filter?.values.includes(o.value),
      initialSelected: filter?.values.includes(o.value),
      count: counts?.get(o.value) ?? 0,
    }));
  }, []);

  const [options, setOptions] = useState(initialOptions);

  // Update selected state when filter values change
  useEffect(() => {
    setOptions((prev) => prev.map((o) => ({ ...o, selected: filter?.values.includes(o.value) })));
  }, [filter?.values]);

  const handleToggle = useCallback(
    (value: string, checked: boolean) => {
      if (checked) {
        // Check if multiple selection is allowed for this column
        if (column.allowMultiple) {
          actions.addFilterValue(column, [value]);
        } else {
          // Single selection: replace the current value
          actions.setFilterValue(column, [value]);
        }
      } else {
        actions.removeFilterValue(column, [value]);
      }
    },
    [actions, column]
  );

  // Derive groups based on `initialSelected` only
  const { selectedOptions, unselectedOptions } = useMemo(() => {
    const sel: typeof options = [];
    const unsel: typeof options = [];
    for (const o of options) {
      if (o.initialSelected) sel.push(o);
      else unsel.push(o);
    }
    return { selectedOptions: sel, unselectedOptions: unsel };
  }, [options]);

  return (
    <Command loop>
      <CommandInput autoFocus placeholder={t('search', locale)} />
      <CommandEmpty>{t('noresults', locale)}</CommandEmpty>
      <CommandList className="max-h-fit">
        <CommandGroup className={cn(selectedOptions.length === 0 && 'hidden')}>
          {selectedOptions.map((option) => (
            <OptionItem key={option.value} option={option} onToggle={handleToggle} />
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup className={cn(unselectedOptions.length === 0 && 'hidden')}>
          {unselectedOptions.map((option) => (
            <OptionItem key={option.value} option={option} onToggle={handleToggle} />
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

function FilterValueOptionController<TData>(props: FilterValueControllerProps<TData, 'option'>) {
  if (props.column.asyncOptions) return <FilterValueOptionAsyncController {...props} />;
  return <FilterValueOptionSyncController {...props} />;
}

function FilterValueMultiOptionController<TData>({
  filter,
  column,
  actions,
  locale = 'en',
}: FilterValueControllerProps<TData, 'multiOption'>) {
  // Compute initial options once per mount
  const initialOptions = useMemo(() => {
    const counts = column.getFacetedUniqueValues();
    return column.getOptions().map((o) => {
      const selected = filter?.values.includes(o.value);
      return {
        ...o,
        selected,
        initialSelected: selected,
        count: counts?.get(o.value) ?? 0,
      };
    });
  }, []);

  const [options, setOptions] = useState(initialOptions);

  // Update selected state when filter values change
  useEffect(() => {
    setOptions((prev) => prev.map((o) => ({ ...o, selected: filter?.values.includes(o.value) })));
  }, [filter?.values]);

  const handleToggle = useCallback(
    (value: string, checked: boolean) => {
      if (checked) actions.addFilterValue(column, [value]);
      else actions.removeFilterValue(column, [value]);
    },
    [actions, column]
  );

  // Derive groups based on `initialSelected` only
  const { selectedOptions, unselectedOptions } = useMemo(() => {
    const sel: typeof options = [];
    const unsel: typeof options = [];
    for (const o of options) {
      if (o.initialSelected) sel.push(o);
      else unsel.push(o);
    }
    return { selectedOptions: sel, unselectedOptions: unsel };
  }, [options]);

  return (
    <Command loop>
      <CommandInput autoFocus placeholder={t('search', locale)} />
      <CommandEmpty>{t('noresults', locale)}</CommandEmpty>
      <CommandList>
        <CommandGroup className={cn(selectedOptions.length === 0 && 'hidden')}>
          {selectedOptions.map((option) => (
            <OptionItem key={option.value} option={option} onToggle={handleToggle} />
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup className={cn(unselectedOptions.length === 0 && 'hidden')}>
          {unselectedOptions.map((option) => (
            <OptionItem key={option.value} option={option} onToggle={handleToggle} />
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

function FilterValueDateController<TData>({ filter, column, actions }: FilterValueControllerProps<TData, 'date'>) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: filter?.values[0] ?? new Date(),
    to: filter?.values[1] ?? undefined,
  });

  function changeDateRange(value: DateRange | undefined) {
    const start = value?.from;
    const end = start && value && value.to && !isEqual(start, value.to) ? value.to : undefined;

    setDate({ from: start, to: end });

    const isRange = start && end;
    const newValues = isRange ? [start, end] : start ? [start] : [];

    actions.setFilterValue(column, newValues);
  }

  return (
    <Command>
      <CommandList className="max-h-fit">
        <CommandGroup>
          <div>
            <Calendar
              autoFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={changeDateRange}
              numberOfMonths={1}
            />
          </div>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

function FilterValueTextController<TData>({
  filter,
  column,
  actions,
  locale = 'en',
}: FilterValueControllerProps<TData, 'text'>) {
  const changeText = (value: string | number) => {
    actions.setFilterValue(column, [String(value)]);
  };

  return (
    <Command>
      <CommandList className="max-h-fit">
        <CommandGroup>
          <CommandItem>
            <DebouncedInput
              placeholder={t('search', locale)}
              autoFocus
              value={filter?.values[0] ?? ''}
              onChange={changeText}
            />
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

function FilterValueNumberController<TData>({
  filter,
  column,
  actions,
  locale = 'en',
}: FilterValueControllerProps<TData, 'number'>) {
  const minMax = useMemo(() => column.getFacetedMinMaxValues(), [column]);
  const [sliderMin, sliderMax] = [minMax ? minMax[0] : 0, minMax ? minMax[1] : 0];
  const step = typeof column.scale === 'number' && column.scale > 1 ? 1 / column.scale : 1;

  // Local state for values
  const [values, setValues] = useState(filter?.values ?? [0, 0]);

  // Sync with parent filter changes
  useEffect(() => {
    if (filter?.values && filter.values.length === values.length && filter.values.every((v, i) => v === values[i])) {
      setValues(filter.values);
    }
  }, [filter?.values, values]);

  const isNumberRange =
    // filter && values.length === 2
    filter && numberFilterOperators[filter.operator].target === 'multiple';

  // Only the slider goes through these. The inputs are already debounced by DebouncedInput.
  const setFilterOperatorDebounced = useDebounceCallback(actions.setFilterOperator, 300);
  const setFilterValueDebounced = useDebounceCallback(actions.setFilterValue, 300);

  const parseNumberInput = (raw: string | number) => {
    const next = Number(raw);
    return Number.isFinite(next) ? next : 0;
  };

  const applySingle = (raw: string | number) => {
    setFilterValueDebounced.cancel();
    const newValues = [parseNumberInput(raw)];
    setValues(newValues);
    actions.setFilterValue(column, newValues);
  };

  const applyRangeBound = (index: 0 | 1, raw: string | number) => {
    setFilterValueDebounced.cancel();
    const parsed = parseNumberInput(raw);
    const newValues = createNumberRange(index === 0 ? [parsed, values[1] ?? 0] : [values[0] ?? 0, parsed]);
    setValues(newValues);
    actions.setFilterValue(column, newValues);
  };

  // Radix sliders pass `number[]`; Base UI sliders pass `number | readonly number[]`.
  const changeNumber = (next: number | readonly number[]) => {
    const value = Array.isArray(next) ? [...next] : [next as number];
    setValues(value);
    setFilterValueDebounced(column as any, value);
  };

  const onEnter = (apply: (raw: string) => void) => (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    event.stopPropagation();
    apply(event.currentTarget.value);
  };

  const changeType = useCallback(
    (type: 'single' | 'range') => {
      let newValues: number[] = [];
      if (type === 'single') {
        const firstValue = values[0] ?? 0;
        newValues = [firstValue]; // Keep the first value for single mode
      } else if (!minMax) {
        const firstValue = values[0] ?? 0;
        const secondValue = values[1] ?? 0;
        newValues = createNumberRange([firstValue, secondValue]);
      } else {
        const value = values[0] ?? 0;
        newValues =
          value - minMax[0] < minMax[1] - value
            ? createNumberRange([value, minMax[1]])
            : createNumberRange([minMax[0], value]);
      }

      const newOperator = type === 'single' ? 'is' : 'is between';

      // Update local state
      setValues(newValues);

      // Cancel in-flight debounced calls to prevent flicker/race conditions
      setFilterOperatorDebounced.cancel();
      setFilterValueDebounced.cancel();

      // Update global filter state atomically
      actions.setFilterOperator(column.id, newOperator);
      actions.setFilterValue(column, newValues);
    },
    [values, column, actions, minMax]
  );

  return (
    <Command>
      <CommandList className="w-[300px] p-2">
        <CommandGroup>
          <div className="flex w-full flex-col">
            <Tabs value={isNumberRange ? 'range' : 'single'} onValueChange={(v) => changeType(v as 'single' | 'range')}>
              <TabsList className="w-full *:text-xs">
                <TabsTrigger value="single">{t('single', locale)}</TabsTrigger>
                <TabsTrigger value="range">{t('range', locale)}</TabsTrigger>
              </TabsList>
              <TabsContent value="single" className="mt-4 flex flex-col gap-4">
                {minMax && (
                  <Slider
                    value={[values[0] ?? 0]}
                    onValueChange={changeNumber}
                    min={sliderMin}
                    max={sliderMax}
                    step={step}
                    aria-orientation="horizontal"
                  />
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">{t('value', locale)}</span>
                  <DebouncedInput
                    id="single"
                    type="number"
                    step={step}
                    value={(values[0] ?? 0).toString()} // Use values[0] directly
                    onChange={applySingle}
                    onKeyDown={onEnter(applySingle)}
                  />
                </div>
              </TabsContent>
              <TabsContent value="range" className="mt-4 flex flex-col gap-4">
                {minMax && (
                  <Slider
                    value={values} // Use values directly
                    onValueChange={changeNumber}
                    min={sliderMin}
                    max={sliderMax}
                    step={step}
                    aria-orientation="horizontal"
                  />
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{t('min', locale)}</span>
                    <DebouncedInput
                      type="number"
                      step={step}
                      value={values[0] ?? 0}
                      onChange={(v) => applyRangeBound(0, v)}
                      onKeyDown={onEnter((raw) => applyRangeBound(0, raw))}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{t('max', locale)}</span>
                    <DebouncedInput
                      type="number"
                      step={step}
                      value={values[1] ?? 0}
                      onChange={(v) => applyRangeBound(1, v)}
                      onKeyDown={onEnter((raw) => applyRangeBound(1, raw))}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
