'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { docs } from '@/lib/site';
import { cn } from '@/lib/utils';

const groups = [
  {
    title: 'Getting started',
    links: [
      { href: '/', title: 'Introduction' },
      { href: '/docs/changelog', title: 'Changelog' },
    ],
  },
  { title: 'Components', links: docs.map(({ href, title }) => ({ href, title })) },
];

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-14 flex max-h-[calc(100svh-3.5rem)] flex-col gap-6 overflow-y-auto py-12 text-sm">
      {groups.map((group) => (
        <div key={group.title} className="flex flex-col gap-1">
          <span className="text-muted-foreground px-2 pb-1 text-xs font-medium">{group.title}</span>
          {group.links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'rounded-md px-2 py-1.5 transition-colors',
                  active ? 'bg-muted text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
                )}>
                {link.title}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
