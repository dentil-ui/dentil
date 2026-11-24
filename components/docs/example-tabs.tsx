'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';

export function ExampleTabs({
  preview,
  code,
  padded = false,
}: {
  preview: React.ReactNode;
  code: React.ReactNode;
  padded?: boolean;
}) {
  const [view, setView] = useState<'preview' | 'code'>('preview');
  return (
    <div className="relative flex flex-col gap-2">
      <div role="tablist" className="flex gap-4 border-b text-sm">
        {(['preview', 'code'] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={view === value}
            onClick={() => setView(value)}
            className={cn(
              '-mb-px border-b-2 border-transparent pb-2 capitalize transition-colors',
              view === value
                ? 'border-foreground text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground'
            )}>
            {value}
          </button>
        ))}
      </div>
      {/*
        Keep the preview mounted so its state survives a peek at the code. It's hidden with `visibility` rather than
        `display: none` and keeps its width, so charts inside never measure 0×0 and Recharts doesn't warn.
      */}
      <div
        aria-hidden={view !== 'preview' || undefined}
        className={cn(
          'bg-background overflow-hidden rounded-lg border',
          padded ? 'p-6' : 'pt-4',
          view !== 'preview' && 'invisible absolute inset-x-0 top-0 max-h-0'
        )}>
        {preview}
      </div>
      <div hidden={view !== 'code'}>{code}</div>
    </div>
  );
}
