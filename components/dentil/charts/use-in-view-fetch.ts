'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type UseInViewFetchOptions = {
  /** Grows the viewport so a chart starts loading just before it scrolls in. */
  rootMargin?: string;
};

/**
 * Runs `fetch` once the element behind `ref` is near the viewport, then again only when `deps` change. Scrolling a
 * chart away and back does not refetch. If `deps` change while it is off screen, the fetch waits until it is back.
 *
 * `deps` are compared by value with `JSON.stringify`, so pass primitives such as timestamps.
 */
export function useInViewFetch<T extends Element = HTMLDivElement>(
  fetch: () => void | Promise<void>,
  deps: readonly unknown[],
  { rootMargin = '200px 0px' }: UseInViewFetchOptions = {}
) {
  const [inView, setInView] = useState(false);

  const fetchRef = useRef(fetch);
  useEffect(() => {
    fetchRef.current = fetch;
  });

  const key = JSON.stringify(deps);
  const lastFetchedKey = useRef<string | null>(null);

  const ref = useCallback(
    (node: T | null) => {
      if (!node) return;
      if (typeof IntersectionObserver === 'undefined') {
        setInView(true);
        return;
      }
      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[entries.length - 1];
          if (entry) setInView(entry.isIntersecting);
        },
        { rootMargin }
      );
      observer.observe(node);
      return () => observer.disconnect();
    },
    [rootMargin]
  );

  useEffect(() => {
    if (!inView || lastFetchedKey.current === key) return;
    lastFetchedKey.current = key;
    void fetchRef.current();
  }, [inView, key]);

  return { ref, inView };
}
