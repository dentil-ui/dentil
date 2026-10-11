'use client';

import { useSheet } from '@/components/sheets';
import { Button } from '@/components/ui/button';

export function SheetsMinimizeDemo() {
  const { openSheet } = useSheet();

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        onClick={() =>
          openSheet('edit-details', { title: 'Draft a note' }, { minimizable: true, title: 'Note draft' })
        }>
        Minimizable sheet
      </Button>
      <Button
        variant="outline"
        onClick={() => openSheet('edit-details', { title: 'New customer' }, { retainDraft: true })}>
        Sheet that keeps its draft
      </Button>
    </div>
  );
}
