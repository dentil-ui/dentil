import { ChevronDown } from 'lucide-react';
import Link from 'next/link';

import { getDocsEntry } from '@/lib/site';

import { Toc, type TocSection } from './toc';

/** Frame for a docs page: header with the page's registry items, content, and the "On this page" nav. */
export function DocsPage({
  href,
  lead,
  demo,
  sections,
  children,
}: {
  /** The page's entry in `docs` (lib/site.ts), which supplies the title and registry items. */
  href: string;
  lead: React.ReactNode;
  /** A live `Example` under the header that shows off the component's main features. */
  demo?: React.ReactNode;
  /** Every `Section` id on the page, in order. */
  sections: readonly TocSection[];
  children: React.ReactNode;
}) {
  const { title, items } = getDocsEntry(href);

  return (
    <div className="grid gap-10 py-12 xl:grid-cols-[minmax(0,1fr)_180px]">
      <main className="flex min-w-0 flex-col gap-14">
        <div className="flex flex-col gap-8">
          <header className="flex flex-col gap-4">
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
            <P>{lead}</P>
            <div className="flex flex-wrap gap-1.5">
              {items.map((item) => (
                <code key={item} className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">
                  {item}
                </code>
              ))}
            </div>
            <details className="group rounded-lg border text-sm xl:hidden">
              <summary className="flex h-10 cursor-pointer list-none items-center justify-between px-4 font-medium [&::-webkit-details-marker]:hidden">
                On this page
                <ChevronDown className="text-muted-foreground size-4 transition-transform group-open:rotate-180" />
              </summary>
              <ul className="flex flex-col border-t px-4 py-2">
                {sections.map(([id, sectionTitle]) => (
                  <li key={id}>
                    <a href={`#${id}`} className="text-muted-foreground hover:text-foreground block py-1.5">
                      {sectionTitle}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          </header>
          {demo}
        </div>
        {children}
      </main>
      <aside className="hidden xl:block">
        <div className="sticky top-26">
          <Toc sections={sections} />
        </div>
      </aside>
    </div>
  );
}

export function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="flex scroll-mt-20 flex-col gap-4">
      <h2 className="text-xl font-semibold tracking-tight">
        <a href={`#${id}`} className="group inline-flex items-baseline gap-2">
          {title}
          <span
            aria-hidden
            className="text-muted-foreground font-normal opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            #
          </span>
        </a>
      </h2>
      {children}
    </section>
  );
}

export function SubSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h3 className="font-medium">{title}</h3>
        {description && <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground leading-relaxed text-pretty">{children}</p>;
}

export function C({ children }: { children: React.ReactNode }) {
  return <code className="bg-muted text-foreground rounded px-1 py-0.5 font-mono text-[0.85em]">{children}</code>;
}

/** Inline link inside prose. Internal paths use client-side navigation. */
export function A({ href, children }: { href: string; children: React.ReactNode }) {
  const className =
    'text-foreground decoration-muted-foreground/40 hover:decoration-foreground underline underline-offset-4 transition-colors';
  return href.startsWith('/') ? (
    <Link href={href} className={className}>
      {children}
    </Link>
  ) : (
    <a href={href} className={className}>
      {children}
    </a>
  );
}
