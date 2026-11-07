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

/** A Lucide-style icon component, or any node such as a flag or a currency symbol. */
export type SelectSearchIcon = React.ReactNode | React.ComponentType<{ className?: string }>;

export interface SelectSearchOption {
  label: string;
  value: string;
  /** Extra terms the search matches, on top of the label and value. */
  keywords?: string[];
  /** Shown before the label, in the list and on the trigger. */
  icon?: SelectSearchIcon;
  /** Muted text after the label, in the list only. Search matches it. */
  description?: string;
  /** Classes for the label. With a description, the label stays a fixed column. */
  labelClassName?: string;
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
  /** Trigger content in place of the selected option's icon and label. */
  renderValue?: (selected: SelectSearchOption | undefined) => React.ReactNode;
  /** Popover alignment against the trigger. */
  align?: 'start' | 'center' | 'end';
  contentClassName?: string;
}

function isIconComponent(icon: SelectSearchIcon): icon is React.ComponentType<{ className?: string }> {
  if (typeof icon === 'function') return true;
  return typeof icon === 'object' && icon !== null && !React.isValidElement(icon) && '$$typeof' in icon;
}

function OptionIcon({ icon }: { icon: SelectSearchIcon }) {
  if (icon == null || typeof icon === 'boolean') return null;
  if (isIconComponent(icon)) {
    const Icon = icon;
    return (
      <span aria-hidden="true" className="text-muted-foreground flex shrink-0 items-center">
        <Icon className="size-4" />
      </span>
    );
  }
  const text = typeof icon === 'string' || typeof icon === 'number';
  return (
    <span
      aria-hidden="true"
      className={cn(
        "text-muted-foreground flex shrink-0 items-center [&_svg:not([class*='size-'])]:size-4",
        text && 'min-w-6 justify-center'
      )}>
      {icon}
    </span>
  );
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
  renderValue,
  align = 'start',
  contentClassName,
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
      keywords={[option.label, ...(option.description ? [option.description] : []), ...(option.keywords ?? [])]}
      onSelect={(current) => {
        onChange(current === value ? '' : current);
        setOpen(false);
      }}>
      {option.icon != null && <OptionIcon icon={option.icon} />}
      {option.description ? (
        <>
          <span className={cn('shrink-0', option.labelClassName)}>{option.label}</span>
          <span className="text-muted-foreground min-w-0 truncate">{option.description}</span>
        </>
      ) : (
        <span className={cn('min-w-0 truncate', option.labelClassName)}>{option.label}</span>
      )}
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
          {renderValue ? (
            renderValue(selected)
          ) : (
            <span className={cn('flex min-w-0 items-center gap-2', !selected && 'text-muted-foreground')}>
              {selected?.icon != null && <OptionIcon icon={selected.icon} />}
              <span className="min-w-0 truncate">{selected ? selected.label : placeholder}</span>
            </span>
          )}
          <ChevronDownIcon className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn('min-w-48 p-0', contentClassName)} style={{ width }} align={align}>
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
