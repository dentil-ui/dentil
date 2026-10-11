'use client';

import { Suspense } from 'react';

import type { SheetDescriptor } from './context';
import { sheetRegistry } from './registry';
import { SheetLoading, SheetShell } from './shell';

export function SheetHost({ stack, onMinimize }: { stack: SheetDescriptor[]; onMinimize: (id: string) => void }) {
  // Minimized sheets unmount; closing sheets still render (for the exit animation) but don't count towards depth.
  const visible = stack.filter((descriptor) => !descriptor.minimized);
  const open = visible.filter((descriptor) => descriptor.open);

  return visible.map((descriptor) => {
    const Content = sheetRegistry[descriptor.key];
    const index = open.indexOf(descriptor);
    const depth = index === -1 ? 0 : open.length - 1 - index;

    return (
      <SheetShell
        key={descriptor.id}
        descriptor={descriptor}
        depth={depth}
        onMinimize={() => onMinimize(descriptor.id)}>
        <Suspense fallback={<SheetLoading />}>
          <Content {...descriptor.props} sheetId={descriptor.id} close={descriptor.close} />
        </Suspense>
      </SheetShell>
    );
  });
}
