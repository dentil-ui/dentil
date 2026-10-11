'use client';

import { Check, Monitor, Moon, Sun, type LucideIcon } from 'lucide-react';
import { useEffect, useLayoutEffect, useSyncExternalStore } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { THEME_STORAGE_KEY, isTheme, type Theme } from '@/lib/theme';
import { cn } from '@/lib/utils';

const CHANGE_EVENT = 'dentil:theme-change';
const DARK_QUERY = '(prefers-color-scheme: dark)';

const options: { value: Theme; label: string; icon: LucideIcon }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

function readStored(): Theme {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(value) ? value : 'system';
  } catch {
    return 'system';
  }
}

function applyTheme(theme: Theme) {
  const dark = theme === 'dark' || (theme === 'system' && matchMedia(DARK_QUERY).matches);
  const root = document.documentElement;
  if (root.classList.contains('dark') === dark) return;

  // Switch every colour at once instead of letting `transition-colors` elements fade one by one.
  const style = document.createElement('style');
  style.textContent = '*,*::before,*::after{transition:none!important}';
  document.head.appendChild(style);
  root.classList.toggle('dark', dark);
  // Flush styles while transitions are off, or the browser batches the class change with the style removal.
  window.getComputedStyle(root).getPropertyValue('color');
  requestAnimationFrame(() => style.remove());
}

function setTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage can be unavailable (private mode, blocked); the choice still applies for this page.
  }
  applyTheme(theme);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY) return;
    applyTheme(readStored());
    onChange();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onStorage);
  };
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, readStored, () => 'system' as const);

  // React clears the class the inline script set when Strict Mode remounts <html> in development.
  useLayoutEffect(() => {
    applyTheme(readStored());
  }, []);

  // Follow the OS while the choice is "system".
  useEffect(() => {
    if (theme !== 'system') return;
    const query = matchMedia(DARK_QUERY);
    const onChange = () => applyTheme('system');
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, [theme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Theme">
          {/* Driven by the .dark class, so the icon is right before hydration. */}
          <Sun className="dark:hidden" />
          <Moon className="hidden dark:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36">
        <DropdownMenuRadioGroup value={theme} onValueChange={(value) => isTheme(value) && setTheme(value)}>
          {options.map(({ value, label, icon: Icon }) => (
            <DropdownMenuRadioItem
              key={value}
              value={value}
              // The stock item draws a radio dot on the left. This menu uses an icon there and a tick on the right.
              className="pr-2 pl-2 [&>span]:hidden">
              <Icon className="text-muted-foreground" />
              {label}
              <Check className={cn('ml-auto', theme === value ? 'opacity-100' : 'opacity-0')} />
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
