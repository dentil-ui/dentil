'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { docs, siteConfig } from '@/lib/site';
import { cn } from '@/lib/utils';

import { ThemeToggle } from './theme-toggle';

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-5">
        <Link href="/" className="flex items-center gap-2 font-mono text-sm font-semibold">
          <span aria-hidden className="bg-foreground text-background flex size-4 rounded-[4px]">
            <svg viewBox="0 0 16 16" className="size-4">
              <rect x="1" y="4" width="14" height="2" fill="currentColor" />
              <rect x="1" y="7" width="2" height="4" fill="currentColor" />
              <rect x="4" y="7" width="2" height="4" fill="currentColor" />
              <rect x="7" y="7" width="2" height="4" fill="currentColor" />
              <rect x="10" y="7" width="2" height="4" fill="currentColor" />
              <rect x="13" y="7" width="2" height="4" fill="currentColor" />
            </svg>
          </span>
          {siteConfig.name}
        </Link>
        <nav className="flex gap-4 text-sm">
          {docs.map((doc) => {
            const active = pathname.startsWith(doc.href);
            return (
              <Link
                key={doc.href}
                href={doc.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'transition-colors',
                  active ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
                )}>
                {doc.title}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
