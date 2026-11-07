'use client';

import { useEffect, useRef, useState } from 'react';

import { Input } from '@/components/ui/input';

type Pending = { value: string | number; timer: ReturnType<typeof setTimeout> };

export function DebouncedInput({
  value: initialValue,
  onChange,
  debounceMs = 300, // This is the wait time, not the function
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounceMs?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const [value, setValue] = useState(initialValue);

  // Sync with initialValue when it changes
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Callers pass a new `onChange` on every render. Holding it in a ref keeps the pending call alive across parent
  // re-renders (such as new table data arriving), which would otherwise cancel it and drop the last keystrokes.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const pendingRef = useRef<Pending | null>(null);

  const flush = () => {
    const pending = pendingRef.current;
    if (!pending) return;
    clearTimeout(pending.timer);
    pendingRef.current = null;
    onChangeRef.current(pending.value);
  };

  // Apply a pending value on unmount, so closing the popover straight after typing doesn't lose it.
  useEffect(() => {
    const pending = pendingRef;
    const latestOnChange = onChangeRef;
    return () => {
      if (!pending.current) return;
      clearTimeout(pending.current.timer);
      latestOnChange.current(pending.current.value);
      pending.current = null;
    };
  }, []);

  const updateValueAndDebounce = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    if (pendingRef.current) clearTimeout(pendingRef.current.timer);
    pendingRef.current = { value: newValue, timer: setTimeout(flush, debounceMs) };
  };

  return <Input {...props} value={value} onChange={updateValueAndDebounce} />;
}
