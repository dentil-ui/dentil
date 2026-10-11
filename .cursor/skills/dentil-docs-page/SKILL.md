---
name: dentil-docs-page
description: Writes or edits a dentil docs page and its live demos — the page structure under app/docs, the "On this page" sections, inline code snippets, live Example demos that show their own source, PropsTable API references, demo data, and the docs' plain technical voice. Use when the user wants to document a registry item, add or change an example or demo, update an API reference, or edit copy on the docs site or home page.
---

# Docs Page

Each registry item has one page at `app/docs/<item>/page.tsx`, built from the shared shell in `components/docs/page-shell.tsx` (`DocsPage`, `Section`, `SubSection`, `P`, `C`, `A`). `app/docs/modals/page.tsx` is the reference. The page is a server component, which lets `Example` and `SourceFile` read files from disk.

First add the page to `docs` in `lib/site.ts` (`href`, `title`, one-line `description`, registry `items`). That one entry puts it in the header nav, the docs sidebar and the home page cards, and `DocsPage` reads its title and registry chips from it.

## Page shape

```tsx
export const metadata: Metadata = {
  title: 'Thing', // rendered as "Thing · dentil"
  description: 'One sentence, same idea as the registry description.',
};

const sections = [
  ['installation', 'Installation'],
  ['setup', 'Setup'],
  ['usage', 'Usage'],
  ['adding', 'Adding a thing'],
  ['examples', 'Examples'],
  ['api', 'API reference'],
] as const;
```

Section order: **Installation, Setup** (only if there's a provider), **Usage, Adding a …** (only for registry-style items you extend), **Examples**, then feature sections (e.g. Filters, Drafts), and **API reference** last. Every `<Section id>` must appear in `sections` and vice versa, because `sections` drives the sticky "On this page" nav.

```tsx
export default function ThingPage() {
  return (
    <DocsPage
      href="/docs/thing"
      sections={sections}
      lead={
        <>
          One sentence naming the key API in <C>openThing()</C>.
        </>
      }>
      <Section id="installation" title="Installation">
        …
      </Section>
    </DocsPage>
  );
}
```

Pass `demo={<Example file="<item>-overview.tsx">…</Example>}` to `DocsPage` for a live showcase right under the header. It isn't a `Section`, so it stays out of `sections`. Make it one demo that combines the item's headline features (the data table's is `overview.tsx`), and keep single-feature demos for Examples.

The `lead` is one paragraph that says what the thing does and names its key API in `C`. Ordered instructions ("Adding a modal") use `Steps` / `Step` from `components/docs/steps.tsx`, not titles numbered by hand. Installation is `<InstallCommand items={['@dentil/<item>']} />` (optional `title`), never a hand-written `npx` `CodeBlock`. It shows pnpm, npm, yarn and bun tabs and remembers the reader's choice across blocks, pages and visits. After it comes one `P` saying where the files land, which stock shadcn components it uses, and any requirements.

## Three ways to show code

| Use                                          | When                                                                                                                                                                              |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<Example file="x.tsx" padded?>`             | A live demo. Renders `components/demos/x.tsx` beside its own source, so the code shown is the code running. Set `padded` when the demo doesn't fill the frame (a row of buttons). |
| `<SourceFile file="lib/demo/columns.tsx" />` | Showing a real repo file verbatim, e.g. shared column definitions.                                                                                                                |
| `<CodeBlock code={SNIPPET} />`               | Setup, usage and "adding" steps that show code in the consumer's app. Pass `lang="bash"` or `"json"` when needed, and `title` for a file label.                                   |

Inline snippets are `SCREAMING_CASE` template-literal consts at the top of the page. `CodeBlock` trims them. Escape backticks inside as `` \` ``. They show consumer paths (`@/components/modals`), start with a `// path/to/file.tsx` comment when the file matters, and use `// ← the only line to add` style markers sparingly.

Inline snippets are **not type-checked**. Keep them short, and move anything long or fiddly into a demo or `SourceFile`, which are compiled.

## Demos

- One file per example in `components/demos/`, named `<item>-<variant>.tsx` (the data-table demos predate this and are unprefixed).
- `'use client'`, a single named export `<Item><Variant>Demo`, and no props.
- Write it as code a reader would copy: realistic labels, no docs-only hacks, and nothing that only makes sense on this site. The source is shown verbatim in the Code tab.
- Use the shared fixtures in `lib/demo/` (`invoices.ts`, `columns.tsx`) for table data rather than inventing new datasets.
- Fake latency with `new Promise((resolve) => setTimeout(resolve, 800))` so loading states are visible.
- When the demo resolves a value, show it with the `Result: <code>…</code>` readout from the design system patterns.
- If a demo needs a new modal or sheet content, remember that `components/modals/contents/` and `components/sheets/contents/` ship to consumers (see the `dentil-registry-item` skill).

## API reference

One `SubSection` per hook, component, options object or injected props type, each with a `PropsTable`:

```tsx
const optionsRows: PropRow[] = [
  {
    name: 'size',
    type: "'default' | 'md' | 'lg' | 'xl' | 'full'",
    default: "'default'",
    description: 'Max width from the sm breakpoint: 32rem (stock dialog), 36rem, 42rem, 48rem or 56rem.',
  },
];
```

- `type` is the TypeScript signature as a reader would write it: `'(key, props?, options?) => Promise<Return | undefined>'`.
- `default` is the code literal, quoted as code (`"'default'"`, `'false'`). Omit it when there's none and the table shows a dash.
- `description` is one or two sentences of behaviour: what it does, when it's called, and what `undefined` means. Use a JSX fragment with `<code>` for inline identifiers.
- Keep row order in the same order as the type definition.

## Voice

Plain, direct and technical. Second person. Short sentences. Describe behaviour and consequences, not benefits.

- Lead with what happens: "Wrap your app once in `ModalProvider`. It renders the modal stack itself, so there's nothing else to mount."
- Name the exact API in `C` rather than paraphrasing it.
- Say what a reader must do and what they don't need to do. Skip marketing words ("powerful", "seamless", "blazing").
- Example descriptions say what to try: "Dismiss with Esc to see the undefined result."
- Escape apostrophes in JSX text as `&apos;` (ESLint `react/no-unescaped-entities`), or use `’`.
- Identifiers and API names use US spelling (`minimize`, `center`) to match React, Radix and shadcn.

## Home page and README

When an item's capabilities change, update its one-line description in all three places: the registry entry in `scripts/generate-registry.mjs`, the `docs` entry in `lib/site.ts`, and the README table. Keep them saying the same thing.

The "Copy skill" button, the first option in the home page's "Get started" section, copies `lib/agent-skill.md`, which is also served at `/skill.md`. When a docs page's setup or usage snippets change, update the matching part of that file.

## Verify

```bash
npm run typecheck && npm run lint && npm run build
```

Then check the page with the `dentil-ui-review` skill: both tabs of every `Example`, the "On this page" links, and dark mode.
