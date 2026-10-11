import { lazy, type ComponentProps, type ComponentType, type LazyExoticComponent } from 'react';

// Add a modal: write a component typed with ModalContentProps<TReturn> in ./contents, then add a loader here.
// Each entry is code-split, so the modal's module is only downloaded when it's first opened.
const modalLoaders = {
  confirm: () => import('./contents/confirm'),
} as const;

// Everything below is inferred from the loaders.

export type ModalKey = keyof typeof modalLoaders;

type ModalComponent<K extends ModalKey> = Awaited<ReturnType<(typeof modalLoaders)[K]>>['default'];

/** Props you pass to `openModal(key, props)`: the component's props minus the injected ones. */
export type ModalPropsMap = {
  [K in ModalKey]: Omit<ComponentProps<ModalComponent<K>>, 'modalId' | 'close'>;
};

/** What `openModal(key)` resolves to when the modal closes with a value. */
export type ModalReturnMap = {
  [K in ModalKey]: ComponentProps<ModalComponent<K>> extends { close: (value?: infer R) => void } ? R : never;
};

export const modalRegistry = Object.fromEntries(
  Object.entries(modalLoaders).map(([key, loader]) => [
    key,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lazy(loader as () => Promise<{ default: ComponentType<any> }>),
  ])
) as {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in ModalKey]: LazyExoticComponent<ComponentType<any>>;
};
