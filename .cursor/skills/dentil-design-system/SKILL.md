---
name: dentil-design-system
description: The visual and interaction language of dentil — registry components that look like stock shadcn/ui in any consumer's theme, and a quiet neutral docs site (Geist / Geist Mono, semantic tokens, bordered surfaces, restrained motion). Use when building, restyling, or adding any registry component, demo, or docs page in this repo, or when the user mentions dentil's look, styling, tokens, theming, or design system.
---

# dentil Design System

dentil ships code into other people's apps. A registry component should be indistinguishable from stock shadcn/ui: it inherits the consumer's theme, works in light and dark, and only ever composes their primitives. The docs site is a plain neutral frame around the demos.

## Principles

1. **Two surfaces, one rule set.** Registry code (`components/data-table/`, `components/modals/`, `components/sheets/`) is copied into consumer apps. Docs code (`app/`, `components/docs/`, `components/demos/`) only runs here. Both use the same tokens, but registry code has extra portability rules (see the `dentil-registry-item` skill).
2. **Semantic tokens only.** Colour comes from shadcn variables: `bg-background`, `text-foreground`, `text-muted-foreground`, `bg-muted`, `border`, `text-destructive`, `ring`. Never a hex, `oklch()`, or palette class (`bg-zinc-100`, `text-blue-600`) in a component. The consumer's theme must win.
3. **Compose stock primitives, never fork them.** Import from `@/components/ui/*` and layer behaviour around them. `components/ui/` is vendored shadcn (ESLint-ignored, and consumers have their own copy), so don't edit it to make a dentil component work.
4. **The data is the content.** Dashboards are dense and neutral. Prefer type weight, muted text and hairlines over boxes, colour and icons.
5. **Accessible by default.** Dialogs and sheets always get a title and description, even if `sr-only`. Icon-only controls get `aria-label`.

## Tokens

Defined in `app/globals.css` (stock shadcn `neutral` base, `new-york` style), exposed through `@theme inline`:

| Token                       | Use                                                                                      |
| --------------------------- | ---------------------------------------------------------------------------------------- |
| `background` / `foreground` | Page and body text                                                                       |
| `muted`                     | Subtle fills: inline code, table header (`bg-muted/40`), code blocks                     |
| `muted-foreground`          | Secondary text, descriptions, nav links, icons                                           |
| `border`                    | Every hairline (applied globally via `* { @apply border-border }`)                       |
| `card` / `popover`          | Floating surfaces (dock, menus)                                                          |
| `destructive`               | Errors and destructive actions, usually as a tint (`bg-destructive/10 text-destructive`) |
| `ring`                      | Focus rings (`outline-ring/50` global, `focus-visible:ring-ring/50`)                     |

Radius scale from `--radius: 0.625rem`: `rounded-md` for controls and dock items, `rounded-lg` for code blocks, example frames and tables, `rounded-xl` for home cards and rounded sheets (`rounded-l-xl`).

Dark mode is the `.dark` class variant. Tokens handle it, so only add `dark:` classes where a stock primitive does (e.g. `dark:bg-input/30` on a raw input).

On the docs site, the header's `ThemeToggle` (`components/docs/theme-toggle.tsx`) sets Light, Dark or System (the default), stored under `dentil:theme` in localStorage. `themeScript` in `lib/theme.ts` runs in `<head>` and adds `.dark` to `<html>` before paint, so never read the theme in render to choose styles; use `dark:` classes, which are correct before hydration. `color-scheme` follows `.dark` in `globals.css`. Registry components never read the theme: the consumer's app owns it.

## Typography

Fonts are Geist (`font-sans`) and Geist Mono (`font-mono`), loaded in `app/layout.tsx`. No other fonts.

