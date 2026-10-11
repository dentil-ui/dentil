export type SheetSize = 'default' | 'md' | 'lg' | 'xl' | 'full';

/**
 * How a sheet recedes when another opens on top. `inset` scales it down so it floats with a gap above and below;
 * `flush` keeps it full height and only shifts it left.
 */
export type SheetStacking = 'inset' | 'flush';

/** How a sheet was closed: the close button or `close()`, the Escape key, or a click outside. */
export type CloseReason = 'button' | 'escape' | 'backdrop';

export interface SheetOptions {
  /** Max width from the sm breakpoint up. `default` keeps the stock sheet width. */
  size?: SheetSize;
  /** How this sheet recedes when another opens on top. Default `inset`. */
  stacking?: SheetStacking;
  /** Round the sheet's exposed corners. Defaults to true for `inset` stacking and false for `flush`. */
  rounded?: boolean;
  /** Label in the minimized dock. Defaults to the sheet key in sentence case. */
  title?: string;
  /** Set to false to ignore outside clicks and Escape. The close button and `close()` still work. Default true. */
  dismissible?: boolean;
  /** Clicking outside minimizes the sheet to a dock instead of closing it. */
  minimizable?: boolean;
  /**
   * Allow more than one sheet with this key at a time. By default, opening a key that's already open restores that
   * sheet and returns its pending result instead.
   */
  multiple?: boolean;
  /**
   * Keep the `useSheetDraft` state when the sheet is dismissed with Escape or an outside click, and restore it the
   * next time a sheet with this key opens. Closing with the button or with a value clears it.
   */
  retainDraft?: boolean;
}

/**
 * Props every sheet content receives. Intersect with your own props; `TReturn` is what `openSheet` resolves to.
 *
 * ```tsx
 * type Props = SheetContentProps<{ id: string }> & { customerId: string };
 * ```
 */
export interface SheetContentProps<TReturn = void> {
  sheetId: string;
  /** Closes this sheet and resolves its `openSheet` promise. Call with no value to cancel. */
  close: (value?: TReturn) => void;
}
