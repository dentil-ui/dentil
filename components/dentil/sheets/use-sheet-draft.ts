'use client';

import { useCallback, useState } from 'react';

import { useSheetDrafts } from './context';

/**
 * `useState` that survives the sheet being minimized, and (with the `retainDraft` option) being dismissed and
 * reopened. Returns the value, a setter and `clear`, which resets the stored draft (not the current value).
 */
export function useSheetDraft<T>(sheetId: string, initial: T | (() => T)) {
  const drafts = useSheetDrafts();
  const [value, setValue] = useState<T>(() => {
    const stored = drafts.get(sheetId) as T | undefined;
    if (stored !== undefined) return stored;
    return typeof initial === 'function' ? (initial as () => T)() : initial;
  });

  const update = useCallback(
    (next: T | ((prev: T) => T)) =>
      setValue((prev) => {
        const resolved = typeof next === 'function' ? (next as (prev: T) => T)(prev) : next;
        drafts.set(sheetId, resolved);
        return resolved;
      }),
    [drafts, sheetId]
  );

  const clear = useCallback(() => drafts.clear(sheetId), [drafts, sheetId]);

  return [value, update, clear] as const;
}
