'use client';

import { useState } from 'react';

import { useModal } from '@/components/modals';
import { Button } from '@/components/ui/button';

export function ModalsOverviewDemo() {
  const { openModal } = useModal();
  const [result, setResult] = useState('—');

  // `onConfirm` keeps the modal open with a spinner until the promise settles.
  const archive = async () => {
    const archived = await openModal('confirm', {
      title: 'Archive invoice?',
      description: 'Archived invoices are hidden from the default view. You can restore them later.',
      confirmLabel: 'Archive',
      onConfirm: () => new Promise((resolve) => setTimeout(resolve, 800)),
    });
    setResult(archived === undefined ? 'dismissed' : `archived: ${archived}`);
  };

  // A modal opened from inside another stacks on top. Throwing shows the error inline in the first one.
  const deleteCustomer = async () => {
    const deleted = await openModal('confirm', {
      title: 'Delete customer?',
      description: 'This customer has 3 open invoices. Deleting them needs a second confirmation.',
      confirmLabel: 'Delete',
      destructive: true,
      onConfirm: async () => {
        const voidInvoices = await openModal('confirm', {
          title: 'Also void 3 invoices?',
          description: 'Open invoices will be voided. This cannot be undone.',
          confirmLabel: 'Void and delete',
          destructive: true,
        });
        if (!voidInvoices) throw new Error('Cancelled: the customer was not deleted.');
      },
    });
    setResult(deleted === undefined ? 'dismissed' : `deleted: ${deleted}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex flex-wrap gap-2">
        <Button onClick={archive}>Archive invoice</Button>
        <Button variant="destructive" onClick={deleteCustomer}>
          Delete customer
        </Button>
      </div>
      <span className="text-muted-foreground text-sm">
        Result: <code className="text-foreground">{result}</code>
      </span>
    </div>
  );
}