| Role                                  | Classes                                                                |
| ------------------------------------- | ---------------------------------------------------------------------- |
| Home h1                               | `text-4xl md:text-5xl font-semibold tracking-tight text-balance`       |
| Docs page h1                          | `text-3xl font-semibold tracking-tight`                                |
| Section h2                            | `text-xl font-semibold tracking-tight`                                 |
| Subsection h3                         | `font-medium`, description `text-muted-foreground text-sm`             |
| Body (`P`)                            | `text-muted-foreground leading-relaxed`                                |
| Inline code (`C`)                     | `bg-muted text-foreground rounded px-1 py-0.5 font-mono text-[0.85em]` |
| Code block                            | Shiki `github-light` / `github-dark`, `text-[13px] leading-relaxed`    |
| Registry names, wordmark, file titles | `font-mono`, `text-xs` in chrome                                       |

Inside registry components, text is `text-sm` with `text-xs` for secondary detail, matching shadcn primitives.

## Layout

- Site width: `mx-auto max-w-7xl px-5` everywhere, so the wordmark, docs sidebar and home content share a left edge. The header (`SiteHeader`) is `h-14`, sticky, `bg-background/80 backdrop-blur border-b`.
- Docs: `app/docs/layout.tsx` adds the 200px `DocsSidebar` from `lg`. Inside it, `DocsPage` (`components/docs/page-shell.tsx`) adds the 180px "On this page" column (`Toc`) from `xl`, and a collapsible "On this page" panel below `xl`.
- Nav lists come from `docs` in `lib/site.ts`. The header nav, sidebar, home cards and page headers all read it, so a new page is one entry there.
- Active nav state: `text-foreground font-medium` in the header, `bg-muted text-foreground font-medium` in the sidebar, and a `border-foreground` left rule in the TOC. Set `aria-current` on all three.
- Text columns on the home page cap at `max-w-2xl` (hero) and `max-w-3xl` (steps).

## Registry component conventions

- Root elements carry `data-slot="kebab-name"` (e.g. `data-table`, `table-cell`, `sheet-dock`). Consumers style against it, and `SheetShell` uses slots to detect stacked overlays.
- Accept `className` and merge with `cn()` from `@/lib/utils`.
- Use the stock `Button` and its variants and sizes (`outline`, `ghost`, `sm`, `icon-xs`) rather than styling raw buttons. Raw `<button>` is fine for unstyled hit areas inside a styled container.
- Icons come from `lucide-react`: `size-4` by default, `size-3.5` inside `sm` buttons, `text-muted-foreground` when decorative.
- Loading: `<Loader2 className="text-muted-foreground size-5 animate-spin" />`, centred in the space the content will take.
- Errors: the error boundary pattern in `components/modals/shell.tsx` (destructive tint circle, `text-sm font-medium` title, `text-xs` message, "Try again" + "Dismiss").
- Elevation: only floating UI gets a shadow (`shadow-lg`, `hover:shadow-xl` on the dock). Cards and frames are bordered, never shadowed.
- Destructive affordances on hover: `hover:bg-destructive/10 hover:text-destructive`.

## Motion

- Enter and exit animations come from the stock primitives (`tw-animate-css`). Don't replace them.
- Stacked modals and sheets recede using the separate CSS `scale` property plus a `margin-top` / `right` offset, because the stock content already animates `transform` and centres with `translate`. Keep these at 150–200ms `ease-out`.
- Hover: `transition-colors`. Small directional nudges are fine (`group-hover:translate-x-0.5` on an arrow).
- Name the transitioned properties (`transition-colors`, `transition-shadow`, `transition-[right]`). Never `transition-all`.
- UI transitions stay at or under 200ms. Anything new that moves (not just fades) needs a `motion-reduce:` fallback. For the reasoning behind these rules, see the `emil-design-eng` skill.

## Don'ts

- No hard-coded colours, gradients, glassmorphism (the header blur is the one exception), or shadows on cards.
- No edits to `components/ui/*` to make a registry component work.
- No icon-only controls without `aria-label`.
- No new fonts, and no custom theme variables in registry code. Consumers would have to add them to their CSS.

## Additional resources

- Page and component recipes: [patterns.md](patterns.md)
