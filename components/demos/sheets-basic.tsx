'use client';

import { useState } from 'react';

import { useSheet } from '@/components/sheets';
import { Button } from '@/components/ui/button';

export function SheetsBasicDemo() {
  const { openSheet } = useSheet();
  const [result, setResult] = useState('—');

  const edit = async () => {
    const details = await openSheet('edit-details', {
      title: 'Edit customer',
      description: 'Changes are saved when you press Save.',
      defaultValues: { name: 'Acme Ltd', notes: '' },
    });
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
