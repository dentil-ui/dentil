'use client';

import { createContext, use, useEffect, useMemo, useState, type ReactNode } from 'react';

import { SheetHost } from './host';
import { MinimizedSheetsDock } from './minimized-dock';
import type { SheetKey, SheetPropsMap, SheetReturnMap } from './registry';
import type { CloseReason, SheetOptions, SheetSize, SheetStacking } from './types';

/** Matches the sheet's exit animation, so closing sheets slide out before they unmount. */
const EXIT_DURATION_MS = 300;

export interface SheetDescriptor {
  id: string;
  key: SheetKey;
  props: object;
  size: SheetSize;
  stacking: SheetStacking;
  rounded: boolean;
  title?: string;
  dismissible: boolean;
  minimizable: boolean;
  /** False while the sheet plays its exit animation. */
  open: boolean;
  minimized: boolean;
  close: (value?: unknown, reason?: CloseReason) => void;
}

/** Props are optional when the sheet has no required props. */
type OpenSheetArgs<K extends SheetKey> =
  Partial<SheetPropsMap[K]> extends SheetPropsMap[K]
    ? [props?: SheetPropsMap[K], options?: SheetOptions]
    : [props: SheetPropsMap[K], options?: SheetOptions];

export interface SheetContextValue {
  /** Open, minimized and closing sheets, bottom to top. */
  stack: SheetDescriptor[];
  /**
   * Opens a sheet on top of the stack. Resolves with the value it closes with, or `undefined` if dismissed.
   * If a sheet with the same key is already open, it's restored and its pending result is returned instead, unless
   * the `multiple` option is set.
   */
  openSheet<K extends SheetKey>(key: K, ...args: OpenSheetArgs<K>): Promise<SheetReturnMap[K] | undefined>;
  closeSheet(id: string, value?: unknown, reason?: CloseReason): void;
  minimizeSheet(id: string): void;
  restoreSheet(id: string): void;
}

export interface SheetCloseInfo {
  /** `undefined` when the sheet was dismissed. */
  value: unknown;
  reason: CloseReason;
  durationMs: number;
  /** Whether the sheet was minimized at any point. */
  minimized: boolean;
}

interface SheetProviderProps {
  children: ReactNode;
  /** Called whenever a sheet opens, e.g. for analytics. */
  onOpen?: (key: SheetKey) => void;
  /** Called whenever a sheet closes, e.g. for analytics. */
  onClose?: (key: SheetKey, info: SheetCloseInfo) => void;
}

type Callbacks = Pick<SheetProviderProps, 'onOpen' | 'onClose'>;
type SetStack = (update: (prev: SheetDescriptor[]) => SheetDescriptor[]) => void;

export interface SheetDrafts {
  get(sheetId: string): unknown;
  set(sheetId: string, value: unknown): void;
  clear(sheetId: string): void;
}

interface PendingSheet {
  key: SheetKey;
  openedAt: number;
  retainDraft: boolean;
  wasMinimized: boolean;
  promise: Promise<unknown>;
  resolve: (value: unknown) => void;
}

const SheetContext = createContext<SheetContextValue | null>(null);
const SheetDraftsContext = createContext<SheetDrafts | null>(null);

export function useSheet(): SheetContextValue {
  const context = use(SheetContext);
  if (!context) {
    throw new Error('useSheet must be used within a SheetProvider');
  }
  return context;
}

export function useSheetDrafts(): SheetDrafts {
  const context = use(SheetDraftsContext);
  if (!context) {
    throw new Error('useSheetDraft must be used within a SheetProvider');
  }
  return context;
}

