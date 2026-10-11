'use client';

import { useId, useLayoutEffect, useSyncExternalStore } from 'react';

import {
  DEFAULT_PACKAGE_MANAGER,
  PACKAGE_MANAGER_STORAGE_KEY,
  isPackageManager,
  packageManagers,
  type PackageManager,
} from '@/lib/package-manager';
import { cn } from '@/lib/utils';

import { CopyButton } from './copy-button';

const CHANGE_EVENT = 'dentil:package-manager-change';

function readStored(): PackageManager {
  try {
    const value = localStorage.getItem(PACKAGE_MANAGER_STORAGE_KEY);
    return isPackageManager(value) ? value : DEFAULT_PACKAGE_MANAGER;
  } catch {
    return DEFAULT_PACKAGE_MANAGER;
  }
}

function applyAttribute(packageManager: PackageManager) {
  document.documentElement.setAttribute('data-pm', packageManager);
}

function setPackageManager(packageManager: PackageManager) {
  try {
    localStorage.setItem(PACKAGE_MANAGER_STORAGE_KEY, packageManager);
  } catch {
    // Storage can be unavailable (private mode, blocked); the choice still applies for this page.
  }
  applyAttribute(packageManager);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== PACKAGE_MANAGER_STORAGE_KEY) return;
    applyAttribute(readStored());
    onChange();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onStorage);
  };
}

function usePackageManager() {
  return useSyncExternalStore(subscribe, readStored, () => DEFAULT_PACKAGE_MANAGER);
}

export interface PackageManagerPanel {
  packageManager: PackageManager;
  command: string;
  /** Highlighted HTML for the command. */
  html: string;
}

/**
 * Tabs for one command per package manager. Which panel and tab look active is driven by `html[data-pm]` in CSS, so
 * it's right before hydration; React state only drives ARIA, focus and the copy value.
 */
export function PackageManagerTabs({ panels, title }: { panels: PackageManagerPanel[]; title?: string }) {
  const id = useId();
  const active = usePackageManager();
  const activeCommand = panels.find((panel) => panel.packageManager === active)?.command ?? panels[0].command;

  // React clears the attribute the inline script set when Strict Mode remounts <html> in development.
  useLayoutEffect(() => {
    applyAttribute(readStored());
  }, []);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const index = packageManagers.indexOf(active);
    const last = packageManagers.length - 1;
    const next = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setPackageManager(packageManagers[next]);
    document.getElementById(`${id}-${packageManagers[next]}-tab`)?.focus();
  };

  return (
    <div className="bg-muted/40 overflow-hidden rounded-lg border">
      <div className="flex h-9 items-center gap-2 border-b pr-1 pl-2">
        <div role="tablist" aria-label="Package manager" onKeyDown={onKeyDown} className="flex h-full items-stretch">
          {panels.map(({ packageManager }) => (
            <button
              key={packageManager}
              id={`${id}-${packageManager}-tab`}
              type="button"
              role="tab"
              aria-selected={active === packageManager}
              aria-controls={`${id}-${packageManager}`}
              tabIndex={active === packageManager ? 0 : -1}
              data-pm-tab={packageManager}
              onClick={() => setPackageManager(packageManager)}
              className="text-muted-foreground hover:text-foreground -mb-px border-b-2 border-transparent px-2 font-mono text-xs transition-colors">
              {packageManager}
            </button>
          ))}
        </div>
        {title && (
          <span className="text-muted-foreground ml-auto hidden truncate font-mono text-xs sm:block">{title}</span>
        )}
        <CopyButton value={activeCommand} className={cn('ml-auto shrink-0', title && 'sm:ml-0')} />
      </div>
      {panels.map(({ packageManager, html }) => (
        <div
          key={packageManager}
          id={`${id}-${packageManager}`}
          role="tabpanel"
          aria-labelledby={`${id}-${packageManager}-tab`}
          data-pm-panel={packageManager}
          className="[&_pre]:overflow-x-auto [&_pre]:!bg-transparent [&_pre]:p-4 [&_pre]:text-[13px] [&_pre]:leading-relaxed"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ))}
    </div>
  );
}
