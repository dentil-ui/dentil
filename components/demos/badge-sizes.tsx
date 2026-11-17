'use client';

import { Badge } from '@/components/dentil/badge/badge';

export function BadgeSizesDemo() {
  return (
    <div className="flex items-center gap-2">
      <Badge>default</Badge>
      <Badge size="sm">small</Badge>
    </div>
  );
}
