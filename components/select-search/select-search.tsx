'use client';

import { CheckIcon, ChevronDownIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface SelectSearchOption {
  label: string;
  value: string;
  /** Extra terms the search matches, on top of the label and value. */
  keywords?: string[];
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
  disabled = false,
  className,
  ...props
}: SelectSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [width, setWidth] = React.useState<number>();
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const selected = value ? options.find((option) => option.value === value) : undefined;

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
          <span className={cn('truncate', !selected && 'text-muted-foreground')}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDownIcon className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="min-w-48 p-0" style={{ width }} align="start">
        <Command filter={filter}>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  keywords={[option.label, ...(option.keywords ?? [])]}
                  onSelect={(current) => {
                    onChange(current === value ? '' : current);
                    setOpen(false);
                  }}>
                  <span className="truncate">{option.label}</span>
                  <CheckIcon
                    className={cn('ml-auto size-4', option.value === value ? 'opacity-100' : 'opacity-0')}
                    aria-hidden="true"
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
