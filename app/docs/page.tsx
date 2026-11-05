import type { Metadata } from 'next';

import { DocsCards } from '@/components/docs/docs-cards';
import { P } from '@/components/docs/page-shell';

export const metadata: Metadata = {
  title: 'Components',
  description: 'Every @dentil registry item, with setup steps, live examples and an API reference for each.',
};

export default function ComponentsPage() {
  return (
    <main className="flex min-w-0 flex-col gap-10 py-12">
      <header className="flex max-w-2xl flex-col gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Components</h1>
        <P>
          Each page covers one registry item: how to install it, live examples you can copy, and its API reference.
          Install only the items you need with the shadcn CLI.
        </P>
      </header>
      <DocsCards />
    </main>
  );
}
