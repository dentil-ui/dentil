'use client';

import * as React from 'react';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export interface SwitchLabelProps extends React.ComponentProps<typeof Switch> {
  label: React.ReactNode;
  description?: React.ReactNode;
  /** `switch` lines the description up with the control. `label` lines it up with the label text. */
  alignDescription?: 'switch' | 'label';
}

export function SwitchLabel({
  className,
  label,
  description,
  alignDescription = 'switch',
  id: idProp,
  disabled,
  'aria-describedby': ariaDescribedBy,
  ...props
}: SwitchLabelProps) {
  const generatedId = React.useId();
  const id = idProp ?? generatedId;
  const descriptionId = description ? `${id}-description` : undefined;
  const describedBy = [descriptionId, ariaDescribedBy].filter(Boolean).join(' ') || undefined;

  return (
    <div
      data-slot="switch-label"
      data-disabled={disabled ? '' : undefined}
      className={cn('group grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2 gap-y-1', className)}>
      <Switch {...props} className="peer" id={id} disabled={disabled} aria-describedby={describedBy} />
      <Label htmlFor={id} className="min-h-8 cursor-pointer">
        {label}
      </Label>
      {description ? (
        <p
          id={descriptionId}
          className={cn(
            'text-muted-foreground text-sm leading-tight group-data-disabled:opacity-50 peer-disabled:opacity-50',
            alignDescription === 'label' ? 'col-start-2' : 'col-span-2'
          )}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
