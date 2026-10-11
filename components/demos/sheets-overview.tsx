'use client';

import { useRef, useState } from 'react';

import { useSheet } from '@/components/sheets';
import { Button } from '@/components/ui/button';

export function SheetsOverviewDemo() {
  const { openSheet } = useSheet();
  const [result, setResult] = useState('—');
  const pending = useRef<Promise<unknown> | null>(null);

  const edit = async () => {
    const request = openSheet(
      'edit-details',
      {
        title: 'Edit customer',
        description: 'Click outside to minimize this sheet to the dock. Your edits are kept.',
        defaultValues: { name: 'Acme Ltd' },
        actions: (
          <Button
            type="button"
            variant="outline"
            // `multiple` stacks a second sheet with the same key instead of restoring this one.
            onClick={() => openSheet('edit-details', { title: 'Add contact' }, { multiple: true })}>
            Add contact
          </Button>
        ),
      },
      { size: 'md', minimizable: true, title: 'Acme Ltd' }
    );
    // Clicking again while the sheet is minimized restores it and returns the same promise.
    if (pending.current === request) return;
    pending.current = request;

    const details = await request;
    pending.current = null;
    setResult(details ? JSON.stringify(details) : 'dismissed');
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button onClick={edit}>Edit customer</Button>
      <span className="text-muted-foreground text-sm">
        Result: <code className="text-foreground">{result}</code>
      </span>
    </div>
  );
}
