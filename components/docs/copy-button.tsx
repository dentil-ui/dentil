'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';

export function CopyButton({ value, onCopy, className }: { value: string; onCopy?: () => void; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={copied ? 'Copied' : 'Copy to clipboard'}
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        onCopy?.();
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className={cn(
        'text-muted-foreground hover:text-foreground hover:bg-muted inline-flex size-7 items-center justify-center rounded-md transition-colors',
        className
      )}>
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </button>
  );
}
