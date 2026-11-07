'use client';

import * as React from 'react';

export function TableError({ error }: { error: Error | string }) {
  return (
    <div className="px-5">
      <div className="flex items-center justify-center gap-2 rounded-md border border-dashed p-10">
        <div className="text-muted-foreground text-sm">{typeof error === 'string' ? error : error.message}</div>
      </div>
    </div>
  );
}

interface TableErrorBoundaryProps {
  children: React.ReactNode;
  /** When any of these change identity, a caught error is cleared and the table re-renders. */
  resetKeys?: unknown[];
  fallback?: (error: Error) => React.ReactNode;
}

interface TableErrorBoundaryState {
  error: Error | null;
  resetKeys?: unknown[];
}

export class TableErrorBoundary extends React.Component<TableErrorBoundaryProps, TableErrorBoundaryState> {
  state: TableErrorBoundaryState = { error: null, resetKeys: this.props.resetKeys };

  static getDerivedStateFromError(error: Error): Partial<TableErrorBoundaryState> {
    return { error };
  }

  static getDerivedStateFromProps(
    props: TableErrorBoundaryProps,
    state: TableErrorBoundaryState
  ): Partial<TableErrorBoundaryState> | null {
    const prev = state.resetKeys ?? [];
    const next = props.resetKeys ?? [];
    const changed = prev.length !== next.length || prev.some((key, index) => !Object.is(key, next[index]));
    if (!changed) return null;
    return { resetKeys: next, error: null };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[DataTable]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        this.props.fallback?.(this.state.error) ?? <TableError error="Something went wrong displaying this table." />
      );
    }
    return this.props.children;
  }
}
