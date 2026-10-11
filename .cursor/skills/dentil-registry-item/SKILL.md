---
name: dentil-registry-item
description: Adds or changes an item in the @dentil shadcn registry — where source files live, the portability rules registry code must follow so it compiles in any consumer app, wiring it into scripts/generate-registry.mjs, tsconfig.registry.json, the README and the docs list in lib/site.ts, and verifying the build and a local install. Use when the user wants to add, publish, rename, split, or change the files or dependencies of a registry component, hook, or block.
---

# Registry Item

Each item's source lives in `components/<item>/`. The docs site imports those files directly, and the registry ships the same files, so there is one copy of the code. `registry.json` and `public/r/*.json` are generated. Never edit them by hand.

## Workflow

```
- [ ] 1. Write the source in components/<item>/
- [ ] 2. Add the item to scripts/generate-registry.mjs
- [ ] 3. Add its folder to tsconfig.registry.json
- [ ] 4. List it in README.md and the docs list in lib/site.ts
- [ ] 5. Write its docs page and demos (dentil-docs-page skill)
- [ ] 6. Verify
```

## 1. Source rules

Registry code is copied into apps you don't control. Write it for the strictest common consumer (Vite's `react-ts` template), which `tsconfig.registry.json` enforces:

| Rule                                                                | Why                                                                                                                                      |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `import type` for type-only imports                                 | `verbatimModuleSyntax`                                                                                                                   |
| No `enum`, `namespace` or constructor parameter properties          | `erasableSyntaxOnly`                                                                                                                     |
| No unused locals or parameters                                      | `noUnusedLocals`, `noUnusedParameters`                                                                                                   |
| No Node globals (`process`, `Buffer`, `node:*`)                     | `types: []`. Consumers may be browser-only                                                                                               |
| No `next/*` imports                                                 | Must work in any React framework. Take a `linkComponent` prop instead (see `DataTableLinkComponent` in `components/data-table/types.ts`) |
| `'use client'` at the top of any file with hooks, state or handlers | Next.js RSC consumers                                                                                                                    |
| React 19 APIs are fine                                              | It's a stated requirement                                                                                                                |

Imports:

- shadcn deps use `@/components/ui/<name>` and `@/lib/utils`. The CLI rewrites these to the consumer's aliases.
- Files in the same item, or in another `@dentil` item, import each other **relatively** (`'./types'`, `'../core/operators'`).
- Only use stock primitive APIs the consumer is likely to have. If you rely on a newer variant (e.g. `Button size="icon-xs"`), the CLI won't overwrite a consumer's older `button.tsx`, so treat that as a known risk and mention it in the docs.

The same source has to work on Radix styles (`new-york`, `radix-*`) and Base UI styles (`base-*`). The docs site uses Radix, so only `test-install.sh` and a Base UI scratch app catch these:

- Use `asChild` only on a stock primitive whose child is a literal JSX element. For `base-*` the CLI rewrites `<X asChild><Child /></X>` into Base UI's `render` prop, but given `{children}` it just deletes `asChild`. It rewrites any element, so never name a prop of your own `asChild` (`TableContextMenu` uses `childAsTrigger`).
- Put a menu label (`DropdownMenuLabel`, `ContextMenuLabel`) inside its `…Group`. Base UI throws otherwise.
- Don't depend on Radix-only props such as `onInteractOutside`, `onEscapeKeyDown` or `onSelect`'s `preventDefault()`. Base UI ignores them and passes a close `reason` to `onOpenChange` instead (see `useDismissal` in `components/sheets/shell.tsx`).
- Style state with both attribute forms (`data-[state=checked]:` and `data-checked:`), and don't use `--radix-*` CSS variables.

Files the consumer is expected to edit (like `components/modals/registry.tsx`) get a short header comment saying what to add and where. Keep their extension point to one line, as the `modalLoaders` map does.

Anything inside the item's folder ships. Example content such as `modals/contents/confirm.tsx` and `sheets/contents/edit-details.tsx` must be genuinely useful to a consumer, not demo-only scaffolding. Demo-only code goes in `components/demos/` or `lib/demo/`.

Vendored code (the filter is adapted from bazza/ui) keeps its original structure. Credit the source in the README row, and scope any ESLint relaxations to its folder in `eslint.config.mjs`.

## 2. Registry entry

In `scripts/generate-registry.mjs`, collect the files (use `walk()` for a whole folder so new files are picked up automatically) and add an item:

```js
{
  name: 'thing',                       // installs as @dentil/thing
  type: 'registry:block',              // or 'registry:hook' for a single hook
  title: 'Thing',
  description: 'One sentence: what it is, then the notable capabilities.',
  dependencies: ['lucide-react'],      // npm packages. Pin a range for anything with breaking majors
  registryDependencies: ['button', 'dialog', '@dentil/data-table'],
  files: thing,
},
```

File types come from the extension: `.ts` is `registry:lib`, `.tsx` is `registry:component`, and a standalone hook is `registry:hook`. `target` equals `path`, so files land at the same path in the consumer's project.

List every shadcn primitive the item imports in `registryDependencies`. Missing ones fail only in a fresh consumer app, never here.

## 3. Strict typecheck

Add `components/<item>/**/*.ts` and `components/<item>/**/*.tsx` to `include` in `tsconfig.registry.json`. Without this, the portability rules above aren't enforced.

## 4. Listings

- `README.md`: a row in the item table with the `@dentil/<name>` and what it installs, plus the docs path.
- `lib/site.ts`: an entry in `docs` (`href`, `title`, `description`, `items`). This drives the header nav, docs sidebar, home cards and the page header, so nothing else needs a link added.
- `lib/agent-skill.md`: the skill users give their coding agent, copied by the home page's "Copy skill" button and served at `/skill.md`. Add the item to its table, plus setup and usage if it needs any. Write `{{SITE_URL}}` for links; it's replaced with `siteConfig.url`.
- If the item needs a provider, decide whether the docs site mounts it in `app/layout.tsx`. Order matters: `SheetProvider` sits inside `ModalProvider` so sheets can open modals.

## 6. Verify

```bash
npm run registry:build && npm run typecheck && npm run lint && npm run build
```

- `registry:build` prints each item with its file count. Check that the new item lists every file you expect in `public/r/<name>.json`.
- Then test a real install with `./scripts/test-install.sh`. It installs every item into fresh Next.js and Vite apps, on a Radix and a Base UI style, and builds them. This is the only check that catches a missing `registryDependencies` entry or a non-relative import between registry files.
- Finish with the `dentil-ui-review` skill for anything visual.

## Changing an existing item

- Add an entry to `lib/changelog.ts` (shown at `/docs/changelog`). Start changes that need consumer edits with "Breaking:".
- Renaming or moving a file changes the consumer's install path. Call it out in the summary and the changelog. Never rename an item: old install commands would break.
- Changing a public type, prop or default means updating the docs page's `PropsTable` rows and inline snippets in the same change, and any matching snippet or rule in `lib/agent-skill.md`. Neither is type-checked.
