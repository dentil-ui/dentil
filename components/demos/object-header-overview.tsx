'use client';

import { Receipt } from 'lucide-react';
import { useState } from 'react';

import { ObjectHeader } from '@/components/dentil/object-header/object-header';

export function ObjectHeaderOverviewDemo() {
  const [copied, setCopied] = useState<string | null>(null);

  return (
    <div className="bg-background w-full max-w-2xl overflow-hidden rounded-lg border">
      <ObjectHeader
        icon={Receipt}
        title="Invoice"
        id="in_1QX4b2Lk9mT8pR7s"
        url
        presence={[
          { id: 'me', name: 'Ada Lovelace' },
          { id: 'u_2', name: 'Grace Hopper' },
          { id: 'u_3', name: 'Alan Turing' },
        ]}
        onCopy={(value) => setCopied(value)}
      />
      <div className="px-5 pt-1 pb-5">
        <h3 className="text-lg leading-9 font-bold">£1,250.00</h3>
        <p className="text-muted-foreground truncate text-sm" aria-live="polite">
          {copied ? `Copied ${copied}` : 'Billed to Ada Lovelace · Due 1 Dec 2026'}
        </p>
      </div>
    </div>
  );
}
