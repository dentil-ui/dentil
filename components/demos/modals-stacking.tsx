'use client';

import { useModal } from '@/components/modals';
import { Button } from '@/components/ui/button';

export function ModalsStackingDemo() {
  const { openModal } = useModal();

  const deleteCustomer = () =>
    openModal('confirm', {
      title: 'Delete customer?',
      description: 'This customer has 3 open invoices. Deleting them needs a second confirmation.',
      confirmLabel: 'Delete',
      destructive: true,
      // Runs while the first modal is still open, so the second one stacks on top of it.
      onConfirm: async () => {
        const really = await openModal('confirm', {
          title: 'Also void 3 invoices?',
          description: 'Open invoices will be voided. This cannot be undone.',
          confirmLabel: 'Void and delete',
          destructive: true,
        });
        if (!really) throw new Error('Cancelled: the customer was not deleted.');
      },
    });

  return (
    <Button variant="destructive" onClick={deleteCustomer}>
      Delete customer
    </Button>
  );
}
