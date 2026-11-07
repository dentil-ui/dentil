'use client';

import type { Table } from '@tanstack/react-table';
import { SlidersHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DataTableDisplayProps<TData> {
  align?: 'start' | 'end';
  table: Table<TData>;
}

function columnLabel<TData>(column: ReturnType<Table<TData>['getAllColumns']>[number]) {
  const header = column.columnDef.header;
  return typeof header === 'string' && header ? header : column.id.replaceAll('_', ' ');
}

/** Dropdown for toggling column visibility. Lists every column where `enableHiding` isn't `false`. */
export function DataTableDisplay<TData>({ table, align = 'end' }: DataTableDisplayProps<TData>) {
  const displayFields = table.getAllColumns().filter((column) => column.getCanHide());
  if (displayFields.length === 0) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="sm" className="h-7 gap-1.5 px-2 text-xs">
          <SlidersHorizontal className="size-3" />
          Display
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-[150px]">
        {displayFields.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            className="capitalize"
            checked={column.getIsVisible()}
            onCheckedChange={(value) => column.toggleVisibility(!!value)}
            // Keeps a Radix menu open after a toggle. Base UI checkbox items stay open anyway and ignore this.
            onSelect={(event) => event.preventDefault()}>
            {columnLabel(column)}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
