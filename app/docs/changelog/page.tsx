import type { Metadata } from 'next';

import { InstallCommand } from '@/components/docs/install-command';
import { C, P } from '@/components/docs/page-shell';
import { changelog } from '@/lib/changelog';

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'What changed in each @dentil registry item, and how to pull changes into your copy.',
};

const dateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' });

/** Renders `backtick` spans in a changelog line as inline code. */
function Change({ text }: { text: string }) {
  return text.split(/`([^`]+)`/).map((part, index) => (index % 2 ? <C key={index}>{part}</C> : part));
}

export default function ChangelogPage() {
  return (
    <main className="flex max-w-3xl min-w-0 flex-col gap-14 py-12">
      <header className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Changelog</h1>
        <P>
          The shadcn CLI copies files into your project and doesn&apos;t track versions, so updates don&apos;t reach you
          on their own. To see how your copy differs from the latest, run <C>add</C> with <C>--diff</C>. It changes
          nothing. Re-run without it, plus <C>--overwrite</C>, to replace your files, then reapply any local edits.
        </P>
        <InstallCommand items={['@dentil/data-table', '--diff']} />
      </header>

      <ol className="flex flex-col gap-12">
        {changelog.map((entry) => (
          <li key={`${entry.date}-${entry.title}`} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <time dateTime={entry.date} className="text-muted-foreground font-mono text-xs">
                {dateFormat.format(new Date(entry.date))}
              </time>
              <h2 className="text-xl font-semibold tracking-tight">{entry.title}</h2>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {entry.items.map((item) => (
                <code key={item} className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">
                  {item}
                </code>
              ))}
            </div>
            <ul className="text-muted-foreground flex list-disc flex-col gap-2 pl-5 leading-relaxed">
              {entry.changes.map((change) => (
                <li key={change}>
                  <Change text={change} />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </main>
  );
}
