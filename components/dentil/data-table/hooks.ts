'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';

function isFormTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

/**
 * Calls `handler` when `key` (a `KeyboardEvent.key` value such as `'ArrowDown'` or `'a'`) is pressed
 * without modifiers. Ignored while focus is in a form field or a dialog/menu has focus.
 */
export function useHotkey(key: string, handler: (event: KeyboardEvent) => void, enabled = true) {
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== key || event.metaKey || event.ctrlKey || event.altKey || event.defaultPrevented) return;
      if (isFormTarget(event.target)) return;
      if (event.target instanceof HTMLElement && event.target.closest('[role=dialog],[role=menu],[role=listbox]')) {
        return;
      }
      event.preventDefault();
      handlerRef.current(event);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [key, enabled]);
}

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}
