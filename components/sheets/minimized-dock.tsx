'use client';

import { Minus, X } from 'lucide-react';

import { Button } from '@/components/ui/button';

import type { SheetDescriptor } from './context';
import { sheetMaxWidths } from './shell';

/** `billing.invoices-create` → `Billing invoices create` */
function humanize(key: string) {
  const text = key
    .split(/[.\-_]/)
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

interface MinimizedSheetsDockProps {
  stack: SheetDescriptor[];
  onRestore: (id: string) => void;
}

export function MinimizedSheetsDock({ stack, onRestore }: MinimizedSheetsDockProps) {
  const minimized = stack.filter((sheet) => sheet.minimized && sheet.open);
  if (minimized.length === 0) return null;

  // Sit beside the open sheet rather than underneath it. The stock sheet is 75vw wide up to its max width.
  const top = [...stack].reverse().find((sheet) => !sheet.minimized && sheet.open);
  const width = top ? sheetMaxWidths[top.size] : 0;
  const right = !top ? '1rem' : width === Infinity ? 'calc(75vw + 1rem)' : `calc(min(75vw, ${width}px) + 1rem)`;

  // Number repeated titles so they can be told apart.
  const seen = new Map<string, number>();
  const labelled = minimized.map((sheet) => {
    const title = sheet.title ?? humanize(sheet.key);
    const count = seen.get(title) ?? 0;
    seen.set(title, count + 1);
    return { sheet, label: count === 0 ? title : `${title} (${count + 1})` };
  });

  return (
    <div
      data-slot="sheet-dock"
      // Modal sheets disable pointer events on the body, so the dock opts back in.
      className="pointer-events-auto fixed bottom-4 z-50 flex flex-col gap-2 transition-[right] duration-200"
      style={{ right }}>
      {labelled.map(({ sheet, label }) => (
        <div
          key={sheet.id}
          className="bg-card text-card-foreground flex items-center gap-2 rounded-md border py-1.5 pr-1.5 pl-3 shadow-lg transition-shadow hover:shadow-xl">
          <button
            type="button"
            onClick={() => onRestore(sheet.id)}
            className="flex flex-1 items-center gap-2 text-left text-sm font-medium">
            <Minus className="text-muted-foreground size-4" />
            {label}
          </button>
          <Button
            variant="ghost"
            size="icon-xs"
            className="hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Close ${label}`}
            onClick={() => sheet.close()}>
            <X />
          </Button>
        </div>
      ))}
    </div>
  );
}