// Created once per provider, so every action keeps a stable identity.
function createSheetActions(setStack: SetStack) {
  let callbacks: Callbacks = {};
  const pending = new Map<string, PendingSheet>();
  const drafts = new Map<string, unknown>();
  const timers = new Set<ReturnType<typeof setTimeout>>();

  // Retained drafts are stored by key so the next sheet with that key picks them up; others by sheet id.
  const draftKey = (sheetId: string) => {
    const sheet = pending.get(sheetId);
    return sheet?.retainDraft ? `key:${sheet.key}` : sheetId;
  };

  const updateSheet = (id: string, patch: Partial<SheetDescriptor>) =>
    setStack((prev) => prev.map((descriptor) => (descriptor.id === id ? { ...descriptor, ...patch } : descriptor)));

  const closeSheet = (id: string, value?: unknown, reason: CloseReason = 'button') => {
    const sheet = pending.get(id);
    // Already closed: a second close (e.g. a button and Escape in the same tick) is a no-op.
    if (!sheet) return;

    if (!(sheet.retainDraft && reason !== 'button' && value === undefined)) {
      drafts.delete(draftKey(id));
    }
    drafts.delete(id);
    pending.delete(id);

    sheet.resolve(value);
    callbacks.onClose?.(sheet.key, {
      value,
      reason,
      durationMs: Date.now() - sheet.openedAt,
      minimized: sheet.wasMinimized,
    });

    updateSheet(id, { open: false });
    const timer = setTimeout(() => {
      timers.delete(timer);
      setStack((prev) => prev.filter((descriptor) => descriptor.id !== id));
    }, EXIT_DURATION_MS);
    timers.add(timer);
  };

  const minimizeSheet = (id: string) => {
    const sheet = pending.get(id);
    if (sheet) sheet.wasMinimized = true;
    updateSheet(id, { minimized: true });
  };

  const restoreSheet = (id: string) => {
    // A minimized sheet is unmounted, so restoring remounts it on top: move it to the top of the stack to match.
    setStack((prev) => {
      const descriptor = prev.find((d) => d.id === id);
      if (!descriptor?.minimized) return prev;
      return [...prev.filter((d) => d.id !== id), { ...descriptor, minimized: false }];
    });
  };

  const openSheet = <K extends SheetKey>(key: K, ...args: OpenSheetArgs<K>) => {
    const [props, options] = args;
    const existing = options?.multiple ? undefined : [...pending.entries()].find(([, sheet]) => sheet.key === key);
    if (existing) {
      const [id, sheet] = existing;
      restoreSheet(id);
      return sheet.promise as Promise<SheetReturnMap[K] | undefined>;
    }

    const id = crypto.randomUUID();
    let resolve!: (value: unknown) => void;
    const promise = new Promise<unknown>((r) => {
      resolve = r;
    });

    pending.set(id, {
      key,
      openedAt: Date.now(),
      retainDraft: options?.retainDraft ?? false,
      wasMinimized: false,
      promise,
      resolve,
    });
    callbacks.onOpen?.(key);

    const stacking = options?.stacking ?? 'inset';
    const descriptor: SheetDescriptor = {
      id,
      key,
      props: props ?? {},
      size: options?.size ?? 'default',
      stacking,
      rounded: options?.rounded ?? stacking === 'inset',
      title: options?.title,
      dismissible: options?.dismissible ?? true,
      minimizable: options?.minimizable ?? false,
      open: true,
      minimized: false,
      close: (value, reason) => closeSheet(id, value, reason),
    };
    setStack((prev) => [...prev, descriptor]);

    return promise as Promise<SheetReturnMap[K] | undefined>;
  };

  const sheetDrafts: SheetDrafts = {
    get: (sheetId) => drafts.get(draftKey(sheetId)),
    set: (sheetId, value) => {
      if (pending.has(sheetId)) drafts.set(draftKey(sheetId), value);
    },
    clear: (sheetId) => {
      drafts.delete(draftKey(sheetId));
    },
  };

  const setCallbacks = (next: Callbacks) => {
    callbacks = next;
  };

  const dispose = () => {
    timers.forEach((timer) => clearTimeout(timer));
    timers.clear();
  };

  return { openSheet, closeSheet, minimizeSheet, restoreSheet, drafts: sheetDrafts, setCallbacks, dispose };
}

export function SheetProvider({ children, onOpen, onClose }: SheetProviderProps) {
  const [stack, setStack] = useState<SheetDescriptor[]>([]);
  const [{ openSheet, closeSheet, minimizeSheet, restoreSheet, drafts, setCallbacks, dispose }] = useState(() =>
    createSheetActions(setStack)
  );

  useEffect(() => {
    setCallbacks({ onOpen, onClose });
  }, [setCallbacks, onOpen, onClose]);

  useEffect(() => dispose, [dispose]);

  const value = useMemo<SheetContextValue>(
    () => ({ stack, openSheet, closeSheet, minimizeSheet, restoreSheet }),
    [stack, openSheet, closeSheet, minimizeSheet, restoreSheet]
  );

  return (
    <SheetContext value={value}>
      <SheetDraftsContext value={drafts}>
        {children}
        <SheetHost stack={stack} onMinimize={minimizeSheet} />
        <MinimizedSheetsDock stack={stack} onRestore={restoreSheet} />
      </SheetDraftsContext>
    </SheetContext>
  );
}
