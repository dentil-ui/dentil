'use client';

import { Suspense } from 'react';

import type { ModalDescriptor } from './context';
import { modalRegistry } from './registry';
import { ModalLoading, ModalShell } from './shell';

export function ModalHost({ stack }: { stack: ModalDescriptor[] }) {
  // Closing modals still render (for the exit animation) but don't count towards depth.
  const open = stack.filter((descriptor) => descriptor.open);

  return stack.map((descriptor) => {
    const Content = modalRegistry[descriptor.key];
    const index = open.indexOf(descriptor);
    const depth = index === -1 ? 0 : open.length - 1 - index;

    return (
      <ModalShell
        key={descriptor.id}
        open={descriptor.open}
        depth={depth}
        size={descriptor.size}
        onClose={() => descriptor.close()}>
        <Suspense fallback={<ModalLoading />}>
          <Content {...descriptor.props} modalId={descriptor.id} close={descriptor.close} />
        </Suspense>
      </ModalShell>
    );
  });
}
