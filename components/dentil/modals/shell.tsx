'use client';

import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

import type { ModalSize } from './types';

// `default` keeps the stock dialog width (sm:max-w-lg).
const sizeClasses: Record<ModalSize, string> = {
  default: '',
  md: 'sm:max-w-xl',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-3xl',
  full: 'sm:max-w-4xl',
};

interface ModalShellProps {
  open: boolean;
  onClose: () => void;
  /** 0 for the top modal, 1 for the one beneath it, and so on. */
  depth: number;
  size: ModalSize;
  children: React.ReactNode;
}

export function ModalShell({ open, onClose, depth, size, children }: ModalShellProps) {
  const interactive = open && depth === 0;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && interactive && onClose()}>
      <DialogContent
        showCloseButton={interactive}
        className={sizeClasses[size]}
        // Modals beneath the top one recede. The stock content centers itself with the `translate` property and
        // animates with `transform`, so this uses the separate `scale` property and a margin instead.
        style={{
          scale: depth > 0 ? 1 - depth * 0.03 : undefined,
          marginTop: depth > 0 ? depth * -12 : undefined,
          transformOrigin: 'top center',
          transition: 'scale 200ms ease-out, margin-top 200ms ease-out',
        }}>
        <ModalErrorBoundary onClose={onClose}>{children}</ModalErrorBoundary>
      </DialogContent>
    </Dialog>
  );
}

/** Suspense fallback while a modal's code loads. Includes a hidden title and description for screen readers. */
export function ModalLoading() {
  return (
    <div className="flex h-40 items-center justify-center">
      <DialogTitle className="sr-only">Loading</DialogTitle>
      <DialogDescription className="sr-only">Loading dialog</DialogDescription>
      <Loader2 className="text-muted-foreground size-5 animate-spin" />
    </div>
  );
}

interface ModalErrorBoundaryProps {
  children: React.ReactNode;
  onClose: () => void;
}

class ModalErrorBoundary extends React.Component<ModalErrorBoundaryProps, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[Modal]', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div role="alert" className="flex min-h-40 flex-col items-center justify-center gap-3 text-center">
        <div className="bg-destructive/10 text-destructive flex size-9 items-center justify-center rounded-full">
          <AlertTriangle className="size-4" />
        </div>
        <div className="flex flex-col gap-1">
          <DialogTitle className="text-sm font-medium">This dialog failed to render</DialogTitle>
          <DialogDescription className="max-w-md text-xs">
            {error.message || 'An unexpected error occurred.'}
          </DialogDescription>
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
