'use client';

import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

export type TocSection = readonly [id: string, title: string];

/** A section is current once its heading reaches the top third of the viewport. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) {
        setActive(ids[ids.length - 1]);
        return;
      }
      const threshold = window.innerHeight / 3;
      let current = ids[0];
      for (const id of ids) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= threshold) current = id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ids]);

  return active;
}

export function Toc({ sections }: { sections: readonly TocSection[] }) {
  const [ids] = useState(() => sections.map(([id]) => id));
  const active = useActiveSection(ids);

  return (
    <nav aria-label="On this page" className="flex flex-col gap-3 text-sm">
      <span className="font-medium">On this page</span>
      <ul className="flex flex-col border-l">
        {sections.map(([id, title]) => (
          <li key={id}>
            <a
              href={`#${id}`}
              aria-current={active === id ? 'location' : undefined}
              className={cn(
                '-ml-px block border-l py-1 pl-3 transition-colors',
                active === id
                  ? 'border-foreground text-foreground'
                  : 'text-muted-foreground hover:text-foreground border-transparent'
              )}>
              {title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
