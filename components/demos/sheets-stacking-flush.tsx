'use client';

import { useSheet } from '@/components/sheets';
import { Button } from '@/components/ui/button';

const MAX_DEPTH = 3;
const titles = ['Edit invoice', 'Edit line item', 'Edit tax'];

export function SheetsStackingFlushDemo() {
  const { openSheet } = useSheet();

  const openStacked = (depth: number) => {
    void openSheet(
      'edit-details',
      {
        title: titles[depth],
        defaultValues: depth === 0 ? { name: 'INV-0042' } : undefined,
        actions:
          depth < MAX_DEPTH - 1 ? (
            <Button type="button" variant="outline" onClick={() => openStacked(depth + 1)}>
              Open another sheet
            </Button>
          ) : undefined,
      },
      { size: 'lg', multiple: true, stacking: 'flush' }
    );
  };

  return <Button onClick={() => openStacked(0)}>Open flush sheets</Button>;
}
