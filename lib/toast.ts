// lib/toast.ts
//
// Toast notification helpers. These are thin wrappers around react-hot-toast
// that keep the style and messaging uniform across the app.

import toast from 'react-hot-toast';

/**
 * Show a success toast. Used for cart actions, CRUD operations, and order
 * confirmation.
 */
export function toastSuccess(message: string): void {
  toast.success(message);
}

/**
 * Show an error toast. Accepts the error object and unwraps ApiError.message,
 * so call sites do not have to decide how to format a failure.
 */
export function toastError(error: unknown): void {
  let message = 'Something went wrong';

  if (error instanceof Error) {
    message = error.message;
  }

  toast.error(message);
}
