'use client';

import {
  endOfDay as toEndOfDay,
  format,
  fromUnixTime,
  getUnixTime,
  isAfter,
  isBefore,
  isValid,
  startOfDay,
} from 'date-fns';
import { CalendarIcon, XIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import {
  defaultSingleDateShortcuts,
  getCycleDate,
  quickSelectOptions,
  type CycleConfig,
  type QuickSelectOption,
  type SingleDateShortcut,
} from './presets';

export type DatePickerMode = 'single' | 'range';
/** `'date'` returns `Date` objects, `'timestamp'` returns unix seconds. */
export type DatePickerReturnFormat = 'date' | 'timestamp';

type Output<F extends DatePickerReturnFormat> = F extends 'date' ? Date : number;

export type DatePickerValue<T extends DatePickerMode, F extends DatePickerReturnFormat = 'date'> = T extends 'single'
  ? Output<F> | undefined
  : { start: Output<F> | undefined; end: Output<F> | undefined };

export interface DatePickerProps<T extends DatePickerMode, F extends DatePickerReturnFormat = 'date'> {
  mode: T;
  returnFormat?: F;
  value: DatePickerValue<T, F> | null | undefined;
  onChange: (value: DatePickerValue<T, F> | undefined) => void;
  placeholder?: string;
  /** A date-fns format string for the trigger label. */
  dateFormat?: string;
  className?: string;
  disabled?: boolean;
  showClear?: boolean;
  align?: 'start' | 'center' | 'end';
  buttonSize?: 'sm' | 'default';
  /** Move a range's end to 23:59:59.999 of its day. */
  endOfDay?: boolean;
  /** Show range presets beside the calendar. */
  showQuickSelect?: boolean;
  presets?: QuickSelectOption[];
  /** Show `shortcuts` and `cycleConfig` cycles beside the single-date calendar. */
  showShortcuts?: boolean;
  shortcuts?: SingleDateShortcut[];
  cycleConfig?: CycleConfig;
  /** A `Date` or unix seconds. Earlier days are disabled. */
  minDate?: Date | number;
  /** A `Date` or unix seconds. Later days are disabled. */
  maxDate?: Date | number;
  /** A `Date` or unix seconds. The month shown on open when there's no value. */
  defaultMonth?: Date | number;
  /** Hold the selection until Apply is clicked. Closing without applying discards it. */
  showApplyButton?: boolean;
}

type Range = { from?: Date; to?: Date };

function toDate(value: Date | number | null | undefined): Date | undefined {
  if (value instanceof Date) return isValid(value) ? value : undefined;
  if (typeof value === 'number' && Number.isFinite(value)) return fromUnixTime(value);
  return undefined;
}

function isInBounds(date: Date, min?: Date, max?: Date) {
  const day = startOfDay(date);
  if (min && isBefore(day, startOfDay(min))) return false;
  if (max && isAfter(day, startOfDay(max))) return false;
  return true;
}

const sideButtonClassName =
  'hover:bg-muted focus-visible:bg-muted w-full rounded-md p-2 text-left text-sm transition-colors outline-none disabled:pointer-events-none disabled:opacity-50';

function QuickSelect({
  presets,
  onSelect,
}: {
  presets: QuickSelectOption[];
  onSelect: (option: QuickSelectOption) => void;
}) {
  return (
    <div className="w-38 border-l p-3">
      {presets.map((option) => (
        <button key={option.value} type="button" onClick={() => onSelect(option)} className={sideButtonClassName}>
          {option.label}
        </button>
      ))}
    </div>
  );
}

function SingleShortcuts({
  shortcuts,
  cycleConfig,
  onSelect,
  minDate,
  maxDate,
  dateFormat,
}: {
  shortcuts: SingleDateShortcut[];
  cycleConfig?: CycleConfig;
  onSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  dateFormat: string;
}) {
  const [customCycles, setCustomCycles] = React.useState('');
  const durationMonths = cycleConfig?.durationMonths ?? 1;
  const cycleLabel = durationMonths === 1 ? 'month' : `${durationMonths} months`;

  const custom = Number.parseInt(customCycles, 10);
  const customDate =
    cycleConfig && custom >= 1 ? getCycleDate(cycleConfig.startDate, custom, durationMonths) : undefined;
  const customValid = !!customDate && isInBounds(customDate, minDate, maxDate);

  const applyCustom = () => {
    if (!customDate || !customValid) return;
    onSelect(customDate);
    setCustomCycles('');
  };

  return (
    <div className="w-46 border-l p-3">
      {shortcuts.length > 0 && (
        <div className="mb-2">
          {shortcuts.map((shortcut) => {
            const date = shortcut.getDate();
            return (
              <button
                key={shortcut.value}
                type="button"
                disabled={!isInBounds(date, minDate, maxDate)}
                onClick={() => onSelect(date)}
                className={sideButtonClassName}>
                {shortcut.label}
              </button>
            );
          })}
        </div>
      )}

      {cycleConfig && (
        <div className={cn(shortcuts.length > 0 && 'border-t pt-2')}>
          <div className="text-muted-foreground mb-1 px-2 text-xs font-medium">Cycles ({cycleLabel})</div>
          {[1, 3, 4, 6, 12].map((cycles) => {
            const date = getCycleDate(cycleConfig.startDate, cycles, durationMonths);
            return (
              <button
                key={cycles}
                type="button"
                disabled={!isInBounds(date, minDate, maxDate)}
                onClick={() => onSelect(date)}
                className={sideButtonClassName}>
                {cycles} cycle{cycles > 1 ? 's' : ''}
                <span className="text-muted-foreground ml-1 text-xs">({format(date, dateFormat)})</span>
              </button>
            );
          })}
          <div className="mt-2 flex gap-1 px-1">
            <Input
              type="number"
              min={1}
              placeholder="24"
              aria-label="Number of cycles"
              value={customCycles}
              onChange={(e) => setCustomCycles(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  applyCustom();
                }
              }}
              className="h-8"
            />
            <Button type="button" size="sm" variant="secondary" disabled={!customValid} onClick={applyCustom}>
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function DatePicker<T extends DatePickerMode, F extends DatePickerReturnFormat = 'date'>({
  mode,
  returnFormat = 'date' as F,
  value,
  onChange,
  placeholder,
  dateFormat = 'd MMM yyyy',
  className,
  disabled = false,
  showClear = true,
  align = 'start',
  buttonSize = 'default',
  endOfDay = true,
  showQuickSelect = false,
  presets = quickSelectOptions,
  showShortcuts = false,
  shortcuts = defaultSingleDateShortcuts,
  cycleConfig,
  minDate,
  maxDate,
  defaultMonth,
  showApplyButton = false,
}: DatePickerProps<T, F>) {
  const [open, setOpen] = React.useState(false);
  const [draftDate, setDraftDate] = React.useState<Date>();
  const [draftRange, setDraftRange] = React.useState<Range>();

  const min = toDate(minDate);
  const max = toDate(maxDate);

  const single = mode === 'single' ? toDate(value as Date | number | undefined) : undefined;
  const rangeValue = mode === 'range' ? (value as { start?: Date | number; end?: Date | number } | null) : null;
  const range: Range = { from: toDate(rangeValue?.start), to: toDate(rangeValue?.end) };

  const out = (date: Date) => (returnFormat === 'timestamp' ? getUnixTime(date) : date) as Output<F>;
  const emit = (next: DatePickerValue<T, F> | undefined) => onChange(next);

  const commitSingle = (date: Date | undefined) => emit((date ? out(date) : undefined) as DatePickerValue<T, F>);
  const commitRange = (from: Date, to: Date) =>
    emit({ start: out(from), end: out(endOfDay ? toEndOfDay(to) : to) } as DatePickerValue<T, F>);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setDraftDate(undefined);
      setDraftRange(range.from ? range : undefined);
    }
    setOpen(next);
  };

  const selectSingle = (date: Date | undefined) => {
    if (showApplyButton) {
      setDraftDate(date);
      return;
    }
    commitSingle(date);
    if (date) setOpen(false);
  };

  const selectRangeDay = (day: Date) => {
    const current = draftRange;
    let next: Range;
    if (!current?.from || current.to) next = { from: day };
    else if (isBefore(day, current.from)) next = { from: day, to: current.from };
    else next = { from: current.from, to: day };

    setDraftRange(next);
    if (next.from && next.to && !showApplyButton) {
      commitRange(next.from, next.to);
      setOpen(false);
    }
  };

  const selectPreset = (option: QuickSelectOption) => {
    const { start, end } = option.getRange();
    setDraftRange({ from: start, to: end });
    if (!showApplyButton) {
      commitRange(start, end);
      setOpen(false);
    }
  };

  const apply = () => {
    if (mode === 'single' && draftDate) commitSingle(draftDate);
    if (mode === 'range' && draftRange?.from && draftRange.to) commitRange(draftRange.from, draftRange.to);
    setOpen(false);
  };

  const clear = () => {
    setDraftDate(undefined);
    setDraftRange(undefined);
    emit(undefined);
  };

  const isEmpty = mode === 'single' ? !single : !range.from && !range.to;
  const canApply = mode === 'single' ? !!draftDate : !!(draftRange?.from && draftRange.to);

  let label: string;
  if (mode === 'single') {
    label = single ? format(single, dateFormat) : (placeholder ?? 'Select a date');
  } else if (range.from && range.to) {
    label = `${format(range.from, dateFormat)} - ${format(range.to, dateFormat)}`;
  } else if (range.from) {
    label = format(range.from, dateFormat);
  } else {
    label = placeholder ?? 'Select a date range';
  }

  const disabledDays = disabled ? true : [...(min ? [{ before: min }] : []), ...(max ? [{ after: max }] : [])];
  const month = toDate(defaultMonth) ?? (mode === 'single' ? single : (draftRange?.from ?? range.from)) ?? min;
  const showClearButton = showClear && !isEmpty && !disabled;

  return (
    <div data-slot="date-picker" className={cn('relative inline-flex', className)}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            size={buttonSize}
            variant="outline"
            disabled={disabled}
            data-empty={isEmpty}
            className={cn(
              'data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal',
              showClearButton && 'pr-9'
            )}>
            <CalendarIcon className="size-4" aria-hidden="true" />
            <span className="flex-1 truncate">{label}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <div className="flex">
            {mode === 'single' ? (
              <Calendar
                mode="single"
                selected={showApplyButton ? (draftDate ?? single) : single}
                onSelect={selectSingle}
                defaultMonth={month}
                disabled={disabledDays}
              />
            ) : (
              <Calendar
                mode="range"
                selected={draftRange ? { from: draftRange.from, to: draftRange.to } : undefined}
                onSelect={(_, day) => selectRangeDay(day)}
                defaultMonth={month}
                disabled={disabledDays}
                numberOfMonths={2}
              />
            )}
            {mode === 'range' && showQuickSelect && <QuickSelect presets={presets} onSelect={selectPreset} />}
            {mode === 'single' && showShortcuts && (shortcuts.length > 0 || cycleConfig) && (
              <SingleShortcuts
                shortcuts={shortcuts}
                cycleConfig={cycleConfig}
                onSelect={(date) => selectSingle(date)}
                minDate={min}
                maxDate={max}
                dateFormat={dateFormat}
              />
            )}
          </div>
          {showApplyButton && (
            <div className="flex justify-end gap-2 border-t p-3">
              <Button type="button" variant="outline" size="sm" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="button" size="sm" disabled={!canApply} onClick={apply}>
                Apply
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
      {showClearButton && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={mode === 'single' ? 'Clear date' : 'Clear date range'}
          onClick={clear}
          className="text-muted-foreground absolute top-1/2 right-1.5 size-6 -translate-y-1/2">
          <XIcon className="size-3.5" />
        </Button>
      )}
    </div>
  );
}

export function SingleDatePicker<F extends DatePickerReturnFormat = 'date'>(
  props: Omit<DatePickerProps<'single', F>, 'mode'>
) {
  return <DatePicker mode="single" {...props} />;
}

export function DateRangePicker<F extends DatePickerReturnFormat = 'date'>(
  props: Omit<DatePickerProps<'range', F>, 'mode'>
) {
  return <DatePicker mode="range" {...props} />;
}

export type { CycleConfig, QuickSelectOption, SingleDateShortcut } from './presets';
export { defaultSingleDateShortcuts, getCycleDate, quickSelectOptions } from './presets';
