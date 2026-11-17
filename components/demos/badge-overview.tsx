'use client';

import { Badge } from '@/components/dentil/badge/badge';

export function BadgeOverviewDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="green">paid</Badge>
      <Badge variant="blue">open</Badge>
      <Badge variant="amber">past due</Badge>
      <Badge variant="red">failed</Badge>
      <Badge variant="zinc">void</Badge>
      <Badge variant="green" size="sm">
        active
      </Badge>
      <Badge variant="outline" asChild>
        <a href="#examples">draft</a>
      </Badge>
    </div>
  );
}
