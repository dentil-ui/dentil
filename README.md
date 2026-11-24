# dentil

A [shadcn](https://ui.shadcn.com/docs/registry) registry of production dashboard primitives, published under the `@dentil` namespace.

| Item                           | What it installs                                                                                                                                                                                                                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `@dentil/data-table`           | `DataTable` with row links, server-side sorting, offset or cursor pagination, tabs, column visibility, context menus, split view, expandable rows and cross-page selection, plus `ActionsButton`, `DateCell` and the table primitives                                                      |
| `@dentil/data-table-filter`    | `DataTableFilters`, a Linear-style filter bar (text, option, multi-option, number, date, async options) adapted from [bazza/ui](https://ui.bazza.dev)                                                                                                                                      |
| `@dentil/data-table-url-state` | `useTableQueryState`, which syncs the table query to the URL                                                                                                                                                                                                                               |
| `@dentil/modals`               | `ModalProvider` and `useModal`: a promise-based modal registry (`await openModal(key, props)` returns a typed result) with lazy-loaded contents and stacking                                                                                                                               |
| `@dentil/sheets`               | `SheetProvider`, `useSheet` and `useSheetDraft`: the same registry for side sheets, plus minimize-to-dock and draft retention                                                                                                                                                              |
| `@dentil/date-picker`          | `DatePicker`, `SingleDatePicker` and `DateRangePicker`: single-date and range picker with range presets, date shortcuts, billing cycles, min and max dates, an Apply step, and `Date` or unix timestamp values                                                                             |
| `@dentil/date`                 | `Date`, a compact date formatted in a time zone you supply. Accepts unix seconds, milliseconds, ISO strings or `Date`. `showTimezone` underlines the date and opens that zone beside UTC, plus `formatDate` and `toDate`                                                                   |
| `@dentil/object-timeline`      | `ObjectTimeline`, a vertical event list with an icon, title, description, date and an optional action on the title                                                                                                                                                                         |
| `@dentil/object-header`        | `ObjectHeader`, a record page header row with the object type and icon, stacked avatars for the people viewing the record, and copy buttons for the page URL and the object ID, plus `ObjectHeaderCopyButton` and `ObjectHeaderPresence`                                                   |
| `@dentil/description-list`     | `Descriptions`, term and detail pairs in one or two columns built from an array, with links, copy buttons, a "Show more" section and a vertical layout, plus the `DescriptionList`, `DescriptionTerm` and `DescriptionDetails` primitives                                                  |
| `@dentil/invoice-table`        | `InvoiceTable`, an invoice line items table with optional quantity, unit price and tax columns, prorated lines, grouped plan changes, a totals footer, and an optional per-line allocation column for credit notes and part payments, plus `formatInvoiceAmount` and `formatInvoicePeriod` |
| `@dentil/badge`                | `Badge`, a small status label with theme-aware default, secondary, outline and destructive variants, fixed color variants from red to zinc, and a compact size                                                                                                                             |
| `@dentil/charts`               | `LineChart` and `CategoryBarChart`, dashboard metric charts on Recharts with a headline, a period-over-period change badge, previous-period comparison lines that stop at today, and a "View more" footer, plus the `Chart` parts, `getPercentChange` and `useInViewFetch`                 |
| `@dentil/dashboard-layout`     | `DashboardContainer`, `DashboardHeader`, `DashboardGrid`, `DashboardSplit` and the section and table headers: page layout blocks for a dashboard where tables, splits and sidebars share a 1px border                                                                                      |
| `@dentil/json-viewer`          | `JsonViewer`, a collapsible JSON tree in your theme tokens, with object IDs rendered as links and the date behind unix timestamps on hover, plus `isTimestamp` and `parseTimestamp`                                                                                                        |
| `@dentil/select-search`        | `SelectSearch`, a searchable single-select combobox built on Popover and Command                                                                                                                                                                                                           |
| `@dentil/async-select`         | `AsyncSelect`, a searchable single-select combobox that loads options from an async fetcher, with debounced search, preloading and custom option rendering                                                                                                                                 |
| `@dentil/country-select`       | `CountrySelect`, a searchable country picker with ISO 3166-1 codes, localized names from `Intl.DisplayNames`, preferred countries listed first, and optional flags                                                                                                                         |
| `@dentil/address-input`        | `AddressInput`, postal address fields that start from a country, with state lists for the US, Canada and Australia and your own lists for any other country                                                                                                                                |
| `@dentil/phone-input`          | `PhoneInput`, an international phone number input with a flag country picker that returns E.164 numbers                                                                                                                                                                                    |
| `@dentil/currency-input`       | `CurrencyInput`, a money input that reads and writes minor units, with the currency symbol and decimal places taken from `Intl` and an optional searchable currency picker                                                                                                                 |
| `@dentil/dob-input`            | `DOBInput`, DD / MM / YYYY date of birth fields that auto-advance and only emit real dates                                                                                                                                                                                                 |
| `@dentil/switch-label`         | `SwitchLabel`, a labeled switch with an optional description aligned to the control or the label text                                                                                                                                                                                      |
| `@dentil/color-picker`         | `ColorPicker`, a hex color input that reads and writes a 6-digit hex, with a swatch that opens a saturation and hue picker                                                                                                                                                                 |
| `@dentil/link`                 | `Link`, a text link with a chevron that turns into an arrow on hover, an external variant that opens a new tab, and a `linkComponent` prop for your router                                                                                                                                 |

## Using the registry

dentil is in the [shadcn registry directory](https://ui.shadcn.com/docs/directory), so the CLI resolves `@dentil` names with no setup:

```bash
npx shadcn@latest add @dentil/data-table @dentil/data-table-filter
```

If your CLI version can't resolve `@dentil`, install by URL:

```bash
npx shadcn@latest add https://dentil.dev/r/data-table.json
```

Or add the namespace to your project's `components.json`:

```json
{
  "registries": {
    "@dentil": "https://dentil.dev/r/{name}.json"
  }
}
```

Files are written to `components/dentil/data-table/` (or `src/components/dentil/data-table/`). Requirements: React 19, Tailwind v4 and `@tanstack/react-table` v8. Any shadcn style works, whether it's built on Radix (`new-york`, `radix-*`) or Base UI (`base-*`).

Docs and live demos are at [`/docs`](https://dentil.dev/docs), with a page per item: `/docs/data-table`, `/docs/modals`, `/docs/sheets`, `/docs/date-picker`, `/docs/date`, `/docs/object-timeline`, `/docs/object-header`, `/docs/description-list`, `/docs/invoice-table`, `/docs/badge`, `/docs/charts`, `/docs/dashboard-layout`, `/docs/json-viewer`, `/docs/select-search`, `/docs/async-select`, `/docs/country-select`, `/docs/address-input`, `/docs/phone-input`, `/docs/currency-input`, `/docs/dob-input`, `/docs/switch-label`, `/docs/color-picker` and `/docs/link`. The [changelog](https://dentil.dev/docs/changelog) lists what changed in each item. Agents can read [`/llms.txt`](https://dentil.dev/llms.txt) and [`/skill.md`](https://dentil.dev/skill.md).

## Development

```bash
npm install
npm run dev              # docs site on http://localhost:3000
npm run registry:build   # regenerate registry.json and public/r/*.json
npm run typecheck        # app typecheck + strict registry typecheck (tsconfig.registry.json)
npm run lint
./scripts/test-install.sh  # install every item into fresh Radix and Base UI apps (Next.js and Vite), then build them
```

- **Sources** live in `components/dentil/<item>/`, e.g. `components/dentil/data-table/` or `components/dentil/date-picker/`. The docs site imports them directly, and the registry ships the same files.
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

### Usage

Vercel Web Analytics counts docs page views. `proxy.ts` also records a custom event each time the shadcn CLI fetches `/r/<item>.json`. Fetches of `registry.json` and requests from browsers aren't counted.

- `registry_install`, with an `item` property, is a direct install: someone ran `shadcn add` with that item.
- `registry_dependency`, with `item` and `via` properties, is an item pulled in by another dentil item. `via` is the item that lists it, so installing `address-input` records `country-select` via `address-input`, then `select-search` via `country-select`.

The split works because `registry:build` rewrites each `@dentil/<name>` dependency in `public/r` to `https://dentil.dev/r/<name>.json?via=<parent>`. `registry.json` keeps the short names. Set `REGISTRY_URL` to build dependency URLs for another host. Events from before this change are all `registry_install`, dependencies included. The CLI fetches the first item of each `shadcn add` twice with identical requests, so `registry_install` counts run about double.

The docs record an `install_copy` custom event each time someone copies an install command. Its properties are `item` (the same bare name as `registry_install`), `pm` (the package manager tab) and `page` (the path it was copied from, `/` for the home page). It only counts items someone chose, so it's the better guide to which component is most popular.

To see the counts, go to Analytics > Events in the Vercel dashboard and pick an event, then group by `item`. Custom events need Web Analytics turned on and a Pro plan or above.

## License

MIT. The filter in `components/dentil/data-table/filter/` is adapted from [bazza/ui](https://github.com/bazzalabs/ui) (MIT), and its license ships with it as `LICENSE.md`.
