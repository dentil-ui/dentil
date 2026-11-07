'use client';

import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

import type { SheetDescriptor } from './context';
import type { CloseReason, SheetSize } from './types';

// `default` keeps the stock sheet width (sm:max-w-sm). Newer styles (radix-*, base-*) set it with a `data-[side=right]:`
// variant, which outranks a plain `sm:` class, so each size sets both and tailwind-merge drops the stock one.
const sizeClasses: Record<SheetSize, string> = {
  default: '',
  md: 'sm:max-w-xl data-[side=right]:sm:max-w-xl',
  lg: 'sm:max-w-2xl data-[side=right]:sm:max-w-2xl',
  xl: 'sm:max-w-4xl data-[side=right]:sm:max-w-4xl',
  full: 'sm:max-w-full data-[side=right]:sm:max-w-full',
};

/** Max width in px for each size, used to place the minimized dock beside the open sheet. */
export const sheetMaxWidths: Record<SheetSize, number> = {
  default: 384,
  md: 576,
  lg: 672,
  xl: 896,
  full: Infinity,
};

// Overlays (modals, popovers, menus, selects) portal to the body, so interacting with one stacked on top of a sheet
// counts as an outside interaction on the sheet. These markers detect that case so the sheet underneath stays open.
const STACKED_OVERLAY_SELECTOR = [
  '[data-slot="dialog-content"]',
  '[data-slot="dialog-overlay"]',
  '[data-slot="popover-content"]',
  '[data-slot="dropdown-menu-content"]',
  '[data-slot="context-menu-content"]',
  '[data-slot="select-content"]',
  '[data-slot="sheet-dock"]',
].join(',');

interface SheetShellProps {
  descriptor: SheetDescriptor;
  /** 0 for the top sheet, 1 for the one beneath it, and so on. */
  depth: number;
  onMinimize: () => void;
  children: React.ReactNode;
}

interface Dismissal {
  reason: CloseReason;
  target: Element | null;
}

const baseUIReasons: Record<string, CloseReason> = {
  'close-press': 'button',
  'escape-key': 'escape',
  'outside-press': 'backdrop',
};

function toElement(target: EventTarget | null | undefined) {
  return target instanceof Element ? target : null;
}

/**
 * Why the sheet is being asked to close. Base UI passes the reason and event to `onOpenChange`. Radix passes nothing,
 * so for Radix this records the last pointer or key press, in the capture phase so it runs before Radix's own listeners.
 */
function useDismissal(id: string, enabled: boolean) {
  const last = React.useRef<Dismissal | null>(null);

  React.useEffect(() => {
    if (!enabled) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = toElement(event.target);
      const inside = target?.closest('[data-sheet-id]')?.getAttribute('data-sheet-id') === id;
      last.current = { reason: inside ? 'button' : 'backdrop', target };
    };
    const onKeyDown = (event: KeyboardEvent) => {
      last.current = { reason: event.key === 'Escape' ? 'escape' : 'button', target: toElement(event.target) };
    };
    window.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener('keydown', onKeyDown, true);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('keydown', onKeyDown, true);
    };
  }, [id, enabled]);

  return (details?: { reason?: string; event?: Event }): Dismissal | null => {
    if (!details?.reason) return last.current;
    const reason = baseUIReasons[details.reason];
    return reason ? { reason, target: toElement(details.event?.target) } : null;
  };
}

export function SheetShell({ descriptor, depth, onMinimize, children }: SheetShellProps) {
  const { id, open, size, stacking, rounded, dismissible, minimizable, close } = descriptor;
  const interactive = open && depth === 0;
  const getDismissal = useDismissal(id, interactive);

  // `open` is controlled, so returning without calling `close` keeps the sheet open.
  const onOpenChange = (next: boolean, details?: { reason?: string; event?: Event }) => {
    if (next || !interactive) return;
    const dismissal = getDismissal(details);
    if (!dismissal) return;
    const { reason, target } = dismissal;
    if (reason !== 'button') {
      if (target?.closest(STACKED_OVERLAY_SELECTOR) || !dismissible) return;
      if (reason === 'backdrop' && minimizable) {
        onMinimize();
        return;
      }
    }
    close(undefined, reason);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={interactive}
        data-sheet-id={id}
        className={cn('overflow-y-auto', rounded && 'rounded-l-xl', sizeClasses[size])}
        // Sheets beneath the top one recede. The slide animation uses `transform` (Radix) or `translate` (Base UI), so
        // this uses the separate `scale` property and the `right` offset. Base UI sheets slide and fade with transitions,
        // which an inline `transition` would otherwise replace.
        style={{
          scale: depth > 0 && stacking === 'inset' ? 1 - depth * 0.01 : undefined,
          right: depth > 0 ? depth * 12 : undefined,
          transformOrigin: 'left center',
          transition:
            'scale 150ms ease-out, right 150ms ease-out, translate 200ms ease-in-out, opacity 200ms ease-in-out',
        }}>
        <SheetErrorBoundary onClose={() => close()}>{children}</SheetErrorBoundary>
      </SheetContent>
    </Sheet>
  );
}

/** Suspense fallback while a sheet's code loads. Includes a hidden title and description for screen readers. */
export function SheetLoading() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <SheetTitle className="sr-only">Loading</SheetTitle>
      <SheetDescription className="sr-only">Loading sheet</SheetDescription>
      <Loader2 className="text-muted-foreground size-5 animate-spin" />
    </div>
  );
}

interface SheetErrorBoundaryProps {
  children: React.ReactNode;
  onClose: () => void;
}

class SheetErrorBoundary extends React.Component<SheetErrorBoundaryProps, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[Sheet]', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div role="alert" className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="bg-destructive/10 text-destructive flex size-9 items-center justify-center rounded-full">
          <AlertTriangle className="size-4" />
        </div>
        <div className="flex flex-col gap-1">
          <SheetTitle className="text-sm font-medium">This sheet failed to render</SheetTitle>
          <SheetDescription className="max-w-md text-xs">
            {error.message || 'An unexpected error occurred.'}
          </SheetDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => this.setState({ error: null })}>
            <RefreshCw className="size-3.5" />
            Try again
          </Button>
          <Button size="sm" variant="ghost" onClick={this.props.onClose}>
            Dismiss
          </Button>
        </div>
      </div>
    );
  }
}
