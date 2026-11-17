'use client';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-sm border text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3',
  {
    variants: {
      variant: {
        default: 'border-border bg-muted text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        destructive:
          'border-destructive/20 bg-destructive/10 text-destructive group-data-hover:bg-destructive/20 dark:bg-destructive/15',
        outline: 'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        // Named colors stay on Tailwind's palette so a status keeps its hue when the theme changes.
        red: 'border-red-500/20 bg-red-500/15 text-red-700 group-data-hover:bg-red-500/25 dark:bg-red-500/10 dark:text-red-400 dark:group-data-hover:bg-red-500/20',
        orange:
          'border-orange-500/20 bg-orange-500/15 text-orange-700 group-data-hover:bg-orange-500/25 dark:bg-orange-500/10 dark:text-orange-400 dark:group-data-hover:bg-orange-500/20',
        amber:
          'border-amber-500/20 bg-amber-400/20 text-amber-700 group-data-hover:bg-amber-400/30 dark:bg-amber-400/10 dark:text-amber-400 dark:group-data-hover:bg-amber-400/15',
        yellow:
          'border-yellow-500/20 bg-yellow-400/20 text-yellow-700 group-data-hover:bg-yellow-400/30 dark:bg-yellow-400/10 dark:text-yellow-300 dark:group-data-hover:bg-yellow-400/15',
        lime: 'border-lime-500/20 bg-lime-400/20 text-lime-700 group-data-hover:bg-lime-400/30 dark:bg-lime-400/10 dark:text-lime-300 dark:group-data-hover:bg-lime-400/15',
        green:
          'border-green-500/20 bg-green-500/15 text-green-700 group-data-hover:bg-green-500/25 dark:bg-green-500/10 dark:text-green-400 dark:group-data-hover:bg-green-500/20',
        emerald:
          'border-emerald-500/20 bg-emerald-500/15 text-emerald-700 group-data-hover:bg-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-400 dark:group-data-hover:bg-emerald-500/20',
        teal: 'border-teal-500/20 bg-teal-500/15 text-teal-700 group-data-hover:bg-teal-500/25 dark:bg-teal-500/10 dark:text-teal-300 dark:group-data-hover:bg-teal-500/20',
        cyan: 'border-cyan-500/20 bg-cyan-400/20 text-cyan-700 group-data-hover:bg-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-300 dark:group-data-hover:bg-cyan-400/15',
        sky: 'border-sky-500/20 bg-sky-500/15 text-sky-700 group-data-hover:bg-sky-500/25 dark:bg-sky-500/10 dark:text-sky-300 dark:group-data-hover:bg-sky-500/20',
        blue: 'border-blue-500/20 bg-blue-500/15 text-blue-700 group-data-hover:bg-blue-500/25 dark:text-blue-400 dark:group-data-hover:bg-blue-500/25',
        indigo:
          'border-indigo-500/20 bg-indigo-500/15 text-indigo-700 group-data-hover:bg-indigo-500/25 dark:text-indigo-400 dark:group-data-hover:bg-indigo-500/20',
        violet:
          'border-violet-500/20 bg-violet-500/15 text-violet-700 group-data-hover:bg-violet-500/25 dark:text-violet-400 dark:group-data-hover:bg-violet-500/20',
        purple:
          'border-purple-500/20 bg-purple-500/15 text-purple-700 group-data-hover:bg-purple-500/25 dark:text-purple-400 dark:group-data-hover:bg-purple-500/20',
        fuchsia:
          'border-fuchsia-500/20 bg-fuchsia-400/15 text-fuchsia-700 group-data-hover:bg-fuchsia-400/25 dark:bg-fuchsia-400/10 dark:text-fuchsia-400 dark:group-data-hover:bg-fuchsia-400/20',
        pink: 'border-pink-500/20 bg-pink-400/15 text-pink-700 group-data-hover:bg-pink-400/25 dark:bg-pink-400/10 dark:text-pink-400 dark:group-data-hover:bg-pink-400/20',
        rose: 'border-rose-500/20 bg-rose-400/15 text-rose-700 group-data-hover:bg-rose-400/25 dark:bg-rose-400/10 dark:text-rose-400 dark:group-data-hover:bg-rose-400/20',
        zinc: 'border-zinc-500/20 bg-zinc-600/10 text-zinc-700 group-data-hover:bg-zinc-600/20 dark:bg-white/5 dark:text-zinc-400 dark:group-data-hover:bg-white/10',
      },
      size: {
        default: 'px-2 py-0.5',
        sm: 'h-[19px] px-1.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

export interface BadgeProps extends React.ComponentProps<'span'>, VariantProps<typeof badgeVariants> {
  /** Render the styles on the child element instead of a span. */
  asChild?: boolean;
}

/** `::first-letter` does not apply to flex containers, so the first letter is capitalized here. */
function capitalizeText(node: React.ReactNode, state: { done: boolean }): React.ReactNode {
  if (state.done || node == null || typeof node === 'boolean') return node;

  if (typeof node === 'string') {
    const index = node.search(/[a-z]/i);
    if (index === -1) return node;
    state.done = true;
    const letter = node[index];
    if (!letter || letter === letter.toUpperCase()) return node;
    return node.slice(0, index) + letter.toUpperCase() + node.slice(index + 1);
  }

  if (typeof node === 'number') {
    state.done = true;
    return node;
  }

  if (Array.isArray(node)) return node.map((child) => capitalizeText(child, state));

  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    if (node.props.children == null) return node;
    return React.cloneElement(node, undefined, capitalizeText(node.props.children, state));
  }

  return node;
}

export function Badge({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  children,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : 'span';

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      data-size={size}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}>
      {capitalizeText(children, { done: false })}
    </Comp>
  );
}

export { badgeVariants };
