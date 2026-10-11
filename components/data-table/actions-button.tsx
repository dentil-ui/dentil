'use client';

import { Ellipsis } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface ActionItem {
  name: string;
  onClick: () => void;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
}

/** The `…` row-actions dropdown. Render it from an `actions` column. */
export function ActionsButton({ actions, label = 'Row actions' }: { actions: ActionItem[]; label?: string }) {
  const [open, setOpen] = useState(false);

  if (actions.length === 0) {
    return null;
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={label}
          onClick={(e) => e.stopPropagation()}
          className="hover:bg-card h-[26px] w-8 hover:shadow-xs">
          <Ellipsis className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.name}
            variant={action.variant || 'default'}
            disabled={action.disabled}
            // onClick (not Radix's onSelect) so this works with both Radix and Base UI shadcn components.
            // Radix fires click for keyboard selection too.
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              // Let the menu close and release pointer-events before the action opens anything (e.g. a dialog).
              setTimeout(() => action.onClick(), 0);
            }}>
            {action.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
