import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { docsGroups, getDocsGroup } from '@/lib/site';

/** Every docs page as a card, one grid per group in `docsGroups`. */
export function DocsCards() {
  return (
    <div className="flex flex-col gap-10">
      {docsGroups.map((group) => {
        const id = `group-${group.toLowerCase().replace(/\s+/g, '-')}`;
        return (
          <section key={group} aria-labelledby={id} className="flex flex-col gap-4">
            <h2 id={id} className="text-muted-foreground text-sm font-medium">
              {group}
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {getDocsGroup(group).map((doc) => (
                <Link
                  key={doc.href}
                  href={doc.href}
                  className="group hover:bg-muted/40 flex flex-col gap-3 rounded-xl border p-5 transition-colors">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{doc.title}</h3>
                    <ArrowRight className="text-muted-foreground group-hover:text-foreground size-4 transition-[color,translate] group-hover:translate-x-0.5" />
                  </div>
                  <p className="text-muted-foreground flex-1 text-sm leading-relaxed">{doc.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {doc.items.map((item) => (
                      <code key={item} className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">
                        {item}
                      </code>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
