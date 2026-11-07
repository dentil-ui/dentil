'use client';

import { CheckIcon, ChevronDownIcon, Loader2 } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface AsyncSelectEmptyState {
  /** The current search field text. */
  query: string;
  /** Closes the popover. */
  close: () => void;
}

export interface AsyncSelectProps<T> extends Omit<
  React.ComponentProps<'button'>,
  'value' | 'onChange' | 'children' | 'type'
> {
  /**
   * Loads options for a search. `''` asks for the unfiltered list.
   * `signal` aborts the previous request. The latest function is used on the next search.
   */
  fetcher: (query: string, signal: AbortSignal) => Promise<T[]>;
  /** The selected option's value. `null`, `undefined` and `''` are empty. */
  value: string | null | undefined;
  /** Called with the picked option, or `null` when the selection is cleared. */
  onChange: (option: T | null) => void;
  /** Unique value for an option. Compared with `value`. */
  getOptionValue: (option: T) => string;
  /** Trigger contents for the selected option. */
  getDisplayValue: (option: T) => React.ReactNode;
  /** Row contents. A check mark is rendered after this. */
  renderOption: (option: T) => React.ReactNode;
  /**
   * Shown on the trigger when `value` matches it and that option is not in the current results.
   * Pass the selection you already have so its label shows before the list loads.
   */
  defaultOption?: T | null;
  /** Load once with `''`, then filter in the browser. Otherwise each search calls `fetcher`. */
  preload?: boolean;
  /** Client filter used when `preload` is set. Return true to keep the option. */
  filterFn?: (option: T, query: string) => boolean;
  /** Extra text the default preload filter matches, besides the option value. */
  getSearchValue?: (option: T) => string;
  /** Disabled options stay in the list and cannot be picked. */
  isOptionDisabled?: (option: T) => boolean;
  /** Trigger label when nothing is selected. */
  placeholder?: string;
  /** Search field placeholder. */
  searchPlaceholder?: string;
  /** Shown when the list is empty. A function receives the query and a way to close the popover. */
  emptyText?: React.ReactNode | ((state: AsyncSelectEmptyState) => React.ReactNode);
  /** Replaces the loading rows. */
  loadingSkeleton?: React.ReactNode;
  /** Wait before calling `fetcher` after a keystroke, in milliseconds. Ignored when `preload` is set. */
  debounce?: number;
  /** Picking the selected option again clears it. */
  clearable?: boolean;
}

const skeletonWidths = ['w-40', 'w-32', 'w-36'] as const;

function optionMatches<T>(
  option: T,
  query: string,
  getOptionValue: (option: T) => string,
  getSearchValue?: (option: T) => string
) {
  const q = query.toLowerCase();
  if (getOptionValue(option).toLowerCase().includes(q)) return true;
  return getSearchValue?.(option).toLowerCase().includes(q) ?? false;
}

function EmptyNotice({
  query,
  close,
  render,
}: {
  query: string;
  close: () => void;
  render: (state: AsyncSelectEmptyState) => React.ReactNode;
}) {
  return render({ query, close });
}

function DefaultLoadingSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-1 p-1">
      {skeletonWidths.map((width) => (
        <div key={width} className="flex flex-col gap-1 px-2 py-1.5">
          <div className={cn('bg-muted h-4 animate-pulse rounded-md', width)} />
          <div className="bg-muted h-3 w-24 animate-pulse rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function AsyncSelect<T>({
  fetcher,
  value,
  onChange,
  getOptionValue,
  getDisplayValue,
  renderOption,
  defaultOption,
  preload = false,
  filterFn,
  getSearchValue,
  isOptionDisabled,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  emptyText = 'No results.',
  loadingSkeleton,
  debounce = 300,
  clearable = true,
  disabled = false,
  className,
  ...props
}: AsyncSelectProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [width, setWidth] = React.useState<number>();
  const [query, setQuery] = React.useState('');
  const [debouncedQuery, setDebouncedQuery] = React.useState('');
  const [options, setOptions] = React.useState<T[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = React.useState(false);
  const [picked, setPicked] = React.useState<T | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const fetcherRef = React.useRef(fetcher);
  const abortRef = React.useRef<AbortController | null>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const startRequest = React.useCallback((search: string, markLoaded: boolean) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    void Promise.resolve()
      .then(() => fetcherRef.current(search, controller.signal))
      .then(
        (data) => {
          if (controller.signal.aborted) return;
          setOptions(data);
          if (markLoaded) setHasLoaded(true);
          setError(null);
          setLoading(false);
        },
        (err: unknown) => {
          if (controller.signal.aborted) return;
          setError(err instanceof Error && err.message ? err.message : 'Could not load options.');
          setLoading(false);
        }
      );
  }, []);

  React.useEffect(() => {
    if (!open || !preload || hasLoaded) return;
    startRequest('', true);
    return () => abortRef.current?.abort();
  }, [open, preload, hasLoaded, startRequest]);

  React.useEffect(() => {
    if (!open || preload) return;
    startRequest(debouncedQuery, false);
    return () => abortRef.current?.abort();
  }, [open, preload, debouncedQuery, startRequest]);

  React.useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    },
    []
  );

  const scheduleSearch = (next: string) => {
    setQuery(next);
    setError(null);
    if (preload || !open) return;
    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (next === '' || debounce <= 0) {
      if (next === debouncedQuery) setLoading(false);
      else setDebouncedQuery(next);
      return;
    }
    debounceRef.current = setTimeout(() => setDebouncedQuery(next), debounce);
  };

  const visible = React.useMemo(() => {
    if (!preload) return options;
    const q = query.trim();
    if (!q) return options;
    if (filterFn) return options.filter((option) => filterFn(option, q));
    return options.filter((option) => optionMatches(option, q, getOptionValue, getSearchValue));
  }, [preload, options, query, filterFn, getOptionValue, getSearchValue]);

  const selected = React.useMemo(() => {
    if (value == null || value === '') return null;
    const fromList = options.find((option) => getOptionValue(option) === value);
    if (fromList) return fromList;
    if (defaultOption && getOptionValue(defaultOption) === value) return defaultOption;
    if (picked && getOptionValue(picked) === value) return picked;
    return null;
  }, [value, options, defaultOption, picked, getOptionValue]);

  const close = React.useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    setOpen(false);
  }, []);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setWidth(triggerRef.current?.offsetWidth);
      setQuery('');
      setDebouncedQuery('');
      if (!preload || !hasLoaded) {
        setLoading(true);
        setError(null);
        if (!preload) setOptions([]);
      }
      setOpen(true);
      return;
    }
    close();
  };

  const handleSelect = (option: T) => {
    if (isOptionDisabled?.(option)) return;
    const optionValue = getOptionValue(option);
    if (optionValue === value) {
      if (clearable) {
        setPicked(null);
        onChange(null);
      }
    } else {
      setPicked(option);
      onChange(option);
    }
    close();
  };

  const showSkeleton = loading && visible.length === 0 && !error;
  const showEmpty = !loading && !error && visible.length === 0;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          data-slot="async-select"
          className={cn('w-full justify-between px-3 font-normal', className)}
          {...props}>
          <span className={cn('min-w-0 flex-1 truncate text-left', !selected && 'text-muted-foreground')}>
            {selected ? getDisplayValue(selected) : placeholder}
          </span>
          <ChevronDownIcon className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="min-w-48 p-0" style={{ width }} align="start">
        <Command shouldFilter={false}>
          <div className="relative">
            <CommandInput
              placeholder={searchPlaceholder}
              value={query}
              className={loading && visible.length > 0 ? 'pr-8' : undefined}
              onValueChange={(next) => {
                if (next === query) return;
                scheduleSearch(next);
              }}
            />
            {loading && visible.length > 0 ? (
              <Loader2
                className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
            ) : null}
          </div>
          {error && visible.length > 0 ? (
            <p role="alert" className="text-destructive border-b px-3 py-2 text-center text-xs">
              {error}
            </p>
          ) : null}
          <CommandList aria-busy={loading}>
            {showSkeleton ? (
              <>
                <span className="sr-only">Loading</span>
                {loadingSkeleton ?? <DefaultLoadingSkeleton />}
              </>
            ) : null}
            {error && visible.length === 0 && !loading ? (
              <div role="alert" className="flex flex-col items-center gap-2 px-3 py-6 text-center">
                <p className="text-destructive text-sm">{error}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setLoading(true);
                    setError(null);
                    startRequest(preload ? '' : query, preload);
                  }}>
                  Try again
                </Button>
              </div>
            ) : null}
            {showEmpty ? (
              typeof emptyText === 'function' ? (
                <EmptyNotice query={query} close={close} render={emptyText} />
              ) : (
                <CommandEmpty>{emptyText}</CommandEmpty>
              )
            ) : null}
            {visible.length > 0 ? (
              <CommandGroup>
                {visible.map((option) => {
                  const optionValue = getOptionValue(option);
                  const optionDisabled = isOptionDisabled?.(option) ?? false;
                  return (
                    <CommandItem
                      key={optionValue}
                      value={optionValue}
                      disabled={optionDisabled}
                      onSelect={() => handleSelect(option)}>
                      <span className="min-w-0 flex-1">{renderOption(option)}</span>
                      <CheckIcon
                        className={cn('ml-auto size-4', optionValue === value ? 'opacity-100' : 'opacity-0')}
                        aria-hidden="true"
                      />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
