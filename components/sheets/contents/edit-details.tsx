'use client';

import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';

import type { SheetContentProps } from '../types';
import { useSheetDraft } from '../use-sheet-draft';

interface Details {
  name: string;
  notes: string;
}

type EditDetailsSheetProps = SheetContentProps<Details> & {
  title?: string;
  description?: string;
  /** Starting values. A retained draft takes precedence. */
  defaultValues?: Partial<Details>;
  /** Extra controls in the footer, for example a button that opens another sheet. */
  actions?: ReactNode;
};

export default function EditDetailsSheet({
  sheetId,
  close,
  title = 'Edit details',
  description,
  defaultValues,
  actions,
}: EditDetailsSheetProps) {
  const [details, setDetails] = useSheetDraft<Details>(sheetId, () => ({
    name: defaultValues?.name ?? '',
    notes: defaultValues?.notes ?? '',
  }));

  return (
    <form
      className="flex flex-1 flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        close(details);
      }}>
      <SheetHeader>
        <SheetTitle>{title}</SheetTitle>
        {description && <SheetDescription>{description}</SheetDescription>}
      </SheetHeader>
      <div className="flex flex-col gap-4 px-4">
        <label className="flex flex-col gap-2 text-sm font-medium">
          Name
          <Input
            value={details.name}
            onChange={(event) => setDetails((prev) => ({ ...prev, name: event.target.value }))}
            required
            autoFocus
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Notes
          <textarea
            value={details.notes}
            onChange={(event) => setDetails((prev) => ({ ...prev, notes: event.target.value }))}
            rows={5}
            className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 rounded-md border bg-transparent px-3 py-2 text-sm font-normal shadow-xs outline-none focus-visible:ring-[3px]"
          />
        </label>
      </div>
      <SheetFooter className="flex-row justify-end">
        {actions && <div className="mr-auto">{actions}</div>}
        <Button type="button" variant="outline" onClick={() => close()}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </SheetFooter>
    </form>
  );
}
