import { codeToHtml } from 'shiki';

import { cn } from '@/lib/utils';

import { Collapsible } from './collapsible';
import { CopyButton } from './copy-button';

/** Code longer than this collapses when `collapsible` is set. */
const COLLAPSE_AFTER_LINES = 20;

export function highlight(code: string, lang: string) {
  return codeToHtml(code, {
    lang,
    themes: { light: 'github-light', dark: 'github-dark' },
    defaultColor: false,
  });
}

export async function CodeBlock({
  code,
  lang = 'tsx',
  title,
  collapsible,
  className,
}: {
  code: string;
  lang?: string;
  title?: string;
  collapsible?: boolean;
  className?: string;
}) {
  const trimmed = code.trim();
  const html = await highlight(trimmed, lang);
  const lines = trimmed.split('\n').length;

  const body = (
    <div
      className="[&_pre]:overflow-x-auto [&_pre]:!bg-transparent [&_pre]:p-4 [&_pre]:pr-12 [&_pre]:text-[13px] [&_pre]:leading-relaxed"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );

  return (
    <div className={cn('bg-muted/40 relative overflow-hidden rounded-lg border', className)}>
      {title ? (
        <div className="text-muted-foreground flex h-9 items-center justify-between gap-2 border-b pr-1 pl-4 font-mono text-xs">
          <span className="truncate">{title}</span>
          <CopyButton value={trimmed} className="shrink-0" />
        </div>
      ) : (
        <CopyButton value={trimmed} className="absolute top-1.5 right-1.5 z-10" />
      )}
      {collapsible && lines > COLLAPSE_AFTER_LINES ? <Collapsible lines={lines}>{body}</Collapsible> : body}
    </div>
  );
}
