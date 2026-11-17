'use client';

import { Badge, type BadgeVariant } from '@/components/dentil/badge/badge';

const variants = [
  'default',
  'secondary',
  'outline',
  'destructive',
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
  'zinc',
] as const satisfies readonly NonNullable<BadgeVariant>[];

export function BadgeColorsDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      {variants.map((variant) => (
        <Badge key={variant} variant={variant}>
          {variant}
        </Badge>
      ))}
    </div>
  );
}
