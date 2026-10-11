# dentil

A [shadcn](https://ui.shadcn.com/docs/registry) registry of production dashboard primitives, published under the `@dentil` namespace.

| Item                           | What it installs                                                                                                                                                                                                                      |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@dentil/data-table`           | `DataTable` with row links, server-side sorting, offset or cursor pagination, tabs, column visibility, context menus, split view, expandable rows and cross-page selection, plus `ActionsButton`, `DateCell` and the table primitives |
| `@dentil/data-table-filter`    | `DataTableFilters`, a Linear-style filter bar (text, option, multi-option, number, date, async options) adapted from [bazza/ui](https://ui.bazza.dev)                                                                                 |
| `@dentil/data-table-url-state` | `useTableQueryState`, which syncs the table query to the URL                                                                                                                                                                          |
| `@dentil/modals`               | `ModalProvider` and `useModal`: a promise-based modal registry (`await openModal(key, props)` returns a typed result) with lazy-loaded contents and stacking                                                                          |
| `@dentil/sheets`               | `SheetProvider`, `useSheet` and `useSheetDraft`: the same registry for side sheets, plus minimize-to-dock and draft retention                                                                                                         |

## Using the registry

Add the namespace to your project's `components.json`:

```json
{
  "registries": {
    "@dentil": "https://dentil.dev/r/{name}.json"
  }
}
```

Then install:

```bash
npx shadcn@latest add @dentil/data-table @dentil/data-table-filter
```

Or skip the config and install by URL:

```bash
npx shadcn@latest add https://dentil.dev/r/data-table.json
```

Files are written to `components/data-table/` (or `src/components/data-table/`). Requirements: React 19, Tailwind v4 and `@tanstack/react-table` v8. Any shadcn style works, whether it's built on Radix (`new-york`, `radix-*`) or Base UI (`base-*`).

Docs and live demos are at `/docs/data-table`, `/docs/modals` and `/docs/sheets`. The [changelog](https://dentil.dev/docs/changelog) lists what changed in each item. Agents can read [`/llms.txt`](https://dentil.dev/llms.txt) and [`/skill.md`](https://dentil.dev/skill.md).

## Development

```bash
npm install
npm run dev              # docs site on http://localhost:3000
npm run registry:build   # regenerate registry.json and public/r/*.json
npm run typecheck        # app typecheck + strict registry typecheck (tsconfig.registry.json)
npm run lint
./scripts/test-install.sh  # install every item into fresh Radix and Base UI apps (Next.js and Vite), then build them
```

- **Sources** live in `components/data-table/`, `components/modals/` and `components/sheets/`. The docs site imports them directly, and the registry ships the same files.
- **`registry.json` is generated** by `scripts/generate-registry.mjs`. Add new files or items there, not by hand.
- **`tsconfig.registry.json`** compiles the registry code with the strictest common consumer settings (`noUnusedLocals`, `verbatimModuleSyntax`, no Node types, as in Vite's template). Code that passes here compiles in fresh Vite and Next apps.
- **Imports inside registry files**: use `@/components/ui/*` and `@/lib/utils` for shadcn deps (the CLI rewrites them to the consumer's aliases), and relative imports between registry files.
- **Demos** in `components/demos/` are rendered next to their own source on the docs page.
- **Changelog**: consumers own their copy and get no version bumps, so add an entry to `lib/changelog.ts` for any change to a registry file. Start changes that need consumer edits with "Breaking:". Never rename an item or move its URL.

### Testing an install locally

`./scripts/test-install.sh` builds the registry, serves `public/` on port 4321 and installs every item into four fresh apps scaffolded by `shadcn init` (Next.js and Vite, each with a Radix and a Base UI style), then runs each app's build. It needs Python 3 for the static server. CI runs it on every push and pull request, and weekly, since `shadcn@latest` and its templates change on their own.

To try an install by hand, serve `public/` and point a scratch app's `components.json` at `"@dentil": "http://127.0.0.1:4321/r/{name}.json"`. Use `127.0.0.1` rather than `localhost`, which Node resolves to IPv6.

## Deploying

The site is hosted at [dentil.dev](https://dentil.dev), which is the default for both URLs below. `npm run build` regenerates the registry before building the site. Override only for previews or other hosts:

- `NEXT_PUBLIC_SITE_URL`: the public URL, shown in the docs' setup snippet
- `REGISTRY_HOMEPAGE`: the same URL, written into `registry.json`

## License

MIT. The filter in `components/data-table/filter/` is adapted from [bazza/ui](https://github.com/bazzalabs/ui) (MIT), and its license ships with it as `LICENSE.md`.
