# Patterns

## Registry component root

```tsx
'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

export function ThingBar({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="thing-bar" className={cn('flex items-center gap-2 text-sm', className)} {...props} />;
}
```

## Floating element (dock, toast-like bar)

```tsx
<div
  data-slot="thing-dock"
  className="bg-card text-card-foreground flex items-center gap-2 rounded-md border py-1.5 pr-1.5 pl-3 shadow-lg">
  …
</div>
```

If it sits over a modal sheet, add `pointer-events-auto` (Radix disables pointer events on the body) and add its `data-slot` to `STACKED_OVERLAY_SELECTOR` in `components/sheets/shell.tsx` so clicking it doesn't dismiss the sheet.

## Icon button

```tsx
<Button variant="ghost" size="icon-xs" aria-label={`Close ${label}`} onClick={onClose}>
  <X />
</Button>
```

## Error state

Copy `ModalErrorBoundary` from `components/modals/shell.tsx`. The visual is:

```tsx
<div role="alert" className="flex min-h-40 flex-col items-center justify-center gap-3 text-center">
  <div className="bg-destructive/10 text-destructive flex size-9 items-center justify-center rounded-full">
    <AlertTriangle className="size-4" />
  </div>
  <div className="flex flex-col gap-1">
    <p className="text-sm font-medium">This failed to render</p>
    <p className="text-muted-foreground max-w-md text-xs">{error.message}</p>
  </div>
  <div className="flex items-center gap-2">
    <Button size="sm" variant="outline">
      <RefreshCw className="size-3.5" />
      Try again
    </Button>
    <Button size="sm" variant="ghost">
      Dismiss
    </Button>
  </div>
</div>
```

Inside a dialog or sheet, the title and message must be `DialogTitle` / `DialogDescription` (or the sheet equivalents) so screen readers announce them.

## Receding stacked overlay

```tsx
style={{
  scale: depth > 0 ? 1 - depth * 0.03 : undefined,
  marginTop: depth > 0 ? depth * -12 : undefined,
  transformOrigin: 'top center',
  transition: 'scale 200ms ease-out, margin-top 200ms ease-out',
}}
```

Use `scale`, not `transform: scale()`. The stock content owns `transform` for its enter animation.

## Docs page skeleton

Use the shared shell in `components/docs/page-shell.tsx`. Don't redefine its helpers per page.

```tsx
import { A, C, DocsPage, P, Section, SubSection } from '@/components/docs/page-shell';

<DocsPage
  href="/docs/thing"
  sections={sections}
  lead={
    <>
      What it does, with <C>keyApi()</C>.
    </>
  }>
  <Section id="installation" title="Installation">
    …
  </Section>
</DocsPage>;
```

- `DocsPage` takes the title and registry chips from the page's `docs` entry in `lib/site.ts`, and renders both "On this page" navs from `sections`.
- `Section` gives the `h2` a hover `#` anchor and `scroll-mt-20` to clear the sticky header.
- `SubSection` children are optional (a description alone is fine).
- `A` is the inline prose link. Internal paths go through `next/link`.

## Steps

For ordered instructions (setup, "Adding a modal"), use `Steps` / `Step` from `components/docs/steps.tsx` rather than numbering titles by hand. The numbered markers and connecting rule come from CSS counters.

```tsx
<Steps>
  <Step title="Register it" description="Keys, props and return types are inferred from the loader.">
    <CodeBlock code={REGISTER} />
  </Step>
</Steps>
```

## Long code

`<CodeBlock collapsible />` caps code over 20 lines at `max-h-80` with a "Show all N lines" bar. There's no gradient fade. `SourceFile` always collapses. Leave short snippets and `Example` code tabs uncollapsed.

## Home card

```tsx
<Link href={href} className="group hover:bg-muted/40 flex flex-col gap-3 rounded-xl border p-5 transition-colors">
  <div className="flex items-center justify-between">
    <h3 className="font-medium">{title}</h3>
    <ArrowRight className="text-muted-foreground group-hover:text-foreground size-4 transition-[color,translate] group-hover:translate-x-0.5" />
  </div>
  <p className="text-muted-foreground flex-1 text-sm leading-relaxed">{description}</p>
</Link>
```

The home page renders one card per `docs` entry in a `md:grid-cols-3` grid, directly under the hero.

## Registry name chip

```tsx
<code className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">@dentil/thing</code>
```

## Demo result readout

Demos that resolve a promise show the result inline:

```tsx
<span className="text-muted-foreground text-sm">
  Result: <code className="text-foreground">{result}</code>
</span>
```
