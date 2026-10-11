'use client';

import { Loader2 } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import type { ModalContentProps } from '../types';

type ConfirmModalProps = ModalContentProps<boolean> & {
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  /** Runs before the modal closes with `true`. While pending the buttons are disabled; a thrown error is shown inline. */
  onConfirm?: () => Promise<void> | void;
};

export default function ConfirmModal({
  close,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
}: ConfirmModalProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    setError(null);
    setPending(true);
    try {
      await onConfirm?.();
      close(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
      </DialogHeader>
      {error && <p className="text-destructive text-sm">{error}</p>}
      <DialogFooter>
        <Button variant="outline" onClick={() => close(false)} disabled={pending}>
          {cancelLabel}
        </Button>
        <Button variant={destructive ? 'destructive' : 'default'} onClick={confirm} disabled={pending}>
          {pending && <Loader2 className="animate-spin" />}
          {confirmLabel}
        </Button>
      </DialogFooter>
    </>
  );
}
