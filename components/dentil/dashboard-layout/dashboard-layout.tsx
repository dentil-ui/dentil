import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';

import { cn } from '@/lib/utils';

/*
 * Page layout for a dashboard: a full-bleed column of headers, chart grids, tables and split panes.
 *
 * Blocks carry no outer border, padding or radius of their own. Children of the container, the split and the split
 * panes are pulled up and left by 1px, so a bordered child (a table, a split, a sidebar) shares its edge with the one
 * before it instead of drawing a double line. The container's -1px margin does the same against the frame around it.
 */

export interface DashboardContainerProps extends React.ComponentProps<'div'> {
  /** Fill the parent's height instead of growing with the content, e.g. so a `DashboardSplit` scrolls each pane. */
  fixedHeight?: boolean;
}

/** Root of a dashboard page. Place it directly inside your app shell's content area. */
export function DashboardContainer({ className, fixedHeight, ...props }: DashboardContainerProps) {
  return (
    <div
      data-slot="dashboard-container"
      className={cn(
        '-m-px flex min-w-0 flex-1 flex-col *:-ms-px *:-mt-px',
        fixedHeight && 'h-full max-h-full',
        className
      )}
      {...props}
    />
  );
}

/** Page title row: a heading on the left and actions on the right, stacked on small screens. */
export function DashboardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dashboard-header"
      className={cn(
        'flex min-w-0 flex-col items-start justify-between gap-2 px-5 py-4 sm:flex-row sm:flex-wrap sm:items-center',
        className
      )}
      {...props}
    />
  );
}

export interface DashboardHeadingProps extends React.ComponentProps<'h3'> {
  /** Render the styles on the child element, e.g. an `h1`, instead of an `h3`. */
  asChild?: boolean;
}

/** Page title. An `h3` by default; pass `asChild` to pick another level. */
export function DashboardHeading({ className, asChild, ...props }: DashboardHeadingProps) {
  const Comp = asChild ? Slot : 'h3';
  return <Comp data-slot="dashboard-heading" className={cn('text-lg leading-9 font-bold', className)} {...props} />;
}

export interface DashboardSubheadingProps extends React.ComponentProps<'h4'> {
  /** Render the styles on the child element, e.g. an `h2`, instead of an `h4`. */
  asChild?: boolean;
}

/** Section title, for a `DashboardSectionHeader` or `DashboardTableHeader`. An `h4` by default. */
export function DashboardSubheading({ className, asChild, ...props }: DashboardSubheadingProps) {
  const Comp = asChild ? Slot : 'h4';
  return <Comp data-slot="dashboard-subheading" className={cn('leading-6 font-bold', className)} {...props} />;
}

/** One column, then two from `xl`. Rows size to their content. */
export function DashboardGrid({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="dashboard-grid" className={cn('grid auto-rows-min xl:grid-cols-2', className)} {...props} />;
}

/** Main pane and sidebar, stacked until `xl`, then side by side. Each pane scrolls on its own when the split has a fixed height. */
export function DashboardSplit({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dashboard-split"
      className={cn('flex h-full min-h-0 min-w-0 flex-col *:-ms-px *:-mt-px xl:flex-row', className)}
      {...props}
    />
  );
}

/** The wide pane of a `DashboardSplit`. */
export function DashboardSplitMain({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dashboard-split-main"
      className={cn('relative min-h-0 min-w-0 flex-1 overflow-auto', className)}
      {...props}
    />
  );
}

/** The sidebar of a `DashboardSplit`: full width when stacked, 384px with a left border from `xl`. */
export function DashboardSplitSidebar({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dashboard-split-sidebar"
      className={cn('relative min-h-0 w-full min-w-0 overflow-auto border-l xl:w-96 xl:shrink-0', className)}
      {...props}
    />
  );
}

/** Groups a `DashboardSectionHeader` with its content. It adds no styles. */
export function DashboardSection(props: React.ComponentProps<'section'>) {
  return <section data-slot="dashboard-section" {...props} />;
}

/** Section title row with a bottom border, spaced 16px below whatever comes before it. */
export function DashboardSectionHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dashboard-section-header"
      className={cn('mt-4 flex min-h-[62px] items-center justify-between border-b px-5 py-4', className)}
      {...props}
    />
  );
}

/** Padded body of a section, for a chart, a description list or text. */
export function DashboardSectionContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="dashboard-section-content" className={cn('px-5 py-4', className)} {...props} />;
}

/** Small label above a block inside `DashboardSectionContent`. */
export function DashboardSectionTitle({ className, ...props }: React.ComponentProps<'p'>) {
  return <p data-slot="dashboard-section-title" className={cn('mb-2 text-sm', className)} {...props} />;
}

/**
 * Title row above a table. It has no bottom border, so the table's own top border closes it. The 16px top margin
 * overrides the container's -1px pull, so it always clears the block above.
 */
export function DashboardTableHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dashboard-table-header"
      className={cn('mt-4! flex min-h-[61px] items-center justify-between px-5 py-4', className)}
      {...props}
    />
  );
}
