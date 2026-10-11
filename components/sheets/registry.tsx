import { lazy, type ComponentProps, type ComponentType, type LazyExoticComponent } from 'react';

// Add a sheet: write a component typed with SheetContentProps<TReturn> in ./contents, then add a loader here.
// Each entry is code-split, so the sheet's module (and its heavy deps) is only downloaded when it's first opened.
const sheetLoaders = {
  'edit-details': () => import('./contents/edit-details'),
} as const;

// Everything below is inferred from the loaders.

export type SheetKey = keyof typeof sheetLoaders;

type SheetComponent<K extends SheetKey> = Awaited<ReturnType<(typeof sheetLoaders)[K]>>['default'];

/** Props you pass to `openSheet(key, props)`: the component's props minus the injected ones. */
export type SheetPropsMap = {
  [K in SheetKey]: Omit<ComponentProps<SheetComponent<K>>, 'sheetId' | 'close'>;
};

/** What `openSheet(key)` resolves to when the sheet closes with a value. */
export type SheetReturnMap = {
  [K in SheetKey]: ComponentProps<SheetComponent<K>> extends { close: (value?: infer R) => void } ? R : never;
};

export const sheetRegistry = Object.fromEntries(
  Object.entries(sheetLoaders).map(([key, loader]) => [
    key,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lazy(loader as () => Promise<{ default: ComponentType<any> }>),
  ])
) as {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in SheetKey]: LazyExoticComponent<ComponentType<any>>;
};
