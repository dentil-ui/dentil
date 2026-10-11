export type ModalSize = 'default' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalOptions {
  /** Max width from the sm breakpoint up. `default` keeps the stock dialog width. */
  size?: ModalSize;
}

/**
 * Props every modal content receives. Intersect with your own props; `TReturn` is what `openModal` resolves to.
 *
 * ```tsx
 * type Props = ModalContentProps<boolean> & { title: string };
 * ```
 */
export interface ModalContentProps<TReturn = void> {
  modalId: string;
  /** Closes this modal and resolves its `openModal` promise. Call with no value to cancel. */
  close: (value?: TReturn) => void;
}
