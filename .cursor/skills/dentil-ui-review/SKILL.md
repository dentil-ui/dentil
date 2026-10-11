---
name: dentil-ui-review
description: Reviews UI changes in dentil against its design system and interaction standards — semantic tokens, light and dark themes, stock shadcn composition, stacking and dismissal behaviour of modals and sheets, accessibility, and rendering in the browser at desktop and mobile widths. Use when the user asks to review, polish, audit, QA, or check a registry component, demo, or docs page, or before finishing any visual change.
---

# dentil UI Review

Review against the `dentil-design-system` skill, which defines the rules. This skill is the checklist and the method.

## Method

1. Read the changed files and list every rendered element and interactive state (open, stacked, minimized, loading, error, empty).
2. Run the checklist below against the code.
3. Run `npm run typecheck && npm run lint`. The second `tsc` pass uses `tsconfig.registry.json`, which catches code that won't compile in a consumer's app.
4. Render it. Use the running dev server if there is one, otherwise start `npm run dev` (port 3000). Open the docs page that hosts the demo and capture with `browser_cdp` `Page.captureScreenshot`:
   - Desktop `1280×800` and mobile `390×844` (`deviceScaleFactor: 2, mobile: true`) via `Emulation.setDeviceMetricsOverride`.
   - First inject `*,*::before,*::after{animation-duration:0s!important;transition-duration:0s!important}` so nothing is caught mid-animation.
   - Repeat in dark mode: pick Dark from the header's theme menu, or run `document.documentElement.classList.add('dark')`. To test System, use `Emulation.setEmulatedMedia` with `prefers-color-scheme`.
   - Exercise the behaviour, not just the resting state: open the demo's modal or sheet, stack a second one, minimize, trigger the async action, and force the error state if there is one.
   - Confirm `document.documentElement.scrollWidth === innerWidth`. Wide tables may scroll inside `[data-slot=table-container]`, but the page itself must not.
   - Check the console (`Log.enable` / `Runtime.consoleAPICalled`) for Radix warnings such as a missing `DialogTitle` or `Description`, and for hydration errors.
   - Reset the emulation (including emulated media) and the theme afterwards: remove the `dark` class, or `localStorage.removeItem('dentil:theme')` if you used the menu.
5. Decode screenshots with `.cursor/skills/dentil-ui-review/scripts/save_cdp_image.py <saved-response.json> /tmp/shot.png` and view them.
6. Report findings, then fix them unless the user only asked for a review.

## Checklist

**Colour and theming**

- [ ] Every colour is a semantic token. No hex, `oklch()` or palette classes (`zinc-*`, `blue-*`) in components.
- [ ] It reads correctly in both light and `.dark`.
- [ ] Destructive states use `destructive` tints, not raw red.
- [ ] Shadows only on floating UI. Cards and frames are bordered.

**Composition**

- [ ] Built from `@/components/ui/*` primitives with their own variants. `components/ui/` itself is unchanged.
- [ ] Root elements have `data-slot`. Components accept and merge `className` with `cn()`.
- [ ] Registry files import other registry files relatively, and shadcn deps via `@/components/ui/*` and `@/lib/utils`.

**Type and layout**

- [ ] Docs headings and body match the scale in the design system (`text-3xl` h1, `text-xl` h2, muted `leading-relaxed` body).
- [ ] Mono only for code, registry names and file titles.
- [ ] Flex text columns have `min-w-0`. Long titles truncate or wrap cleanly.
- [ ] Every docs `Section` id appears in the page's `sections` array, and the reverse.

**Overlays (modals, sheets, menus)**

- [ ] Only the top modal or sheet is interactive. Esc and the close button act on the top one alone.
- [ ] Interacting with a popover, menu or modal stacked over a sheet doesn't dismiss the sheet.
- [ ] Focus moves into the overlay on open and returns to the trigger on close.
- [ ] Every dialog or sheet renders a title and description, including loading and error states.
- [ ] Lazy-loaded content shows the loading fallback, not a layout jump.

**Motion**

- [ ] Stock enter and exit animations are untouched. Stacking depth uses the `scale` property, not `transform`.
- [ ] Transitions name their properties. No `transition-all`. 200ms or less.
- [ ] New movement has a `motion-reduce:` fallback.

**Accessibility**

- [ ] Icon-only controls have `aria-label`.
- [ ] Focus rings are visible (`outline-ring/50` and `focus-visible:ring-*` aren't suppressed).
- [ ] Touch targets are at least 32px on mobile (`size-8`). `icon-xs` buttons are for dense desktop chrome only.
- [ ] Custom controls use the correct roles and keyboard behaviour (e.g. the docs `ExampleTabs` uses `role="tab"` and `aria-selected`).

## Report format

One table, one row per issue:

| Where                             | Before             | After                     | Why                                                           |
| --------------------------------- | ------------------ | ------------------------- | ------------------------------------------------------------- |
| `minimized-dock.tsx` close button | `hover:bg-red-100` | `hover:bg-destructive/10` | Hard-coded palette ignores the consumer's theme and dark mode |

Follow it with the screenshots that show the problem or the fix.
