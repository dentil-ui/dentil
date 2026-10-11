'use client';

import { useState } from 'react';

import { useModal } from '@/components/modals';
import { Button } from '@/components/ui/button';

export function ModalsBasicDemo() {
  const { openModal } = useModal();
  const [result, setResult] = useState<string>('—');

  const archive = async () => {
    const confirmed = await openModal('confirm', {
      title: 'Archive invoice?',
      description: 'Archived invoices are hidden from the default view. You can restore them later.',
      confirmLabel: 'Archive',
      onConfirm: () => new Promise((resolve) => setTimeout(resolve, 800)),
    });
    setResult(confirmed === undefined ? 'dismissed' : String(confirmed));
  };

  return (
    <div className="flex items-center gap-4">
      <Button onClick={archive}>Archive invoice</Button>
      <span className="text-muted-foreground text-sm">
        Result: <code className="text-foreground">{result}</code>
      </span>
    </div>
  );
}
