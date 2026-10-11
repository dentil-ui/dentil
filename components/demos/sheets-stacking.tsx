'use client';

import { useModal } from '@/components/modals';
import { useSheet } from '@/components/sheets';
import { Button } from '@/components/ui/button';

const MAX_DEPTH = 3;
const titles = ['Edit invoice', 'Edit line item', 'Edit tax'];

export function SheetsStackingDemo() {
  const { openSheet } = useSheet();
  const { openModal } = useModal();

  const openStacked = (depth: number) => {
    const result = openSheet(
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
      // `multiple` lets the same sheet key stack instead of restoring the one already open. Every sheet uses `lg`.
      { size: 'lg', multiple: true }
    );

    void result.then(async (details) => {
      if (details) await openModal('confirm', { title: `Save “${details.name}”?` });
    });
  };

  return <Button onClick={() => openStacked(0)}>Open stacked sheets</Button>;
}
