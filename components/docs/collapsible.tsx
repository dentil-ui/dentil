'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';

/** Caps long code at a fixed height, with a bar to show the rest. */
export function Collapsible({ lines, children }: { lines: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className={cn(!open && 'max-h-80 overflow-hidden')}>{children}</div>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="text-muted-foreground hover:text-foreground flex h-9 w-full items-center justify-center gap-1.5 border-t text-xs font-medium transition-colors">
        {open ? 'Collapse' : `Show all ${lines} lines`}
        <ChevronDown className={cn('size-3.5 transition-transform', open && 'rotate-180')} />
      </button>
    </>
  );
}
