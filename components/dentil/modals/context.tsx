'use client';

import { createContext, use, useEffect, useMemo, useState, type ReactNode } from 'react';

import { ModalHost } from './host';
import type { ModalKey, ModalPropsMap, ModalReturnMap } from './registry';
import type { ModalOptions, ModalSize } from './types';

/** Matches the dialog's exit animation, so closing modals animate out before they unmount. */
const EXIT_DURATION_MS = 200;

export interface ModalDescriptor {
  id: string;
  key: ModalKey;
  props: object;
  size: ModalSize;
  /** False while the modal plays its exit animation. */
  open: boolean;
  close: (value?: unknown) => void;
}

/** Props are optional when the modal has no required props. */
type OpenModalArgs<K extends ModalKey> =
  Partial<ModalPropsMap[K]> extends ModalPropsMap[K]
    ? [props?: ModalPropsMap[K], options?: ModalOptions]
    : [props: ModalPropsMap[K], options?: ModalOptions];

export interface ModalContextValue {
  /** Open (and closing) modals, bottom to top. */
  stack: ModalDescriptor[];
  /** Opens a modal on top of the stack. Resolves with the value it closes with, or `undefined` if dismissed. */
  openModal<K extends ModalKey>(key: K, ...args: OpenModalArgs<K>): Promise<ModalReturnMap[K] | undefined>;
  closeModal(id: string, value?: unknown): void;
}

export interface ModalCloseInfo {
  /** `undefined` when the modal was dismissed (Esc, overlay, close button or `close()`). */
  value: unknown;
  durationMs: number;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function useModal(): ModalContextValue {
  const context = use(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}

interface ModalProviderProps {
  children: ReactNode;
  /** Called whenever a modal opens, e.g. for analytics. */
  onOpen?: (key: ModalKey) => void;
  /** Called whenever a modal closes, e.g. for analytics. */
  onClose?: (key: ModalKey, info: ModalCloseInfo) => void;
}

interface PendingModal {
  key: ModalKey;
  openedAt: number;
  resolve: (value: unknown) => void;
}

type SetStack = (update: (prev: ModalDescriptor[]) => ModalDescriptor[]) => void;
type Callbacks = Pick<ModalProviderProps, 'onOpen' | 'onClose'>;

// Created once per provider, so openModal and closeModal keep a stable identity.
function createModalActions(setStack: SetStack) {
  let callbacks: Callbacks = {};
  const pending = new Map<string, PendingModal>();

  const closeModal = (id: string, value?: unknown) => {
    const modal = pending.get(id);
    // Already closed: a second close (e.g. a button and Esc in the same tick) is a no-op.
    if (!modal) return;
    pending.delete(id);

    modal.resolve(value);
    callbacks.onClose?.(modal.key, { value, durationMs: Date.now() - modal.openedAt });

    setStack((prev) => prev.map((descriptor) => (descriptor.id === id ? { ...descriptor, open: false } : descriptor)));
    setTimeout(() => {
      setStack((prev) => prev.filter((descriptor) => descriptor.id !== id));
    }, EXIT_DURATION_MS);
  };

  const openModal = <K extends ModalKey>(key: K, ...args: OpenModalArgs<K>) =>
    new Promise<ModalReturnMap[K] | undefined>((resolve) => {
      const [props, options] = args;
      const id = crypto.randomUUID();
      pending.set(id, { key, openedAt: Date.now(), resolve: resolve as (value: unknown) => void });
      callbacks.onOpen?.(key);

      const descriptor: ModalDescriptor = {
        id,
        key,
        props: props ?? {},
        size: options?.size ?? 'default',
        open: true,
        close: (value) => closeModal(id, value),
      };
      setStack((prev) => [...prev, descriptor]);
    });

  const setCallbacks = (next: Callbacks) => {
    callbacks = next;
  };

  return { openModal, closeModal, setCallbacks };
}

export function ModalProvider({ children, onOpen, onClose }: ModalProviderProps) {
  const [stack, setStack] = useState<ModalDescriptor[]>([]);
  const [{ openModal, closeModal, setCallbacks }] = useState(() => createModalActions(setStack));

  useEffect(() => {
    setCallbacks({ onOpen, onClose });
  }, [setCallbacks, onOpen, onClose]);

  const value = useMemo<ModalContextValue>(() => ({ stack, openModal, closeModal }), [stack, openModal, closeModal]);

  return (
    <ModalContext value={value}>
      {children}
      <ModalHost stack={stack} />
    </ModalContext>
  );
}
