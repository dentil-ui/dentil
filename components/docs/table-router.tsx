'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

import { DataTableRouter } from '@/components/data-table/router';

/** The docs site's router, so table demos don't each pass Next.js link props. */
export function DocsTableRouter({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <DataTableRouter linkComponent={Link} onNavigate={router.push} onPrefetch={router.prefetch}>
      {children}
    </DataTableRouter>
  );
}
