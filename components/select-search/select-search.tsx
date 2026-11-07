'use client';

import { CheckIcon, ChevronDownIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
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
import { cn } from '@/lib/utils';

export interface SelectSearchOption {
  label: string;
  value: string;
  /** Extra terms the search matches, on top of the label and value. */
  keywords?: string[];
  /** Shown before the label, in the list and on the trigger. */
  icon?: React.ReactNode;
}

export type SelectSearchFilter = (value: string, search: string, keywords?: string[]) => number;

export interface SelectSearchProps extends Omit<
  React.ComponentProps<'button'>,
  'value' | 'onChange' | 'children' | 'type'
> {
  options: SelectSearchOption[];
  value: string | null | undefined;
  /** Called with the selected value, or `''` when the selected option is picked again. */
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: React.ReactNode;
  filter?: SelectSearchFilter;
  /**
   * Render `options` in these groups, with a separator between them.
   * The separator hides while searching, and a group hides when none of its options match.
   * `options` is still used for the selected label.
   */
  groups?: SelectSearchOption[][];
}

const defaultFilter: SelectSearchFilter = (value, search, keywords) => {
  const query = search.toLowerCase();
  if (value.toLowerCase().includes(query)) return 1;
  if (keywords?.some((keyword) => keyword.toLowerCase().includes(query))) return 1;
  return 0;
};

export function SelectSearch({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  emptyText = 'No results.',
  filter = defaultFilter,
  groups,
  disabled = false,
  className,
  ...props
}: SelectSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [width, setWidth] = React.useState<number>();
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const selected = value ? options.find((option) => option.value === value) : undefined;
  const lists = groups?.filter((group) => group.length > 0);
  const rendered = lists && lists.length > 0 ? lists : [options];

  const renderOption = (option: SelectSearchOption) => (
    <CommandItem
      key={option.value}
      value={option.value}
      keywords={[option.label, ...(option.keywords ?? [])]}
      onSelect={(current) => {
        onChange(current === value ? '' : current);
        setOpen(false);
      }}>
      {option.icon}
      <span className="truncate">{option.label}</span>
      <CheckIcon
        className={cn('ml-auto size-4', option.value === value ? 'opacity-100' : 'opacity-0')}
        aria-hidden="true"
      />
    </CommandItem>
  );

  const handleOpenChange = (next: boolean) => {
    if (next) setWidth(triggerRef.current?.offsetWidth);
    setOpen(next);
  };

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
          data-slot="select-search"
          className={cn('w-full justify-between px-3 font-normal', className)}
          {...props}>
          <span className={cn('flex min-w-0 items-center gap-2', !selected && 'text-muted-foreground')}>
            {selected?.icon}
            <span className="truncate">{selected ? selected.label : placeholder}</span>
          </span>
          <ChevronDownIcon className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="min-w-48 p-0" style={{ width }} align="start">
        <Command filter={filter}>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            {rendered.map((list, index) => (
              <React.Fragment key={index}>
                {index > 0 && <CommandSeparator />}
                <CommandGroup>{list.map(renderOption)}</CommandGroup>
              </React.Fragment>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
