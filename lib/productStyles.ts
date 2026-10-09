// lib/productStyles.ts
//
// Typed Tailwind class mapping for ProductCard.
//
// The single rule enforced here: every class is a WHOLE literal string.
// Tailwind resolves classes by scanning source text, so a class assembled by
// interpolating a variable or concatenating fragments produces no CSS. Each
// branch below returns a complete literal string for exactly that reason.

import type { Availability } from './types';

/**
 * Returns the complete button class string for the add-to-cart control.
 * A different whole literal string per branch — never assembled.
 */
export function getButtonClasses(inStock: boolean): string {
  return inStock
    ? 'w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-400'
    : 'w-full cursor-not-allowed rounded-md bg-slate-200 px-4 py-2 font-semibold text-slate-400';
}

/**
 * Returns the complete badge class string for a given availability state.
 * Switches on the discriminated union's `kind`; the `default` branch is an
 * exhaustiveness check that fails to compile if a new union member is added.
 */
export function getBadgeClasses(availability: Availability): string {
  switch (availability.kind) {
    case 'in-stock':
      return 'inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800';
    case 'low-stock':
      return 'inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800';
    case 'out-of-stock':
      return 'inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800';
    default: {
      const _exhaustive: never = availability;
      return _exhaustive;
    }
  }
}

/**
 * Returns the human-readable badge label for a given availability state.
 * Shares the same exhaustive switch pattern as getBadgeClasses.
 */
export function getBadgeLabel(availability: Availability): string {
  switch (availability.kind) {
    case 'in-stock':
      return `In stock (${availability.quantity})`;
    case 'low-stock':
      return `Only ${availability.quantity} left`;
    case 'out-of-stock':
      return 'Out of stock';
    default: {
      const _exhaustive: never = availability;
      return _exhaustive;
    }
  }
}
